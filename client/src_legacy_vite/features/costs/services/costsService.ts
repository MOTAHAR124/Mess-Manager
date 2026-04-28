import { apiClient } from '@/services/apiClient';
import type { PaginatedResponse } from '@/types/api';

/**
 * Costs Service
 * Handles cost tracking and management
 */

export interface Cost {
  id: string;
  description: string;
  amount: number;
  type: 'INDIVIDUAL' | 'SHARED';
  paidBy: string;
  paidByName: string;
  date: string;
  distribution?: Record<string, number>; // For shared costs
  createdAt: string;
}

export interface CreateCostDto {
  description: string;
  amount: number;
  type: 'INDIVIDUAL' | 'SHARED';
  paidBy: string;
  date: string;
  distribution?: Record<string, number>;
}

export interface UpdateCostDto {
  description?: string;
  amount?: number;
  date?: string;
  distribution?: Record<string, number>;
}

export class CostsService {
  /**
   * Get all costs for a month
   */
  static async getCosts(
    messId: string,
    monthId: string,
    cursor?: string,
    pageSize: number = 20,
  ): Promise<PaginatedResponse<Cost>> {
    const params = new URLSearchParams({
      messId,
      monthId,
      pageSize: pageSize.toString(),
    });

    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get<PaginatedResponse<Cost>>(
      `/costs?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Get single cost
   */
  static async getCost(costId: string): Promise<Cost> {
    const response = await apiClient.get<Cost>(`/costs/${costId}`);
    return response.data;
  }

  /**
   * Create new cost
   */
  static async createCost(messId: string, monthId: string, dto: CreateCostDto): Promise<Cost> {
    const response = await apiClient.post<Cost>(
      `/costs`,
      {
        ...dto,
        messId,
        monthId,
      },
    );
    return response.data;
  }

  /**
   * Update cost
   */
  static async updateCost(costId: string, dto: UpdateCostDto): Promise<Cost> {
    const response = await apiClient.patch<Cost>(`/costs/${costId}`, dto);
    return response.data;
  }

  /**
   * Delete cost
   */
  static async deleteCost(costId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/costs/${costId}`);
    return response.data;
  }

  /**
   * Get cost summary by type
   */
  static async getCostSummary(messId: string, monthId: string): Promise<any> {
    const response = await apiClient.get(
      `/costs/summary?messId=${messId}&monthId=${monthId}`,
    );
    return response.data;
  }

  /**
   * Get cost breakdown by member
   */
  static async getCostByMember(
    messId: string,
    monthId: string,
    memberId: string,
  ): Promise<Cost[]> {
    const response = await apiClient.get<{ data: Cost[] }>(
      `/costs/member/${memberId}?messId=${messId}&monthId=${monthId}`,
    );
    return response.data.data;
  }

  /**
   * Calculate shared cost distribution
   */
  static async calculateDistribution(
    amount: number,
    memberIds: string[],
  ): Promise<Record<string, number>> {
    const response = await apiClient.post<Record<string, number>>(
      `/costs/calculate-distribution`,
      { amount, memberIds },
    );
    return response.data;
  }
}
