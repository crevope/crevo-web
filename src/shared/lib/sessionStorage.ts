import { CONSENT_STORAGE_KEY } from '@/features/cookie-consent/lib/consentStorage'

/**
 * localStorage keys that must SURVIVE a logout (manual or automatic).
 *
 * - Cookie consent: regulated by Ley N° 29733 + Directiva ANPDP 01-2020. We
 *   are not allowed to forget the user's decision; they must explicitly
 *   change it. Wiping it on logout would force them to re-consent every time
 *   they log back in, which is bad UX and arguably non-compliant.
 *
 * - Theme: pure UX preference. People expect dark mode to stick across
 *   sessions; next-themes persists it under the `theme` key.
 *
 * Add anything else that's a long-lived user preference (language, currency
 * format, opt-out flags, etc.) to this list.
 */
const PRESERVED_KEYS: ReadonlySet<string> = new Set([
  CONSENT_STORAGE_KEY, // 'crevo_cookie_consent'
  'theme', // next-themes
])

/**
 * Wipes localStorage on logout, preserving the keys listed in PRESERVED_KEYS.
 *
 * We iterate-and-remove instead of `localStorage.clear()` because:
 *   1. We need to keep the preference keys.
 *   2. clear() wipes EVERY origin's localStorage on the same domain in some
 *      edge cases — being explicit is safer.
 *
 * Silent on failure: localStorage can be blocked (Safari private mode, user
 * settings). The auth flow must not break because of storage quirks.
 */
export function clearAuthLocalStorage(): void {
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && !PRESERVED_KEYS.has(key)) {
        toRemove.push(key)
      }
    }
    toRemove.forEach((key) => {
      try {
        window.localStorage.removeItem(key)
      } catch {
        // Per-key failure is non-fatal.
      }
    })
  } catch {
    // Reading localStorage itself can throw under strict policies.
  }
}
