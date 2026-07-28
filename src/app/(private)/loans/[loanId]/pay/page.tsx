'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, TriangleAlert, Lock, ShieldCheck, CreditCard } from 'lucide-react'
import { useLoanStore, usePaymentCheckout, EarlyPayoffCard } from '@/features/request-loan'
import { useAuthStore } from '@/features/auth'
import { canPay } from '@/entities/loan'
import { formatCurrency, loanRef } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'
import { Input } from '@/shared/ui/input'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

type AmountType = 'full' | 'custom'

export default function PayLoanPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const router = useRouter()
  const {
    selectedLoan: loan,
    balance,
    earlyPayoffQuote,
    isLoading,
    loadLoanDetails,
    loadEarlyPayoffQuote,
  } = useLoanStore()
  const { user } = useAuthStore()
  const { pay, isProcessing, error } = usePaymentCheckout()
  const [amountType, setAmountType] = useState<AmountType>('full')
  const [customAmount, setCustomAmount] = useState('')

  useEffect(() => {
    loadLoanDetails(loanId)
  }, [loanId, loadLoanDetails])
  useEffect(() => {
    if (loan && ['ACTIVE', 'OVERDUE'].includes(loan.status)) loadEarlyPayoffQuote(loanId)
  }, [loanId, loan, loadEarlyPayoffQuote])

  // Guard: this page must not be reachable for loans that aren't payable
  // (e.g. SIGNED/DISBURSED). Redirect back to the loan detail page instead.
  useEffect(() => {
    if (!isLoading && loan && !canPay(loan)) {
      toast.error('Este préstamo no está disponible para pago en este momento.')
      router.replace(`/loans/${loanId}`)
    }
  }, [isLoading, loan, loanId, router])

  // usePaymentCheckout keeps a single error slot for whichever payment
  // action (cuota or anticipado) is in flight — surface it the same way
  // this page already did (toast), instead of duplicating error UI.
  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  // Monto de una cuota, nunca mayor al saldo pendiente (así la última cuota no
  // sobrecobra). Sin fallback al saldo completo: si installmentAmount fuera 0
  // (dato inválido) el pago queda en 0 y el botón se deshabilita — fail-safe.
  const cuotaAmount = loan && balance ? Math.min(loan.installmentAmount, balance.remaining) : 0
  const customAmountValue = parseFloat(customAmount) || 0
  const paymentAmount = amountType === 'full' ? cuotaAmount : customAmountValue
  const isCustomTooLow = amountType === 'custom' && paymentAmount < 50

  if (isLoading || !loan || !balance || !canPay(loan)) {
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
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          {balance.isOverdue && (
            <div className="flex items-center gap-2 mt-2 text-red-300 text-sm">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Este préstamo está vencido
            </div>
          )}
        </div>
      </div>

      {/* Early payoff */}
      {earlyPayoffQuote && (
        <EarlyPayoffCard
          quote={earlyPayoffQuote}
          onConfirm={() => pay(loanId, earlyPayoffQuote.payoffAmount, 'early_payoff')}
          isProcessing={isProcessing}
          disabled={!user}
        />
      )}

      {/* Regular payment */}
      <div className={`${cardCls} p-6`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[#0A192F]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#0A192F] dark:text-[#D4AF37]">
            <CreditCard className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">
              Pagar con tarjeta
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Visa o Mastercard · confirmación inmediata
            </p>
          </div>
        </div>

        {/* Amount type selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <label className="cursor-pointer block">
            <input
              type="radio"
              name="pay-amount-type"
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
                <h3 className="text-sm font-medium text-[#0A192F] dark:text-white">Pagar cuota</h3>
                <p className="text-sm font-semibold text-[#0A192F] dark:text-[#D4AF37] mt-0.5">
                  {formatCurrency(cuotaAmount)}
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

          <label className="cursor-pointer block">
            <input
              type="radio"
              name="pay-amount-type"
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
                <h3 className="text-sm font-medium text-[#0A192F] dark:text-white">Otro monto</h3>
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

        {amountType === 'custom' ? (
          <div className="mb-5">
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
        ) : (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-white/6 flex justify-between items-center mb-5">
            <span className="text-sm text-gray-600 dark:text-gray-400">Cuota a pagar</span>
            <div className="text-right">
              <span className="text-xl font-bold text-[#0A192F] dark:text-[#D4AF37]">
                {formatCurrency(cuotaAmount)}
              </span>
              {balance.dueDate && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Vence el{' '}
                  {new Date(balance.dueDate).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => pay(loanId, paymentAmount, 'regular')}
          disabled={isProcessing || !user || paymentAmount <= 0 || isCustomTooLow}
          className="w-full bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" aria-hidden="true" />
              Pagar {formatCurrency(paymentAmount)}
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
          <ShieldCheck className="inline h-3 w-3 mr-1" aria-hidden="true" />
          Pago seguro procesado por Culqi · Cifrado 256-bit
        </p>
      </div>
    </div>
  )
}
