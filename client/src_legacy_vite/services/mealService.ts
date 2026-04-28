import { apiClient } from './api'
import { ApiResponse, Meal, CreateMealRequest } from '@/types/common'

export type CreateMealPayload = CreateMealRequest

export const mealService = {
  /**
   * Bulk upsert meal records (Preferred method)
   */
  async bulkUpsert(meals: CreateMealPayload[]): Promise<ApiResponse<Meal[]>> {
    return apiClient.post<Meal[]>('/meals/bulk', { meals })
  },

  /**
   * Add a new meal record
   */
  async addMeal(data: CreateMealPayload): Promise<ApiResponse<Meal>> {
    return apiClient.post<Meal>('/meals', data)
  },

  /**
   * Get meals for a month with cursor-based pagination
   */
  async getMeals(
    monthId: string
  ): Promise<ApiResponse<Meal[]>> {
    return apiClient.get<Meal[]>(`/meals/month/${monthId}`)
  },

  /**
   * Get meal by ID
   */
  async getMealById(mealId: string): Promise<ApiResponse<Meal>> {
    return apiClient.get<Meal>(`/meals/${mealId}`)
  },

  /**
   * Update meal record
   */
  async updateMeal(
    mealId: string,
    data: {
      breakfast?: number
      lunch?: number
      dinner?: number
      details?: string
    }
  ): Promise<ApiResponse<Meal>> {
    return apiClient.put<Meal>(`/meals/${mealId}`, data)
  },

  /**
   * Delete a meal record
   */
  async deleteMeal(mealId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/meals/${mealId}`)
  },
}
