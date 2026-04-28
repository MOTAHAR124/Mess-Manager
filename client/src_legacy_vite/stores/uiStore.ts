import { create } from 'zustand';

/**
 * UI Store
 * 
 * Manages:
 * - Modal/dialog states
 * - Loading states
 * - Notifications/toasts
 * - Sidebar state
 * - Theme preferences
 */

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIStore {
  // Modal states
  isAuthModalOpen: boolean;
  isAddMemberModalOpen: boolean;
  isAddMealModalOpen: boolean;
  isAddCostModalOpen: boolean;
  isAddDepositModalOpen: boolean;
  isConfirmDialogOpen: boolean;

  // Loading states
  isPageLoading: boolean;
  isSidebarOpen: boolean;

  // Notifications
  toasts: Toast[];

  // Confirmmodal data
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  };

  // Actions
  openAuthModal: () => void;
  closeAuthModal: () => void;
  toggleAuthModal: () => void;

  openAddMemberModal: () => void;
  closeAddMemberModal: () => void;

  openAddMealModal: () => void;
  closeAddMealModal: () => void;

  openAddCostModal: () => void;
  closeAddCostModal: () => void;

  openAddDepositModal: () => void;
  closeAddDepositModal: () => void;

  setPageLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  openConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmDialog: () => void;

  reset: () => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  isAuthModalOpen: false,
  isAddMemberModalOpen: false,
  isAddMealModalOpen: false,
  isAddCostModalOpen: false,
  isAddDepositModalOpen: false,
  isConfirmDialogOpen: false,
  isPageLoading: false,
  isSidebarOpen: true,
  toasts: [],
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  },

  // Auth Modal
  openAuthModal: () => {
    set({ isAuthModalOpen: true });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  },

  toggleAuthModal: () => {
    set((state) => ({ isAuthModalOpen: !state.isAuthModalOpen }));
  },

  // Add Member Modal
  openAddMemberModal: () => {
    set({ isAddMemberModalOpen: true });
  },

  closeAddMemberModal: () => {
    set({ isAddMemberModalOpen: false });
  },

  // Add Meal Modal
  openAddMealModal: () => {
    set({ isAddMealModalOpen: true });
  },

  closeAddMealModal: () => {
    set({ isAddMealModalOpen: false });
  },

  // Add Cost Modal
  openAddCostModal: () => {
    set({ isAddCostModalOpen: true });
  },

  closeAddCostModal: () => {
    set({ isAddCostModalOpen: false });
  },

  // Add Deposit Modal
  openAddDepositModal: () => {
    set({ isAddDepositModalOpen: true });
  },

  closeAddDepositModal: () => {
    set({ isAddDepositModalOpen: false });
  },

  // Page Loading
  setPageLoading: (loading) => {
    set({ isPageLoading: loading });
  },

  // Sidebar
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open });
  },

  // Toasts
  addToast: (toast) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (toast.duration) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Confirm Dialog
  openConfirmDialog: (title, message, onConfirm) => {
    set({
      confirmDialog: {
        isOpen: true,
        title,
        message,
        onConfirm,
      },
    });
  },

  closeConfirmDialog: () => {
    set({
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
      },
    });
  },

  // Reset
  reset: () => {
    set({
      isAuthModalOpen: false,
      isAddMemberModalOpen: false,
      isAddMealModalOpen: false,
      isAddCostModalOpen: false,
      isAddDepositModalOpen: false,
      isConfirmDialogOpen: false,
      isPageLoading: false,
      isSidebarOpen: true,
      toasts: [],
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
      },
    });
  },
}));
