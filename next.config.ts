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

export default withSentryConfig(bundleAnalyzer(nextConfig), {
  // URL de tu organización/proyecto en Sentry (para source maps)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Auth token para subir source maps (en CI/CD: variable de entorno)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Silenciar logs de Sentry durante el build
  silent: !process.env.CI,
  // Subir source maps solo en producción
  hideSourceMaps: true,
  // Disable Sentry telemetry
  telemetry: false,
})
