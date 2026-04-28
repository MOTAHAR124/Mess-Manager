import { apiClient } from './api'
import { ApiResponse, Deposit } from '@/types/common'

export interface RecordDepositPayload {
  monthId: string
  messId: string
  memberId: string
  amount: number
  date: string
  details?: string
}

export interface UpdateDepositDto {
  amount?: number
  date?: string
  details?: string
  memberId?: string
}

export const depositService = {
  /**
   * Record a new deposit
   */
  async recordDeposit(
    data: RecordDepositPayload
  ): Promise<ApiResponse<Deposit>> {
    return apiClient.post<Deposit>('/deposits', data)
  },

  async createDeposit(data: RecordDepositPayload): Promise<ApiResponse<Deposit>> {
    return this.recordDeposit(data)
  },

  /**
   * Get deposits for a month
   */
  async getDeposits(monthId: string): Promise<ApiResponse<Deposit[]>> {
    return apiClient.get<Deposit[]>(`/deposits/month/${monthId}`)
  },

  async deleteDeposit(depositId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/deposits/${depositId}`)
  },

  async updateDeposit(depositId: string, data: UpdateDepositDto): Promise<ApiResponse<Deposit>> {
    return apiClient.put<Deposit>(`/deposits/${depositId}`, data)
  },
}
