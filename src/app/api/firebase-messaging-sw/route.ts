/**
 * Sirve el Service Worker de Firebase Messaging con la config inyectada desde env vars.
 * El header Service-Worker-Allowed: / permite registrarlo con scope raíz aunque el script
 * esté en /api/firebase-messaging-sw.
 */
export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
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
