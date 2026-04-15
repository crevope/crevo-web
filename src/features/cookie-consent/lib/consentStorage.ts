/**
 * Persistencia del consentimiento granular de cookies.
 *
 * Obligación regulatoria: Ley N° 29733 + Directiva ANPDP 01-2020 exigen
 * consentimiento previo, libre, informado, específico y granular antes de
 * instalar cookies no estrictamente necesarias (analíticas, marketing).
 *
 * El consentimiento queda en localStorage y está versionado: si subimos la
 * versión (por ejemplo porque cambiamos finalidades o proveedores) el banner
 * vuelve a mostrarse y el usuario debe decidir de nuevo — esto es lo que
 * exige la Directiva ANPDP como "renovación del consentimiento".
 */

/** Sube este número cada vez que cambien las finalidades, categorías o
 *  proveedores. Fuerza a todos los visitantes a re-consentir. */
export const CONSENT_VERSION = 1

export const CONSENT_STORAGE_KEY = 'crevo_cookie_consent'

export type CookieCategory = 'necessary' | 'analytics' | 'marketing'

export interface CookieConsentDecision {
  /** Siempre true — las cookies necesarias no son opcionales. */
  necessary: true
  analytics: boolean
  marketing: boolean
}

export interface StoredConsent {
  /** Versión del aviso bajo la que se consintió. */
  version: number
  /** ISO 8601. Útil para demostrar ante la ANPDP cuándo se consintió. */
  decidedAt: string
  categories: CookieConsentDecision
}

/**
 * Lee el consentimiento almacenado. Devuelve `null` si:
 *   - No hay decisión previa (primer visitante)
 *   - La versión almacenada es anterior a la actual (hay que re-pedir consent)
 *   - El JSON está corrupto (lo tratamos como "sin consentimiento")
 */
export function readStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredConsent>
    if (!parsed || parsed.version !== CONSENT_VERSION) return null
    if (!parsed.categories || typeof parsed.categories !== 'object') return null
    // Normalizar por si un atacante manipuló el storage
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : new Date().toISOString(),
      categories: {
        necessary: true,
        analytics: parsed.categories.analytics === true,
        marketing: parsed.categories.marketing === true,
      },
    }
  } catch {
    return null
  }
}

/** Persiste una decisión nueva. No lanza si localStorage está bloqueado — el
 *  banner simplemente volverá a aparecer en la próxima visita, cosa
 *  aceptable desde el punto de vista regulatorio. */
export function writeStoredConsent(categories: CookieConsentDecision): StoredConsent {
  const decision: StoredConsent = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    categories,
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision))
    } catch {
      // Safari en modo privado, bloqueo de storage, etc. — no bloqueamos al user
    }
  }
  return decision
}

/** Acepta todas las categorías. Atajo usado por el CTA principal del banner. */
export function acceptAllDecision(): CookieConsentDecision {
  return { necessary: true, analytics: true, marketing: true }
}

/** Rechaza todo excepto lo necesario. */
export function rejectAllDecision(): CookieConsentDecision {
  return { necessary: true, analytics: false, marketing: false }
}
