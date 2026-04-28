import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monthService } from '@/services/monthService';
import { useMessStore } from '@/stores/messStore';
import type { CreateMonthRequest } from '@/types/common';

export const useMonthQuery = () => {
  const queryClient = useQueryClient();
  const { messId, setActiveMonth, setAllMonths } = useMessStore();

  const createMonthMutation = useMutation({
    mutationFn: async (data: CreateMonthRequest) => {
      const response = await monthService.createMonth(data);
      if (!response.data) throw new Error(response.message || 'Failed to create month');
      return response.data;
    },
    onSuccess: (month) => {
      setActiveMonth(month);
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['activeMonth'] });
    },
  });

  const getMonthsQuery = useQuery({
    queryKey: ['months', messId],
    queryFn: async () => {
      if (!messId) return [];
      const response = await monthService.getMonths(messId);
      return response.data || [];
    },
    enabled: !!messId,
    staleTime: 1000 * 60 * 5,
  });

  const getActiveMonthQuery = useQuery({
    queryKey: ['activeMonth'],
    queryFn: async () => {
      if (!messId) return null;
      const response = await monthService.getMonths(messId);
      const months = response.data || [];
      setAllMonths(months);
      const active = months.find((month) => month.status === 'ACTIVE') || null;
      if (active) {
        setActiveMonth(active);
      }
      return active;
    },
    enabled: !!messId,
    staleTime: 1000 * 60 * 5,
  });

  const switchMonthMutation = useMutation({
    mutationFn: async (monthId: string) => {
      const response = await monthService.setActiveMonth(monthId);
      if (!response.data) throw new Error(response.message || 'Failed to activate month');
      return response.data;
    },
    onSuccess: (month) => {
      setActiveMonth(month);
      queryClient.invalidateQueries({ queryKey: ['activeMonth'] });
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['settlement'] });
    },
  });

  const completeMonthMutation = useMutation({
    mutationFn: (monthId: string) => monthService.completeMonth(monthId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['activeMonth'] });
    },
  });

  const deleteMonthMutation = useMutation({
    mutationFn: (monthId: string) => monthService.deleteMonth(monthId),
    onSuccess: () => {
      setActiveMonth(null as any);
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['activeMonth'] });
    },
  });

  return {
    createMonthMutation,
    getActiveMonthQuery,
    getMonthsQuery,
    switchMonthMutation,
    completeMonthMutation,
    deleteMonthMutation,
  };
};
