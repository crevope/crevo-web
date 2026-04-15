'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  acceptAllDecision,
  rejectAllDecision,
  readStoredConsent,
  writeStoredConsent,
  type CookieCategory,
  type CookieConsentDecision,
  type StoredConsent,
} from './consentStorage'

interface CookieConsentContextValue {
  /** Estado hidratado. `null` mientras leemos localStorage en el cliente. */
  consent: StoredConsent | null
  /** True cuando aún no hay decisión válida — el banner debe mostrarse. */
  needsDecision: boolean
  /** True hasta que el efecto de hidratación haya corrido. Evita parpadeo en SSR. */
  isHydrated: boolean
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (decision: CookieConsentDecision) => void
  /** Atajo para consumidores (`allows('analytics')` etc.). */
  allows: (category: CookieCategory) => boolean
  /** Reabrir el panel desde cualquier enlace "Gestionar cookies". */
  openPreferences: () => void
  /** Estado interno del dialog — expuesto para que el banner lo controle. */
  isPreferencesOpen: boolean
  setPreferencesOpen: (open: boolean) => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<StoredConsent | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isPreferencesOpen, setPreferencesOpen] = useState(false)

  // Hidratación cliente — lee localStorage después del primer render.
  // Mantener SSR/hidratación consistentes: el provider renderiza `null` en
  // ambos lados hasta que este efecto termina.
  useEffect(() => {
    setConsent(readStoredConsent())
    setIsHydrated(true)
  }, [])

  const persist = useCallback((decision: CookieConsentDecision) => {
    const stored = writeStoredConsent(decision)
    setConsent(stored)
    setPreferencesOpen(false)
  }, [])

  const acceptAll = useCallback(() => persist(acceptAllDecision()), [persist])
  const rejectAll = useCallback(() => persist(rejectAllDecision()), [persist])
  const savePreferences = useCallback((decision: CookieConsentDecision) => {
    persist(decision)
  }, [persist])

  const allows = useCallback(
    (category: CookieCategory) => (consent ? consent.categories[category] : false),
    [consent],
  )

  const openPreferences = useCallback(() => setPreferencesOpen(true), [])

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      needsDecision: isHydrated && consent === null,
      isHydrated,
      acceptAll,
      rejectAll,
      savePreferences,
      allows,
      openPreferences,
      isPreferencesOpen,
      setPreferencesOpen,
    }),
    [consent, isHydrated, acceptAll, rejectAll, savePreferences, allows, openPreferences, isPreferencesOpen],
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    throw new Error('useCookieConsent debe usarse dentro de un <CookieConsentProvider>')
  }
  return ctx
}
