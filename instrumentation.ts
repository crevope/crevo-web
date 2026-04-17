import * as Sentry from '@sentry/nextjs'

/**
 * Next.js server-side instrumentation hook.
 *
 * Called once per runtime (node / edge) when the server process boots, before
 * any page or route handler executes. This is the canonical place to wire up
 * observability — Sentry, OpenTelemetry, custom tracers — since it guarantees
 * initialization happens before the first request is served.
 *
 * The separate `sentry.server.config.ts` + `sentry.edge.config.ts` files that
 * the `@sentry/nextjs` wizard creates are deprecated in Next 15 and emit
 * warnings on every build. Consolidating here silences them and aligns with
 * the framework's recommended shape.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      // 10% sampling in production keeps costs predictable; 100% in dev so
      // we see every trace while iterating locally.
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
      sendDefaultPii: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
      sendDefaultPii: false,
    })
  }
}

/**
 * Error telemetry — Sentry auto-hooks into Next's error boundaries when this
 * is exported from `instrumentation.ts`. Re-exporting the framework helper
 * covers both route handlers and server components without extra wiring.
 */
export const onRequestError = Sentry.captureRequestError
