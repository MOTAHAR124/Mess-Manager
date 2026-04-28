import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementService } from '@/services/settlementService';
import { useSettlementStore } from '@/stores/settlementStore';
import { useEffect } from 'react';

/**
 * useSettlement hook
 * 
 * Manages settlement calculations and synchronization.
 */

export const useSettlement = (monthId?: string) => {
  const store = useSettlementStore();
  const queryClient = useQueryClient();

  const settlementQuery = useQuery({
    queryKey: ['settlement', monthId],
    queryFn: () => settlementService.getSettlement(monthId!),
    enabled: !!monthId,
    refetchInterval: monthId ? 10000 : false,
    refetchIntervalInBackground: true,
  });

  const calculateMutation = useMutation({
    mutationFn: (id: string) => settlementService.calculateSettlement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlement', monthId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-quick-stats'] });
      queryClient.invalidateQueries({ queryKey: ['meals', monthId] });
      queryClient.invalidateQueries({ queryKey: ['costs', monthId] });
      queryClient.invalidateQueries({ queryKey: ['deposits', monthId] });
    },
  });

  // Synchronize with store
  useEffect(() => {
    if (settlementQuery.data?.data) {
      const settlement = settlementQuery.data.data;
      
      store.setCurrentSettlement({
        ...settlement
      });
    }
  }, [settlementQuery.data]);

  return {
    settlementQuery,
    calculateMutation,
    isLoading: settlementQuery.isLoading || calculateMutation.isPending,
    error: settlementQuery.error || calculateMutation.error,
  };
};
