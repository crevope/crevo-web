import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import withBundleAnalyzer from '@next/bundle-analyzer'

// Bundle analyzer only activates when `ANALYZE=true yarn build`. The wrapper
// is a no-op otherwise, so it costs nothing in normal builds. Use it to hunt
// heavy deps: it writes two HTML reports under `.next/analyze/` (one per
// runtime) that open in the browser automatically.
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * Backend upstream for the `/api/*` rewrite.
 *
 * Only read server-side — it MUST NOT be a `NEXT_PUBLIC_` variable, otherwise
 * it would be inlined into the client bundle and exposed to the browser.
 *
 * When set, every request the SPA makes to `/api/<path>` is transparently
 * forwarded by the Next.js dev server (or Vercel/Node in prod) to the backend.
 * This keeps auth cookies same-origin with the frontend and eliminates cross-
 * site SameSite headaches whether you browse at `localhost`, the LAN IP, or
 * from your phone pointing at your dev machine.
 *
 * When unset, no rewrite is added — the SPA must hit the API directly via
 * `NEXT_PUBLIC_API_URL`. Useful for previews where the frontend is served by
 * the same process as the API.
 */
const BACKEND_UPSTREAM_URL = process.env.BACKEND_UPSTREAM_URL?.replace(/\/+$/, '')

const nextConfig: NextConfig = {
  // ─── Standalone output ─────────────────────────────────────────────────
  //
  // Produces a self-contained `.next/standalone` bundle (server + only the
  // node_modules it actually needs) so the Docker runtime image doesn't
  // have to ship the full node_modules tree. Required for the Dockerfile.
  output: 'standalone',

  // ─── Image optimization ────────────────────────────────────────────────
  //
  // Serve AVIF when the browser accepts it (≈50% smaller than WebP, ≈75%
  // smaller than JPEG at equal quality); fall back to WebP for older UAs
  // and to the original format as the last resort. `minimumCacheTTL` of
  // 31 days matches the typical product shelf life of a hero image and
  // matches Vercel's Image Optimization recommended default.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },

  // ─── Partial Prerendering (PPR) — deferred ─────────────────────────────
  //
  // `experimental.ppr` is **canary-only** on Next 16 (throws
  // CanaryOnlyError on stable). The per-page `experimental_ppr = true`
  // exports also rely on this flag and would fail at build time; they
  // stay commented out in the pages so we can flip the switch in one
  // place the day we're comfortable running Next canary (or PPR
  // graduates to stable).
  //
  // When that day comes, uncomment:
  //   experimental: { ppr: 'incremental' },
  // and re-add `export const experimental_ppr = true` to:
  //   /sobre-nosotros, /preguntas-frecuentes, /blog, /blog/[slug],
  //   /prestamos-en-[city].

  // ─── Response headers ──────────────────────────────────────────────────
  //
  // Cache-Control policies tuned per route family. The shared security
  // headers already ship from `src/middleware.ts` (CSP, HSTS, XFO,
  // Permissions-Policy); we only wire Cache-Control here because it's
  // route-scoped and belongs closer to the route definitions.
  async headers() {
    return [
      {
        // Legal documents almost never change between deploys; 1-day
        // CDN cache with a long stale-while-revalidate keeps them
        // blazing fast without blocking urgent updates.
        source:
          '/(terminos-y-condiciones|politica-de-privacidad|politica-de-cookies|politica-de-cobranza|derechos-del-usuario|sobre-nosotros)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Blog posts + FAQ refresh hourly; longer SWR so the edge can
        // still serve stale while a new deploy regenerates.
        source: '/(blog|preguntas-frecuentes)(/.*)?',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Tarifas + simulador depend on the BCRP rate that syncs
        // every ~24h, so a 1h s-maxage with 1d SWR is right-sized.
        source: '/(tarifas|simulador)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // City landing pages are effectively static — recompute once
        // a day, cache for a week on the edge.
        source: '/prestamos-en-(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },

  async rewrites() {
    if (!BACKEND_UPSTREAM_URL) return []
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_UPSTREAM_URL}/api/:path*`,
      },
    ]
  },
}

// Only run Sentry's build-time plugin (release creation + source-map
// upload) when an auth token is actually available AND looks real.
// We ship `.env.example` with a placeholder `sntrys_xxxx` token so the
// presence of the env var alone isn't enough — it would trip the CLI
// with "Project not found" on every local build. Vercel production
// has a real token and skips these guards.
const sentryToken = process.env.SENTRY_AUTH_TOKEN?.trim() ?? ''
const isPlaceholderToken =
  !sentryToken ||
  sentryToken.includes('xxxx') ||
  sentryToken.includes('placeholder') ||
  sentryToken.toUpperCase().includes('YOUR_TOKEN')

const configuredWithAnalyzer = bundleAnalyzer(nextConfig)

export default isPlaceholderToken
  ? configuredWithAnalyzer
  : withSentryConfig(configuredWithAnalyzer, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: sentryToken,
      silent: !process.env.CI,
      hideSourceMaps: true,
      telemetry: false,
    })
