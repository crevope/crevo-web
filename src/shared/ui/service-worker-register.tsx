'use client'
import { useServiceWorker } from '@/shared/hooks/useServiceWorker'

/**
 * Client-only mount point for the global Service Worker registration.
 *
 * Lives in the root layout so every visitor — authenticated or not — picks
 * up the caching SW on the first page view. Rendered as a fragment with no
 * visual output; the only side effect is the `useServiceWorker` hook.
 *
 * Separated from the layout itself so the layout can stay a Server Component
 * (zero client runtime cost for its static chrome); this file is the smallest
 * possible `'use client'` island.
 */
export function ServiceWorkerRegister() {
  useServiceWorker()
  return null
}
