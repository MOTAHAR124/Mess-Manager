import { create } from 'zustand';
import { Settlement, SettlementMemberBalance } from '../types/common';

/**
 * Settlement Store
 * 
 * Manages:
 * - Month settlements
 * - Balance calculations
 * - Final settlement details
 */

interface SettlementStore {
  // State
  currentSettlement: Settlement | null;
  settlements: Settlement[];
  memberBalances: Record<string, SettlementMemberBalance>;
  totalMealCost: number;
  totalDeposit: number;
  totalCost: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentSettlement: (settlement: Settlement) => void;
  setSettlements: (settlements: Settlement[]) => void;
  setMemberBalances: (balances: Record<string, SettlementMemberBalance>) => void;
  setTotalMealCost: (cost: number) => void;
  setTotalDeposit: (deposit: number) => void;
  setTotalCost: (cost: number) => void;
  getMemberBalance: (memberId: string) => number;
  updateBalance: (memberId: string, amount: number) => void;
  getDebts: () => Array<{ from: string; to: string; amount: number }>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useSettlementStore = create<SettlementStore>((set, get) => ({
  // Initial state
  currentSettlement: null,
  settlements: [],
  memberBalances: {},
  totalMealCost: 0,
  totalDeposit: 0,
  totalCost: 0,
  isLoading: false,
  error: null,

  // Actions
  setCurrentSettlement: (settlement) => {
    set({ 
      currentSettlement: settlement, 
      memberBalances: settlement.memberBalances,
      totalMealCost: settlement.totalMealCost,
      totalDeposit: settlement.totalDeposit,
      totalCost: settlement.totalCost
    });
  },

  setSettlements: (settlements) => {
    set({ settlements });
  },

  setMemberBalances: (balances) => {
    set({ memberBalances: balances });
  },

  setTotalMealCost: (cost) => {
    set({ totalMealCost: cost });
  },

  setTotalDeposit: (deposit) => {
    set({ totalDeposit: deposit });
  },

  setTotalCost: (cost) => {
    set({ totalCost: cost });
  },

  getMemberBalance: (memberId) => {
    const state = get();
    return state.memberBalances[memberId]?.balance || 0;
  },

  updateBalance: (memberId, amount) => {
    set((state) => ({
      memberBalances: {
        ...state.memberBalances,
        [memberId]: {
          ...(state.memberBalances[memberId] || {
            meals: 0,
            cost: 0,
            deposit: 0,
            balance: 0,
          }),
          balance: (state.memberBalances[memberId]?.balance || 0) + amount,
        },
      },
    }));
  },

  getDebts: () => {
    const state = get();
    const debts: Array<{ from: string; to: string; amount: number }> = [];
    const balances = state.memberBalances;

    const memberIds = Object.keys(balances);
    const creditors = memberIds.filter((id) => balances[id].balance > 0);
    const debtors = memberIds.filter((id) => balances[id].balance < 0);

    // Simple debt settlement algorithm
    debtors.forEach((debtorId) => {
      let debtAmount = Math.abs(balances[debtorId].balance);

      creditors.forEach((creditorId) => {
        if (debtAmount <= 0 || balances[creditorId].balance <= 0) return;

        const settlementAmount = Math.min(debtAmount, balances[creditorId].balance);
        debts.push({
          from: debtorId,
          to: creditorId,
          amount: settlementAmount,
        });

        debtAmount -= settlementAmount;
      });
    });

    return debts;
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clear: () => {
    set({
      currentSettlement: null,
      settlements: [],
      memberBalances: {},
      totalMealCost: 0,
      totalDeposit: 0,
      totalCost: 0,
      error: null,
    });
  },
}));
