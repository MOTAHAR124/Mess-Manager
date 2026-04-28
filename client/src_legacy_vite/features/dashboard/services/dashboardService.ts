import { apiClient } from '@/services/apiClient';

export interface AdminStats {
  totalUsers: number;
  totalMesses: number;
  activeMesses: number;
  totalMembers: number;
  totalTransactions: number;
  totalMealCost: number;
  totalDeposits: number;
  totalBalance: number;
  lastUpdated: string;
}

export interface ManagerSummary {
  messId: string;
  messName: string;
  monthId: string;
  monthName: string;
  totalMembers: number;
  totalMeals: number;
  totalMealCost: number;
  totalSharedCosts: number;
  totalIndividualCosts: number;
  totalDeposits: number;
  totalBalance: number;
  averageMealCost: number;
}

export interface MemberSummary {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  totalMeals: number;
  totalMealCost: number;
  totalIndividualCosts: number;
  shareInSharedCosts: number;
  totalDeposits: number;
  balance: number;
}

export interface QuickStats {
  totalIncome: number;
  totalExpense: number;
  totalMembers: number;
  averagePerMember: number;
  pendingSettlements: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  pageSize: number;
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Dashboard Service
 * Handles all dashboard API calls
 */
export const dashboardService = {
  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    const response = await apiClient.get('/dashboard/admin/stats');
    return response.data;
  },

  /**
   * Get recent messes with pagination
   */
  async getRecentMesses(
    pageSize: number = 20,
    cursor?: string,
  ): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/dashboard/admin/recent-messes', {
      params: { pageSize, cursor },
    });
    return response.data;
  },

  /**
   * Get manager's mess summary
   */
  async getManagerSummary(messId: string): Promise<ManagerSummary> {
    const response = await apiClient.get('/dashboard/manager/summary', {
      params: { messId },
    });
    return response.data;
  },

  /**
   * Get members summary with pagination
   */
  async getMembersSummary(
    messId: string,
    pageSize: number = 20,
    cursor?: string,
  ): Promise<PaginatedResponse<MemberSummary>> {
    const response = await apiClient.get('/dashboard/manager/members-summary', {
      params: { messId, pageSize, cursor },
    });
    return response.data;
  },

  /**
   * Get recent activities with pagination
   */
  async getRecentActivities(
    messId: string,
    pageSize: number = 20,
    cursor?: string,
  ): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/dashboard/manager/recent-activities', {
      params: { messId, pageSize, cursor },
    });
    return response.data;
  },

  /**
   * Get quick stats
   */
  async getQuickStats(messId: string): Promise<QuickStats> {
    const response = await apiClient.get('/dashboard/manager/quick-stats', {
      params: { messId },
    });
    return response.data;
  },
};
