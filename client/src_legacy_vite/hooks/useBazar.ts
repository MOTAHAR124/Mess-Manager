import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bazarService } from '@/services/bazarService';
import { useMessStore } from '@/stores/messStore';

export const useBazar = () => {
  const queryClient = useQueryClient();
  const { activeMonth } = useMessStore();

  const upcomingDatesQuery = useQuery({
    queryKey: ['bazar', 'upcoming', activeMonth?.id],
    queryFn: async () => {
      if (!activeMonth?.id) return [];
      const response = await bazarService.getUpcomingDates(activeMonth.id);
      return response.data || [];
    },
    enabled: !!activeMonth?.id,
  });

  const myDatesQuery = useQuery({
    queryKey: ['bazar', 'mine', activeMonth?.id],
    queryFn: async () => {
      if (!activeMonth?.id) return [];
      const response = await bazarService.getPersonalDates(activeMonth.id);
      return response.data || [];
    },
    enabled: !!activeMonth?.id,
  });

  const assignMemberMutation = useMutation({
    mutationFn: bazarService.assignMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bazar'] });
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: bazarService.removeAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bazar'] });
    },
  });

  return {
    upcomingDatesQuery,
    myDatesQuery,
    assignMemberMutation,
    removeAssignmentMutation,
  };
};
