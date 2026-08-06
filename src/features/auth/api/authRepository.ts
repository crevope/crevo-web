import { apiClient, USER_STORAGE_KEY, clearClientSession } from '@/shared/api/client'
import type { AuthUser } from '@/entities/user'
import type { RegisterDto } from '../lib/authSchemas'

/**
 * Auth API adapter.
 *
 * Access/refresh tokens are transported exclusively via HttpOnly cookies set
 * by the backend — the SPA never sees or stores them. This repository only
 * owns the cached `user` profile in localStorage for fast client-side
 * hydration before /auth/me resolves.
 */

// ── 2FA (TOTP) — see docs/superpowers/specs/2026-07-28-crevo-2fa-totp-design.md
// Types mirror crevo-backend's AuthController /auth/2fa/* JSON verbatim.

export interface TwoFactorStatus {
  enabled: boolean
  confirmedAt: string | null
  unusedRecoveryCodes: number
}

export interface TwoFactorSetupData {
  otpauthUri: string
  secret: string
}

/**
 * `LoginUser.execute` on the backend returns one of three outcomes; the
 * controller maps them 1:1 into the JSON body (`requires2fa`/`challengeToken`
 * or `requires2faSetup`/`setupToken`, or `user`/`csrfToken`). A borrower
 * (crevo-web) should only ever see 'success' or 'requires_2fa' —
 * 'requires_2fa_setup' is the staff-only mandatory-enrollment path
 * (crevo-admin), but it's modeled here so `login()` can't silently swallow
 * it if it were ever hit.
 */
export type LoginResult =
  | { outcome: 'success'; user: AuthUser }
  | { outcome: 'requires_2fa'; challengeToken: string }
  | { outcome: 'requires_2fa_setup' }

interface RawAuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  emailVerified?: boolean
  isIdentityVerified?: boolean
}

function mapAuthUser(u: RawAuthUser): AuthUser {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    emailVerified: u.emailVerified ?? false,
    isIdentityVerified: u.isIdentityVerified ?? false,
  }
}

export const authRepository = {
  async login(email: string, password: string): Promise<LoginResult> {
    const { data } = await apiClient.post('/auth/login', { email, password })
    const payload = data.data as {
      user?: RawAuthUser
      requires2fa?: boolean
      challengeToken?: string
      requires2faSetup?: boolean
    }

    if (payload.requires2fa && payload.challengeToken) {
      return { outcome: 'requires_2fa', challengeToken: payload.challengeToken }
    }
    if (payload.requires2faSetup) {
      return { outcome: 'requires_2fa_setup' }
    }
    // Backend guarantees `user` on every non-2FA outcome (LoginUser's
    // 'success' branch always populates it) — see AuthController.login.
    return { outcome: 'success', user: mapAuthUser(payload.user as RawAuthUser) }
  },

  async register(dto: RegisterDto): Promise<{ user: AuthUser }> {
    const { data } = await apiClient.post('/auth/register', dto)
    // Backend returns: { id, email, firstName, lastName, emailVerified }
    const { id, email, firstName, lastName, emailVerified } = data.data
    const user: AuthUser = {
      id,
      email,
      firstName,
      lastName,
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

  // ── 2FA (TOTP) — opt-in client flow ────────────────────────────────────

  /** GET /auth/2fa/status — session-authenticated. */
  async getTwoFactorStatus(): Promise<TwoFactorStatus> {
    const { data } = await apiClient.get('/auth/2fa/status')
    return data.data
  },

  /** POST /auth/2fa/setup — session-authenticated (web never uses a
   *  setupToken; that path is staff-only mandatory enrollment in
   *  crevo-admin). Generates a PENDING secret; does NOT enable 2FA. Throws
   *  if 2FA is already enabled (disable first to reconfigure). */
  async setupTwoFactor(): Promise<TwoFactorSetupData> {
    const { data } = await apiClient.post('/auth/2fa/setup', {})
    return data.data
  },

  /** POST /auth/2fa/confirm — verifies the pending secret with a 6-digit
   *  code, enables 2FA, and returns the 8 recovery codes in clear text
   *  (the backend never returns them again after this call). */
  async confirmTwoFactor(code: string): Promise<{ recoveryCodes: string[] }> {
    const { data } = await apiClient.post('/auth/2fa/confirm', { code })
    return { recoveryCodes: data.data.recoveryCodes }
  },

  /** POST /auth/2fa/disable — requires a valid current TOTP code.
   *  Client-only; the backend rejects staff accounts. */
  async disableTwoFactor(code: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { code })
  },

  /** POST /auth/2fa/verify — no session yet (challengeToken only). Verifies
   *  a TOTP code OR a recovery code and, on success, the backend sets the
   *  session cookies exactly like a normal login. `useRecoveryCode` is a UI
   *  hint only — the backend always tries TOTP first regardless. */
  async verifyTwoFactor(
    challengeToken: string,
    code: string,
    useRecoveryCode = false,
  ): Promise<{ user: AuthUser }> {
    const { data } = await apiClient.post('/auth/2fa/verify', {
      challengeToken,
      code,
      useRecoveryCode,
    })
    return { user: mapAuthUser(data.data.user) }
  },

  /** POST /auth/2fa/recovery-codes/regenerate — requires a valid current
   *  TOTP code. Invalidates every existing recovery code and returns a
   *  fresh set of 8 (shown once). */
  async regenerateRecoveryCodes(code: string): Promise<{ recoveryCodes: string[] }> {
    const { data } = await apiClient.post('/auth/2fa/recovery-codes/regenerate', { code })
    return { recoveryCodes: data.data.recoveryCodes }
  },

  // ── User profile cache (localStorage) ──────────────────────────────────
  // We still cache the `user` object so the UI can render immediately on
  // refresh without waiting for /auth/me. This is NOT the security boundary:
  // the server treats every request as anonymous unless it carries a valid
  // HttpOnly auth cookie.

  /**
   * Permanently close the authenticated account — Ley 29733 Art. 19 right
   * to suppression. The backend anonymizes the live row and moves a copy
   * to the PLAFT archive (5-year retention per UIF), then invalidates the
   * session. The client-side cleanup mirrors logout.
   */
  async deleteMyAccount(): Promise<void> {
    await apiClient.delete('/users/me')
    clearClientSession()
  },

  saveUser(user: AuthUser) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  },
  /** Full client-side cleanup on logout: localStorage (preserves cookie
   *  consent + theme), sessionStorage CSRF, and the readable CSRF cookie. */
  clearUser() {
    clearClientSession()
  },
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw || raw === 'undefined') return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
}
