'use client'

import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { LEGAL_URLS } from '@/features/legal/lib/legalConstants'
import { useCookieConsent } from '../lib/CookieConsentContext'
import { CookiePreferencesDialog } from './CookiePreferencesDialog'

/**
 * Banner inferior que aparece en la primera visita o cuando sube la versión
 * del aviso. Las tres acciones obligatorias son equivalentes en peso visual,
 * cumpliendo con el principio de "consentimiento libre" (Directiva ANPDP):
 * rechazar debe ser tan fácil como aceptar.
 */
export function CookieBanner() {
  const { needsDecision, acceptAll, rejectAll, openPreferences } = useCookieConsent()

  return (
    <>
      {/* El dialog se monta siempre — su visibilidad la controla el context. */}
      <CookiePreferencesDialog />

      {needsDecision && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de cookies"
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
        >
          <div className="mx-auto max-w-3xl pointer-events-auto rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-lg bg-[#D4AF37]/10 items-center justify-center">
                <Cookie className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-[#0A192F] dark:text-white mb-1">
                  Usamos cookies
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Las cookies necesarias nos permiten mantener tu sesión y
                  proteger el sitio. Las analíticas y de marketing son opcionales
                  y nos ayudan a entender cómo usas Crevo. Puedes aceptarlas
                  todas, rechazarlas todas o elegir por categoría — tu decisión
                  se guarda para las próximas visitas. Más información en
                  nuestra{' '}
                  <Link
                    href={LEGAL_URLS.COOKIES}
                    className="text-[#0A192F] dark:text-[#D4AF37] hover:underline font-medium"
                  >
                    Política de Cookies
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                onClick={rejectAll}
                className="sm:order-1 w-full sm:w-auto"
              >
                Rechazar opcionales
              </Button>
              <Button
                variant="outline"
                onClick={openPreferences}
                className="sm:order-2 w-full sm:w-auto"
              >
                Personalizar
              </Button>
              <Button
                onClick={acceptAll}
                className="sm:order-3 w-full sm:w-auto bg-[#0A192F] hover:bg-[#112240] text-white dark:bg-[#D4AF37] dark:hover:bg-[#B8932D] dark:text-[#0A192F]"
              >
                Aceptar todo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Enlace textual para reabrir el panel desde footer / política de cookies /
 * perfil del usuario. Usar donde necesite un CTA pequeño que permita
 * modificar el consent sin volver a forzar el banner completo.
 */
export function CookieSettingsLink({ className }: { className?: string }) {
  const { openPreferences } = useCookieConsent()
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={className ?? 'text-[#0A192F] dark:text-[#D4AF37] hover:underline text-sm'}
    >
      Gestionar cookies
    </button>
  )
}
