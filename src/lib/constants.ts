import { UserRole } from '@/stores/auth-store';
import { AppView } from '@/stores/app-store';
import { type Locale, type LocaleConfig, LOCALE_CONFIGS, formatCurrencyByLocale, formatDateByLocale, formatTimeByLocale, getTaxRate, getTaxPercent } from '@/lib/i18n/locales';

export interface NavItem {
  view: AppView;
  labelKey: string; // translation key like 'nav.dashboard'
  icon: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', labelKey: 'nav.dashboard', icon: 'LayoutDashboard', roles: ['ADMIN', 'MANAGER'] },
  { view: 'floor-plan', labelKey: 'nav.floorPlan', icon: 'Map', roles: ['ADMIN', 'MANAGER', 'FOH'] },
  { view: 'pos', labelKey: 'nav.pos', icon: 'ShoppingCart', roles: ['ADMIN', 'MANAGER', 'FOH', 'BAR'] },
  { view: 'kds', labelKey: 'nav.kds', icon: 'ChefHat', roles: ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR'] },
  { view: 'reservations', labelKey: 'nav.reservations', icon: 'CalendarDays', roles: ['ADMIN', 'MANAGER', 'FOH'] },
  { view: 'inventory', labelKey: 'nav.inventory', icon: 'Package', roles: ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR'] },
  { view: 'staff', labelKey: 'nav.staff', icon: 'Users', roles: ['ADMIN', 'MANAGER'] },
  { view: 'crm', labelKey: 'nav.crm', icon: 'Heart', roles: ['ADMIN', 'MANAGER'] },
  { view: 'transactions', labelKey: 'nav.transactions', icon: 'ArrowLeftRight', roles: ['ADMIN', 'MANAGER'] },
  { view: 'menu', labelKey: 'nav.menu', icon: 'ChefHat', roles: ['ADMIN', 'MANAGER'] },
  { view: 'settings', labelKey: 'settings.title', icon: 'Settings', roles: ['ADMIN', 'MANAGER'] },
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

/* ─── Table Status Labels are now locale-dependent ─── */
/* Use getTableStatusLabel(locale, status) instead */

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

const TABLE_STATUS_KEYS: Record<string, string> = {
  FREE: 'statusFree',
  RESERVED: 'statusReserved',
  SEATED: 'statusSeated',
  ORDER_PLACED: 'statusOrderPlaced',
  APPETIZER: 'statusAppetizer',
  MAIN: 'statusMain',
  DESSERT: 'statusDessert',
  BILL_REQUESTED: 'statusBillRequested',
  DIRTY: 'statusDirty',
};

import { TRANSLATIONS } from '@/lib/i18n/translations';

export function getTableStatusLabel(locale: Locale, status: string): string {
  const key = TABLE_STATUS_KEYS[status];
  if (!key) return status;
  const t = TRANSLATIONS[locale];
  if (!t) return status;
  return (t.floorPlan as any)[key] || status;
}

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

/* ─── Currency / Date / Time formatting now uses locale ─── */

export function formatCurrency(amount: number, locale?: Locale): string {
  return formatCurrencyByLocale(amount, locale || 'en-GB');
}

export function formatTime(date: string | Date, locale?: Locale): string {
  return formatTimeByLocale(date, locale || 'en-GB');
}

export function formatDate(date: string | Date, locale?: Locale): string {
  return formatDateByLocale(date, locale || 'en-GB');
}

export { getTaxRate, getTaxPercent, formatCurrencyByLocale, formatDateByLocale, formatTimeByLocale };
