import { apiClient } from './api';
import type { ApiResponse, BazarDate, MessMember } from '@/types/common';

export interface BazarDateAssignment extends BazarDate {
  member: MessMember;
}

export const bazarDateService = {
  async getMonthAssignments(monthId: string): Promise<ApiResponse<BazarDateAssignment[]>> {
    return apiClient.get<BazarDateAssignment[]>(`/bazar-dates/month/${monthId}`);
  },

  async createAssignment(data: {
    monthId: string;
    date: string;
    memberId: string;
  }): Promise<ApiResponse<BazarDateAssignment>> {
    return apiClient.post<BazarDateAssignment>('/bazar-dates', data);
  },

  async updateAssignment(
    id: string,
    data: { date?: string; memberId?: string },
  ): Promise<ApiResponse<BazarDateAssignment>> {
    return apiClient.put<BazarDateAssignment>(`/bazar-dates/${id}`, data);
  },

  async deleteAssignment(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/bazar-dates/${id}`);
  },
};
