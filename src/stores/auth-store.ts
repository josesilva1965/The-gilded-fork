import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'MANAGER' | 'KITCHEN' | 'BAR' | 'FOH';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pin: string;
  avatarUrl?: string;
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  switchRole: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  switchRole: (user) => set({ user, isAuthenticated: true }),
}));

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin / Owner',
  MANAGER: 'Manager',
  KITCHEN: 'Kitchen Staff',
  BAR: 'Bar Staff',
  FOH: 'Front of House',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-amber-600',
  MANAGER: 'bg-emerald-600',
  KITCHEN: 'bg-orange-600',
  BAR: 'bg-purple-600',
  FOH: 'bg-sky-600',
};

export const ROLE_ICONS: Record<UserRole, string> = {
  ADMIN: 'Shield',
  MANAGER: 'ClipboardList',
  KITCHEN: 'ChefHat',
  BAR: 'Wine',
  FOH: 'UtensilsCrossed',
};
