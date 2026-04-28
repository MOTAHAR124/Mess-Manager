import { apiClient } from '@/services/apiClient';
import type { PaginatedResponse } from '@/types/api';

/**
 * Settlement Service
 * Handles settlement calculations and reports
 */

export interface Settlement {
  id: string;
  monthId: string;
  monthName: string;
  membersSettlement: MemberSettlement[];
  settlementDate: string;
  status: 'PENDING' | 'SETTLED' | 'COMPLETED';
  createdAt: string;
}

export interface MemberSettlement {
  memberId: string;
  memberName: string;
  totalMeals: number;
  totalCosts: number;
  totalDeposits: number;
  balance: number;
}

export interface SettlementSummary {
  totalMembers: number;
  totalMeals: number;
  totalCosts: number;
  totalDeposits: number;
  totalBalance: number;
  debts: DebtEntry[];
}

export interface DebtEntry {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export class SettlementService {
  /**
   * Get settlement for a month
   */
  static async getSettlement(monthId: string): Promise<Settlement> {
    const response = await apiClient.get<Settlement>(`/settlement/${monthId}`);
    return response.data;
  }

  /**
   * Calculate settlement
   */
  static async calculateSettlement(messId: string, monthId: string): Promise<Settlement> {
    const response = await apiClient.post<Settlement>(
      `/settlement/calculate`,
      {
        messId,
        monthId,
      },
    );
    return response.data;
  }

  /**
   * Get settlement summary
   */
  static async getSettlementSummary(messId: string, monthId: string): Promise<SettlementSummary> {
    const response = await apiClient.get<SettlementSummary>(
      `/settlement/summary?messId=${messId}&monthId=${monthId}`,
    );
    return response.data;
  }

  /**
   * Get all settlements for a mess
   */
  static async getSettlements(
    messId: string,
    cursor?: string,
    pageSize: number = 20,
  ): Promise<PaginatedResponse<Settlement>> {
    const params = new URLSearchParams({
      messId,
      pageSize: pageSize.toString(),
    });

    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get<PaginatedResponse<Settlement>>(
      `/settlement?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Finalize settlement
   */
  static async finalizeSettlement(monthId: string): Promise<Settlement> {
    const response = await apiClient.post<Settlement>(
      `/settlement/${monthId}/finalize`,
    );
    return response.data;
  }

  /**
   * Get member balance for month
   */
  static async getMemberBalance(memberId: string, monthId: string): Promise<{
    memberId: string;
    balance: number;
    meals: number;
    costs: number;
    deposits: number;
  }> {
    const response = await apiClient.get(
      `/settlement/member/${memberId}?monthId=${monthId}`,
    );
    return response.data;
  }

  /**
   * Generate PDF report
   */
  static async generatePdfReport(monthId: string): Promise<Blob> {
    const response = await apiClient.get(
      `/settlement/${monthId}/pdf`,
      { responseType: 'blob' },
    );
    return response.data;
  }

  /**
   * Export settlement as CSV
   */
  static async exportCsv(monthId: string): Promise<Blob> {
    const response = await apiClient.get(
      `/settlement/${monthId}/csv`,
      { responseType: 'blob' },
    );
    return response.data;
  }

  /**
   * Calculate debts between members
   */
  static async calculateDebts(messId: string, monthId: string): Promise<DebtEntry[]> {
    const response = await apiClient.get<DebtEntry[]>(
      `/settlement/debts?messId=${messId}&monthId=${monthId}`,
    );
    return response.data;
  }
}
