import { apiClient } from './api'
import { ApiResponse, MessMember, Role } from '@/types/common'

export interface AddMemberPayload {
  messId: string
  email: string
  firstName?: string
  lastName?: string
  role?: Role
}

export interface UpdateMemberPayload {
  firstName?: string
  lastName?: string
  role?: Role
}

export const memberService = {
  /**
   * Add a member to mess by email
   */
  async addMember(data: AddMemberPayload): Promise<ApiResponse<MessMember>> {
    return apiClient.post<MessMember>('/members', data)
  },

  /**
   * Get member details
   */
  async getMemberById(memberId: string): Promise<ApiResponse<MessMember>> {
    return apiClient.get<MessMember>(`/members/${memberId}`)
  },

  /**
   * Remove member from mess
   */
  async removeMember(memberId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/members/${memberId}`)
  },

  /**
   * Update member role
   */
  async updateRole(
    memberId: string,
    role: Role
  ): Promise<ApiResponse<MessMember>> {
    return apiClient.put<MessMember>(`/members/${memberId}/role`, { role })
  },

  async updateMember(
    memberId: string,
    data: UpdateMemberPayload
  ): Promise<ApiResponse<MessMember>> {
    return apiClient.put<MessMember>(`/members/${memberId}`, data)
  },
}
