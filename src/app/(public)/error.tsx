'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { TriangleAlert, RotateCw, Home } from 'lucide-react'

/**
 * Error boundary for every page inside the `(public)` route group.
 *
 * Unlike the private version we surface a "Volver al inicio" escape hatch —
 * public pages are often entry points via organic/paid traffic where keeping
 * the user on a broken page is worse than sending them to the landing. The
 * retry is still primary since most errors are transient.
 */
export default function PublicError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { segment: 'public' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <TriangleAlert className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2">
            Algo salió mal
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            No pudimos cargar esta página. El equipo ya fue notificado — intenta de nuevo o vuelve
            al inicio.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] font-medium text-sm transition-colors"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium text-sm transition-colors"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
