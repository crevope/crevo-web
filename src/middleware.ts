import { NextResponse, type NextRequest } from 'next/server'

/**
 * Security headers — applied to every response.
 *
 * `Content-Security-Policy` uses a per-request nonce + `strict-dynamic`:
 *   - We generate a fresh 128-bit nonce on every request and advertise it
 *     via the `x-nonce` header so Server Components / Route Handlers can
 *     inject it into any inline `<script>` they render.
 *   - `'strict-dynamic'` lets nonce-authorized scripts load more scripts
 *     without listing every CDN — simpler to maintain than a URL allowlist
 *     and closes the gap where `https:` on its own allows any origin.
 *   - `'unsafe-inline'` on `script-src` is kept as a fallback for browsers
 *     that don't support nonces (old Safari); modern browsers ignore it
 *     when a nonce is present per the CSP3 spec.
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
  // Backend API when NEXT_PUBLIC_API_URL points to an absolute origin.
  // Parsed at request time since middleware is an Edge runtime.
].join(' ')

const CSP_SCRIPT_SRC_EXTRA = [
  // Firebase messaging SDK is loaded via importScripts() inside the SW,
  // which inherits its own CSP rules, but the compat loader initializes
  // a nested script element in the main thread during token registration.
  'https://www.gstatic.com',
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

function generateNonce(): string {
  // 16 bytes of CSPRNG entropy, base64-encoded — matches the browser
  // requirement for a minimum of 128 bits of unpredictability.
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}

function buildCsp(nonce: string, isDev: boolean): string {
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

  const scriptSrc = isDev
    // Dev needs 'unsafe-eval' for Turbopack / React Refresh; 'strict-dynamic'
    // would break HMR. We keep a loose policy locally and tighten in prod.
    ? `'self' 'unsafe-inline' 'unsafe-eval' blob: ${CSP_SCRIPT_SRC_EXTRA}`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https: ${CSP_SCRIPT_SRC_EXTRA}`

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

export function middleware(request: NextRequest) {
  const nonce = generateNonce()
  const isDev = process.env.NODE_ENV !== 'production'
  const csp = buildCsp(nonce, isDev)

  // Forward the nonce to downstream Route Handlers / Server Components via
  // a request header. Next's `<Script>` will pick this up and wire it into
  // every inline script it renders.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
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
 * Skip middleware on static assets, image optimization, the Firebase SW
 * endpoint (it sets its own strict headers), and favicon requests.
 * Running it on those paths adds latency without security benefit.
 */
export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|icon0|icon1|apple-icon|opengraph-image|twitter-image|manifest.webmanifest|sitemap.xml|robots.txt|api/firebase-messaging-sw).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
