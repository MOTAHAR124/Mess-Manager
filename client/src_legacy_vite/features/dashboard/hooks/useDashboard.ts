import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useMessStore } from '@/stores/messStore';
import {
  dashboardService,
  AdminStats,
  ManagerSummary,
  MemberSummary,
  QuickStats,
  PaginatedResponse,
} from '../services/dashboardService';

/**
 * useDashboard Hook
 * Manages dashboard data fetching and caching
 */
export const useDashboard = () => {
  const authStore = useAuthStore();
  const messStore = useMessStore();
  const queryClient = useQueryClient();

  /**
   * Fetch admin stats
   */
  const adminStatsQuery = useQuery<AdminStats>({
    queryKey: ['dashboard', 'admin-stats'],
    queryFn: () => dashboardService.getAdminStats(),
    enabled: authStore.user?.id !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Fetch manager summary
   */
  const managerSummaryQuery = useQuery<ManagerSummary>({
    queryKey: ['dashboard', 'manager-summary', messStore.messId],
    queryFn: () => dashboardService.getManagerSummary(messStore.messId!),
    enabled: messStore.messId !== null,
    staleTime: 1000 * 60 * 5,
  });

  /**
   * Fetch members summary with pagination
   */
  const membersSummaryQuery = useQuery<PaginatedResponse<MemberSummary>>({
    queryKey: ['dashboard', 'members-summary', messStore.messId],
    queryFn: () => dashboardService.getMembersSummary(messStore.messId!, 20),
    enabled: messStore.messId !== null,
    staleTime: 1000 * 60 * 5,
  });

  /**
   * Fetch quick stats
   */
  const quickStatsQuery = useQuery<QuickStats>({
    queryKey: ['dashboard', 'quick-stats', messStore.messId],
    queryFn: () => dashboardService.getQuickStats(messStore.messId!),
    enabled: messStore.messId !== null,
    staleTime: 1000 * 60 * 5,
  });

  /**
   * Fetch recent activities with pagination
   */
  const recentActivitiesQuery = useQuery<PaginatedResponse<any>>({
    queryKey: ['dashboard', 'recent-activities', messStore.messId],
    queryFn: () => dashboardService.getRecentActivities(messStore.messId!, 20),
    enabled: messStore.messId !== null,
    staleTime: 1000 * 60 * 5,
  });

  /**
   * Refetch all dashboard data
   */
  const refetchAll = async () => {
    await Promise.all([
      adminStatsQuery.refetch(),
      managerSummaryQuery.refetch(),
      membersSummaryQuery.refetch(),
      quickStatsQuery.refetch(),
      recentActivitiesQuery.refetch(),
    ]);
  };

  /**
   * Load more members
   */
  const loadMoreMembers = async () => {
    const currentData = membersSummaryQuery.data;
    if (!currentData?.cursor || !messStore.messId) return;

    const newData = await dashboardService.getMembersSummary(
      messStore.messId,
      20,
      currentData.cursor,
    );

    queryClient.setQueryData(
      ['dashboard', 'members-summary', messStore.messId],
      {
        ...newData,
        data: [...(currentData.data || []), ...newData.data],
      },
    );
  };

  /**
   * Load more activities
   */
  const loadMoreActivities = async () => {
    const currentData = recentActivitiesQuery.data;
    if (!currentData?.cursor || !messStore.messId) return;

    const newData = await dashboardService.getRecentActivities(
      messStore.messId,
      20,
      currentData.cursor,
    );

    queryClient.setQueryData(
      ['dashboard', 'recent-activities', messStore.messId],
      {
        ...newData,
        data: [...(currentData.data || []), ...newData.data],
      },
    );
  };

  const isLoading =
    adminStatsQuery.isLoading ||
    managerSummaryQuery.isLoading ||
    membersSummaryQuery.isLoading ||
    quickStatsQuery.isLoading ||
    recentActivitiesQuery.isLoading;

  const error =
    adminStatsQuery.error ||
    managerSummaryQuery.error ||
    membersSummaryQuery.error ||
    quickStatsQuery.error ||
    recentActivitiesQuery.error;

  return {
    // Data
    adminStats: adminStatsQuery.data,
    managerSummary: managerSummaryQuery.data,
    members: membersSummaryQuery.data?.data || [],
    quickStats: quickStatsQuery.data,
    recentActivities: recentActivitiesQuery.data?.data || [],

    // Pagination
    membersHasMore: membersSummaryQuery.data?.hasMore || false,
    activitiesHasMore: recentActivitiesQuery.data?.hasMore || false,

    // Status
    isLoading,
    error,

    // Actions
    refetchAll,
    loadMoreMembers,
    loadMoreActivities,
  };
};
