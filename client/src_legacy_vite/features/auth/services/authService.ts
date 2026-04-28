import axios, { AxiosError } from 'axios';
import type { AuthResponseDto, LoginDto, RegisterDto, UserProfileDto } from '@/types/common';

/**
 * Authentication Service
 * 
 * Handles all auth API calls:
 * - Login/Register
 * - Google OAuth
 * - Token refresh
 * - Profile operations
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const authApi = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

class AuthService {
  /**
   * Register with email and password
   */
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    try {
      const response = await authApi.post<AuthResponseDto>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<AuthResponseDto> {
    try {
      const response = await authApi.post<AuthResponseDto>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Google OAuth login URL
   */
  getGoogleLoginUrl(): string {
    return `${API_URL}${API_PREFIX}/auth/google`;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean }> {
    try {
      const response = await authApi.post<{ success: boolean }>(
        '/auth/verify-email',
        { token },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await authApi.post<{
        success: boolean;
        message: string;
      }>('/auth/resend-verification-email', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await authApi.post<{
        accessToken: string;
        expiresIn: number;
      }>('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(accessToken: string): Promise<UserProfileDto> {
    try {
      const response = await authApi.get<UserProfileDto>('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    accessToken: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await authApi.post<{
        success: boolean;
        message: string;
      }>(
        '/auth/change-password',
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout
   */
  async logout(accessToken: string): Promise<{ success: boolean }> {
    try {
      const response = await authApi.post<{ success: boolean }>(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set authorization header
   */
  setAuthHeader(token: string): void {
    if (token) {
      authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete authApi.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Remove authorization header
   */
  removeAuthHeader(): void {
    delete authApi.defaults.headers.common['Authorization'];
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        error: { message: string };
      }>;
      const message =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'An error occurred';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('An unknown error occurred');
  }
}

export const authService = new AuthService();
