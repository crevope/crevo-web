import { apiClient, TOKEN_KEY } from '@/shared/api/client'
import type { AuthUser } from '@/entities/user'

export const authRepository = {
  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const { data } = await apiClient.post('/auth/login', { email, password })
    // Backend returns: { token, user: { id, email, firstName, lastName, isIdentityVerified } }
    const { token, user: u } = data.data
    const user: AuthUser = {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      emailVerified: u.emailVerified ?? false,
      isIdentityVerified: u.isIdentityVerified ?? false,
    }
    return { user, token }
  },

  async register(dto: {
    email: string; password: string; firstName: string
    lastName: string; dni: string; phone: string
  }): Promise<{ user: AuthUser; token: string }> {
    const { data } = await apiClient.post('/auth/register', dto)
    // Backend returns flat: { id, email, firstName, lastName, emailVerified, token }
    const { token, id, email, firstName, lastName, emailVerified } = data.data
    const user: AuthUser = {
      id, email, firstName, lastName,
      emailVerified: emailVerified ?? false,
      isIdentityVerified: false,
    }
    return { user, token }
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

  saveToken(token: string) { localStorage.setItem(TOKEN_KEY, token) },
  clearToken() { localStorage.removeItem(TOKEN_KEY) },
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },
  saveUser(user: AuthUser) { localStorage.setItem('solvo_user', JSON.stringify(user)) },
  clearUser() { localStorage.removeItem('solvo_user') },
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem('solvo_user')
    if (!raw || raw === 'undefined') return null
    try { return JSON.parse(raw) } catch { return null }
  },
}
