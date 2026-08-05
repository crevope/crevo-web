import { create } from 'zustand'
import { authRepository, type LoginResult } from '../api/authRepository'
import type { AuthUser } from '@/entities/user'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
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
    // Keep isLoading true — the cached user is used as a placeholder so the
    // skeleton doesn't flash while refreshUser() fetches the real one. If we
    // set isLoading: false here the dashboard renders with stale fields
    // (emailVerified: false from before the verification click) and the user
    // sees a step flicker from incomplete → complete.
    set({ user, isAuthenticated: !!user, isLoading: !user })
  },

  /**
   * Re-fetch the profile from the server (`/auth/me`) and overwrite the cache.
   * The localStorage copy is only a hydration shortcut and can go stale after a
   * server-side change the client never saw (email verification or KYC
   * approval). `isLoading` is cleared HERE — the server response is what the
   * UI should render.
   *
   * Failure is non-fatal: a transient error or a truly expired session leaves
   * the cached user in place; the apiClient interceptor renews the token or, on
   * a real auth failure, redirects to /login.
   */
  refreshUser: async () => {
    try {
      const fresh = await authRepository.getMyProfile()
      authRepository.saveUser(fresh)
      set({ user: fresh, isAuthenticated: true, isLoading: false })
    } catch {
      // keep the hydrated cache; see doc comment above
      set({ isLoading: false })
    }
  },

  /**
   * Adopts an already-authenticated user without going through login() —
   * used by the 2FA challenge/setup-confirm flows, where the session cookies
   * are set by /auth/2fa/verify or /auth/2fa/confirm (not /auth/login). This
   * is the point where `isAuthenticated` actually flips to true for those
   * flows.
   */
  setUser: (user) => {
    authRepository.saveUser(user)
    set({ user, isAuthenticated: true })
  },

  /**
   * Returns the full LoginResult so the caller (LoginForm) can branch on a
   * pending 2FA challenge instead of always redirecting. Store state is only
   * updated on the 'success' outcome — 'requires_2fa'/'requires_2fa_setup'
   * leave the store untouched, since no session was issued yet.
   */
  login: async (email, password) => {
    const result = await authRepository.login(email, password)
    if (result.outcome === 'success') {
      authRepository.saveUser(result.user)
      set({ user: result.user, isAuthenticated: true })
    }
    return result
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
