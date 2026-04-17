import type { Metadata } from 'next'
import { CloudOff } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sin conexión',
  // Offline fallback is not useful in search results — it would index a
  // "you're offline" dead-end against our brand terms.
  robots: { index: false, follow: false },
}

/**
 * Offline fallback served by the Service Worker when a navigation request
 * fails (no network + no cached copy of the target page).
 *
 * Kept intentionally static and dependency-free so it's cheap to precache at
 * SW install time — no client bundle, no client hooks, just a server
 * component that renders the same markup for every visitor.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] text-gray-800 dark:text-[#F1F5F9]">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto">
          <CloudOff className="h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-2">
            Sin conexión
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            No pudimos cargar esta página porque no hay conexión a internet. Revisa tu red e
            intenta nuevamente — los datos de tu cuenta se sincronizarán automáticamente cuando
            vuelvas a estar en línea.
          </p>
        </div>
      </div>
    </div>
  )
}
