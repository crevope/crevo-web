import { apiClient, USER_STORAGE_KEY } from '@/shared/api/client'
import type { AuthUser } from '@/entities/user'

/**
 * Auth API adapter.
 *
 * Access/refresh tokens are transported exclusively via HttpOnly cookies set
 * by the backend — the SPA never sees or stores them. This repository only
 * owns the cached `user` profile in localStorage for fast client-side
 * hydration before /auth/me resolves.
 */
export const authRepository = {
  async login(email: string, password: string): Promise<{ user: AuthUser }> {
    const { data } = await apiClient.post('/auth/login', { email, password })
    // Backend returns: { user: { id, email, firstName, lastName, emailVerified, isIdentityVerified } }
    // Cookies (crevo_at, crevo_rt, crevo_csrf) are set server-side via Set-Cookie.
    const u = data.data.user
    const user: AuthUser = {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      emailVerified: u.emailVerified ?? false,
      isIdentityVerified: u.isIdentityVerified ?? false,
    }
    return { user }
  },

  async register(dto: {
    email: string; password: string; firstName: string
    lastName: string; dni: string; phone: string
  }): Promise<{ user: AuthUser }> {
    const { data } = await apiClient.post('/auth/register', dto)
    // Backend returns: { id, email, firstName, lastName, emailVerified }
    const { id, email, firstName, lastName, emailVerified } = data.data
    const user: AuthUser = {
      id, email, firstName, lastName,
      emailVerified: emailVerified ?? false,
      isIdentityVerified: false,
    }
    return { user }
  },

  async logout(): Promise<void> {
    try {
      // The refresh cookie travels automatically thanks to withCredentials.
      await apiClient.post('/auth/logout', {})
    } catch {
      // Logout is best-effort; server-side cleanup is idempotent and the
      // browser cookie state is cleared regardless.
    }
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await apiClient.get(`/auth/verify-email/${token}`)
    return { message: data.message }
  },

  async resendVerification(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email })
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword })
  },

  async getMyProfile(): Promise<AuthUser> {
    const { data } = await apiClient.get('/auth/me')
    const u = data.data
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      emailVerified: u.emailVerified ?? false,
      isIdentityVerified: u.isIdentityVerified ?? false,
      phone: u.phone,
      dni: u.dni,
    }
  },

  // ── User profile cache (localStorage) ──────────────────────────────────
  // We still cache the `user` object so the UI can render immediately on
  // refresh without waiting for /auth/me. This is NOT the security boundary:
  // the server treats every request as anonymous unless it carries a valid
  // HttpOnly auth cookie.

  saveUser(user: AuthUser) { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)) },
  clearUser() { localStorage.removeItem(USER_STORAGE_KEY) },
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw || raw === 'undefined') return null
    try { return JSON.parse(raw) } catch { return null }
  },
}
