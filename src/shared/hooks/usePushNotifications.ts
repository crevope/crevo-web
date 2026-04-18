'use client'
import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/shared/lib/firebase'
import { env } from '@/shared/config/env'
import { notificationsRepository } from '@/features/notifications/api/notificationsRepository'
import { useAuthStore } from '@/features/auth'

/**
 * Solicita permiso de notificaciones push al usuario (solo una vez por sesión),
 * registra el Service Worker de Firebase Messaging y guarda el token FCM en el backend.
 * Maneja mensajes en primer plano mostrando una Notification nativa del navegador.
 *
 * IMPORTANT: este hook hace `POST /notifications/fcm-token` que requiere auth
 * y CSRF. Si se dispara antes de que la sesión esté confirmada (auth todavía
 * cargando o sin login), la request falla con 401, el interceptor intenta un
 * refresh, y se desencadena toda la cadena de errores CSRF. Por eso esperamos
 * a que `isAuthenticated && user.id` antes de hacer cualquier cosa.
 *
 * Falla silenciosamente si el navegador no soporta notificaciones o el usuario
 * las deniega — push es estrictamente opcional.
 */
export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id)

  useEffect(() => {
    // Gate: only run when the session is confirmed. Prevents a 401 race that
    // would trigger the refresh interceptor and (in the worst case) cascade
    // into a CSRF deadlock with stale cookies from a previous session.
    if (!isAuthenticated || !userId) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    // Push only runs in production. In dev the SW is not registered (see
    // `useServiceWorker`), so `navigator.serviceWorker.ready` would hang
    // forever and we'd never resolve the FCM token request.
    if (process.env.NODE_ENV !== 'production') return

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    async function init() {
      try {
        // No pedir permiso si ya fue denegado — evita molestar al usuario
        if (Notification.permission === 'denied') return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted' || cancelled) return

        // The Service Worker is already registered at mount by
        // `ServiceWorkerRegister` (root layout), so we reuse that
        // registration — registering twice would be a no-op but wait on
        // `.ready` guarantees the SW is active before we ask Firebase for
        // a token against it.
        const registration = await navigator.serviceWorker.ready

        const messaging = getFirebaseMessaging()
        if (!messaging || cancelled) return

        const token = await getToken(messaging, {
          vapidKey: env.firebase.vapidKey,
          serviceWorkerRegistration: registration,
        })

        if (token && !cancelled) {
          await notificationsRepository.saveFcmToken(token)
        }

        // Notificaciones recibidas con la app abierta (foreground)
        if (cancelled) return
        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title
          const body = payload.notification?.body
          if (title) {
            new Notification(title, {
              body: body ?? '',
              icon: '/logo-192.png',
              badge: '/logo-96.png',
            })
          }
        })
      } catch {
        // Push notifications son opcionales — no interrumpir el flujo
      }
    }

    init()
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [isAuthenticated, userId])
}
