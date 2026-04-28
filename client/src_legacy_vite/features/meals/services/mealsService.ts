import { apiClient } from '@/services/apiClient';
import type { PaginatedResponse } from '@/types/api';

/**
 * Meals Service
 * Handles meal tracking, creation, and management
 */

export interface Meal {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  cost: number;
  description?: string;
  quantity: number;
  createdAt: string;
}

export interface CreateMealDto {
  memberId: string;
  date: string;
  cost: number;
  description?: string;
  quantity?: number;
}

export interface UpdateMealDto {
  cost?: number;
  date?: string;
  description?: string;
  quantity?: number;
}

export class MealsService {
  /**
   * Get all meals for a month
   */
  static async getMeals(
    messId: string,
    monthId: string,
    cursor?: string,
    pageSize: number = 20,
  ): Promise<PaginatedResponse<Meal>> {
    const params = new URLSearchParams({
      messId,
      monthId,
      pageSize: pageSize.toString(),
    });

    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get<PaginatedResponse<Meal>>(
      `/meals?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Get meals for a specific member
   */
  static async getMemberMeals(
    messId: string,
    memberId: string,
    monthId?: string,
  ): Promise<Meal[]> {
    const params = new URLSearchParams({
      messId,
      memberId,
    });

    if (monthId) params.append('monthId', monthId);

    const response = await apiClient.get<{ data: Meal[] }>(
      `/meals/member/${memberId}?${params.toString()}`,
    );
    return response.data.data;
  }

  /**
   * Get single meal
   */
  static async getMeal(mealId: string): Promise<Meal> {
    const response = await apiClient.get<Meal>(`/meals/${mealId}`);
    return response.data;
  }

  /**
   * Create new meal entry
   */
  static async createMeal(messId: string, monthId: string, dto: CreateMealDto): Promise<Meal> {
    const response = await apiClient.post<Meal>(
      `/meals`,
      {
        ...dto,
        messId,
        monthId,
      },
    );
    return response.data;
  }

  /**
   * Update meal
   */
  static async updateMeal(mealId: string, dto: UpdateMealDto): Promise<Meal> {
    const response = await apiClient.patch<Meal>(`/meals/${mealId}`, dto);
    return response.data;
  }

  /**
   * Delete meal
   */
  static async deleteMeal(mealId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/meals/${mealId}`);
    return response.data;
  }

  /**
   * Get meal summary
   */
  static async getMealSummary(messId: string, monthId: string): Promise<any> {
    const response = await apiClient.get(
      `/meals/summary?messId=${messId}&monthId=${monthId}`,
    );
    return response.data;
  }

  /**
   * Bulk create meals
   */
  static async bulkCreateMeals(
    messId: string,
    monthId: string,
    meals: CreateMealDto[],
  ): Promise<{ success: boolean; count: number }> {
    const response = await apiClient.post(
      `/meals/bulk`,
      { meals, messId, monthId },
    );
    return response.data;
  }
}
