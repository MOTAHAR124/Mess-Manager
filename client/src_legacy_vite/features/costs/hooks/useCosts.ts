import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CostsService, type CreateCostDto } from '../services/costsService';
import { useMessStore } from '@/stores/messStore';
import { useCostStore } from '@/stores/costStore';
import { useUiStore } from '@/stores/uiStore';

/**
 * useCosts Hook
 * Manages cost data, fetching, and mutations
 */

export const useCosts = (messId?: string, monthId?: string, pageSize: number = 20) => {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();
  const activeMess = useMessStore((s) => s.messId);
  const activeMonth = useMessStore((s) => s.activeMonth);
  const { setCosts } = useCostStore();

  const currentMessId = messId || activeMess;
  const currentMonthId = monthId || activeMonth?.id;

  // Fetch costs
  const costsQuery = useQuery({
    queryKey: ['costs', currentMessId, currentMonthId],
    queryFn: () =>
      CostsService.getCosts(
        currentMessId!,
        currentMonthId!,
        undefined,
        pageSize,
      ),
    enabled: !!currentMessId && !!currentMonthId,
    staleTime: 1000 * 60 * 2,
  });

  // Create cost mutation
  const createCostMutation = useMutation({
    mutationFn: (dto: CreateCostDto) =>
      CostsService.createCost(currentMessId!, currentMonthId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['costs', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Cost added successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        message: error.response?.data?.error?.message || 'Failed to add cost',
        type: 'error',
      });
    },
  });

  // Update cost mutation
  const updateCostMutation = useMutation({
    mutationFn: ({ costId, ...data }: { costId: string; [key: string]: any }) =>
      CostsService.updateCost(costId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['costs', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Cost updated successfully',
        type: 'success',
      });
    },
  });

  // Delete cost mutation
  const deleteCostMutation = useMutation({
    mutationFn: (costId: string) => CostsService.deleteCost(costId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['costs', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Cost deleted successfully',
        type: 'success',
      });
    },
  });

  // Get cost summary
  const summaryQuery = useQuery({
    queryKey: ['costSummary', currentMessId, currentMonthId],
    queryFn: () => CostsService.getCostSummary(currentMessId!, currentMonthId!),
    enabled: !!currentMessId && !!currentMonthId,
  });

  // Calculate distribution
  const calculateDistributionMutation = useMutation({
    mutationFn: ({
      amount,
      memberIds,
    }: {
      amount: number;
      memberIds: string[];
    }) => CostsService.calculateDistribution(amount, memberIds),
  });

  return {
    // Query data
    costs: costsQuery.data?.data || [],
    isLoadingCosts: costsQuery.isLoading,
    isErrorCosts: costsQuery.isError,
    costsError: costsQuery.error,
    costsPagination: {
      cursor: costsQuery.data?.pagination?.cursor || null,
      hasMore: costsQuery.data?.pagination?.hasMore || false,
      pageSize: costsQuery.data?.pagination?.pageSize || pageSize,
    },

    // Summary
    costSummary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,

    // Mutations
    createCost: createCostMutation.mutate,
    isCreatingCost: createCostMutation.isPending,
    updateCost: updateCostMutation.mutate,
    isUpdatingCost: updateCostMutation.isPending,
    deleteCost: deleteCostMutation.mutate,
    isDeletingCost: deleteCostMutation.isPending,
    calculateDistribution: calculateDistributionMutation.mutate,
    isCalculatingDistribution: calculateDistributionMutation.isPending,
    distribution: calculateDistributionMutation.data,

    // Refetch
    refetchCosts: costsQuery.refetch,
    refetchSummary: summaryQuery.refetch,
  };
};
