'use client'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { TriangleAlert, RotateCw } from 'lucide-react'

/**
 * Error boundary for every page inside the `(private)` route group.
 *
 * Catches render-time errors thrown by any descendant — page component, data
 * fetch, client hook. The user keeps the sidebar + header (rendered by the
 * group layout) and sees a contained failure instead of a blank screen, with
 * a retry button that re-invokes the failed render.
 *
 * We forward the error to Sentry so the team sees the failure even if the
 * user never clicks retry. The `digest` (Next's opaque error id) is the same
 * on both client and server, which lets us correlate frontend reports with
 * backend logs when the page is a Server Component.
 */
export default function PrivateError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { segment: 'private' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <TriangleAlert className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2">
            Algo salió mal
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            No pudimos mostrar esta página. El equipo ya fue notificado — intenta de nuevo en unos
            segundos.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] font-medium text-sm transition-colors"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
