import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealService } from '@/services/mealService';
import type { CreateMealRequest } from '@/types/common';
import { useMealStore } from '@/stores/mealStore';
import { useEffect } from 'react';

/**
 * useMeal hook
 * 
 * Manages meal attendance logging and stateful synchronization.
 * Supports bulk operations for daily attendance grids.
 */

export const useMeal = (monthId: string) => {
  const queryClient = useQueryClient();
  const store = useMealStore();

  const getMealsQuery = useQuery({
    queryKey: ['meals', monthId],
    queryFn: () => mealService.getMeals(monthId),
    enabled: !!monthId,
    refetchInterval: monthId ? 10000 : false,
    refetchIntervalInBackground: true,
  });

  const invalidateRealtimeQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['meals', monthId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-members'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-quick-stats'] });
    queryClient.invalidateQueries({ queryKey: ['settlement', monthId] });
    queryClient.invalidateQueries({ queryKey: ['costs', monthId] });
    queryClient.invalidateQueries({ queryKey: ['deposits', monthId] });
    queryClient.invalidateQueries({ queryKey: ['bazar'] });
  };

  const bulkUpsertMutation = useMutation({
    mutationFn: (meals: CreateMealRequest[]) => mealService.bulkUpsert(meals),
    onSuccess: invalidateRealtimeQueries,
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ mealId, data }: { mealId: string; data: Partial<CreateMealRequest> }) =>
      mealService.updateMeal(mealId, data),
    onSuccess: invalidateRealtimeQueries,
  });

  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) => mealService.deleteMeal(mealId),
    onSuccess: invalidateRealtimeQueries,
  });

  // Synchronize store
  useEffect(() => {
    if (getMealsQuery.data?.data) {
      store.setMeals(getMealsQuery.data.data);
    }
  }, [getMealsQuery.data]);

  return {
    getMealsQuery,
    bulkUpsertMutation,
    updateMealMutation,
    deleteMealMutation,
    isLoading:
      !!monthId &&
      (getMealsQuery.isLoading ||
        bulkUpsertMutation.isPending ||
        updateMealMutation.isPending ||
        deleteMealMutation.isPending),
    error:
      getMealsQuery.error ||
      bulkUpsertMutation.error ||
      updateMealMutation.error ||
      deleteMealMutation.error,
  };
};
