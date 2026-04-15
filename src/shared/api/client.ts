import axios, { AxiosError } from 'axios'
import { env } from '@/shared/config/env'

export const TOKEN_KEY         = 'crevo_token'
export const REFRESH_TOKEN_KEY = 'crevo_refresh_token'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Refresh token interceptor ─────────────────────────────────────────────────
// Previene múltiples llamadas simultáneas al endpoint de refresh.
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    // Solo intentar refresh en errores 401 que no sean ya del endpoint de refresh/logout
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout') ||
      originalRequest?.url?.includes('/auth/login')

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest?._retry &&
      typeof window !== 'undefined'
    ) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (refreshToken) {
        originalRequest._retry = true

        if (isRefreshing) {
          // Esperar a que otro request ya en curso termine el refresh
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((newToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              resolve(apiClient(originalRequest))
            })
            // Timeout de seguridad: si el refresh tarda más de 10s, rechazar
            setTimeout(() => reject(new Error('Refresh timeout')), 10_000)
          })
        }

        isRefreshing = true

        try {
          const { data } = await axios.post(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refreshToken },
          )
          const newToken: string = data.data.token
          localStorage.setItem(TOKEN_KEY, newToken)

          isRefreshing = false
          onTokenRefreshed(newToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return apiClient(originalRequest)
        } catch {
          // Refresh falló — limpiar sesión y redirigir a login
          isRefreshing = false
          refreshSubscribers = []
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(REFRESH_TOKEN_KEY)
          localStorage.removeItem('crevo_user')
          window.location.href = '/login'
          return Promise.reject(new Error('Sesión expirada. Por favor inicia sesión de nuevo.'))
        }
      } else {
        // No hay refresh token → redirect directo
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem('crevo_user')
          window.location.href = '/login'
        }
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
