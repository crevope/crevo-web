import axios from 'axios'

export const TOKEN_KEY = 'solvo_token'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (typeof globalThis.window) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof globalThis.window) {
      localStorage.removeItem(TOKEN_KEY)
      globalThis.location.href = '/login'
    }
    const message: string =
      error.response?.data?.message ||
      error.message ||
      'Error inesperado. Intenta de nuevo.'
    return Promise.reject(new Error(message))
  }
)
