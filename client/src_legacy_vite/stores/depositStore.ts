import { create } from 'zustand';
import { Deposit } from '../types/common';

/**
 * Deposit Management Store
 * 
 * Manages:
 * - Member deposits/contributions
 * - Deposit history
 * - Total deposits per member
 */

interface DepositStore {
  // State
  deposits: Deposit[];
  totalDeposits: number;
  isLoading: boolean;
  error: string | null;
  depositsByMember: Record<string, Deposit[]>;

  // Actions
  setDeposits: (deposits: Deposit[]) => void;
  addDeposit: (deposit: Deposit) => void;
  updateDeposit: (depositId: string, deposit: Partial<Deposit>) => void;
  deleteDeposit: (depositId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getMemberDeposits: (memberId: string) => Deposit[];
  getMemberTotalDeposit: (memberId: string) => number;
  getTotalDeposits: () => number;
  clear: () => void;
}

export const useDepositStore = create<DepositStore>((set, get) => ({
  // Initial state
  deposits: [],
  totalDeposits: 0,
  isLoading: false,
  error: null,
  depositsByMember: {},

  // Actions
  setDeposits: (deposits) => {
    const depositsByMember: Record<string, Deposit[]> = {};
    const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);

    deposits.forEach((deposit) => {
      if (!depositsByMember[deposit.memberId]) {
        depositsByMember[deposit.memberId] = [];
      }
      depositsByMember[deposit.memberId].push(deposit);
    });

    set({
      deposits,
      depositsByMember,
      totalDeposits,
    });
  },

  addDeposit: (deposit) => {
    set((state) => {
      const newDeposits = [...state.deposits, deposit];
      const depositsByMember = { ...state.depositsByMember };

      if (!depositsByMember[deposit.memberId]) {
        depositsByMember[deposit.memberId] = [];
      }
      depositsByMember[deposit.memberId].push(deposit);

      return {
        deposits: newDeposits,
        depositsByMember,
        totalDeposits: state.totalDeposits + deposit.amount,
      };
    });
  },

  updateDeposit: (depositId, depositUpdate) => {
    set((state) => {
      const oldDeposit = state.deposits.find((d) => d.id === depositId);
      const newDeposits = state.deposits.map((d) =>
        d.id === depositId ? { ...d, ...depositUpdate } : d,
      );

      let totalDeposits = state.totalDeposits;
      if (oldDeposit && depositUpdate.amount) {
        totalDeposits = totalDeposits - oldDeposit.amount + depositUpdate.amount;
      }

      return {
        deposits: newDeposits,
        totalDeposits,
      };
    });
  },

  deleteDeposit: (depositId) => {
    set((state) => {
      const depositToDelete = state.deposits.find((d) => d.id === depositId);
      const newDeposits = state.deposits.filter((d) => d.id !== depositId);

      return {
        deposits: newDeposits,
        totalDeposits: depositToDelete
          ? state.totalDeposits - depositToDelete.amount
          : state.totalDeposits,
      };
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  getMemberDeposits: (memberId) => {
    const state = get();
    return state.depositsByMember[memberId] || [];
  },

  getMemberTotalDeposit: (memberId) => {
    const state = get();
    const memberDeposits = state.depositsByMember[memberId] || [];
    return memberDeposits.reduce((sum, d) => sum + d.amount, 0);
  },

  getTotalDeposits: () => {
    return get().totalDeposits;
  },

  clear: () => {
    set({
      deposits: [],
      totalDeposits: 0,
      depositsByMember: {},
      error: null,
    });
  },
}));
