import { env } from '@/shared/config/env'

/**
 * Serves the Firebase Messaging Service Worker with the config injected from env vars.
 * The `Service-Worker-Allowed: /` header lets us register it with root scope even
 * though the script lives at /api/firebase-messaging-sw.
 */
export async function GET() {
  const config = {
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
  }

  const sw = `
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

    firebase.initializeApp(${JSON.stringify(config)});

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function(payload) {
      const title = payload.notification?.title || 'Crevo';
      const body  = payload.notification?.body  || '';
      self.registration.showNotification(title, {
        body,
        icon: '/logo-192.png',
        badge: '/logo-96.png',
        data: payload.data,
      });
    });
  `

  return new Response(sw, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-store',
    },
  })
}
