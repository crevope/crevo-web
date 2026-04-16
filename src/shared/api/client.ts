import axios, { AxiosError } from 'axios'
import { env } from '@/shared/config/env'

// ─── Cookie names shared with the backend ────────────────────────────────────
// Must stay in sync with `src/shared/utils/authCookies.ts` on the server.

/** Readable CSRF cookie (non-HttpOnly). The SPA reads it and echoes it back
 *  in the `X-CSRF-Token` header on every mutating request. */
const CSRF_COOKIE_NAME = 'crevo_csrf'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

/** Key under which we cache the user profile for client-side hydration. The
 *  auth token itself is never stored — it lives in an HttpOnly cookie only. */
export const USER_STORAGE_KEY = 'crevo_user'

// ─── Axios instance ──────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials is THE switch that tells the browser to include our
  // HttpOnly auth cookies on cross-origin API calls. Without it, the server
  // sees anonymous requests even after a successful login.
  withCredentials: true,
})

// ─── Request interceptor: attach CSRF header ─────────────────────────────────

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config

  // Safe methods don't mutate state and are exempt from CSRF validation.
  const method = (config.method ?? 'get').toLowerCase()
  const isSafe = method === 'get' || method === 'head' || method === 'options'
  if (isSafe) return config

  const csrfToken = readCookie(CSRF_COOKIE_NAME)
  if (csrfToken) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>)[CSRF_HEADER_NAME] = csrfToken
  }
  return config
})

// ─── Response interceptor: transparent refresh on 401 ────────────────────────
//
// Prevents a thundering herd: while one request is refreshing, every other
// 401 is queued and replayed against the new cookie.

let isRefreshing = false
let refreshSubscribers: Array<() => void> = []

function subscribeToRefresh(cb: () => void) {
  refreshSubscribers.push(cb)
}

function notifyRefreshCompleted() {
  refreshSubscribers.forEach((cb) => cb())
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    // Don't try to refresh when the failure IS on an auth endpoint — no loops.
    const url = originalRequest?.url ?? ''
    const isAuthEndpoint =
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register')

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest?._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        // Another request is already refreshing; wait for it and retry.
        return new Promise((resolve, reject) => {
          subscribeToRefresh(() => resolve(apiClient(originalRequest)))
          setTimeout(() => reject(new Error('Refresh timeout')), 10_000)
        })
      }

      isRefreshing = true

      try {
        // The browser sends the refresh cookie automatically thanks to
        // `withCredentials: true`. Body is empty — the server reads the
        // `crevo_rt` cookie, rotates the access cookie, and also rotates the
        // CSRF cookie so our next request picks up the fresh value.
        await apiClient.post('/auth/refresh', {})

        isRefreshing = false
        notifyRefreshCompleted()
        return apiClient(originalRequest)
      } catch {
        // Refresh failed — clear the full session so the next login starts
        // from a clean slate (no stale HttpOnly cookies triggering CSRF).
        isRefreshing = false
        refreshSubscribers = []

        await Promise.race([
          apiClient.post('/auth/logout', {}).catch(() => {}),
          new Promise((r) => setTimeout(r, 2000)),
        ])
        clearClientSession()

        window.location.href = '/login'
        return Promise.reject(new Error('Sesión expirada. Por favor inicia sesión de nuevo.'))
      }
    }

    // ── 429 handling ─────────────────────────────────────────────────────
    // The backend already returns a friendly Spanish message; we enrich it
    // with the remaining time when standard rate-limit headers are present.
    // express-rate-limit (draft-7) emits a combined `RateLimit` header like:
    //   RateLimit: limit=5, remaining=0, reset=900
    // Older draft-6 splits it into `RateLimit-Reset`. We try both.
    if (error.response?.status === 429) {
      const baseMessage =
        (error.response.data as { message?: string })?.message ||
        'Demasiadas solicitudes. Intenta de nuevo en unos minutos.'
      const resetSeconds = parseRateLimitReset(error.response.headers ?? {})
      const suffix =
        resetSeconds !== null && resetSeconds > 0
          ? ` (puedes reintentar en ${formatRetryAfter(resetSeconds)})`
          : ''
      return Promise.reject(new Error(baseMessage + suffix))
    }

    const message: string =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Error inesperado. Intenta de nuevo.'
    return Promise.reject(new Error(message))
  },
)

// ─── Session cleanup ────────────────────────────────────────────────────────

/**
 * Wipes every piece of client-side session state.
 *
 * HttpOnly cookies (`crevo_at`, `crevo_rt`) can only be cleared by a server
 * `Set-Cookie` response — that's handled by the `/auth/logout` call above.
 * Here we clear the non-HttpOnly CSRF cookie and localStorage so the next
 * login starts from a perfectly clean slate.
 */
function clearClientSession() {
  localStorage.removeItem(USER_STORAGE_KEY)
  if (typeof document !== 'undefined') {
    document.cookie = `${CSRF_COOKIE_NAME}=; Path=/; Max-Age=0`
  }
}

// ─── Utility: read a cookie by name ──────────────────────────────────────────

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const needle = `${encodeURIComponent(name)}=`
  const pairs = document.cookie.split('; ')
  for (const pair of pairs) {
    if (pair.startsWith(needle)) {
      return decodeURIComponent(pair.slice(needle.length))
    }
  }
  return null
}

// ─── Rate-limit header parsing ───────────────────────────────────────────────

/**
 * Reads the seconds-until-reset value from the response headers, handling both
 * the combined RFC draft-7 `RateLimit` header and the older draft-6 split
 * variants (`RateLimit-Reset` / `Retry-After`).
 */
function parseRateLimitReset(headers: Record<string, unknown>): number | null {
  // draft-7 combined header: "limit=5, remaining=0, reset=900"
  const combined = headers['ratelimit']
  if (typeof combined === 'string') {
    const match = combined.match(/reset=(\d+)/i)
    if (match) {
      const v = Number.parseInt(match[1], 10)
      if (Number.isFinite(v)) return v
    }
  }

  // draft-6 split header
  const split = headers['ratelimit-reset']
  if (typeof split === 'string' || typeof split === 'number') {
    const v = Number.parseInt(String(split), 10)
    if (Number.isFinite(v)) return v
  }

  // Last resort: standard Retry-After (seconds OR HTTP-date)
  const retryAfter = headers['retry-after']
  if (typeof retryAfter === 'string' || typeof retryAfter === 'number') {
    const v = Number.parseInt(String(retryAfter), 10)
    if (Number.isFinite(v)) return v
  }

  return null
}

/** Formats a retry-after value in seconds into a friendly Spanish string. */
function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} segundos`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  const hours = Math.ceil(minutes / 60)
  return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
}
