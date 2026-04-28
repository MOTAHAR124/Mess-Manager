import axios, { AxiosInstance, AxiosError } from 'axios'
import { ApiResponse } from '@/types/common'
import { QueryClient } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.instance = axios.create({
      baseURL: `${API_URL}/api/v1`,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as import("axios").InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.subscribeTokenRefresh((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(this.instance(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) throw new Error('No refresh token')

            // Use a clean axios instance to avoid interceptor loops
            const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
              `${API_URL}/api/v1/auth/refresh`,
              { refreshToken }
            )

            const { accessToken, refreshToken: newRefreshToken } = response.data.data!
            
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            this.onTokenRefreshed(accessToken)
            this.isRefreshing = false

            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return this.instance(originalRequest)
          } catch (refreshError) {
            this.isRefreshing = false
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb)
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.map((cb) => cb(token))
    this.refreshSubscribers = []
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url)
    return response.data
  }
}

export const apiClient = new ApiClient()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})
