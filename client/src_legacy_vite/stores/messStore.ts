import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MessMember, Month, Role } from '../types/common';

/**
 * Mess Management Store
 * 
 * Manages:
 * - Current mess (group) context
 * - Active month
 * - Members list
 * - Mess settings
 */

interface MessStore {
  // State
  messId: string | null;
  messName: string | null;
  members: MessMember[];
  activeMonth: Month | null;
  allMonths: Month[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setMess: (messId: string, messName: string) => void;
  setMembers: (members: MessMember[]) => void;
  addMember: (member: MessMember) => void;
  removeMember: (memberId: string) => void;
  updateMember: (memberId: string, member: Partial<MessMember>) => void;
  setActiveMonth: (month: Month) => void;
  setAllMonths: (months: Month[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMess: () => void;
  isMemberManager: (userId: string) => boolean;
  getMemberById: (memberId: string) => MessMember | undefined;
}

export const useMessStore = create<MessStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messId: null,
      messName: null,
      members: [],
      activeMonth: null,
      allMonths: [],
      isLoading: false,
      error: null,

      // Actions
      setMess: (messId, messName) => {
        set({ messId, messName });
      },

      setMembers: (members) => {
        set({ members });
      },

      addMember: (member) => {
        set((state) => ({
          members: [...state.members, member],
        }));
      },

      removeMember: (memberId) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== memberId),
        }));
      },

      updateMember: (memberId, memberUpdate) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, ...memberUpdate } : m,
          ),
        }));
      },

      setActiveMonth: (month) => {
        set({ activeMonth: month });
      },

      setAllMonths: (months) => {
        set({ allMonths: months });
      },

      setLoading: (isLoading) => {
        set({ isLoading: isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearMess: () => {
        set({
          messId: null,
          messName: null,
          members: [],
          activeMonth: null,
          allMonths: [],
          error: null,
        });
      },

      isMemberManager: (userId) => {
        const state = get();
        return state.members.some((m) => m.userId === userId && m.role === Role.MANAGER);
      },

      getMemberById: (memberId) => {
        const state = get();
        return state.members.find((m) => m.id === memberId);
      },
    }),
    {
      name: 'meso-mess-store',
      partialize: (state) => ({
        messId: state.messId,
        messName: state.messName,
        activeMonth: state.activeMonth,
      }),
    },
  ),
);
