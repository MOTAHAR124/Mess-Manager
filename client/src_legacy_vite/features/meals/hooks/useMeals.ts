import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MealsService, type CreateMealDto } from '../services/mealsService';
import { useMessStore } from '@/stores/messStore';
import { useMealStore } from '@/stores/mealStore';
import { useUiStore } from '@/stores/uiStore';

/**
 * useMeals Hook
 * Manages meal data, fetching, and mutations
 */

export const useMeals = (messId?: string, monthId?: string, pageSize: number = 20) => {
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();
  const activeMess = useMessStore((s) => s.messId);
  const activeMonth = useMessStore((s) => s.activeMonth);
  const { setMeals, addMeal } = useMealStore();

  const currentMessId = messId || activeMess;
  const currentMonthId = monthId || activeMonth?.id;

  // Fetch meals
  const mealsQuery = useQuery({
    queryKey: ['meals', currentMessId, currentMonthId],
    queryFn: () =>
      MealsService.getMeals(
        currentMessId!,
        currentMonthId!,
        undefined,
        pageSize,
      ),
    enabled: !!currentMessId && !!currentMonthId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: (dto: CreateMealDto) =>
      MealsService.createMeal(currentMessId!, currentMonthId!, dto),
    onSuccess: (newMeal) => {
      queryClient.invalidateQueries({
        queryKey: ['meals', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Meal added successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        message: error.response?.data?.error?.message || 'Failed to add meal',
        type: 'error',
      });
    },
  });

  // Update meal mutation
  const updateMealMutation = useMutation({
    mutationFn: ({ mealId, ...data }: { mealId: string; [key: string]: any }) =>
      MealsService.updateMeal(mealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['meals', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Meal updated successfully',
        type: 'success',
      });
    },
  });

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) => MealsService.deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['meals', currentMessId, currentMonthId],
      });
      addToast({
        message: 'Meal deleted successfully',
        type: 'success',
      });
    },
  });

  // Get meal summary
  const summaryQuery = useQuery({
    queryKey: ['mealSummary', currentMessId, currentMonthId],
    queryFn: () => MealsService.getMealSummary(currentMessId!, currentMonthId!),
    enabled: !!currentMessId && !!currentMonthId,
  });

  return {
    // Query data
    meals: mealsQuery.data?.data || [],
    isLoadingMeals: mealsQuery.isLoading,
    isErrorMeals: mealsQuery.isError,
    mealsError: mealsQuery.error,
    mealsPagination: {
      cursor: mealsQuery.data?.pagination?.cursor || null,
      hasMore: mealsQuery.data?.pagination?.hasMore || false,
      pageSize: mealsQuery.data?.pagination?.pageSize || pageSize,
    },

    // Summary
    mealSummary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,

    // Mutations
    createMeal: createMealMutation.mutate,
    isCreatingMeal: createMealMutation.isPending,
    updateMeal: updateMealMutation.mutate,
    isUpdatingMeal: updateMealMutation.isPending,
    deleteMeal: deleteMealMutation.mutate,
    isDeletingMeal: deleteMealMutation.isPending,

    // Refetch
    refetchMeals: mealsQuery.refetch,
    refetchSummary: summaryQuery.refetch,
  };
};
