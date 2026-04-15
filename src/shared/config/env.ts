import { z } from 'zod'

/**
 * Validated environment configuration for the Crevo web app.
 *
 * Next.js inlines `NEXT_PUBLIC_*` variables at build time, so we read them
 * via `process.env.NEXT_PUBLIC_X` (NOT bracket notation — Next's swc
 * substitution only matches dot-access syntax).
 *
 * Validation runs at module load on both server and client:
 *   - During `next build` → fails the build with a clear error.
 *   - At runtime in the browser → throws once on first import, surfacing
 *     the misconfiguration immediately instead of producing silent runtime
 *     errors deep inside Firebase / Supabase / API calls.
 */

// ─── Reusable primitives ─────────────────────────────────────────────────────

const httpUrl = z
  .string()
  .trim()
  .min(1, 'must not be empty')
  .url('must be a valid URL')
  .refine((v) => /^https?:\/\//.test(v), {
    message: 'must start with http:// or https://',
  })

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => v ?? '')

// ─── Schema ──────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // Required — without these the app cannot work at all.
  NEXT_PUBLIC_API_URL: httpUrl,

  // Supabase client (required — auth and storage rely on it).
  NEXT_PUBLIC_SUPABASE_URL: httpUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1, 'must not be empty'),

  // Optional — payments and push notifications degrade gracefully when missing.
  NEXT_PUBLIC_CULQI_PUBLIC_KEY: optionalString,

  NEXT_PUBLIC_FIREBASE_API_KEY: optionalString,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalString,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: optionalString,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_APP_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: optionalString,

  // Sentry (recommended in production — soft warning if absent).
  NEXT_PUBLIC_SENTRY_DSN: optionalString,
})

type EnvSchema = z.infer<typeof envSchema>

// ─── Parse ───────────────────────────────────────────────────────────────────

function parseEnv(): EnvSchema {
  // IMPORTANT: dot-access only. Next.js inlines these at build time;
  // `process.env[...]` with a computed key is NOT replaced.
  const raw = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CULQI_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  }

  const result = envSchema.safeParse(raw)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    const message =
      '\n[env] Invalid environment configuration:\n' +
      issues +
      '\n\nSet the missing variables in .env.local (dev) or in your hosting provider (prod). See .env.example.\n'

    // Surface the issue in the browser console too, then throw.
    if (typeof window !== 'undefined') {
      console.error(message)
    } else {
      console.error(message)
    }
    throw new Error('Invalid environment configuration. See logs above.')
  }

  return result.data
}

const parsed = parseEnv()

// ─── Public env shape ────────────────────────────────────────────────────────

export const env = {
  apiUrl: parsed.NEXT_PUBLIC_API_URL,

  supabase: {
    url: parsed.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  culqi: {
    publicKey: parsed.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
  },

  firebase: {
    apiKey: parsed.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: parsed.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: parsed.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: parsed.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: parsed.NEXT_PUBLIC_FIREBASE_APP_ID,
    vapidKey: parsed.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  },

  sentry: {
    dsn: parsed.NEXT_PUBLIC_SENTRY_DSN,
  },
} as const

/** True when at least the minimum Firebase config is present to initialize the app. */
export const hasFirebaseConfig =
  !!env.firebase.apiKey && !!env.firebase.projectId && !!env.firebase.appId
