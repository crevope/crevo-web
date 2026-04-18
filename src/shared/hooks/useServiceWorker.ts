'use client'
import { useEffect } from 'react'

/**
 * Registers the combined Firebase + PWA caching Service Worker at root
 * scope IN PRODUCTION ONLY.
 *
 * Why prod-only: the SW does cache-first for `/_next/static/*` to serve
 * stable build chunks instantly. In `next dev`, those chunks change on
 * every save (Turbopack rebuilds) but the SW would keep serving the
 * cached copy, causing hydration mismatches between the freshly-rendered
 * server HTML and the stale client bundle (the exact React 19 error
 * "server rendered HTML didn't match the client" that bit us before).
 *
 * Beyond just bypassing registration in dev, we also actively
 * **unregister** any pre-existing SW + purge its caches when the page
 * loads in dev. This handles the case where a developer ran prod once,
 * registered the SW, then went back to dev — the SW would otherwise
 * persist across sessions and keep serving stale bundles.
 *
 * Silent on failure: SW operations are best-effort. If the browser
 * blocks them (private tab, feature flag off, HTTP), the site keeps
 * working exactly as before.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV !== 'production') {
      // Dev mode — actively kill any SW that previous prod sessions left
      // behind so it can't intercept dev-server chunks.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {
          /* no-op */
        })
      // Also purge the caches the SW populated, so once a fresh prod
      // build registers a new SW it starts from a clean slate.
      if (typeof caches !== 'undefined') {
        caches
          .keys()
          .then((keys) =>
            Promise.all(keys.filter((k) => k.startsWith('crevo-')).map((k) => caches.delete(k))),
          )
          .catch(() => {
            /* no-op */
          })
      }
      return
    }

    // Production: register normally.
    navigator.serviceWorker.register('/api/firebase-messaging-sw', { scope: '/' }).catch(() => {
      // No-op: caching is best-effort.
    })
  }, [])
}
