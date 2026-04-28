import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect } from 'react';

/**
 * useDashboard hook
 * 
 * Centralizes all dashboard-related queries and synchronizes them with the 
 * stateful DashboardStore.
 */

export const useDashboard = (messId?: string) => {
  const store = useDashboardStore();

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary', messId],
    queryFn: () => dashboardService.getManagerSummary(messId!),
    enabled: !!messId,
    refetchInterval: messId ? 15000 : false,
    refetchIntervalInBackground: true,
  });

  const membersSummaryQuery = useQuery({
    queryKey: ['dashboard-members', messId],
    queryFn: () => dashboardService.getMembersSummary(messId!),
    enabled: !!messId,
    refetchInterval: messId ? 15000 : false,
    refetchIntervalInBackground: true,
  });

  const quickStatsQuery = useQuery({
    queryKey: ['dashboard-quick-stats', messId],
    queryFn: () => dashboardService.getQuickStats(messId!),
    enabled: !!messId,
    refetchInterval: messId ? 15000 : false,
    refetchIntervalInBackground: true,
  });

  // Synchronize with store
  useEffect(() => {
    if (summaryQuery.data?.data) {
      store.setOverview(summaryQuery.data.data);
    }
  }, [summaryQuery.data]);

  useEffect(() => {
    if (membersSummaryQuery.data?.data) {
      store.setMembersSummary(membersSummaryQuery.data.data.data);
    }
  }, [membersSummaryQuery.data]);

  useEffect(() => {
    if (quickStatsQuery.data?.data) {
      store.setQuickStats(quickStatsQuery.data.data);
    }
  }, [quickStatsQuery.data]);

  return {
    summaryQuery,
    membersSummaryQuery,
    quickStatsQuery,
    isLoading: !!messId && (summaryQuery.isLoading || membersSummaryQuery.isLoading || quickStatsQuery.isLoading),
    error: summaryQuery.error || membersSummaryQuery.error || quickStatsQuery.error,
  };
};
