'use client'
import { useEffect, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Sparkles, TrendingDown } from 'lucide-react'
import { loanRepository, useLoanStore } from '@/features/request-loan'
import { useAuthStore } from '@/features/auth'
import { formatCurrency, loanRef } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

const manualSchema = z.object({
  amount: z.number({ invalid_type_error: 'Ingresa un monto' }).positive('Debe ser mayor a 0'),
  method: z.enum(['YAPE', 'PLIN', 'BANK_TRANSFER', 'CASH'], { required_error: 'Selecciona un método' }),
  reference: z.string().optional(),
})
type ManualInput = z.infer<typeof manualSchema>

const earlyPayoffMethodSchema = z.object({
  method: z.enum(['YAPE', 'PLIN', 'BANK_TRANSFER', 'CASH'], { required_error: 'Selecciona un método' }),
  reference: z.string().optional(),
})
type EarlyPayoffMethodInput = z.infer<typeof earlyPayoffMethodSchema>

const MANUAL_METHODS = [
  { value: 'YAPE' as const, label: 'Yape', icon: 'fa-solid fa-mobile-screen-button' },
  { value: 'PLIN' as const, label: 'Plin', icon: 'fa-solid fa-mobile-screen' },
  { value: 'BANK_TRANSFER' as const, label: 'Transferencia', icon: 'fa-solid fa-building-columns' },
  { value: 'CASH' as const, label: 'Efectivo', icon: 'fa-solid fa-money-bills' },
]

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/6 bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500'

