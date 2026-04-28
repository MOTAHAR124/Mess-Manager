import { apiClient } from './api'
import { ApiResponse, User, AuthResponse } from '@/types/common'

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  /**
   * Get current authenticated user
   */
  async getMe(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me')
  },

  /**
   * Register with email/password
   */
  async register(data: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', data)
  },

  /**
   * Login with email/password
   */
  async login(data: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', data)
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      return await apiClient.post<null>('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },

  /**
   * Refresh token manually if needed
   */
  async refresh(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken })
  },

  /**
   * Forgot Password
   */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/forgot-password', { email })
  },

  /**
   * Reset Password
   */
  async resetPassword(data: { token: string; newPassword: string }): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/reset-password', data)
  },

  /**
   * Verify Email
   */
  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/verify-email', { token })
  },

  /**
   * Handle Google OAuth callback
   * Extracts tokens from URL and stores them
   */
  handleGoogleCallback(accessToken: string, refreshToken: string) {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    }
  },

  /**
   * Initialize Google OAuth login
   */
  loginWithGoogle() {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.href = `${backendUrl}/api/v1/auth/google`
  },
}
