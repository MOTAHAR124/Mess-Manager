import { apiClient } from '@/services/apiClient';
import type { PaginatedResponse } from '@/types/api';

/**
 * Deposits Service
 * Handles deposit and contribution tracking
 */

export interface Deposit {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  description?: string;
  type: 'CASH' | 'TRANSFER' | 'ONLINE';
  status: 'PENDING' | 'COMPLETED' | 'VERIFIED';
  createdAt: string;
}

export interface CreateDepositDto {
  memberId: string;
  amount: number;
  date: string;
  description?: string;
  type?: 'CASH' | 'TRANSFER' | 'ONLINE';
}

export interface UpdateDepositDto {
  amount?: number;
  date?: string;
  description?: string;
  status?: 'PENDING' | 'COMPLETED' | 'VERIFIED';
}

export class DepositsService {
  /**
   * Get all deposits for a month
   */
  static async getDeposits(
    messId: string,
    monthId: string,
    cursor?: string,
    pageSize: number = 20,
  ): Promise<PaginatedResponse<Deposit>> {
    const params = new URLSearchParams({
      messId,
      monthId,
      pageSize: pageSize.toString(),
    });

    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get<PaginatedResponse<Deposit>>(
      `/deposits?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Get single deposit
   */
  static async getDeposit(depositId: string): Promise<Deposit> {
    const response = await apiClient.get<Deposit>(`/deposits/${depositId}`);
    return response.data;
  }

  /**
   * Create new deposit
   */
  static async createDeposit(
    messId: string,
    monthId: string,
    dto: CreateDepositDto,
  ): Promise<Deposit> {
    const response = await apiClient.post<Deposit>(
      `/deposits`,
      {
        ...dto,
        messId,
        monthId,
      },
    );
    return response.data;
  }

  /**
   * Update deposit
   */
  static async updateDeposit(depositId: string, dto: UpdateDepositDto): Promise<Deposit> {
    const response = await apiClient.patch<Deposit>(`/deposits/${depositId}`, dto);
    return response.data;
  }

  /**
   * Delete deposit
   */
  static async deleteDeposit(depositId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/deposits/${depositId}`,
    );
    return response.data;
  }

  /**
   * Get deposit summary
   */
  static async getDepositSummary(messId: string, monthId: string): Promise<any> {
    const response = await apiClient.get(
      `/deposits/summary?messId=${messId}&monthId=${monthId}`,
    );
    return response.data;
  }

  /**
   * Get member deposits
   */
  static async getMemberDeposits(
    messId: string,
    memberId: string,
    monthId?: string,
  ): Promise<Deposit[]> {
    const params = new URLSearchParams({
      messId,
      memberId,
    });

    if (monthId) params.append('monthId', monthId);

    const response = await apiClient.get<{ data: Deposit[] }>(
      `/deposits/member/${memberId}?${params.toString()}`,
    );
    return response.data.data;
  }

  /**
   * Verify deposit
   */
  static async verifyDeposit(depositId: string): Promise<Deposit> {
    const response = await apiClient.patch<Deposit>(
      `/deposits/${depositId}/verify`,
    );
    return response.data;
  }
}
