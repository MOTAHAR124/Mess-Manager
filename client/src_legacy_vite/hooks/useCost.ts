import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { costService, CreateCostPayload } from '@/services/costService';
import { useCostStore } from '@/stores/costStore';
import { useEffect } from 'react';

/**
 * useCost hook
 * 
 * Manages expense logging and synchronization.
 */

export const useCost = (monthId: string) => {
  const queryClient = useQueryClient();
  const store = useCostStore();

  const getCostsQuery = useQuery({
    queryKey: ['costs', monthId],
    queryFn: () => costService.getCosts(monthId),
    enabled: !!monthId,
    refetchInterval: monthId ? 10000 : false,
    refetchIntervalInBackground: true,
  });

  const invalidateRealtimeQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['costs', monthId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-members'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-quick-stats'] });
    queryClient.invalidateQueries({ queryKey: ['settlement', monthId] });
    queryClient.invalidateQueries({ queryKey: ['meals', monthId] });
    queryClient.invalidateQueries({ queryKey: ['deposits', monthId] });
    queryClient.invalidateQueries({ queryKey: ['bazar'] });
  };

  const createCostMutation = useMutation({
    mutationFn: (data: CreateCostPayload) => costService.createCost(data),
    onSuccess: invalidateRealtimeQueries,
  });

  const deleteCostMutation = useMutation({
    mutationFn: (id: string) => costService.deleteCost(id),
    onSuccess: invalidateRealtimeQueries,
  });

  const updateCostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCostPayload }) => costService.updateCost(id, data),
    onSuccess: invalidateRealtimeQueries,
  });

  // Sync store
  useEffect(() => {
    if (getCostsQuery.data?.data) {
      store.setCosts(getCostsQuery.data.data);
    }
  }, [getCostsQuery.data]);

  return {
    getCostsQuery,
    createCostMutation,
    updateCostMutation,
    deleteCostMutation,
    isLoading: getCostsQuery.isLoading || createCostMutation.isPending,
    error: getCostsQuery.error || createCostMutation.error,
  };
};
