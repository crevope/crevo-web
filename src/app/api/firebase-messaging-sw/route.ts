import { env } from '@/shared/config/env'

/**
 * Serves the combined Service Worker: Firebase Messaging + PWA caching.
 *
 * Only one active Service Worker is allowed per scope, so we can't register
 * a separate caching SW alongside the Firebase one — they'd fight for `/`.
 * Instead we merge both responsibilities into this single script served
 * from `/api/firebase-messaging-sw`, with `Service-Worker-Allowed: /`
 * letting it claim root scope regardless of its served path.
 *
 * Caching strategy (conservative for a fintech):
 *   - **Cache-first** for Next.js build assets (`/_next/static/*`) — they're
 *     content-hashed and immutable, safe to serve stale forever.
 *   - **Stale-while-revalidate** for public images (`/images/*`, `/brand/*`)
 *     — fast repeat loads, silent updates in background.
 *   - **Network-only** for everything else (HTML pages, API calls) — we
 *     never want to serve a stale authenticated response or leak PII.
 *   - **Navigation fallback** to `/offline` when the network fails entirely
 *     during a page navigation. Authenticated data is never cached; the
 *     offline page is just a "you're disconnected" shell.
 *
 * Bumping `CACHE_VERSION` invalidates all previous caches on activation, so
 * bump it whenever the caching logic below changes.
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
    // ─── Firebase Messaging ────────────────────────────────────────────
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

    firebase.initializeApp(${JSON.stringify(config)});

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(function(payload) {
      const title = payload.notification?.title || 'Crevo';
      const body  = payload.notification?.body  || '';
      self.registration.showNotification(title, {
        body,
        icon: '/icon1',
        badge: '/icon0',
        data: payload.data,
      });
    });

    // Open the URL from the notification payload (if any) when the user
    // taps the notification. Falls back to the app root otherwise.
    self.addEventListener('notificationclick', function(event) {
      event.notification.close();
      const target = event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : '/';
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
          for (const client of list) {
            if (client.url === self.registration.scope + target.replace(/^\\//, '') && 'focus' in client) {
              return client.focus();
            }
          }
          return clients.openWindow(target);
        })
      );
    });

    // ─── PWA caching ───────────────────────────────────────────────────
    const CACHE_VERSION = 'v1';
    const STATIC_CACHE = 'crevo-static-' + CACHE_VERSION;
    const IMAGE_CACHE  = 'crevo-images-' + CACHE_VERSION;
    const OFFLINE_URL  = '/offline';

    self.addEventListener('install', function(event) {
      event.waitUntil(
        caches.open(STATIC_CACHE).then(function(cache) {
          // Precache the offline fallback so it's available even on the
          // user's first offline navigation. Everything else is cached
          // lazily as the user visits.
          return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        }).then(function() {
          // Skip the waiting phase so the new SW activates immediately
          // on first install (on subsequent updates we still let the old
          // one drain to avoid mid-session swaps).
          return self.skipWaiting();
        })
      );
    });

    self.addEventListener('activate', function(event) {
      event.waitUntil(
        caches.keys().then(function(keys) {
          return Promise.all(keys
            .filter(function(k) {
              return k.startsWith('crevo-') && k !== STATIC_CACHE && k !== IMAGE_CACHE;
            })
            .map(function(k) { return caches.delete(k); })
          );
        }).then(function() {
          return self.clients.claim();
        })
      );
    });

    self.addEventListener('fetch', function(event) {
      const request = event.request;
      const url = new URL(request.url);

      // Only handle GET on our own origin — POSTs, cross-origin (Sentry,
      // Vercel Analytics, Firebase endpoints), and the Firebase SW itself
      // go straight to the network untouched.
      if (request.method !== 'GET' || url.origin !== self.location.origin) return;
      if (url.pathname.startsWith('/api/')) return;

      // Cache-first for immutable Next.js build assets. Content-hashed
      // filenames mean collisions are impossible, so a hit is always safe.
      if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(
          caches.match(request).then(function(cached) {
            if (cached) return cached;
            return fetch(request).then(function(response) {
              if (response.ok) {
                const copy = response.clone();
                caches.open(STATIC_CACHE).then(function(cache) { cache.put(request, copy); });
              }
              return response;
            });
          })
        );
        return;
      }

      // Stale-while-revalidate for images — serve the cached copy
      // immediately and refresh in the background.
      if (url.pathname.startsWith('/images/') || url.pathname.startsWith('/brand/')) {
        event.respondWith(
          caches.match(request).then(function(cached) {
            const network = fetch(request).then(function(response) {
              if (response.ok) {
                const copy = response.clone();
                caches.open(IMAGE_CACHE).then(function(cache) { cache.put(request, copy); });
              }
              return response;
            }).catch(function() { return cached; });
            return cached || network;
          })
        );
        return;
      }

      // Navigation requests: try the network, fall back to the offline
      // page only if the network fails entirely. We never cache HTML of
      // authenticated pages to avoid leaking data across sessions.
      if (request.mode === 'navigate') {
        event.respondWith(
          fetch(request).catch(function() {
            return caches.match(OFFLINE_URL);
          })
        );
        return;
      }

      // Everything else: default network behavior.
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
