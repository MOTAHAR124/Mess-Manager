import { create } from 'zustand';
import { 
  ManagerDashboardSummary, 
  MemberSummary, 
  RecentActivity, 
  QuickStats 
} from '@/services/dashboardService';

/**
 * Dashboard Store
 * 
 * Manages the state for the manager and admin dashboards.
 * Centralizes fetched data and activity feeds.
 */

interface DashboardStore {
  // State
  overview: ManagerDashboardSummary | null;
  membersSummary: MemberSummary[];
  recentActivities: RecentActivity[];
  quickStats: QuickStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setOverview: (data: ManagerDashboardSummary) => void;
  setMembersSummary: (data: MemberSummary[]) => void;
  setRecentActivities: (data: RecentActivity[]) => void;
  setQuickStats: (data: QuickStats) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  // Initial state
  overview: null,
  membersSummary: [],
  recentActivities: [],
  quickStats: null,
  isLoading: false,
  error: null,

  // Actions
  setOverview: (overview) => set({ overview }),
  setMembersSummary: (membersSummary) => set({ membersSummary }),
  setRecentActivities: (recentActivities) => set({ recentActivities }),
  setQuickStats: (quickStats) => set({ quickStats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clear: () => set({ 
    overview: null, 
    membersSummary: [], 
    recentActivities: [], 
    quickStats: null, 
    error: null 
  }),
}));
