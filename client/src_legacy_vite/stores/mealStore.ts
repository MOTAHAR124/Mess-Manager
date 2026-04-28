import { create } from 'zustand';
import { Meal } from '../types/common';

/**
 * Meal Management Store
 * 
 * Manages:
 * - Meals list with pagination
 * - Meal requests
 * - Real-time meal totals per member
 */

interface MealStore {
  // State
  meals: Meal[];
  totalMeals: number;
  currentPage: number;
  pageSize: number;
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  mealsByMember: Record<string, Meal[]>;

  // Actions
  setMeals: (meals: Meal[]) => void;
  addMeal: (meal: Meal) => void;
  updateMeal: (mealId: string, meal: Partial<Meal>) => void;
  deleteMeal: (mealId: string) => void;
  setTotalMeals: (total: number) => void;
  setPageInfo: (currentPage: number, pageSize: number, cursor: string | null, hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getMemberMeals: (memberId: string) => Meal[];
  calculateMemberTotalMeals: (memberId: string) => number;
  clear: () => void;
}

export const useMealStore = create<MealStore>((set, get) => ({
  // Initial state
  meals: [],
  totalMeals: 0,
  currentPage: 1,
  pageSize: 20,
  cursor: null,
  hasMore: false,
  isLoading: false,
  error: null,
  mealsByMember: {},

  // Actions
  setMeals: (meals) => {
    const mealsByMember: Record<string, Meal[]> = {};
    meals.forEach((meal) => {
      if (!mealsByMember[meal.memberId]) {
        mealsByMember[meal.memberId] = [];
      }
      mealsByMember[meal.memberId].push(meal);
    });
    set({ meals, mealsByMember });
  },

  addMeal: (meal) => {
    set((state) => {
      const newMeals = [...state.meals, meal];
      const mealsByMember = { ...state.mealsByMember };
      if (!mealsByMember[meal.memberId]) {
        mealsByMember[meal.memberId] = [];
      }
      mealsByMember[meal.memberId].push(meal);
      return { meals: newMeals, mealsByMember };
    });
  },

  updateMeal: (mealId, mealUpdate) => {
    set((state) => {
      const newMeals = state.meals.map((m) =>
        m.id === mealId ? { ...m, ...mealUpdate } : m,
      );
      const mealsByMember = { ...state.mealsByMember };
      const oldMeal = state.meals.find((m) => m.id === mealId);
      if (oldMeal && mealsByMember[oldMeal.memberId]) {
        mealsByMember[oldMeal.memberId] = mealsByMember[oldMeal.memberId].map(
          (m) => (m.id === mealId ? { ...m, ...mealUpdate } : m),
        );
      }
      return { meals: newMeals, mealsByMember };
    });
  },

  deleteMeal: (mealId) => {
    set((state) => {
      const mealToDelete = state.meals.find((m) => m.id === mealId);
      const newMeals = state.meals.filter((m) => m.id !== mealId);
      const mealsByMember = { ...state.mealsByMember };
      if (mealToDelete && mealsByMember[mealToDelete.memberId]) {
        mealsByMember[mealToDelete.memberId] = mealsByMember[
          mealToDelete.memberId
        ].filter((m) => m.id !== mealId);
      }
      return { meals: newMeals, mealsByMember };
    });
  },

  setTotalMeals: (total) => {
    set({ totalMeals: total });
  },

  setPageInfo: (currentPage, pageSize, cursor, hasMore) => {
    set({ currentPage, pageSize, cursor, hasMore });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  getMemberMeals: (memberId) => {
    const state = get();
    return state.mealsByMember[memberId] || [];
  },

  calculateMemberTotalMeals: (memberId) => {
    const state = get();
    const memberMeals = state.mealsByMember[memberId] || [];
    return memberMeals.reduce((sum, meal) => sum + (meal.breakfast + meal.lunch + meal.dinner), 0);
  },

  clear: () => {
    set({
      meals: [],
      totalMeals: 0,
      currentPage: 1,
      cursor: null,
      hasMore: false,
      mealsByMember: {},
      error: null,
    });
  },
}));
