import * as Sentry from '@sentry/nextjs'

/**
 * Next.js client-side instrumentation hook (Next 15+ convention).
 *
 * Runs once per browser session before the app hydrates. Replaces the legacy
 * `sentry.client.config.ts` naming so the whole observability setup lives
 * next to `instrumentation.ts` and follows the framework's canonical layout.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // 100% in dev to see every trace; 10% in prod to keep quota predictable.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  // Session Replay: 1% of sessions overall, 10% of sessions with an error.
  // Keeps the signal high (errors are rare, replays of them are gold) while
  // staying well inside the free tier.
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,
  integrations: [Sentry.replayIntegration()],
  sendDefaultPii: false,
})

// Note: `onRouterTransitionStart` hook is a Sentry v9+ feature; on v8.x the
// navigation traces are wired up automatically by the client SDK via the
// browser tracing integration. Re-add the export when we upgrade to v9.
