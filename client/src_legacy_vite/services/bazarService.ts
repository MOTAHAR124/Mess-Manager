import { apiClient } from './api';
import type { BazarDate } from '@/types/common';

export const bazarService = {
  assignMember: async (data: { monthId: string; date: string; memberId: string }) => {
    return await apiClient.post<BazarDate>('/bazar/assign', data);
  },

  getUpcomingDates: async (monthId: string) => {
    return await apiClient.get<BazarDate[]>(`/bazar/upcoming/${monthId}`);
  },

  getPersonalDates: async (monthId: string) => {
    return await apiClient.get<BazarDate[]>(`/bazar/mine/${monthId}`);
  },

  removeAssignment: async (id: string) => {
    return await apiClient.delete<void>(`/bazar/${id}`);
  },
};
