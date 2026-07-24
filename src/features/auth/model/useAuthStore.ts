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
  refreshUser: () => Promise<void>
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

  /**
   * Re-fetch the profile from the server (`/auth/me`) and overwrite the cache.
   * The localStorage copy is only a hydration shortcut and can go stale after a
   * server-side change the client never saw (email verification — typically
   * done from a link opened on another device — or KYC approval). Call this on
   * entry to the authenticated area so those changes surface without a re-login.
   *
   * Failure is non-fatal: a transient error or a truly expired session leaves
   * the cached user in place; the apiClient interceptor renews the token or, on
   * a real auth failure, redirects to /login.
   */
  refreshUser: async () => {
    try {
      const fresh = await authRepository.getMyProfile()
      authRepository.saveUser(fresh)
      set({ user: fresh, isAuthenticated: true })
    } catch {
      // keep the hydrated cache; see doc comment above
    }
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
