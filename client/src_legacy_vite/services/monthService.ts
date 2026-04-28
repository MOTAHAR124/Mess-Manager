import { apiClient } from './api'
import { ApiResponse, Month, CreateMonthRequest } from '@/types/common'

export type CreateMonthPayload = CreateMonthRequest

export const monthService = {
  /**
   * Create a new month for a mess
   */
  async createMonth(data: CreateMonthPayload): Promise<ApiResponse<Month>> {
    return apiClient.post<Month>('/months', data)
  },

  /**
   * Get months for a mess
   */
  async getMonths(messId: string): Promise<ApiResponse<Month[]>> {
    return apiClient.get<Month[]>(`/months/mess/${messId}`)
  },

  /**
   * Get month by ID
   */
  async getMonthById(monthId: string): Promise<ApiResponse<Month>> {
    return apiClient.get<Month>(`/months/${monthId}`)
  },

  /**
   * Set a month as active for its mess
   */
  async setActiveMonth(monthId: string): Promise<ApiResponse<Month>> {
    return apiClient.post<Month>(`/months/${monthId}/active`)
  },

  /**
   * Close a month (complete business)
   */
  async completeMonth(monthId: string): Promise<ApiResponse<Month>> {
    return apiClient.post<Month>(`/months/${monthId}/complete`)
  },

  async deleteMonth(monthId: string): Promise<ApiResponse<Month | null>> {
    return apiClient.delete<Month | null>(`/months/${monthId}`)
  },
}
