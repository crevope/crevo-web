import { create } from 'zustand'
import { authRepository } from '../api/authRepository'
import type { AuthUser } from '@/entities/user'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (dto: {
    email: string
    password: string
    firstName: string
    lastName: string
    dni: string
    phone: string
  }) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => void
  setUser: (user: AuthUser) => void
}

/**
 * Client-side auth store.
 *
 * Tokens live in HttpOnly cookies and are inaccessible to JS by design — this
 * store only mirrors the user profile so pages can render immediately without
 * waiting for /auth/me. The server remains the source of truth.
 *
 * `isAuthenticated` is derived from having a cached user: if the cookies were
 * revoked or expired, the first API call will 401 → the refresh interceptor
 * will either renew transparently or redirect to /login.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loadUser: () => {
    const user = authRepository.getStoredUser()
    set({ user, isAuthenticated: !!user, isLoading: false })
  },

  setUser: (user) => {
    authRepository.saveUser(user)
    set({ user })
  },

  login: async (email, password) => {
    const { user } = await authRepository.login(email, password)
    authRepository.saveUser(user)
    set({ user, isAuthenticated: true })
  },

  register: async (dto) => {
    const { user } = await authRepository.register(dto)
    authRepository.saveUser(user)
    set({ user, isAuthenticated: true })
  },

  logout: async () => {
    // Server revokes the refresh token and clears all auth cookies via
    // Set-Cookie headers. We only need to drop the cached user profile.
    await authRepository.logout()
    authRepository.clearUser()
    set({ user: null, isAuthenticated: false })
  },
}))
