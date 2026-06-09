import { create } from 'zustand';
import { generateId } from '@/lib/generate-id';

export type AppView = 
  | 'dashboard'
  | 'floor-plan'
  | 'pos'
  | 'kds'
  | 'inventory'
  | 'staff'
  | 'crm'
  | 'transactions'
  | 'reservations'
  | 'menu'
  | 'settings';

interface AppState {
  currentView: AppView;
  sidebarOpen: boolean;
  selectedTableId: string | null;
  selectedOrderId: string | null;
  notifications: Array<{ id: string; message: string; type: string; timestamp: number }>;
  setView: (view: AppView) => void;
  toggleSidebar: () => void;
  selectTable: (tableId: string | null) => void;
  selectOrder: (orderId: string | null) => void;
  addNotification: (message: string, type: string) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'floor-plan',
  sidebarOpen: true,
  selectedTableId: null,
  selectedOrderId: null,
  notifications: [],
  setView: (view) => set((s) => ({
    currentView: view,
    ...(view !== 'pos' && { selectedTableId: null, selectedOrderId: null }),
  })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectTable: (tableId) => set({ selectedTableId: tableId }),
  selectOrder: (orderId) => set({ selectedOrderId: orderId }),
  addNotification: (message, type) => set((s) => ({
    notifications: [...s.notifications, { id: generateId(), message, type, timestamp: Date.now() }]
  })),
  removeNotification: (id) => set((s) => ({
    notifications: s.notifications.filter((n) => n.id !== id)
  })),
}));
