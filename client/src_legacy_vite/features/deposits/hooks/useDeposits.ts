import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepositsService, type CreateDepositDto } from '../services/depositsService';
import { useMessStore } from '@/stores/messStore';
import { useDepositStore } from '@/stores/depositStore';
import { useUiStore } from '@/stores/uiStore';

/**
 * useDeposits Hook
 * Manages deposit data, fetching, and mutations
 */

export const useDeposits = (messId?: string, monthId?: string, pageSize: number = 20) => {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();
  const activeMess = useMessStore((s) => s.messId);
  const activeMonth = useMessStore((s) => s.activeMonth);
  const { setDeposits } = useDepositStore();

  const currentMessId = messId || activeMess;
  const currentMonthId = monthId || activeMonth?.id;

  // Fetch deposits
  const depositsQuery = useQuery({
    queryKey: ['deposits', currentMessId, currentMonthId],
    queryFn: () =>
      DepositsService.getDeposits(
        currentMessId!,
        currentMonthId!,
        undefined,
        pageSize,
      ),
    enabled: !!currentMessId && !!currentMonthId,
    staleTime: 1000 * 60 * 2,
  });

  // Create deposit mutation
  const createDepositMutation = useMutation({
    mutationFn: (dto: CreateDepositDto) =>
      DepositsService.createDeposit(currentMessId!, currentMonthId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['deposits', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Deposit recorded successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        message: error.response?.data?.error?.message || 'Failed to record deposit',
        type: 'error',
      });
    },
  });

  // Update deposit mutation
  const updateDepositMutation = useMutation({
    mutationFn: ({ depositId, ...data }: { depositId: string; [key: string]: any }) =>
      DepositsService.updateDeposit(depositId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['deposits', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Deposit updated successfully',
        type: 'success',
      });
    },
  });

  // Delete deposit mutation
  const deleteDepositMutation = useMutation({
    mutationFn: (depositId: string) => DepositsService.deleteDeposit(depositId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['deposits', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Deposit deleted successfully',
        type: 'success',
      });
    },
  });

  // Verify deposit mutation
  const verifyDepositMutation = useMutation({
    mutationFn: (depositId: string) => DepositsService.verifyDeposit(depositId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['deposits', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Deposit verified successfully',
        type: 'success',
      });
    },
  });

  // Get deposit summary
  const summaryQuery = useQuery({
    queryKey: ['depositSummary', currentMessId, currentMonthId],
    queryFn: () => DepositsService.getDepositSummary(currentMessId!, currentMonthId!),
    enabled: !!currentMessId && !!currentMonthId,
  });

  return {
    // Query data
    deposits: depositsQuery.data?.data || [],
    isLoadingDeposits: depositsQuery.isLoading,
    isErrorDeposits: depositsQuery.isError,
    depositsError: depositsQuery.error,
    depositsPagination: {
      cursor: depositsQuery.data?.pagination?.cursor || null,
      hasMore: depositsQuery.data?.pagination?.hasMore || false,
      pageSize: depositsQuery.data?.pagination?.pageSize || pageSize,
    },

    // Summary
    depositSummary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,

    // Mutations
    createDeposit: createDepositMutation.mutate,
    isCreatingDeposit: createDepositMutation.isPending,
    updateDeposit: updateDepositMutation.mutate,
    isUpdatingDeposit: updateDepositMutation.isPending,
    deleteDeposit: deleteDepositMutation.mutate,
    isDeletingDeposit: deleteDepositMutation.isPending,
    verifyDeposit: verifyDepositMutation.mutate,
    isVerifyingDeposit: verifyDepositMutation.isPending,

    // Refetch
    refetchDeposits: depositsQuery.refetch,
    refetchSummary: summaryQuery.refetch,
  };
};
