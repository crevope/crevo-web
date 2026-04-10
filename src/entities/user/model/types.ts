export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
  isIdentityVerified: boolean
  phone?: string
  dni?: string
}
