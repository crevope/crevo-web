'use client'
import { useEffect, useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Sparkles, TrendingDown } from 'lucide-react'
import { loanRepository, useLoanStore } from '@/features/request-loan'
import { useAuthStore } from '@/features/auth'
import { formatCurrency, loanRef } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

export default function PayLoanPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const { selectedLoan: loan, balance, earlyPayoffQuote, isLoading, loadLoanDetails, loadEarlyPayoffQuote } = useLoanStore()
  const { user } = useAuthStore()
  const [showEarlyPayoff, setShowEarlyPayoff] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isEarlyPaying, setIsEarlyPaying] = useState(false)

  useEffect(() => { loadLoanDetails(loanId) }, [loanId, loadLoanDetails])
  useEffect(() => {
    if (loan && ['ACTIVE', 'OVERDUE'].includes(loan.status)) loadEarlyPayoffQuote(loanId)
  }, [loanId, loan, loadEarlyPayoffQuote])

  const handlePayNow = useCallback(async () => {
    if (!balance) return
    setIsPaying(true)
    try {
      const { checkoutUrl } = await loanRepository.createCheckout({
        loanId,
        amount: balance.remaining,
        paymentType: 'regular',
      })
      window.location.href = checkoutUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar el link de pago')
      setIsPaying(false)
    }
  }, [balance, loanId])

  const handleEarlyPayoff = useCallback(async () => {
    if (!earlyPayoffQuote) return
    setIsEarlyPaying(true)
    try {
      const { checkoutUrl } = await loanRepository.createCheckout({
        loanId,
        amount: earlyPayoffQuote.payoffAmount,
        paymentType: 'early_payoff',
      })
      window.location.href = checkoutUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar el link de pago')
      setIsEarlyPaying(false)
    }
  }, [earlyPayoffQuote, loanId])

  if (isLoading || !loan || !balance) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-7 w-56" />
        </div>
        <div className="rounded-lg h-36">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
        <div className={`${cardCls} p-6 space-y-5`}>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/loans/${loanId}`}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
        >
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F] dark:text-white">Realizar Pago</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Préstamo #{loanRef(loanId)}</p>
        </div>
      </div>

      {/* Balance summary */}
      <div
        className="rounded-lg p-6 relative overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#00E5FF]/20 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-gray-300 text-sm mb-1">Saldo Pendiente</p>
          <p className="text-4xl font-bold text-white mb-4">{formatCurrency(balance.remaining)}</p>
          {balance.dueDate && (
            <p className="text-gray-300 text-sm">
              Vence el{' '}
              {new Date(balance.dueDate).toLocaleDateString('es-PE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
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

      {/* Early payoff offer banner */}
      {earlyPayoffQuote && !showEarlyPayoff && (
        <div className={`${cardCls} p-5 border-l-2 border-l-emerald-400`}>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#0A192F] dark:text-white text-sm">
                Cancela hoy y ahorra en intereses
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Solo pagas el capital:{' '}
                <strong className="text-[#0A192F] dark:text-[#D4AF37]">
                  {formatCurrency(earlyPayoffQuote.payoffAmount)}
                </strong>
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

      {/* Early payoff confirm */}
      {showEarlyPayoff && earlyPayoffQuote && (
        <div className={`${cardCls} p-6 border border-emerald-200 dark:border-emerald-800`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
              Pago Anticipado Total
            </h3>
          </div>

          {/* Desglose */}
          <div className="bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-lg p-4 space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Desglose</p>

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
              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base">{formatCurrency(earlyPayoffQuote.payoffAmount)}</span>
            </div>
          </div>

          {earlyPayoffQuote.interestSaved > 0 && (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30 rounded-lg px-4 py-2.5 mb-4">
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <i className="fa-solid fa-piggy-bank" />
                <span>Ahorro en intereses futuros</span>
              </div>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                −{formatCurrency(earlyPayoffQuote.interestSaved)}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowEarlyPayoff(false)}
              className="flex-1 py-3 rounded-xl border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleEarlyPayoff}
              disabled={isEarlyPaying || !user}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              {isEarlyPaying
                ? <><Loader2 className="h-4 w-4 animate-spin" />Procesando...</>
                : <><i className="fa-solid fa-lock" />Pagar {formatCurrency(earlyPayoffQuote.payoffAmount)}</>}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
            <i className="fa-solid fa-shield-halved mr-1" />
            Pago seguro procesado por Culqi · Cifrado 256-bit
          </p>
        </div>
      )}

      {/* Regular payment */}
      {!showEarlyPayoff && (
        <div className={`${cardCls} p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#0A192F]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#0A192F] dark:text-[#D4AF37]">
              <i className="fa-solid fa-credit-card" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Pagar con tarjeta</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Visa o Mastercard · confirmación inmediata
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-white/6 flex justify-between items-center mb-5">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total a pagar</span>
            <span className="text-xl font-bold text-[#0A192F] dark:text-[#D4AF37]">
              {formatCurrency(balance.remaining)}
            </span>
          </div>

          <button
            onClick={handlePayNow}
            disabled={isPaying || !user}
            className="w-full bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPaying
              ? <><Loader2 className="h-4 w-4 animate-spin" />Procesando...</>
              : <><i className="fa-solid fa-lock" />Pagar {formatCurrency(balance.remaining)}</>}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
            <i className="fa-solid fa-shield-halved mr-1" />
            Pago seguro procesado por Culqi · Cifrado 256-bit
          </p>
        </div>
      )}
    </div>
  )
}
