import { create } from 'zustand';
import { Cost, CostType } from '../types/common';

/**
 * Cost Management Store
 * 
 * Manages:
 * - Individual costs (member-specific)
 * - Shared costs (split among members)
 * - Cost distribution
 */

interface CostStore {
  // State
  costs: Cost[];
  totalIndividualCost: number;
  totalSharedCost: number;
  isLoading: boolean;
  error: string | null;
  costsByMember: Record<string, Cost[]>;
  costsByType: {
    individual: Cost[];
    shared: Cost[];
  };

  // Actions
  setCosts: (costs: Cost[]) => void;
  addCost: (cost: Cost) => void;
  updateCost: (costId: string, cost: Partial<Cost>) => void;
  deleteCost: (costId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getMemberCosts: (memberId: string) => Cost[];
  calculateTotalCosts: () => { individual: number; shared: number };
  clear: () => void;
}

export const useCostStore = create<CostStore>((set, get) => ({
  // Initial state
  costs: [],
  totalIndividualCost: 0,
  totalSharedCost: 0,
  isLoading: false,
  error: null,
  costsByMember: {},
  costsByType: {
    individual: [],
    shared: [],
  },

  // Actions
  setCosts: (costs) => {
    const costsByMember: Record<string, Cost[]> = {};
    const costsByType = {
      individual: costs.filter((c) => c.type === CostType.INDIVIDUAL),
      shared: costs.filter((c) => c.type === CostType.SHARED),
    };

    costs.forEach((cost) => {
      if (cost.memberId) {
        if (!costsByMember[cost.memberId]) {
          costsByMember[cost.memberId] = [];
        }
        costsByMember[cost.memberId].push(cost);
      }
    });

    const totalIndividual = costsByType.individual.reduce((sum, c) => sum + c.amount, 0);
    const totalShared = costsByType.shared.reduce((sum, c) => sum + c.amount, 0);

    set({
      costs,
      costsByMember,
      costsByType,
      totalIndividualCost: totalIndividual,
      totalSharedCost: totalShared,
    });
  },

  addCost: (cost) => {
    set((state) => {
      const newCosts = [...state.costs, cost];
      const costsByMember = { ...state.costsByMember };

      if (cost.memberId) {
        if (!costsByMember[cost.memberId]) {
          costsByMember[cost.memberId] = [];
        }
        costsByMember[cost.memberId].push(cost);
      }

      const total = state.totalIndividualCost + (cost.type === CostType.INDIVIDUAL ? cost.amount : 0);
      const sharedTotal = state.totalSharedCost + (cost.type === CostType.SHARED ? cost.amount : 0);

      return {
        costs: newCosts,
        costsByMember,
        totalIndividualCost: total,
        totalSharedCost: sharedTotal,
      };
    });
  },

  updateCost: (costId, costUpdate) => {
    set((state) => {
      const newCosts = state.costs.map((c) =>
        c.id === costId ? { ...c, ...costUpdate } : c,
      );
      return { costs: newCosts };
    });
  },

  deleteCost: (costId) => {
    set((state) => {
      const costToDelete = state.costs.find((c) => c.id === costId);
      const newCosts = state.costs.filter((c) => c.id !== costId);

      let totalIndividual = state.totalIndividualCost;
      let totalShared = state.totalSharedCost;

      if (costToDelete) {
        if (costToDelete.type === CostType.INDIVIDUAL) {
          totalIndividual -= costToDelete.amount;
        } else {
          totalShared -= costToDelete.amount;
        }
      }

      return {
        costs: newCosts,
        totalIndividualCost: totalIndividual,
        totalSharedCost: totalShared,
      };
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  getMemberCosts: (memberId) => {
    const state = get();
    return state.costsByMember[memberId] || [];
  },

  calculateTotalCosts: () => {
    const state = get();
    return {
      individual: state.totalIndividualCost,
      shared: state.totalSharedCost,
    };
  },

  clear: () => {
    set({
      costs: [],
      totalIndividualCost: 0,
      totalSharedCost: 0,
      costsByMember: {},
      costsByType: { individual: [], shared: [] },
      error: null,
    });
  },
}));
