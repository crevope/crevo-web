'use client'
import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/shared/lib/firebase'
import { env } from '@/shared/config/env'
import { notificationsRepository } from '@/features/notifications/api/notificationsRepository'

/**
 * Solicita permiso de notificaciones push al usuario (solo una vez por sesión),
 * registra el Service Worker de Firebase Messaging y guarda el token FCM en el backend.
 * Maneja mensajes en primer plano mostrando una Notification nativa del navegador.
 *
 * Se llama en el layout privado — falla silenciosamente si el navegador no soporta
 * notificaciones o el usuario las deniega.
 */
export function usePushNotifications() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    let unsubscribe: (() => void) | undefined

    async function init() {
      try {
        // No pedir permiso si ya fue denegado — evita molestar al usuario
        if (Notification.permission === 'denied') return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // Registrar SW mediante API route (inyecta Firebase config desde env vars)
        const registration = await navigator.serviceWorker.register(
          '/api/firebase-messaging-sw',
          { scope: '/' },
        )

        const messaging = getFirebaseMessaging()
        if (!messaging) return

        const token = await getToken(messaging, {
          vapidKey: env.firebase.vapidKey,
          serviceWorkerRegistration: registration,
        })

        if (token) {
          await notificationsRepository.saveFcmToken(token)
        }

        // Notificaciones recibidas con la app abierta (foreground)
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
    return () => { unsubscribe?.() }
  }, [])
}
