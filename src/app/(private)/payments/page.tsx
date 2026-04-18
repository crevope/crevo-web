'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Bell,
  CreditCard,
  History,
  Receipt,
  X,
  Check,
  Clock,
  FileDown,
  FolderOpen,
  Zap,
  TriangleAlert,
  CircleAlert,
  Loader2,
  Lock,
  ShieldCheck,
  Download,
} from 'lucide-react'
import { loanRepository, useLoanStore } from '@/features/request-loan'
import { formatCurrency, formatDate, formatDateTime, loanRef } from '@/shared/lib/utils'
import type { Loan, LoanBalance, Payment } from '@/entities/loan'
import { Skeleton } from '@/shared/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Input } from '@/shared/ui/input'

const ACTIVE_STATUSES = ['APPROVED', 'SIGNED', 'ACTIVE', 'OVERDUE']

type PageTab = 'pay' | 'history'

const METHOD_LABELS: Record<string, string> = {
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  YAPE: 'Yape',
  PLIN: 'Plin',
  BBVA: 'BBVA',
  CASH: 'Efectivo',
}

interface HistoryEntry {
  payment: Payment
  loanRef: string
  loanId: string
}

type AmountType = 'full' | 'custom'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

export default function PaymentsPage() {
  const { loans, isLoading, loadMyLoans } = useLoanStore()

  const [pageTab, setPageTab] = useState<PageTab>('pay')
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [amountType, setAmountType] = useState<AmountType>('full')
  const [customAmount, setCustomAmount] = useState('')
  const [balance, setBalance] = useState<LoanBalance | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // History tab state
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoanFilter, setHistoryLoanFilter] = useState<string>('all')

  useEffect(() => {
    loadMyLoans()
  }, [loadMyLoans])

  const activeLoans = loans.filter((l) => ACTIVE_STATUSES.includes(l.status))

  const loadLoanData = useCallback(async (loanId: string) => {
    setIsLoadingBalance(true)
    try {
      const [bal, pays] = await Promise.all([
        loanRepository.getLoanBalance(loanId),
        loanRepository.getLoanPayments(loanId),
      ])
      setBalance(bal)
      setPayments(pays)
    } catch {
      setBalance(null)
      setPayments([])
    } finally {
      setIsLoadingBalance(false)
    }
  }, [])

  useEffect(() => {
    if (activeLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(activeLoans[0].id)
    }
  }, [activeLoans, selectedLoanId])

  // Load full history across all loans when switching to history tab
  useEffect(() => {
    if (pageTab !== 'history' || loans.length === 0) return
    setHistoryLoading(true)
    Promise.all(
      loans.map(async (loan) => {
        const pays = await loanRepository.getLoanPayments(loan.id).catch(() => [] as Payment[])
        return pays.map((p) => ({ payment: p, loanRef: loanRef(loan.id), loanId: loan.id }))
      }),
    )
      .then((results) => {
        const all = results
          .flat()
          .sort(
            (a, b) => new Date(b.payment.paidAt).getTime() - new Date(a.payment.paidAt).getTime(),
          )
        setHistoryEntries(all)
      })
      .finally(() => setHistoryLoading(false))
  }, [pageTab, loans])

  useEffect(() => {
    if (selectedLoanId) loadLoanData(selectedLoanId)
  }, [selectedLoanId, loadLoanData])

  const selectedLoan = loans.find((l) => l.id === selectedLoanId) ?? null

  const paymentAmount =
    amountType === 'full' ? (selectedLoan?.installmentAmount ?? 0) : parseFloat(customAmount) || 0

  const handleSubmit = async () => {
    if (!selectedLoanId || paymentAmount <= 0) return
    setIsSubmitting(true)
    setError(null)
    try {
      const { checkoutUrl } = await loanRepository.createCheckout({
        loanId: selectedLoanId,
        amount: paymentAmount,
        paymentType: 'regular',
      })
      window.location.href = checkoutUrl
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Ocurrió un error al generar el link de pago. Inténtalo de nuevo.')
      setIsSubmitting(false)
    }
  }

  const filteredHistory =
    historyLoanFilter === 'all'
      ? historyEntries
      : historyEntries.filter((e) => e.loanId === historyLoanFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">Pagos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Realiza pagos y consulta tu historial de transacciones.
          </p>
        </div>
        <Link
          href="/notifications"
          className="w-9 h-9 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Page tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        {[
          { id: 'pay' as PageTab, label: 'Realizar Pago', icon: CreditCard },
          { id: 'history' as PageTab, label: 'Historial', icon: History },
        ].map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setPageTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pageTab === tab.id
                  ? 'bg-white dark:bg-[#1E293B] text-[#0A192F] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── History tab ───────────────────────────────────────────────── */}
      {pageTab === 'history' && (
        <div className={`${cardCls}`}>
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100 dark:border-white/6">
            <h2 className="text-base font-semibold text-[#0A192F] dark:text-white">
              Historial de Transacciones
            </h2>
            {loans.length > 1 && (
              <Select
                value={historyLoanFilter}
                onValueChange={(v) => setHistoryLoanFilter(v ?? 'all')}
              >
                <SelectTrigger className="w-52 text-sm">
                  <SelectValue>
                    {historyLoanFilter === 'all'
                      ? 'Todos los préstamos'
                      : `Préstamo #${loanRef(historyLoanFilter)}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los préstamos</SelectItem>
                  {loans.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      Préstamo #{loanRef(l.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {historyLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Receipt className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Sin transacciones registradas
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Los pagos que realices aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/6">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Fecha
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Referencia
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Préstamo
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Método
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      Monto
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(({ payment: p, loanRef: ref }) => {
                    const isOk = p.status === 'CONFIRMED'
                    const isFailed = p.status === 'FAILED'
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-gray-100 dark:border-white/6 last:border-0 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
                      >
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {formatDateTime(p.paidAt)}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                          {p.reference ? `#${p.reference.slice(0, 10)}` : `#${loanRef(p.id)}`}
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/loans/${p.loanId}`}
                            className="text-[#0A192F] dark:text-[#D4AF37] hover:underline text-xs font-medium"
                          >
                            #{ref}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            {METHOD_LABELS[p.method] ?? p.method}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {isFailed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              Fallido
                            </span>
                          ) : isOk ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Exitoso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`font-semibold ${isFailed ? 'text-red-500 dark:text-red-400 line-through' : 'text-[#0A192F] dark:text-white'}`}
                          >
                            {formatCurrency(p.amount)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isOk && (
                            <button
                              onClick={() =>
                                loanRepository
                                  .downloadReceipt(p.id)
                                  .catch(() => toast.error('No se pudo descargar el comprobante'))
                              }
                              title="Descargar comprobante PDF"
                              className="text-gray-400 hover:text-[#0A192F] dark:hover:text-white transition-colors"
                            >
                              <FileDown className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Summary row */}
              {filteredHistory.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 dark:bg-[#0F172A] border-t border-gray-100 dark:border-white/6 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredHistory.length} transacción{filteredHistory.length !== 1 ? 'es' : ''}
                    {' · '}
                    {filteredHistory.filter((e) => e.payment.status === 'CONFIRMED').length}{' '}
                    exitosas
                  </span>
                  <span className="text-sm font-bold text-[#0A192F] dark:text-white">
                    Total pagado:{' '}
                    {formatCurrency(
                      filteredHistory
                        .filter((e) => e.payment.status === 'CONFIRMED')
                        .reduce((sum, e) => sum + e.payment.amount, 0),
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Pay tab ───────────────────────────────────────────────────── */}
      {pageTab === 'pay' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column (steps) ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1 – Select loan */}
            <section className={`${cardCls} p-5`}>
              <h2 className="text-sm font-semibold text-[#0A192F] dark:text-white flex items-center gap-2.5 mb-4">
                <span className="w-5 h-5 rounded-full bg-[#0A192F]/10 dark:bg-[#D4AF37]/20 text-[#0A192F] dark:text-[#D4AF37] flex items-center justify-center text-[10px] font-semibold shrink-0">
                  1
                </span>
                Seleccionar Préstamo
              </h2>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-gray-100 dark:border-white/6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <Skeleton className="h-3 w-16 ml-auto" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeLoans.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen
                    className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-gray-500 dark:text-gray-400">
                    No tienes préstamos activos para pagar.
                  </p>
                  <Link
                    href="/request-loan"
                    className="mt-4 inline-block text-sm font-medium text-[#0A192F] dark:text-[#D4AF37] underline"
                  >
                    Solicitar un préstamo
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeLoans.map((loan: Loan) => (
                    <label key={loan.id} className="cursor-pointer block">
                      <input
                        type="radio"
                        name="loan-selection"
                        className="sr-only peer"
                        checked={selectedLoanId === loan.id}
                        onChange={() => {
                          setSelectedLoanId(loan.id)
                          setAmountType('full')
                          setCustomAmount('')
                        }}
                      />
                      <div
                        className={`p-4 rounded-lg border-2 transition-all flex items-center justify-between
                      ${
                        selectedLoanId === loan.id
                          ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/5'
                          : 'border-gray-100 dark:border-white/6 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155]/30'
                      }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center shrink-0">
                            <Zap className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="text-[#0A192F] dark:text-white font-medium">
                              Préstamo Crevo
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Ref: #{loanRef(loan.id)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                              Cuota actual
                            </p>
                            <p className="text-[#0A192F] dark:text-white font-bold">
                              {formatCurrency(loan.installmentAmount)}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${
                            selectedLoanId === loan.id
                              ? 'border-[#0A192F] dark:border-[#D4AF37]'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}
                          >
                            {selectedLoanId === loan.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2 – Amount */}
            <section className={`${cardCls} p-5`}>
              <h2 className="text-sm font-semibold text-[#0A192F] dark:text-white flex items-center gap-2.5 mb-4">
                <span className="w-5 h-5 rounded-full bg-[#0A192F]/10 dark:bg-[#D4AF37]/20 text-[#0A192F] dark:text-[#D4AF37] flex items-center justify-center text-[10px] font-semibold shrink-0">
                  2
                </span>
                Monto a Pagar
              </h2>

              {isLoadingBalance || !balance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-gray-100 dark:border-white/6 flex items-center justify-between"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Full installment */}
                    <label className="cursor-pointer block">
                      <input
                        type="radio"
                        name="amount-type"
                        className="sr-only peer"
                        checked={amountType === 'full'}
                        onChange={() => setAmountType('full')}
                      />
                      <div
                        className={`p-4 rounded-lg border-2 transition-all flex items-center justify-between
                      ${
                        amountType === 'full'
                          ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/5'
                          : 'border-gray-100 dark:border-white/6 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155]/30'
                      }`}
                      >
                        <div>
                          <h3 className="text-sm font-medium text-[#0A192F] dark:text-white">
                            Pago Total de Cuota
                          </h3>
                          <p className="text-sm font-semibold text-[#0A192F] dark:text-[#D4AF37] mt-0.5">
                            {formatCurrency(selectedLoan!.installmentAmount)}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${amountType === 'full' ? 'border-[#0A192F] dark:border-[#D4AF37]' : 'border-gray-300 dark:border-gray-500'}`}
                        >
                          {amountType === 'full' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />
                          )}
                        </div>
                      </div>
                    </label>

                    {/* Custom amount */}
                    <label className="cursor-pointer block">
                      <input
                        type="radio"
                        name="amount-type"
                        className="sr-only peer"
                        checked={amountType === 'custom'}
                        onChange={() => setAmountType('custom')}
                      />
                      <div
                        className={`p-4 rounded-lg border-2 transition-all flex items-center justify-between
                      ${
                        amountType === 'custom'
                          ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/5'
                          : 'border-gray-100 dark:border-white/6 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155]/30'
                      }`}
                      >
                        <div>
                          <h3 className="text-sm font-medium text-[#0A192F] dark:text-white">
                            Otro Monto
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Pago parcial o adelantado
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${amountType === 'custom' ? 'border-[#0A192F] dark:border-[#D4AF37]' : 'border-gray-300 dark:border-gray-500'}`}
                        >
                          {amountType === 'custom' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />
                          )}
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Custom amount input */}
                  {amountType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ingresa el monto a pagar
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold z-10">
                          S/
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-9 text-lg"
                        />
                      </div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2 flex items-center gap-1">
                        <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                        El monto mínimo aceptado es de S/ 50.00
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Payment summary */}
            <section className={`${cardCls} p-5`}>
              <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-4 border-b border-gray-100 dark:border-white/6 pb-4">
                Resumen de Pago
              </h3>

              {isLoadingBalance || !balance ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/6 pt-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg mt-2" />
                  <Skeleton className="h-3 w-40 mx-auto mt-1" />
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Préstamo</span>
                      <span className="text-[#0A192F] dark:text-white font-medium text-right">
                        <>
                          Préstamo Crevo
                          <br />
                          <span className="text-xs text-gray-400">
                            #{loanRef(selectedLoan!.id)}
                          </span>
                        </>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Saldo pendiente</span>
                      <span className="text-[#0A192F] dark:text-white font-medium">
                        {formatCurrency(balance.remaining)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Monto a pagar</span>
                      <span className="text-[#0A192F] dark:text-white font-medium">
                        {paymentAmount > 0 ? formatCurrency(paymentAmount) : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-white/6 pt-3 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-[#0A192F] dark:text-white">
                        Total a Pagar
                      </span>
                      <span className="text-xl font-semibold text-[#0A192F] dark:text-[#D4AF37]">
                        {paymentAmount > 0 ? formatCurrency(paymentAmount) : '—'}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                      <CircleAlert className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedLoanId || paymentAmount <= 0}
                    className="w-full bg-[#0A192F] dark:bg-[#D4AF37] hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-[#0A192F] py-2.5 rounded-lg flex justify-center items-center gap-2 mb-3 font-semibold transition-all text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        Pagar {paymentAmount > 0 ? formatCurrency(paymentAmount) : ''}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Pago seguro procesado por Culqi · Cifrado 256-bit
                  </p>
                </>
              )}
            </section>

            {/* Recent payments */}
            <section className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white">
                  Últimos Pagos
                </h3>
                {selectedLoanId && (
                  <Link
                    href={`/loans/${selectedLoanId}`}
                    className="text-[#0A192F] dark:text-[#D4AF37] hover:underline text-sm transition-colors"
                  >
                    Ver todos
                  </Link>
                )}
              </div>

              {isLoadingBalance ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/6"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  Sin pagos registrados aún.
                </p>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => {
                    const isOk = payment.status === 'CONFIRMED'
                    const isFailed = payment.status === 'FAILED'
                    return (
                      <div
                        key={payment.id}
                        className={`flex items-center justify-between p-3 rounded-lg border
                        ${
                          isFailed
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'
                            : 'bg-gray-50 dark:bg-[#0F172A] border-gray-100 dark:border-white/6'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                          ${
                            isFailed
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          }`}
                          >
                            {isFailed ? (
                              <X className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <Check className="h-3 w-3" aria-hidden="true" />
                            )}
                          </div>
                          <div>
                            <p className="text-[#0A192F] dark:text-white font-medium text-sm">
                              {isFailed ? 'Pago Fallido' : 'Pago Exitoso'}
                            </p>
                            <p
                              className={`text-xs ${isFailed ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                              {isFailed ? 'Error al procesar' : formatDate(payment.paidAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#0A192F] dark:text-white font-bold text-sm">
                            {formatCurrency(payment.amount)}
                          </p>
                          {isOk && (
                            <button className="text-xs text-[#0A192F] dark:text-[#D4AF37] hover:underline flex items-center gap-1 justify-end mt-1">
                              <Download className="h-4 w-4" aria-hidden="true" /> Recibo
                            </button>
                          )}
                          {isFailed && (
                            <button className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded mt-1 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
                              Reintentar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
