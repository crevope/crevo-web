'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

type ReturnStatus = 'loading' | 'success' | 'pending' | 'failed'

export default function PaymentReturnPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<ReturnStatus>('loading')

  // Culqi redirige con ?order_id=ord_xxx&order_status=paid|expired|deleted
  const orderId = searchParams.get('order_id') ?? searchParams.get('orderId')
  const orderStatus = searchParams.get('order_status') ?? searchParams.get('status')
  const loanId = searchParams.get('loan_id') ?? searchParams.get('loanId')

  useEffect(() => {
    if (!orderStatus) {
      // Sin parámetros — redirigir a pagos
      router.replace('/payments')
      return
    }

    if (orderStatus === 'paid') {
      setStatus('success')
    } else if (orderStatus === 'expired' || orderStatus === 'deleted') {
      setStatus('failed')
    } else {
      // Estado intermedio (pending, etc.)
      setStatus('pending')
    }
  }, [orderStatus, router])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0A192F] dark:text-[#D4AF37]" />
        <p className="text-gray-500 dark:text-gray-400">Verificando estado del pago…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-2">¡Pago exitoso!</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Tu pago fue procesado correctamente. Puede tomar unos momentos en reflejarse en tu préstamo.
          </p>
          {orderId && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Referencia: {orderId}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {loanId ? (
            <Link
              href={`/loans/${loanId}`}
              className="flex-1 py-3 rounded-xl bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
            >
              Ver mi préstamo
            </Link>
          ) : (
            <Link
              href="/loans"
              className="flex-1 py-3 rounded-xl bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
            >
              Ver mis préstamos
            </Link>
          )}
          <Link
            href="/payments"
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium text-sm text-center hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
          >
            Historial de pagos
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-2">Pago en proceso</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          </p>
        </div>
        <Link
          href="/loans"
          className="py-3 px-6 rounded-xl bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Ver mis préstamos
        </Link>
      </div>
    )
  }

  // failed
  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-2">Pago no completado</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          El pago expiró o fue cancelado. Puedes intentarlo nuevamente cuando quieras.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {loanId ? (
          <Link
            href={`/loans/${loanId}/pay`}
            className="flex-1 py-3 rounded-xl bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
          >
            Intentar de nuevo
          </Link>
        ) : (
          <Link
            href="/payments"
            className="flex-1 py-3 rounded-xl bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
          >
            Volver a pagos
          </Link>
        )}
        <Link
          href="/loans"
          className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium text-sm text-center hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
        >
          Ver mis préstamos
        </Link>
      </div>
    </div>
  )
}
