import { apiClient } from '@/services/apiClient';
import type { PaginatedResponse, ApiError } from '@/types/api';

/**
 * Members Service
 * Handles all member-related API calls
 */

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'MANAGER' | 'MEMBER';
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateMemberDto {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateMemberDto {
  firstName?: string;
  lastName?: string;
  role?: 'MANAGER' | 'MEMBER';
}

export class MembersService {
  /**
   * Get all members for a mess
   */
  static async getMembers(
    messId: string,
    cursor?: string,
    pageSize: number = 20,
  ): Promise<PaginatedResponse<Member>> {
    const params = new URLSearchParams({
      messId,
      pageSize: pageSize.toString(),
    });

    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get<PaginatedResponse<Member>>(
      `/members?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Get single member details
   */
  static async getMember(memberId: string): Promise<Member> {
    const response = await apiClient.get<Member>(`/members/${memberId}`);
    return response.data;
  }

  /**
   * Add new member to mess
   */
  static async addMember(
    messId: string,
    dto: CreateMemberDto,
  ): Promise<Member> {
    const response = await apiClient.post<Member>(
      `/members`,
      {
        ...dto,
        messId,
      },
    );
    return response.data;
  }

  /**
   * Update member
   */
  static async updateMember(
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<Member> {
    const response = await apiClient.patch<Member>(
      `/members/${memberId}`,
      dto,
    );
    return response.data;
  }

  /**
   * Remove member from mess
   */
  static async removeMember(memberId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/members/${memberId}`,
    );
    return response.data;
  }

  /**
   * Change member role
   */
  static async changeMemberRole(
    memberId: string,
    role: 'MANAGER' | 'MEMBER',
  ): Promise<Member> {
    const response = await apiClient.patch<Member>(
      `/members/${memberId}/role`,
      { role },
    );
    return response.data;
  }

  /**
   * Get member summary (meals, costs, deposits, balance)
   */
  static async getMemberSummary(
    memberId: string,
    monthId?: string,
  ): Promise<any> {
    const params = new URLSearchParams();
    if (monthId) params.append('monthId', monthId);

    const response = await apiClient.get(
      `/members/${memberId}/summary?${params.toString()}`,
    );
    return response.data;
  }
}
