'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

type ReturnStatus = 'loading' | 'success' | 'pending' | 'failed'

const cardCls =
  'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg shadow-sm'

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className={`${cardCls} w-full max-w-md p-10 flex flex-col items-center gap-4`}>
          <Loader2 className="h-9 w-9 animate-spin text-[#0A192F] dark:text-[#D4AF37]" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Verificando estado del pago…</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className={`${cardCls} w-full max-w-md p-8 flex flex-col items-center gap-6 text-center`}>
          <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">¡Pago exitoso!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
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
                className="flex-1 py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
              >
                Ver mi préstamo
              </Link>
            ) : (
              <Link
                href="/loans"
                className="flex-1 py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
              >
                Ver mis préstamos
              </Link>
            )}
            <Link
              href="/payments"
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium text-sm text-center hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
            >
              Historial de pagos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className={`${cardCls} w-full max-w-md p-8 flex flex-col items-center gap-6 text-center`}>
          <div className="w-16 h-16 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Clock className="h-9 w-9 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">Pago en proceso</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            </p>
          </div>
          <Link
            href="/loans"
            className="w-full py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm hover:opacity-90 transition-opacity text-center"
          >
            Ver mis préstamos
          </Link>
        </div>
      </div>
    )
  }

  // failed
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className={`${cardCls} w-full max-w-md p-8 flex flex-col items-center gap-6 text-center`}>
        <div className="w-16 h-16 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <XCircle className="h-9 w-9 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">Pago no completado</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            El pago expiró o fue cancelado. Puedes intentarlo nuevamente cuando quieras.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {loanId ? (
            <Link
              href={`/loans/${loanId}/pay`}
              className="flex-1 py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
            >
              Intentar de nuevo
            </Link>
          ) : (
            <Link
              href="/payments"
              className="flex-1 py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
            >
              Volver a pagos
            </Link>
          )}
          <Link
            href="/loans"
            className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium text-sm text-center hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
          >
            Ver mis préstamos
          </Link>
        </div>
      </div>
    </div>
  )
}
