'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { LEGAL_URLS } from '@/features/legal/lib/legalConstants'
import { useCookieConsent } from '../lib/CookieConsentContext'
import type { CookieConsentDecision } from '../lib/consentStorage'

/**
 * Dialog con toggles por categoría. Se reabre desde cualquier enlace
 * "Gestionar cookies" (ver `CookieSettingsLink`) y desde el botón
 * "Personalizar" del banner.
 */
export function CookiePreferencesDialog() {
  const { consent, isPreferencesOpen, setPreferencesOpen, savePreferences, rejectAll } =
    useCookieConsent()

  // Estado local editable. Sincroniza con el consent persistido cada vez que
  // se abre el dialog — si el user cambió de opinión, ve su decisión actual.
  const [draft, setDraft] = useState<CookieConsentDecision>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (isPreferencesOpen) {
      setDraft({
        necessary: true,
        analytics: consent?.categories.analytics ?? false,
        marketing: consent?.categories.marketing ?? false,
      })
    }
  }, [isPreferencesOpen, consent])

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={setPreferencesOpen}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0A192F] dark:text-white">
            Preferencias de cookies
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Elige qué categorías de cookies quieres permitir. Las cookies
            necesarias no se pueden desactivar porque son indispensables para
            que el sitio funcione (sesión, seguridad CSRF, preferencias
            básicas). Puedes cambiar esta decisión en cualquier momento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Necessary — locked on */}
          <div className="rounded-lg border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A]/50 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="cookie-necessary"
                checked
                disabled
                className="mt-0.5"
              />
              <div className="flex-1">
                <label
                  htmlFor="cookie-necessary"
                  className="text-sm font-medium text-[#0A192F] dark:text-white flex items-center gap-2"
                >
                  Cookies necesarias
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-200 dark:bg-[#334155] text-gray-600 dark:text-gray-300">
                    Siempre activas
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Sesión autenticada, protección CSRF, balanceo de carga y
                  preferencias mínimas (tema claro/oscuro). Sin estas cookies
                  el sitio no puede operar, por eso no son opcionales.
                </p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="cookie-analytics"
                checked={draft.analytics}
                onCheckedChange={(checked) =>
                  setDraft((d) => ({ ...d, analytics: checked === true }))
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <label
                  htmlFor="cookie-analytics"
                  className="text-sm font-medium text-[#0A192F] dark:text-white cursor-pointer"
                >
                  Cookies analíticas
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Nos ayudan a entender cómo usas el sitio de forma anónima:
                  páginas más visitadas, errores que encontrás, tiempos de
                  carga. Sin esto no podemos mejorar la experiencia. Tus datos
                  no se usan para publicidad.
                </p>
              </div>
            </div>
          </div>

          {/* Marketing */}
          <div className="rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="cookie-marketing"
                checked={draft.marketing}
                onCheckedChange={(checked) =>
                  setDraft((d) => ({ ...d, marketing: checked === true }))
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <label
                  htmlFor="cookie-marketing"
                  className="text-sm font-medium text-[#0A192F] dark:text-white cursor-pointer"
                >
                  Cookies de marketing
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Nos permiten mostrarte avisos relevantes en redes sociales y
                  otros sitios, y medir si nuestras campañas funcionan. Si las
                  rechazas, igual puedes ver publicidad de Crevo, pero será
                  genérica en lugar de personalizada.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          Más detalles en nuestra{' '}
          <Link
            href={LEGAL_URLS.COOKIES}
            className="text-[#0A192F] dark:text-[#D4AF37] hover:underline"
            onClick={() => setPreferencesOpen(false)}
          >
            Política de Cookies
          </Link>{' '}
          y la{' '}
          <Link
            href={LEGAL_URLS.PRIVACY}
            className="text-[#0A192F] dark:text-[#D4AF37] hover:underline"
            onClick={() => setPreferencesOpen(false)}
          >
            Política de Privacidad
          </Link>.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
          <Button
            variant="outline"
            onClick={rejectAll}
            className="sm:order-1"
          >
            Rechazar opcionales
          </Button>
          <Button
            onClick={() => savePreferences(draft)}
            className="bg-[#0A192F] hover:bg-[#112240] dark:bg-[#D4AF37] dark:hover:bg-[#B8932D] dark:text-[#0A192F] sm:order-2"
          >
            Guardar preferencias
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
