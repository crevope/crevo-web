'use client'
import { useEffect } from 'react'

/**
 * Registers the combined Firebase + PWA caching Service Worker at root scope.
 *
 * Runs once per session on mount. Decoupled from `usePushNotifications` so
 * the caching strategies (static asset cache, offline fallback) kick in for
 * every visitor — not only those who grant notification permission. Firebase
 * Messaging piggybacks on the same registration when the push hook runs
 * later, so we never end up with two competing SWs for `/`.
 *
 * Silent on failure: SW registration is a nice-to-have. If the browser
 * blocks it (private tab, feature flag off, HTTP), the site keeps working
 * exactly as before.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // Localhost over plain HTTP is fine; SWs require HTTPS otherwise and
    // the browser will refuse silently. Let the native check handle it.

    navigator.serviceWorker.register('/api/firebase-messaging-sw', { scope: '/' }).catch(() => {
      // No-op: caching is best-effort.
    })
  }, [])
}
