import axios, { AxiosError } from 'axios'

export const TOKEN_KEY         = 'solvo_token'
export const REFRESH_TOKEN_KEY = 'solvo_refresh_token'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
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
          localStorage.removeItem('solvo_user')
          window.location.href = '/login'
          return Promise.reject(new Error('Sesión expirada. Por favor inicia sesión de nuevo.'))
        }
      } else {
        // No hay refresh token → redirect directo
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem('solvo_user')
          window.location.href = '/login'
        }
      }
    }

    const message: string =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Error inesperado. Intenta de nuevo.'
    return Promise.reject(new Error(message))
  },
)
