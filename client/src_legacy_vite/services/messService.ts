import { apiClient } from './api'
import { ApiResponse, Mess, MessMember } from '@/types/common'

export const messService = {
  /**
   * Create a new mess group
   */
  async createMess(data: { name: string }): Promise<ApiResponse<Mess>> {
    return apiClient.post<Mess>('/mess', data)
  },

  /**
   * Get mess details by ID
   */
  async getMessById(messId: string): Promise<ApiResponse<Mess>> {
    return apiClient.get<Mess>(`/mess/${messId}`)
  },

  /**
   * Get the current authenticated user's mess context
   */
  async getCurrentMess(): Promise<ApiResponse<Mess | null>> {
    return apiClient.get<Mess | null>('/mess/current')
  },

  /**
   * Update mess details
   */
  async updateMess(
    messId: string,
    data: { name?: string }
  ): Promise<ApiResponse<Mess>> {
    return apiClient.put<Mess>(`/mess/${messId}`, data)
  },

  /**
   * Get all members of a mess
   */
  async getMembers(messId: string): Promise<ApiResponse<MessMember[]>> {
    return apiClient.get<MessMember[]>(`/mess/${messId}/members`)
  },
}
