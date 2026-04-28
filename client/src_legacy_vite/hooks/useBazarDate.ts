import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bazarDateService } from '@/services/bazarDateService';

export const useBazarDate = (monthId?: string) => {
  const queryClient = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ['bazar-dates', monthId],
    queryFn: async () => {
      if (!monthId) return [];
      const response = await bazarDateService.getMonthAssignments(monthId);
      return response.data || [];
    },
    enabled: !!monthId,
  });

  const createAssignmentMutation = useMutation({
    mutationFn: bazarDateService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bazar-dates', monthId] });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { date?: string; memberId?: string } }) =>
      bazarDateService.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bazar-dates', monthId] });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: string) => bazarDateService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bazar-dates', monthId] });
    },
  });

  return {
    assignmentsQuery,
    createAssignmentMutation,
    updateAssignmentMutation,
    deleteAssignmentMutation,
  };
};
