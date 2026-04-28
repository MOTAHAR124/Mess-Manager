import { apiClient } from './api'
import { ApiResponse, Cost, CostType } from '@/types/common'

export interface CreateCostPayload {
  monthId: string
  messId: string
  name: string
  amount: number
  type: CostType
  memberId?: string
  details?: string
}

export const costService = {
  /**
   * Add a new cost
   */
  async addCost(data: CreateCostPayload): Promise<ApiResponse<Cost>> {
    return apiClient.post<Cost>('/costs', data)
  },

  async createCost(data: CreateCostPayload): Promise<ApiResponse<Cost>> {
    return this.addCost(data)
  },

  /**
   * Get costs for a month
   */
  async getCosts(monthId: string): Promise<ApiResponse<Cost[]>> {
    return apiClient.get<Cost[]>(`/costs/month/${monthId}`)
  },

  /**
   * Delete a cost
   */
  async deleteCost(costId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/costs/${costId}`)
  },

  async updateCost(costId: string, data: CreateCostPayload): Promise<ApiResponse<Cost>> {
    return apiClient.put<Cost>(`/costs/${costId}`, data)
  },
}
