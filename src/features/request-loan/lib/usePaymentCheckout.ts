'use client'
import { useState, useCallback } from 'react'
import { loanRepository } from '../api/loanRepository'

/**
 * Encapsulates the checkout step shared by every payment surface (/pay,
 * /payments): create the hosted checkout session and redirect the browser
 * to it. Extracted so this logic — and its error handling — can't diverge
 * between pages again.
 *
 * Both surfaces only ever have one payment action in flight at a time
 * (regular cuota OR early payoff, never both), so a single isProcessing/error
 * pair is enough — no need to track which "kind" of payment is running.
 */
export function usePaymentCheckout() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = useCallback(
    async (loanId: string, amount: number, paymentType: 'regular' | 'early_payoff') => {
      if (!(amount > 0)) return
      setIsProcessing(true)
      setError(null)
      try {
        const { checkoutUrl } = await loanRepository.createCheckout({
          loanId,
          amount,
          paymentType,
        })
        window.location.href = checkoutUrl
      } catch (e) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg ?? 'Error al generar el link de pago')
        setIsProcessing(false)
      }
    },
    [],
  )

  return { pay, isProcessing, error }
}
