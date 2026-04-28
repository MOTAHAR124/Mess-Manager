import { apiClient } from './api'
import { 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/common'

export interface AdminDashboardStats {
  totalUsers: number
  totalMesses: number
  activeMesses: number
  totalMembers: number
  totalTransactions: number
  totalMealCost: number
  totalDeposits: number
  totalBalance: number
  lastUpdated: string
}

export interface MessSummary {
  id: string
  name: string
  createdBy: string
  memberCount: number
  lastActivityDate: string
  createdAt: string
}

export interface ManagerDashboardSummary {
  messId: string
  messName: string
  monthId: string
  monthName: string
  totalMembers: number
  totalMeals: number
  totalMealCost: number
  totalSharedCosts: number
  totalIndividualCosts: number
  totalDeposits: number
  totalBalance: number
  averageMealCost: number
}

export interface MemberSummary {
  id: string
  name: string
  email: string
  profilePicture?: string
  totalMeals: number
  totalMealCost: number
  totalIndividualCosts: number
  shareInSharedCosts: number
  totalDeposits: number
  balance: number
}

export interface RecentActivity {
  id: string
  type: 'MEAL' | 'COST' | 'DEPOSIT'
  amount: number
  date: string
  memberId: string
  memberName: string
  description: string
  createdAt: string
}

export interface QuickStats {
  totalIncome: number
  totalExpense: number
  totalMembers: number
  averagePerMember: number
  pendingSettlements: number
}

export const dashboardService = {
  /**
   * Get admin global stats
   */
  async getAdminStats(): Promise<ApiResponse<AdminDashboardStats>> {
    return apiClient.get<AdminDashboardStats>('/dashboard/admin/stats')
  },

  /**
   * Get recently created messes
   */
  async getRecentMesses(pageSize = 10, cursor?: string): Promise<ApiResponse<PaginatedResponse<MessSummary>>> {
    return apiClient.get<PaginatedResponse<MessSummary>>('/dashboard/admin/recent-messes', { pageSize, cursor })
  },

  /**
   * Get manager's current mess summary
   */
  async getManagerSummary(messId: string): Promise<ApiResponse<ManagerDashboardSummary>> {
    return apiClient.get<ManagerDashboardSummary>(`/dashboard/manager/${messId}/summary`)
  },

  /**
   * Get member summaries for a mess
   */
  async getMembersSummary(messId: string, pageSize = 20, cursor?: string): Promise<ApiResponse<PaginatedResponse<MemberSummary>>> {
    return apiClient.get<PaginatedResponse<MemberSummary>>(`/dashboard/manager/${messId}/members`, { pageSize, cursor })
  },

  /**
   * Get recent activities for a mess
   */
  async getRecentActivities(messId: string, pageSize = 10, cursor?: string): Promise<ApiResponse<PaginatedResponse<RecentActivity>>> {
    return apiClient.get<PaginatedResponse<RecentActivity>>(`/dashboard/manager/${messId}/activity`, { pageSize, cursor })
  },

  /**
   * Get quick stats for dashboard cards
   */
  async getQuickStats(messId: string): Promise<ApiResponse<QuickStats>> {
    return apiClient.get<QuickStats>(`/dashboard/manager/${messId}/quick-stats`)
  },
}
