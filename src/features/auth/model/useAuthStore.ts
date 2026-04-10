import { create } from 'zustand'
import { authRepository } from '../api/authRepository'
import type { AuthUser } from '@/entities/user'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (dto: { email: string; password: string; firstName: string; lastName: string; dni: string; phone: string }) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => void
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loadUser: () => {
    const token = authRepository.getToken()
    const user = authRepository.getStoredUser()
    set({ user, isAuthenticated: !!token && !!user, isLoading: false })
  },

  setUser: (user) => { authRepository.saveUser(user); set({ user }) },

  login: async (email, password) => {
    const { user, token, refreshToken } = await authRepository.login(email, password)
    authRepository.saveToken(token)
    if (refreshToken) authRepository.saveRefreshToken(refreshToken)
    authRepository.saveUser(user)
    set({ user, isAuthenticated: true })
  },

  register: async (dto) => {
    const { user, token, refreshToken } = await authRepository.register(dto)
    authRepository.saveToken(token)
    if (refreshToken) authRepository.saveRefreshToken(refreshToken)
    authRepository.saveUser(user)
    set({ user, isAuthenticated: true })
  },

  logout: async () => {
    // Revocar el refresh token en el servidor antes de limpiar el estado local
    const refreshToken = authRepository.getRefreshToken()
    if (refreshToken) {
      await authRepository.logout(refreshToken)
    }
    authRepository.clearToken()
    authRepository.clearRefreshToken()
    authRepository.clearUser()
    set({ user: null, isAuthenticated: false })
  },
}))