export default function PayLoanPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const router = useRouter()
  const { selectedLoan: loan, balance, earlyPayoffQuote, isLoading, loadLoanDetails, loadEarlyPayoffQuote, partialPayLoan, earlyPayoff } = useLoanStore()
  const { user } = useAuthStore()
  const [showEarlyPayoff, setShowEarlyPayoff] = useState(false)
  const [isEarlyPayoffSubmitting, setIsEarlyPayoffSubmitting] = useState(false)
  const [activeMethod, setActiveMethod] = useState<'card' | 'manual'>('card')

  useEffect(() => { loadLoanDetails(loanId) }, [loanId, loadLoanDetails])
  useEffect(() => {
    if (loan && ['ACTIVE', 'OVERDUE'].includes(loan.status)) loadEarlyPayoffQuote(loanId)
  }, [loanId, loan, loadEarlyPayoffQuote])

  const form = useForm<ManualInput>({
    resolver: zodResolver(manualSchema),
    defaultValues: { amount: 0, method: 'YAPE', reference: '' },
  })
  const earlyPayoffForm = useForm<EarlyPayoffMethodInput>({
    resolver: zodResolver(earlyPayoffMethodSchema),
    defaultValues: { method: 'YAPE', reference: '' },
  })

  useEffect(() => {
    if (balance) form.setValue('amount', balance.remaining)
  }, [balance, form])

  const handleCardPayment = useCallback(() => {
    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    if (!publicKey) { toast.error('El pago con tarjeta no está disponible en este momento.'); return }
    if (!balance) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CulqiConstructor = (globalThis as any).Culqi
    if (!CulqiConstructor) { toast.error('Cargando pasarela de pago, intenta en un momento.'); return }
    const culqi = new CulqiConstructor({ publicKey })
    culqi.open({
      settings: {
        title: 'Solvo', currency: 'PEN',
        description: `Pago préstamo #${loanRef(loanId)}`,
        amount: Math.round(balance.remaining * 100),
      },
    })
    culqi.on('token', async ({ id: culqiToken }: { id: string }) => {
      culqi.close()
      try {
        await loanRepository.chargeCard({ loanId, amount: balance.remaining, culqiToken })
        toast.success('¡Pago con tarjeta procesado correctamente!')
        router.push(`/loans/${loanId}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al procesar el pago')
      }
    })
    culqi.on('error', (err: { user_message?: string }) => {
      toast.error(err.user_message || 'Error en la pasarela de pago.')
    })
  }, [balance, loanId, router])

  const onSubmit = async (values: ManualInput) => {
    try {
      await partialPayLoan(loanId, values)
      const isPartial = balance && values.amount < balance.remaining
      toast.success(isPartial
        ? '¡Pago parcial registrado! El equipo Solvo lo verificará pronto.'
        : '¡Pago registrado! El equipo Solvo lo verificará pronto.')
      router.push(`/loans/${loanId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar el pago')
    }
  }

  const onEarlyPayoffSubmit = async (values: EarlyPayoffMethodInput) => {
    setIsEarlyPayoffSubmitting(true)
    try {
      await earlyPayoff(loanId, values)
      toast.success('¡Pago anticipado registrado! Tu préstamo quedará cancelado una vez verificado.')
      router.push(`/loans/${loanId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar el pago anticipado')
    } finally {
      setIsEarlyPayoffSubmitting(false)
    }
  }

  if (isLoading || !loan || !balance) {
    return (
      <div className="space-y-6 max-w-2xl">
        {/* Breadcrumb */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-7 w-56" />
        </div>
        {/* Balance summary card */}
        <div className={`${cardCls} p-6 space-y-4`}>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-36" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-white/6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
        {/* Payment form card */}
        <div className={`${cardCls} p-6 space-y-5`}>
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/6">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  const currentAmount = form.watch('amount')
  const isPartialAmount = currentAmount > 0 && currentAmount < balance.remaining

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/loans/${loanId}`}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors "
        >
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F] dark:text-white">Realizar Pago</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Préstamo #{loanRef(loanId)}</p>
        </div>
      </div>

      {/* Balance summary */}
      <div className="rounded-lg p-6 relative overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#00E5FF]/20 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-gray-300 text-sm mb-1">Saldo Pendiente</p>
          <p className="text-4xl font-bold text-white mb-4">{formatCurrency(balance.remaining)}</p>
          {balance.dueDate && (
            <p className="text-gray-300 text-sm">
              Vence el {new Date(balance.dueDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          {balance.isOverdue && (
            <div className="flex items-center gap-2 mt-2 text-red-300 text-sm">
              <i className="fa-solid fa-triangle-exclamation" />
              Este préstamo está vencido
            </div>
          )}
        </div>
      </div>

      {/* Early payoff offer */}
      {earlyPayoffQuote && !showEarlyPayoff && (
        <div className={`${cardCls} p-5 border-l-2 border-l-emerald-400`}>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#0A192F] dark:text-white text-sm">Cancela hoy y ahorra en intereses</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Solo pagas el capital: <strong className="text-[#0A192F] dark:text-[#D4AF37]">{formatCurrency(earlyPayoffQuote.payoffAmount)}</strong>
                {earlyPayoffQuote.interestSaved > 0 && (
                  <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                    — ahorras <strong>{formatCurrency(earlyPayoffQuote.interestSaved)}</strong>
                  </span>
                )}
              </p>
              <button
                onClick={() => setShowEarlyPayoff(true)}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <TrendingDown className="h-4 w-4" />
                Pagar anticipado ({formatCurrency(earlyPayoffQuote.payoffAmount)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Early payoff form */}
      {showEarlyPayoff && earlyPayoffQuote && (
        <div className={`${cardCls} p-6 border border-emerald-200 dark:border-emerald-800`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">Pago Anticipado</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
            Pagarás <strong>{formatCurrency(earlyPayoffQuote.payoffAmount)}</strong> y tu préstamo quedará cancelado.
            {earlyPayoffQuote.interestSaved > 0 && <> Ahorras <strong>{formatCurrency(earlyPayoffQuote.interestSaved)}</strong>.</>}
          </p>
          <form onSubmit={earlyPayoffForm.handleSubmit(onEarlyPayoffSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de pago</label>
              <div className="grid grid-cols-2 gap-2">
                {MANUAL_METHODS.map(m => {
                  const selected = earlyPayoffForm.watch('method') === m.value
                  return (
                    <button key={m.value} type="button"
                      onClick={() => earlyPayoffForm.setValue('method', m.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${selected
                        ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/10 text-[#0A192F] dark:text-[#D4AF37]'
                        : 'border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                        }`}
                    >
                      <i className={`${m.icon} text-base`} />
                      {m.label}
                    </button>
                  )
                })}
              </div>
              {earlyPayoffForm.formState.errors.method && (
                <p className="text-red-500 text-xs mt-1">{earlyPayoffForm.formState.errors.method.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de operación</label>
              <input type="text" placeholder="Ej: 123456789" className={inputCls}
                {...earlyPayoffForm.register('reference')} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowEarlyPayoff(false)}
                className="flex-1 py-3 rounded-xl border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={isEarlyPayoffSubmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                {isEarlyPayoffSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Registrando...</>
                  : `Confirmar pago de ${formatCurrency(earlyPayoffQuote.payoffAmount)}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment method selector */}
      {!showEarlyPayoff && (
        <>
          {/* Method toggle */}
          <div className={`${cardCls} p-2`}>
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: 'card' as const, icon: 'fa-solid fa-credit-card', label: 'Tarjeta' },
                { id: 'manual' as const, icon: 'fa-solid fa-mobile-screen-button', label: 'Yape / Transferencia' },
              ].map(m => (
                <button key={m.id} onClick={() => setActiveMethod(m.id)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${activeMethod === m.id
                    ? 'bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                    }`}
                >
                  <i className={m.icon} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card payment */}
          {activeMethod === 'card' && (
            <div className={`${cardCls} p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#0A192F]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#0A192F] dark:text-[#D4AF37]">
                  <i className="fa-solid fa-credit-card" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Pagar con tarjeta</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Visa o Mastercard — confirmación inmediata</p>
                </div>
              </div>
              <div className="mt-5 p-4 rounded-lg bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-white/6 flex justify-between items-center mb-5">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total a pagar</span>
                <span className="text-xl font-bold text-[#0A192F] dark:text-[#D4AF37]">{formatCurrency(balance.remaining)}</span>
              </div>
              <button
                onClick={handleCardPayment}
                disabled={!user}
                className="w-full bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-lock" />
                Pagar {formatCurrency(balance.remaining)} con tarjeta
              </button>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                <i className="fa-solid fa-shield-halved mr-1" />
                Pago seguro procesado por Culqi
              </p>
            </div>
          )}

          {/* Manual payment */}
          {activeMethod === 'manual' && (
            <div className={`${cardCls} p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#0A192F]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#0A192F] dark:text-[#D4AF37]">
                  <i className="fa-solid fa-mobile-screen-button" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Yape / Plin / Transferencia</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isPartialAmount ? 'Pago parcial — se aplica a cuotas más antiguas' : 'Ingresa el número de operación para verificar'}
                  </p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-5">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monto a pagar (S/)
                    {isPartialAmount && (
                      <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400">Pago parcial</span>
                    )}
                  </label>
                  <input
                    type="number" step="0.01" min="0.01" max={balance.remaining}
                    className={inputCls}
                    {...form.register('amount', { valueAsNumber: true })}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                {/* Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MANUAL_METHODS.map(m => {
                      const selected = form.watch('method') === m.value
                      return (
                        <button key={m.value} type="button"
                          onClick={() => form.setValue('method', m.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${selected
                            ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/10 text-[#0A192F] dark:text-[#D4AF37]'
                            : 'border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                            }`}
                        >
                          <i className={`${m.icon} text-base`} />
                          {m.label}
                        </button>
                      )
                    })}
                  </div>
                  {form.formState.errors.method && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.method.message}</p>
                  )}
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de operación</label>
                  <input type="text" placeholder="Ej: 123456789" className={inputCls}
                    {...form.register('reference')} />
                </div>

                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {form.formState.isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Registrando...</>
                    : isPartialAmount
                      ? `Registrar pago parcial de ${formatCurrency(currentAmount)}`
                      : 'Registrar pago'}
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  El equipo Solvo verificará tu pago en las próximas horas.
                </p>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  )
}
