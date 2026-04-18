import { NextResponse, type NextRequest } from 'next/server'

/**
 * Security headers — applied to every response.
 *
 * `Content-Security-Policy` ships a pragmatic `'unsafe-inline'` policy for
 * scripts rather than the stricter nonce + `'strict-dynamic'` variant.
 * Rationale lives next to `buildCsp` below; TL;DR: nonces break once you
 * miss a single inline `<script>` and Next emits many of them automatically.
 *
 * Inline STYLE is harder to avoid (Tailwind 4 injects hashed style tags,
 * Next.js inlines critical CSS) so `'unsafe-inline'` is kept on `style-src`
 * — CSP's risk model treats style injection as lower-impact than script.
 *
 * Third-party origins allowed in `connect-src`:
 *   - `*.sentry.io` + `*.ingest.sentry.io` — error + tracing ingestion.
 *   - `*.vercel-insights.com` + `vitals.vercel-insights.com` — Web Vitals.
 *   - `*.vercel-analytics.com` — page view beacons.
 *   - Firebase / Google APIs — Messaging, Firestore, Auth if used.
 *   - Backend API — parsed from NEXT_PUBLIC_API_URL at build time. If the
 *     value is a relative path (`/api`) the origin is same-origin and the
 *     default `'self'` already covers it; no addition needed.
 */

const CSP_CONNECT_SRC = [
  "'self'",
  'https://*.sentry.io',
  'https://*.ingest.sentry.io',
  'https://*.vercel-insights.com',
  'https://vitals.vercel-insights.com',
  'https://*.vercel-analytics.com',
  // Firebase Messaging + Auth + Firestore endpoints used by firebase-js-sdk.
  'https://*.googleapis.com',
  'https://*.firebaseio.com',
  'https://*.firebaseapp.com',
  'https://fcm.googleapis.com',
  'https://firebaseinstallations.googleapis.com',
  // WebSocket for Firestore realtime (if/when used).
  'wss://*.firebaseio.com',
  // Supabase — REST + realtime (websocket). The notifications store
  // subscribes to the `notifications` table over Supabase Realtime so
  // both protocols need to be allowlisted.
  'https://*.supabase.co',
  'wss://*.supabase.co',
  // Backend API when NEXT_PUBLIC_API_URL points to an absolute origin.
  // Parsed at request time since middleware is an Edge runtime.
].join(' ')

const CSP_SCRIPT_SRC_EXTRA = [
  // Firebase messaging SDK is loaded via importScripts() inside the SW,
  // which inherits its own CSP rules, but the compat loader initializes
  // a nested script element in the main thread during token registration.
  'https://www.gstatic.com',
  // @vercel/analytics + @vercel/speed-insights load `script.debug.js`
  // (dev) and `script.js` (prod) from this CDN. Without it the browser
  // blocks both with "Content Security Policy directive" errors that
  // surface in DevTools as red rows in the Network tab.
  'https://va.vercel-scripts.com',
].join(' ')

/** Security headers that don't depend on the per-request nonce. */
const STATIC_HEADERS: Record<string, string> = {
  // 2 years + preload — ready for HSTS preload list submission.
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // Block all framing; `frame-ancestors 'none'` in CSP is the modern
  // equivalent but XFO is still respected by older UAs.
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  // Balance: external links don't leak the full URL, internal navigation
  // does (we need it for analytics attribution).
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Deny every browser feature we don't use, except the camera which KYC
  // needs on `/kyc`. The allowlist is origin-scoped to our own domain.
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=(self)',
    'geolocation=()',
    'gyroscope=()',
    'interest-cohort=()', // opt out of FLoC / Topics API
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=(self)',
    'usb=()',
  ].join(', '),
  // Opt into cross-origin isolation benefits where possible.
  'X-DNS-Prefetch-Control': 'on',
}

function buildCsp(isDev: boolean): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() ?? ''
  // If NEXT_PUBLIC_API_URL is an absolute URL, add its origin to connect-src.
  // Relative paths (`/api`) already covered by 'self'.
  let apiOrigin = ''
  try {
    if (/^https?:\/\//.test(apiUrl)) {
      apiOrigin = ' ' + new URL(apiUrl).origin
    }
  } catch {
    // malformed URL — skip
  }

  // We intentionally ship an `'unsafe-inline'` policy for scripts instead
  // of the stricter nonce + `'strict-dynamic'` variant. Rationale:
  //   - Next 15/16 emits many inline scripts for hydration, Flight, RSC
  //     payloads and theme initialization (next-themes). Authoring every
  //     one with a per-request nonce requires propagating the nonce
  //     through every Server Component that renders a `<script>` (Scripts,
  //     JsonLd, Sentry client init, etc.).
  //   - Once a nonce appears in the policy, CSP3-compliant browsers
  //     IGNORE `'unsafe-inline'`, so any unnonced inline script breaks.
  //   - `'unsafe-inline'` without a nonce is the pragmatic middle ground
  //     and matches what production Next apps (Vercel's own properties,
  //     most fintechs) ship today.
  //
  // We can revisit this when Next exposes a first-class nonce helper
  // that auto-propagates to every inline `<script>` it renders.
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval' blob: ${CSP_SCRIPT_SRC_EXTRA}`
    : `'self' 'unsafe-inline' https: ${CSP_SCRIPT_SRC_EXTRA}`

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `script-src-elem ${scriptSrc}`,
    // Inline style is unavoidable with Tailwind 4 + next/font critical CSS.
    // style-src-elem needs `https:` so Google fonts fallback CSS (if any) loads.
    `style-src 'self' 'unsafe-inline'`,
    `style-src-elem 'self' 'unsafe-inline'`,
    // data: for inline SVG data-uris, blob: for next/image optimization.
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src ${CSP_CONNECT_SRC}${apiOrigin}`,
    // Allow the Firebase + PWA Service Worker we ship.
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    // Upgrade any stray `http:` subresource to https (cheap defense in depth).
    `upgrade-insecure-requests`,
  ].join('; ')
}

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production'
  const csp = buildCsp(isDev)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Also apply the CSP + static headers to the response so the browser
  // enforces them on the rendered HTML.
  response.headers.set('Content-Security-Policy', csp)
  for (const [k, v] of Object.entries(STATIC_HEADERS)) {
    response.headers.set(k, v)
  }

  return response
}

/**
 * Skip the proxy on static assets, image optimization, the Firebase SW
 * endpoint (it sets its own strict headers), and favicon requests.
 * Running it on those paths adds latency without security benefit.
 */
export const config = {
  matcher: [
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|icon0|icon1|apple-icon|opengraph-image|twitter-image|manifest.webmanifest|sitemap.xml|robots.txt|api/firebase-messaging-sw).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
