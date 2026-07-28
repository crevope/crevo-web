'use client'
import { useState } from 'react'
import { Sparkles, TrendingDown, PiggyBank, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import type { EarlyPayoffQuote } from '@/entities/loan'
import { formatCurrency } from '@/shared/lib/utils'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

interface EarlyPayoffCardProps {
  quote: EarlyPayoffQuote
  onConfirm: () => void
  isProcessing: boolean
  disabled?: boolean
}

/**
 * Self-contained "pago anticipado" offer, shared by /pay and /payments so the
 * copy/markup/amounts can't diverge between the two surfaces again.
 *
 * Collapsed: teaser banner ("Cancela hoy y ahorra en intereses") with the
 * payoff amount + savings. Expanded (internal state): full breakdown +
 * confirm button. The caller only supplies the quote and what to do when the
 * user confirms — it never computes or touches `payoffAmount` itself.
 */
export function EarlyPayoffCard({
  quote,
  onConfirm,
  isProcessing,
  disabled,
}: Readonly<EarlyPayoffCardProps>) {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
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
                {formatCurrency(quote.payoffAmount)}
              </strong>
              {quote.interestSaved > 0 && (
                <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                  — ahorras <strong>{formatCurrency(quote.interestSaved)}</strong>
                </span>
              )}
            </p>
            <button
              onClick={() => setExpanded(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <TrendingDown className="h-4 w-4" />
              Pagar anticipado ({formatCurrency(quote.payoffAmount)})
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${cardCls} p-6 border border-emerald-200 dark:border-emerald-800`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-emerald-500" />
        <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
          Pago Anticipado Total
        </h3>
      </div>

      {/* Desglose */}
      <div className="bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-lg p-4 space-y-2 mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          Desglose
        </p>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Capital pendiente</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {formatCurrency(quote.outstandingPrincipal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Interés devengado
            <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
              ({quote.daysElapsed} días)
            </span>
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {formatCurrency(quote.accruedInterest)}
          </span>
        </div>

        {quote.accruedMaintenanceFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Com. mantenimiento (proporcional)
            </span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {formatCurrency(quote.accruedMaintenanceFee)}
            </span>
          </div>
        )}

        {quote.moraAccrued > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-orange-600 dark:text-orange-400">Intereses moratorios</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {formatCurrency(quote.moraAccrued)}
            </span>
          </div>
        )}

        {quote.collectionFeesAccrued > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-orange-600 dark:text-orange-400">Gastos de cobranza</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {formatCurrency(quote.collectionFeesAccrued)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-white/10">
          <span className="font-bold text-gray-800 dark:text-gray-100">Total a pagar hoy</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base">
            {formatCurrency(quote.payoffAmount)}
          </span>
        </div>
      </div>

      {quote.interestSaved > 0 && (
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30 rounded-lg px-4 py-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <PiggyBank className="h-4 w-4" aria-hidden="true" />
            <span>Ahorro en intereses futuros</span>
          </div>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
            −{formatCurrency(quote.interestSaved)}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex-1 py-3 rounded-xl border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing || disabled}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" aria-hidden="true" />
              Pagar {formatCurrency(quote.payoffAmount)}
            </>
          )}
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
        <ShieldCheck className="inline h-3 w-3 mr-1" aria-hidden="true" />
        Pago seguro procesado por Culqi · Cifrado 256-bit
      </p>
    </div>
  )
}
