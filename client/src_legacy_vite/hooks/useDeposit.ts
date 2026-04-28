import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depositService, RecordDepositPayload, UpdateDepositDto } from '@/services/depositService';
import { useDepositStore } from '@/stores/depositStore';
import { useEffect } from 'react';

/**
 * useDeposit hook
 * 
 * Manages funding/deposit logging and synchronization.
 */

export const useDeposit = (monthId: string) => {
  const queryClient = useQueryClient();
  const store = useDepositStore();

  const getDepositsQuery = useQuery({
    queryKey: ['deposits', monthId],
    queryFn: () => depositService.getDeposits(monthId),
    enabled: !!monthId,
    refetchInterval: monthId ? 10000 : false,
    refetchIntervalInBackground: true,
  });

  const invalidateRealtimeQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['deposits', monthId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-members'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-quick-stats'] });
    queryClient.invalidateQueries({ queryKey: ['settlement', monthId] });
    queryClient.invalidateQueries({ queryKey: ['meals', monthId] });
    queryClient.invalidateQueries({ queryKey: ['costs', monthId] });
    queryClient.invalidateQueries({ queryKey: ['bazar'] });
  };

  const createDepositMutation = useMutation({
    mutationFn: (data: RecordDepositPayload) => depositService.createDeposit(data),
    onSuccess: invalidateRealtimeQueries,
  });

  const deleteDepositMutation = useMutation({
    mutationFn: (id: string) => depositService.deleteDeposit(id),
    onSuccess: invalidateRealtimeQueries,
  });

  const updateDepositMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepositDto }) => depositService.updateDeposit(id, data),
    onSuccess: invalidateRealtimeQueries,
  });

  // Sync store
  useEffect(() => {
    if (getDepositsQuery.data?.data) {
      store.setDeposits(getDepositsQuery.data.data);
    }
  }, [getDepositsQuery.data]);

  return {
    getDepositsQuery,
    createDepositMutation,
    updateDepositMutation,
    deleteDepositMutation,
    isLoading: getDepositsQuery.isLoading || createDepositMutation.isPending,
    error: getDepositsQuery.error || createDepositMutation.error,
  };
};
