'use client'
import { useEffect, useState, Fragment } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLoanStore, loanRepository } from '@/features/request-loan'
import type { RestructureResult } from '@/features/request-loan'
import { canSign, isActiveLoan, canPay, LoanStatusBadge } from '@/entities/loan'
import type { InstallmentStatus, EarlyPayoffQuote } from '@/entities/loan'
import { formatCurrency, formatDate, formatDateTime, loanRef } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

type TabId = 'calendario' | 'desglose' | 'documentos'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

const INSTALLMENT_STATUS_CONFIG: Record<InstallmentStatus, { label: string; icon: typeof CheckCircle2; badge: string }> = {
  PAID: { label: 'Pagada', icon: CheckCircle2, badge: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
  PENDING: { label: 'Pendiente', icon: Clock, badge: 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400' },
  OVERDUE: { label: 'Vencida', icon: AlertCircle, badge: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  RESTRUCTURED: { label: 'Reestructurada', icon: RefreshCw, badge: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'calendario', label: 'Calendario de Pagos' },
  { id: 'desglose', label: 'Desglose e Intereses' },
  { id: 'documentos', label: 'Documentos' },
]

const TIMELINE_STEPS = [
  { id: 'requested',  label: 'Solicitado',   icon: 'fa-solid fa-file-pen' },
  { id: 'approved',   label: 'Aprobado',     icon: 'fa-solid fa-clipboard-check' },
  { id: 'signed',     label: 'Firmado',      icon: 'fa-solid fa-signature' },
  { id: 'disbursed',  label: 'Desembolsado', icon: 'fa-solid fa-paper-plane' },
  { id: 'active',     label: 'Activo',       icon: 'fa-solid fa-wallet' },
  { id: 'paid',       label: 'Pagado',       icon: 'fa-solid fa-circle-check' },
] as const

type TimelineStepId = typeof TIMELINE_STEPS[number]['id']

function getStepState(
  stepId: TimelineStepId,
  loanStatus: string,
): 'complete' | 'current' | 'pending' {
  const ORDER: TimelineStepId[] = ['requested', 'approved', 'signed', 'disbursed', 'active', 'paid']
  const statusToCurrentStep: Record<string, TimelineStepId> = {
    PENDING:   'approved',
    APPROVED:  'signed',
    SIGNED:    'disbursed',
    DISBURSED: 'active',
    ACTIVE:    'paid',
    OVERDUE:   'paid',
    PAID:      'paid',
  }
  if (loanStatus === 'PAID') return 'complete'
  const currentStep = statusToCurrentStep[loanStatus] ?? 'approved'
  const stepIdx = ORDER.indexOf(stepId)
  const currentIdx = ORDER.indexOf(currentStep)
  if (stepIdx < currentIdx) return 'complete'
  if (stepId === currentStep) return 'current'
  return 'pending'
}

export default function LoanDetailPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const { selectedLoan: loan, balance, payments, installments, isLoading, loadLoanDetails, signLoan } = useLoanStore()
  const [activeTab, setActiveTab] = useState<TabId>('calendario')
  const [restructureOpen, setRestructureOpen] = useState(false)
  const [restructureStep, setRestructureStep] = useState<'confirm' | 'done'>('confirm')
  const [restructureResult, setRestructureResult] = useState<RestructureResult | null>(null)
  const [restructureLoading, setRestructureLoading] = useState(false)
  const [restructureInstallments, setRestructureInstallments] = useState(3)

  const [earlyPayoffOpen, setEarlyPayoffOpen] = useState(false)
  const [earlyPayoffStep, setEarlyPayoffStep] = useState<'quote' | 'done'>('quote')
  const [earlyPayoffQuote, setEarlyPayoffQuote] = useState<EarlyPayoffQuote | null>(null)
  const [earlyPayoffLoading, setEarlyPayoffLoading] = useState(false)
  const [earlyPayoffQuoteLoading, setEarlyPayoffQuoteLoading] = useState(false)

  useEffect(() => { loadLoanDetails(loanId) }, [loanId, loadLoanDetails])

  const handleDownloadContract = async () => {
    try {
      const url = await loanRepository.getContractUrl(loanId)
      window.open(url, '_blank')
    } catch {
      toast.error('No se pudo obtener el contrato. Inténtalo de nuevo.')
    }
  }

  const handleSign = async () => {
    try {
      await signLoan(loanId)
      toast.success('¡Contrato firmado! Recibirás el dinero en breve.')
      loadLoanDetails(loanId)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al firmar')
    }
  }

  const handleOpenEarlyPayoff = async () => {
    setEarlyPayoffStep('quote')
    setEarlyPayoffQuote(null)
    setEarlyPayoffOpen(true)
    setEarlyPayoffQuoteLoading(true)
    try {
      const quote = await loanRepository.getEarlyPayoffQuote(loanId)
      setEarlyPayoffQuote(quote)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al obtener la cotización')
      setEarlyPayoffOpen(false)
    } finally {
      setEarlyPayoffQuoteLoading(false)
    }
  }

  const handleEarlyPayoff = async () => {
    if (!earlyPayoffQuote) return
    setEarlyPayoffLoading(true)
    try {
      const { checkoutUrl } = await loanRepository.createCheckout({
        loanId,
        amount: earlyPayoffQuote.payoffAmount,
        paymentType: 'early_payoff',
      })
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al generar el link de pago')
      setEarlyPayoffLoading(false)
    }
  }

  const handleRestructure = async () => {
    setRestructureLoading(true)
    try {
      const result = await loanRepository.restructureLoan(loanId, restructureInstallments)
      setRestructureResult(result)
      setRestructureStep('done')
      loadLoanDetails(loanId)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al reestructurar')
    } finally {
      setRestructureLoading(false)
    }
  }

  if (isLoading || !loan) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb + header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-44 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        {/* Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-lg p-6 space-y-6" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 bg-white/10" />
              <Skeleton className="h-10 w-40 bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-6 w-28 bg-white/10" />
                <Skeleton className="h-3 w-20 bg-white/10" />
              </div>
              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10 rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 bg-white/10" />
                  <Skeleton className="h-3 w-16 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
          <div className={`${cardCls} p-6 space-y-4`}>
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2.5">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-white/6 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className={`${cardCls}`}>
          <div className="flex gap-1 p-4 border-b border-gray-100 dark:border-white/6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-40 rounded-lg" />)}
          </div>
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeInstallments = installments.filter(i => i.status !== 'RESTRUCTURED')
  const nextInstallment = activeInstallments.find(i => i.status === 'PENDING' || i.status === 'OVERDUE')
  const paidCount = activeInstallments.filter(i => i.status === 'PAID').length
  const progressPct = balance ? Math.min(100, Math.round((balance.totalPaid / balance.totalAmount) * 100)) : 0
  const ref = loanRef(loan.id)

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb + Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-2">
            <Link href="/loans" className="text-gray-500 dark:text-gray-400 hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors">
              Mis Préstamos
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-gray-400" />
            <span className="text-[#0A192F] dark:text-[#D4AF37] font-medium">Detalle #{ref}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/loans"
              className="w-9 h-9 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors shrink-0"
            >
              <i className="fa-solid fa-arrow-left text-sm" />
            </Link>
            <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white">Préstamo Solvo</h1>
            <LoanStatusBadge status={loan.status} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loan.contractUrl && (
            <button
              onClick={handleDownloadContract}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/6 bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
            >
              <i className="fa-solid fa-download text-sm" />
              Descargar Comprobante
            </button>
          )}
          {(isActiveLoan(loan) || canPay(loan)) && (
            <Link
              href={`/loans/${loan.id}/pay`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] text-sm font-medium hover:bg-[#0A192F]/90 dark:hover:bg-[#B8941F] transition-colors"
            >
              <i className="fa-solid fa-money-bill-wave text-sm" />
              Pagar Cuota
            </Link>
          )}
        </div>
      </div>

      {/* ── Loan lifecycle timeline ────────────────────────────────────── */}
      {!['REJECTED', 'CANCELLED'].includes(loan.status) && (
        <div className={`${cardCls} px-6 py-5`}>
          <div className="overflow-x-auto">
            <div className="flex items-start min-w-[480px] sm:min-w-0">
              {TIMELINE_STEPS.map((step, i) => {
                const state = getStepState(step.id, loan.status)
                const isLast = i === TIMELINE_STEPS.length - 1
                const nextState = !isLast ? getStepState(TIMELINE_STEPS[i + 1].id, loan.status) : null
                const connectorGreen = state === 'complete' && (nextState === 'complete' || nextState === 'current')
                return (
                  <Fragment key={step.id}>
                    {/* Step: fixed width, shrink-0 */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 w-[72px]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        state === 'complete'
                          ? 'bg-green-500 text-white'
                          : state === 'current'
                            ? 'bg-[#00E5FF] text-[#0A192F] ring-4 ring-[#00E5FF]/20'
                            : 'bg-gray-100 dark:bg-[#0F172A] text-gray-400 dark:text-gray-500'
                      }`}>
                        {state === 'complete'
                          ? <i className="fa-solid fa-check text-xs" />
                          : <i className={`${step.icon} text-xs`} />
                        }
                      </div>
                      <p className={`text-[10px] font-medium text-center whitespace-nowrap ${
                        state === 'complete'
                          ? 'text-green-600 dark:text-green-400'
                          : state === 'current'
                            ? 'text-[#0A192F] dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.id === 'requested' && (
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center leading-tight">{formatDate(loan.createdAt)}</p>
                      )}
                      {step.id === 'disbursed' && state === 'complete' && loan.disbursedAt && (
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center leading-tight">{formatDate(loan.disbursedAt)}</p>
                      )}
                    </div>
                    {/* Connector: flex-1, aligned to circle center (mt-[18px] = half of 36px circle) */}
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mt-[18px] shrink-0 min-w-[8px] transition-colors ${
                        connectorGreen ? 'bg-green-400' : 'bg-gray-100 dark:bg-white/8'
                      }`} />
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Disbursement in progress banner ─────────────────────────────── */}
      {loan.status === 'SIGNED' && (
        <div className={`${cardCls} p-4 border-l-2 border-l-[#00E5FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] shrink-0">
              <i className="fa-solid fa-paper-plane" />
            </div>
            <div>
              <p className="font-semibold text-[#0A192F] dark:text-white text-sm">Tu dinero está en camino</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estamos procesando la transferencia de{' '}
                <strong className="text-[#0A192F] dark:text-white">{formatCurrency(loan.netDisbursed)}</strong>{' '}
                a tu cuenta registrada. Puede demorar hasta 24 horas hábiles.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#00E5FF] font-medium shrink-0">
            <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse inline-block" />
            En proceso
          </div>
        </div>
      )}

      {/* ── Sign contract banner ────────────────────────────────────────── */}
      {canSign(loan) && (
        <div className="rounded-lg p-5 border-2 border-[#D4AF37]/60 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-[#D4AF37]/10 dark:to-[#D4AF37]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0A192F] shrink-0">
              <i className="fa-solid fa-file-signature text-lg" />
            </div>
            <div>
              <p className="font-bold text-[#0A192F] dark:text-white text-base">¡Tu préstamo fue aprobado!</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                Firma el contrato ahora para recibir{' '}
                <strong className="text-[#0A192F] dark:text-[#D4AF37]">{formatCurrency(loan.netDisbursed)}</strong>{' '}
                en tu cuenta.
              </p>
            </div>
          </div>
          <button
            onClick={handleSign}
            className="bg-[#D4AF37] text-[#0A192F] font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-[#B8941F] transition-colors shrink-0 flex items-center gap-2"
          >
            <i className="fa-solid fa-signature" />
            Firmar contrato
          </button>
        </div>
      )}

      {/* ── Mora breakdown card ─────────────────────────────────────────── */}
      {balance?.isOverdue && (
        <div className="rounded-lg border-2 border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 bg-red-100 dark:bg-red-900/30 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-700 dark:text-red-300 text-sm">Préstamo en Mora</span>
              {balance.daysOverdue > 0 && (
                <span className="text-xs bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                  {balance.daysOverdue} días vencido
                </span>
              )}
            </div>
            {balance.moraLevel > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">Nivel de mora:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(lvl => (
                    <div
                      key={lvl}
                      className={`w-4 h-4 rounded-sm ${lvl <= balance.moraLevel ? 'bg-red-500 dark:bg-red-400' : 'bg-red-200 dark:bg-red-800/40'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-red-500 dark:text-red-400">{balance.moraLevel}/4</span>
              </div>
            )}
          </div>

          {/* Breakdown rows */}
          <div className="px-5 py-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Capital e intereses pendientes</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(balance.remaining)}</span>
            </div>
            {balance.moraAccrued > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Mora acumulada</span>
                <span className="font-medium text-red-600 dark:text-red-400">+{formatCurrency(balance.moraAccrued)}</span>
              </div>
            )}
            {balance.collectionFeesAccrued > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Comisión de cobranza</span>
                <span className="font-medium text-red-600 dark:text-red-400">+{formatCurrency(balance.collectionFeesAccrued)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-red-200 dark:border-red-800/40">
              <span className="font-semibold text-gray-800 dark:text-gray-100">Total a regularizar hoy</span>
              <span className="font-bold text-red-600 dark:text-red-400 text-base">
                {formatCurrency(balance.remaining + balance.moraAccrued + balance.collectionFeesAccrued)}
              </span>
            </div>
          </div>

          {/* CTA row */}
          {loan.restructureCount < 3 && (
            <div className="px-5 pb-4 flex flex-wrap gap-3">
              <button
                onClick={() => { setRestructureStep('confirm'); setRestructureOpen(true) }}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-white dark:bg-[#1E293B] border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <i className="fa-solid fa-arrows-rotate" />
                Solicitar Reestructura
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                {3 - loan.restructureCount} de 3 disponibles
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Hero: balance card + quick actions ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main balance card */}
        <div className="lg:col-span-2 bg-[#0A192F] dark:bg-[#1E293B] rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-7">
              <div>
                <p className="text-gray-400 text-xs mb-1">Saldo Pendiente</p>
                <h2 className="text-3xl font-bold text-white">{balance ? formatCurrency(balance.remaining) : '—'}</h2>
                <p className="text-xs text-gray-500 mt-1">de {formatCurrency(loan.amount)} (Monto Original)</p>
              </div>
              {nextInstallment && (
                <div className="text-right">
                  <p className="text-gray-400 text-xs mb-1">Próxima Cuota</p>
                  <h3 className="text-2xl font-bold text-[#D4AF37]">{formatCurrency(nextInstallment.amount)}</h3>
                  <p className="text-xs text-gray-500 mt-1">Vence: {formatDate(nextInstallment.dueDate)}</p>
                </div>
              )}
            </div>

            {balance && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    Progreso del préstamo ({paidCount} de {activeInstallments.length} cuotas)
                  </span>
                  <span className="text-[#00E5FF] font-medium">{progressPct}% Pagado</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-[#00E5FF] h-1.5 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className={`${cardCls} p-5 flex flex-col justify-between`}>
          <div>
            <h3 className="text-sm font-semibold text-[#0A192F] dark:text-[#D4AF37] mb-4">Acciones Rápidas</h3>
            <div className="space-y-2.5">
              {(isActiveLoan(loan) || canPay(loan)) && (
                <Link
                  href={`/loans/${loan.id}/pay`}
                  className="w-full bg-[#D4AF37] text-[#0A192F] py-2.5 rounded-lg text-center font-medium flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors text-sm"
                >
                  <i className="fa-solid fa-credit-card text-sm" />
                  Pagar Cuota Actual
                </Link>
              )}
              {(isActiveLoan(loan) || canPay(loan)) && (
                <button
                  onClick={handleOpenEarlyPayoff}
                  className="w-full bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-gray-200 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-100 dark:border-white/6 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors text-sm"
                >
                  <i className="fa-solid fa-forward-fast text-sm" />
                  Pago Anticipado
                </button>
              )}
              {canSign(loan) && (
                <button
                  onClick={handleSign}
                  className="w-full bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-gray-200 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-100 dark:border-white/6 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors text-sm"
                >
                  <i className="fa-solid fa-signature text-sm" />
                  Firmar Contrato
                </button>
              )}
              {loan.contractUrl && (
                <button
                  onClick={handleDownloadContract}
                  className="w-full text-gray-500 dark:text-gray-400 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
                >
                  <i className="fa-solid fa-file-contract text-sm" />
                  Ver Contrato
                </button>
              )}
            </div>
          </div>

          {/* Loan mini-info */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/6 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Referencia</span>
              <span className="font-mono text-gray-700 dark:text-gray-200">#{ref}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Solicitado</span>
              <span className="text-gray-700 dark:text-gray-200">{formatDate(loan.createdAt)}</span>
            </div>
            {loan.dueDate && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Vencimiento</span>
                <span className={`font-medium ${balance?.isOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {formatDate(loan.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs card ───────────────────────────────────────────────────── */}
      <div className={cardCls}>
        {/* Tab navigation */}
        <div className="flex flex-wrap border-b border-gray-100 dark:border-white/6 px-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id
                ? 'border-[#00E5FF] text-[#0A192F] dark:text-[#D4AF37]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-200 dark:hover:border-white/10'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Calendario de Pagos ────────────────────────────────── */}
        {activeTab === 'calendario' && (
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
              <h3 className="text-base font-semibold text-[#0A192F] dark:text-white">Historial y Próximos Pagos</h3>
              <div className="flex gap-4">
                {[
                  { color: 'bg-green-500', label: 'Pagada' },
                  { color: 'bg-yellow-500', label: 'Pendiente' },
                  { color: 'bg-red-500', label: 'Vencida' },
                ].map(s => (
                  <span key={s.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${s.color} inline-block`} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {activeInstallments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/6">
                      <th className="pb-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Cuota</th>
                      <th className="pb-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Fecha Vencimiento</th>
                      <th className="pb-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Monto</th>
                      <th className="pb-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Capital</th>
                      <th className="pb-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Interés</th>
                      <th className="pb-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Estado</th>
                      <th className="pb-3 px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeInstallments.map(inst => {
                      const cfg = INSTALLMENT_STATUS_CONFIG[inst.status]
                      const Icon = cfg.icon
                      const pendingAmount = inst.amount - inst.paidAmount
                      const isOverdueRow = inst.status === 'OVERDUE'
                      return (
                        <tr
                          key={inst.id}
                          className={`border-b border-gray-100 dark:border-white/6 last:border-0 transition-colors ${isOverdueRow
                            ? 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                            }`}
                        >
                          <td className="py-4 px-3 font-medium text-gray-800 dark:text-gray-200">
                            {inst.installmentNumber} / {activeInstallments.length}
                          </td>
                          <td className={`py-4 px-3 ${isOverdueRow ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                            {formatDate(inst.dueDate)}
                          </td>
                          <td className="py-4 px-3 font-medium text-gray-800 dark:text-gray-200">
                            {formatCurrency(inst.amount)}
                            {inst.paidAmount > 0 && inst.paidAmount < inst.amount && (
                              <span className="block text-xs text-gray-400">Pend: {formatCurrency(pendingAmount)}</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-gray-500 dark:text-gray-400">{formatCurrency(inst.principal)}</td>
                          <td className="py-4 px-3 text-gray-500 dark:text-gray-400">{formatCurrency(inst.interest)}</td>
                          <td className="py-4 px-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            {inst.status === 'PAID' ? (
                              <button className="text-gray-300 dark:text-gray-600" title="Ver recibo">
                                <i className="fa-solid fa-file-invoice" />
                              </button>
                            ) : inst.status === 'OVERDUE' ? (
                              <Link
                                href={`/loans/${loan.id}/pay`}
                                className="text-[#0A192F] dark:text-[#D4AF37] text-xs font-semibold hover:underline"
                              >
                                Pagar
                              </Link>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600 cursor-not-allowed text-xs">
                                <i className="fa-solid fa-lock" />
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No hay cuotas registradas.</p>
            )}

            {/* Payment history nested inside calendar tab */}
            {payments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/6">
                <h4 className="text-sm font-semibold text-[#0A192F] dark:text-white mb-4">Pagos Realizados</h4>
                <div className="space-y-2">
                  {payments.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-arrow-down text-xs" />
                        </div>
                        <div>
                          <p className="font-medium text-[#0A192F] dark:text-white text-sm">Pago Registrado</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {p.method.toLowerCase().replace('_', ' ')} · {formatDateTime(p.paidAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-semibold text-sm">
                        +{formatCurrency(p.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Desglose e Intereses ───────────────────────────────── */}
        {activeTab === 'desglose' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: credit details */}
              <div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-4">Detalles del Crédito</h3>
                <div className="divide-y divide-gray-100 dark:divide-white/6">
                  {([
                    { label: 'Monto solicitado', value: formatCurrency(loan.amount), highlight: true },
                    { label: 'Monto neto recibido', value: formatCurrency(loan.netDisbursed), highlight: true },
                    { label: 'Tasa de Interés (TEA)', value: `${loan.interestRate * 100}%` },
                    { label: 'TCEA', value: `${loan.tcea * 100}%` },
                    { label: 'Total de interés', value: formatCurrency(loan.totalInterest) },
                    { label: 'Plazo', value: `${loan.termDays} días` },
                    { label: 'Nº cuotas', value: `${loan.numInstallments} cuota${loan.numInstallments > 1 ? 's' : ''}` },
                    { label: 'Valor por cuota', value: formatCurrency(loan.installmentAmount) },
                    { label: 'Fecha de solicitud', value: formatDate(loan.createdAt) },
                    ...(loan.dueDate ? [{ label: 'Fecha de vencimiento', value: formatDate(loan.dueDate) }] : []),
                    ...(loan.disbursedAt ? [{ label: 'Fecha de desembolso', value: formatDate(loan.disbursedAt) }] : []),
                  ] as { label: string; value: string; highlight?: boolean }[]).map(item => (
                    <div key={item.label} className="flex justify-between py-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                      <span className={`text-sm font-medium ${item.highlight ? 'text-[#0A192F] dark:text-[#D4AF37]' : 'text-gray-800 dark:text-gray-200'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: fee breakdown + balance */}
              <div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-4">Comisiones y Saldo</h3>
                <div className="divide-y divide-gray-100 dark:divide-white/6">
                  {([
                    { label: 'Com. de desembolso', value: formatCurrency(loan.disbursementFee) },
                    { label: 'Com. de tecnología', value: formatCurrency(loan.techFee) },
                    { label: 'Com. de mantenimiento', value: `${formatCurrency(loan.maintenanceFee)} × ${loan.numInstallments}` },
                    { label: 'Total com. mantenimiento', value: formatCurrency(loan.maintenanceFeeTotal) },
                    { label: 'IGV (18%)', value: formatCurrency(loan.igvAmount) },
                    { label: 'Total a devolver', value: formatCurrency(loan.totalAmount), highlight: true },
                    ...(balance ? [
                      { label: 'Total pagado', value: formatCurrency(balance.totalPaid), green: true },
                      { label: 'Saldo pendiente', value: formatCurrency(balance.remaining), bold: true },
                    ] : []),
                  ] as { label: string; value: string; highlight?: boolean; green?: boolean; bold?: boolean }[]).map(item => (
                    <div key={item.label} className="flex justify-between py-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                      <span className={`text-sm font-medium ${item.green ? 'text-green-600 dark:text-green-400' :
                        item.highlight ? 'text-[#0A192F] dark:text-[#D4AF37]' :
                          item.bold ? 'text-[#0A192F] dark:text-white font-semibold' :
                            'text-gray-800 dark:text-gray-200'
                        }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Documentos ────────────────────────────────────────── */}
        {activeTab === 'documentos' && (
          <div className="p-6">
            <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-5">Contratos y Documentos Legales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Contrato de Préstamo */}
              <button
                onClick={loan.contractUrl ? handleDownloadContract : undefined}
                disabled={!loan.contractUrl}
                className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-white/6 p-4 rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#0F172A]/80 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-file-pdf text-sm" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 dark:text-gray-200 font-medium text-sm">Contrato de Préstamo</h4>
                    <p className="text-xs text-gray-500">
                      {loan.contractUrl ? `Firmado el ${formatDate(loan.createdAt)}` : 'Pendiente de firma'}
                    </p>
                  </div>
                </div>
                <i className="fa-solid fa-download text-gray-400 dark:text-gray-500 text-sm" />
              </button>

              {/* Tabla de Amortización — TODO: endpoint not yet available */}
              <div className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-white/6 p-4 rounded-lg flex items-center justify-between opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-file-invoice-dollar text-sm" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 dark:text-gray-200 font-medium text-sm">Tabla de Amortización</h4>
                    {/* TODO: connect to amortization download endpoint */}
                    <p className="text-xs text-gray-500">Próximamente disponible</p>
                  </div>
                </div>
                <i className="fa-solid fa-download text-gray-400 dark:text-gray-500 text-sm" />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ── Support section ─────────────────────────────────────────────── */}
      <div className={`${cardCls} p-5 flex flex-col md:flex-row items-center justify-between gap-5`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-700/30 shrink-0">
            <i className="fa-solid fa-headset text-[#0A192F] dark:text-[#00E5FF]" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">¿Problemas con este préstamo?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Si tienes dudas sobre tu cuota o necesitas reestructurar tu deuda, contáctanos.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <button className="flex-1 md:flex-none px-5 py-2 rounded-lg cursor-pointer border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <i className="fa-brands fa-whatsapp text-green-500" />
            Chat
          </button>
          <button className="flex-1 md:flex-none px-5 py-2 rounded-lg cursor-pointer bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] hover:bg-[#0A192F]/90 dark:hover:bg-[#B8941F] transition-colors text-sm font-medium">
            Llamar a Soporte
          </button>
        </div>
      </div>

      {/* ── Restructure modal ───────────────────────────────────────────── */}
      {restructureOpen && balance && loan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${cardCls} w-full max-w-md shadow-2xl`}>

            {restructureStep === 'confirm' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                      <i className="fa-solid fa-arrows-rotate" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Reestructuración de Deuda</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Genera un nuevo plan de pagos</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRestructureOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-sm" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Debt capitalization summary */}
                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700/30 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-3">Lo siguiente se capitalizará en tu nuevo préstamo:</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Capital e intereses pendientes</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(balance.remaining)}</span>
                    </div>
                    {balance.moraAccrued > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Mora capitalizada</span>
                        <span className="font-medium text-red-600 dark:text-red-400">+{formatCurrency(balance.moraAccrued)}</span>
                      </div>
                    )}
                    {balance.collectionFeesAccrued > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Cargos de cobranza</span>
                        <span className="font-medium text-red-600 dark:text-red-400">+{formatCurrency(balance.collectionFeesAccrued)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-orange-200 dark:border-orange-700/30">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Nuevo capital estimado</span>
                      <span className="font-bold text-[#0A192F] dark:text-white">
                        {formatCurrency(balance.remaining + balance.moraAccrued + balance.collectionFeesAccrued)}
                      </span>
                    </div>
                  </div>

                  {/* Installments selector */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Número de nuevas cuotas
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <button
                          key={n}
                          onClick={() => setRestructureInstallments(n)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${
                            restructureInstallments === n
                              ? 'bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] border-transparent'
                              : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/4 rounded-lg p-3">
                    <i className="fa-solid fa-circle-info text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                    <p>
                      Esta acción es <strong className="text-gray-700 dark:text-gray-300">irreversible</strong>. Contará como{' '}
                      <strong className="text-gray-700 dark:text-gray-300">reestructuración {loan.restructureCount + 1} de 3</strong>.
                      Las cuotas anteriores quedarán marcadas como reestructuradas.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 pt-0">
                  <button
                    onClick={() => setRestructureOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/4 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRestructure}
                    disabled={restructureLoading}
                    className="flex-1 py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] text-sm font-semibold hover:bg-[#0A192F]/90 dark:hover:bg-[#B8941F] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {restructureLoading ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin text-xs" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-arrows-rotate text-xs" />
                        Confirmar reestructura
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {restructureStep === 'done' && restructureResult && (
              <>
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-white/6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-3">
                    <i className="fa-solid fa-check text-lg" />
                  </div>
                  <h3 className="font-semibold text-[#0A192F] dark:text-white">¡Reestructuración completada!</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tu nuevo plan de pagos está activo</p>
                </div>

                {/* New plan summary */}
                <div className="p-5 space-y-2.5">
                  {[
                    { label: 'Nuevo capital', value: formatCurrency(restructureResult.newPrincipal) },
                    { label: 'Mora capitalizada', value: formatCurrency(restructureResult.capitalizedDebt) },
                    { label: 'Cuota mensual', value: formatCurrency(restructureResult.newInstallmentAmount) },
                    { label: 'Nº de cuotas', value: `${restructureResult.newNumInstallments}` },
                    { label: 'Nuevo vencimiento', value: formatDate(restructureResult.newDueDate) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => { setRestructureOpen(false); setRestructureResult(null); setRestructureStep('confirm') }}
                    className="w-full py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] text-sm font-semibold hover:bg-[#0A192F]/90 dark:hover:bg-[#B8941F] transition-colors"
                  >
                    Ver nuevo calendario
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Early Payoff modal ──────────────────────────────────────────── */}
      {earlyPayoffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${cardCls} w-full max-w-md shadow-2xl`}>

            {earlyPayoffStep === 'quote' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                      <i className="fa-solid fa-forward-fast" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Pago Anticipado Total</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Liquida tu préstamo hoy y ahorra intereses</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEarlyPayoffOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-sm" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {earlyPayoffQuoteLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <i className="fa-solid fa-spinner animate-spin text-2xl text-[#0A192F] dark:text-[#D4AF37]" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Calculando tu cotización...</p>
                    </div>
                  ) : earlyPayoffQuote && (
                    <>
                      {/* Cost breakdown */}
                      <div className="bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Desglose del pago</p>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Capital pendiente</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(earlyPayoffQuote.outstandingPrincipal)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Interés devengado
                            <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({earlyPayoffQuote.daysElapsed} días)</span>
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(earlyPayoffQuote.accruedInterest)}</span>
                        </div>

                        {earlyPayoffQuote.accruedMaintenanceFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Com. mantenimiento (proporcional)</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(earlyPayoffQuote.accruedMaintenanceFee)}</span>
                          </div>
                        )}

                        {earlyPayoffQuote.moraAccrued > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-orange-600 dark:text-orange-400">Intereses moratorios</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(earlyPayoffQuote.moraAccrued)}</span>
                          </div>
                        )}

                        {earlyPayoffQuote.collectionFeesAccrued > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-orange-600 dark:text-orange-400">Gastos de cobranza</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(earlyPayoffQuote.collectionFeesAccrued)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-white/10">
                          <span className="font-bold text-gray-800 dark:text-gray-100">Total a pagar hoy</span>
                          <span className="font-bold text-[#0A192F] dark:text-[#D4AF37] text-base">{formatCurrency(earlyPayoffQuote.payoffAmount)}</span>
                        </div>
                      </div>

                      {/* Savings banner */}
                      {earlyPayoffQuote.interestSaved > 0 && (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700/30 rounded-lg px-4 py-2.5">
                          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                            <i className="fa-solid fa-piggy-bank" />
                            <span>Ahorro en intereses futuros</span>
                          </div>
                          <span className="font-semibold text-green-700 dark:text-green-400 text-sm">
                            −{formatCurrency(earlyPayoffQuote.interestSaved)}
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/4 rounded-lg p-3">
                        <i className="fa-solid fa-circle-info text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                        <p>Al confirmar, tu préstamo quedará <strong className="text-gray-700 dark:text-gray-300">completamente liquidado</strong>. Esta acción es irreversible.</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {!earlyPayoffQuoteLoading && earlyPayoffQuote && (
                  <div className="p-5 pt-0 space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEarlyPayoffOpen(false)}
                        className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/4 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleEarlyPayoff}
                        disabled={earlyPayoffLoading}
                        className="flex-1 py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {earlyPayoffLoading ? (
                          <>
                            <i className="fa-solid fa-spinner animate-spin text-xs shrink-0" />
                            <span className="text-sm">Procesando...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-lock text-xs shrink-0" />
                            <span className="flex flex-col items-start leading-tight">
                              <span className="text-[11px] opacity-80 font-medium">Pagar anticipado</span>
                              <span className="text-sm">{formatCurrency(earlyPayoffQuote.payoffAmount)}</span>
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                      <i className="fa-solid fa-shield-halved" />
                      Pago seguro procesado por Culqi · Cifrado 256-bit
                    </p>
                  </div>
                )}
              </>
            )}

            {earlyPayoffStep === 'done' && (
              <>
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto">
                    <i className="fa-solid fa-circle-check text-3xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A192F] dark:text-white text-lg">¡Préstamo liquidado!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                      Tu pago anticipado fue procesado exitosamente. El préstamo está completamente saldado.
                    </p>
                  </div>
                  {earlyPayoffQuote && earlyPayoffQuote.interestSaved > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700/30 rounded-lg p-3">
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        <i className="fa-solid fa-piggy-bank mr-1.5" />
                        Ahorraste {formatCurrency(earlyPayoffQuote.interestSaved)} en intereses
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-5 pb-5">
                  <button
                    onClick={() => { setEarlyPayoffOpen(false); setEarlyPayoffStep('quote'); setEarlyPayoffQuote(null) }}
                    className="w-full py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] text-sm font-semibold hover:bg-[#0A192F]/90 dark:hover:bg-[#B8941F] transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
