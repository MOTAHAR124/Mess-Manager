import { apiClient } from './api'
import { ApiResponse, Settlement } from '@/types/common'

export interface CalculateSettlementResponse extends Settlement {
  mealRate: number
  totalMeals: number
}

export const settlementService = {
  /**
   * Get settlement for a month (calculates if not exists)
   */
  async getSettlement(monthId: string): Promise<ApiResponse<CalculateSettlementResponse>> {
    return apiClient.get<CalculateSettlementResponse>(`/settlement/${monthId}`)
  },

  /**
   * Manually trigger settlement calculation
   */
  async calculateSettlement(monthId: string): Promise<ApiResponse<CalculateSettlementResponse>> {
    return apiClient.post<CalculateSettlementResponse>(`/settlement/${monthId}/calculate`)
  },

  /**
   * Mark a settlement as finalized/paid
   */
  async finalizeSettlement(monthId: string): Promise<ApiResponse<Settlement>> {
    return apiClient.post<Settlement>(`/settlement/${monthId}/finalize`)
  },
}
