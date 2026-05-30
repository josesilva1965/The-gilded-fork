import { UserRole } from '@/stores/auth-store';
import { AppView } from '@/stores/app-store';

export interface NavItem {
  view: AppView;
  label: string;
  icon: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['ADMIN', 'MANAGER'] },
  { view: 'floor-plan', label: 'Floor Plan', icon: 'Map', roles: ['ADMIN', 'MANAGER', 'FOH'] },
  { view: 'pos', label: 'POS / Orders', icon: 'ShoppingCart', roles: ['ADMIN', 'MANAGER', 'FOH'] },
  { view: 'kds', label: 'Kitchen / Bar', icon: 'ChefHat', roles: ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR'] },
  { view: 'reservations', label: 'Reservations', icon: 'CalendarDays', roles: ['ADMIN', 'MANAGER', 'FOH'] },
  { view: 'inventory', label: 'Inventory', icon: 'Package', roles: ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR'] },
  { view: 'staff', label: 'Staff / Rota', icon: 'Users', roles: ['ADMIN', 'MANAGER'] },
  { view: 'crm', label: 'CRM / Guests', icon: 'Heart', roles: ['ADMIN', 'MANAGER'] },
];

export const TABLE_STATUS_COLORS: Record<string, string> = {
  FREE: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
  RESERVED: 'bg-sky-500/20 border-sky-500 text-sky-400',
  SEATED: 'bg-amber-500/20 border-amber-500 text-amber-400',
  ORDER_PLACED: 'bg-orange-500/20 border-orange-500 text-orange-400',
  APPETIZER: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  MAIN: 'bg-red-500/20 border-red-500 text-red-400',
  DESSERT: 'bg-pink-500/20 border-pink-500 text-pink-400',
  BILL_REQUESTED: 'bg-violet-500/20 border-violet-500 text-violet-400',
  DIRTY: 'bg-zinc-500/20 border-zinc-500 text-zinc-400',
};

export const TABLE_STATUS_LABELS: Record<string, string> = {
  FREE: 'Free',
  RESERVED: 'Reserved',
  SEATED: 'Seated',
  ORDER_PLACED: 'Order Placed',
  APPETIZER: 'Appetizer',
  MAIN: 'Main Course',
  DESSERT: 'Dessert',
  BILL_REQUESTED: 'Bill Requested',
  DIRTY: 'Needs Cleaning',
};

export const URGENCY_COLORS: Record<string, string> = {
  green: 'border-l-4 border-l-emerald-500 bg-emerald-950/30',
  amber: 'border-l-4 border-l-amber-500 bg-amber-950/30',
  red: 'border-l-4 border-l-red-500 bg-red-950/30 animate-pulse',
};

export function getUrgencyLevel(createdAt: string | Date): 'green' | 'amber' | 'red' {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const minutes = (now - created) / 60000;
  if (minutes < 10) return 'green';
  if (minutes < 20) return 'amber';
  return 'red';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}
