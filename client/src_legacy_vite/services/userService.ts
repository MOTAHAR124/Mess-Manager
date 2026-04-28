import { apiClient } from './api';
import type { ApiResponse, User } from '@/types/common';

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export const userService = {
  async updateProfile(data: UpdateProfilePayload): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/users/me', data);
  },
};
