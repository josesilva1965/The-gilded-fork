'use client';

import { useMemo } from 'react';
import {
  LayoutDashboard,
  Map,
  ShoppingCart,
  ChefHat,
  CalendarDays,
  Package,
  Users,
  Heart,
  ArrowLeftRight,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore, ROLE_COLORS } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale } from '@/stores/locale-store';
import { type Translations } from '@/lib/i18n/translations';
import { useQuery } from '@tanstack/react-query';
import { useBranding } from '@/stores/branding-store';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { LocalExitButton } from '@/components/local-exit-button';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Map,
  ShoppingCart,
  ChefHat,
  CalendarDays,
  Package,
  Users,
  Heart,
  ArrowLeftRight,
  Settings,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? LayoutDashboard;
}

function getTranslatedRoleLabel(role: string, t: Translations): string {
  const roleMap: Record<string, string> = {
    ADMIN: t.roles.admin,
    MANAGER: t.roles.manager,
    KITCHEN: t.roles.kitchen,
    BAR: t.roles.bar,
    FOH: t.roles.foh,
  };
  return roleMap[role] || role;
}

function getNavLabel(view: string, t: Translations): string {
  const labelMap: Record<string, string> = {
    'dashboard': t.nav.dashboard,
    'floor-plan': t.nav.floorPlan,
    'pos': t.nav.pos,
    'kds': t.nav.kds,
    'reservations': t.nav.reservations,
    'inventory': t.nav.inventory,
    'staff': t.nav.staff,
    'crm': t.nav.crm,
    'settings': t.settings?.title,
  };
  return labelMap[view] || view;
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentView = useAppStore((s) => s.currentView);
  const setView = useAppStore((s) => s.setView);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const t = useT();
  const { logoText, logoIconType, logoEmoji, logoUrl, restaurantName } = useBranding();

  const { data: activeOrders = [] } = useQuery<any[]>({
    queryKey: ['active-orders'],
    queryFn: () => fetch('/api/orders').then((r) => {
      if (!r.ok) throw new Error('Unauthorized or failed to fetch orders');
      return r.json();
    }),
    enabled: sidebarOpen,
    staleTime: 10000,
  });

  const { data: inventoryData } = useQuery<{ lowStock: any[] }>({
    queryKey: ['inventory'],
    queryFn: () => fetch('/api/inventory').then((r) => {
      if (!r.ok) throw new Error('Unauthorized or failed to fetch inventory');
      return r.json();
    }),
    enabled: sidebarOpen,
    staleTime: 30000,
  });

  const activeOrdersCount = activeOrders.length;
  const lowStockCount = inventoryData?.lowStock?.length || 0;

  const filteredItems = useMemo(() => {
    if (!user) return [];
    return NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  }, [user]);

  if (!user) return null;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full bg-zinc-900 border-r border-zinc-800 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo / Restaurant Name */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-zinc-800 shrink-0">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm shrink-0 overflow-hidden",
          logoIconType === 'url' && logoUrl ? "" : "bg-emerald-600"
        )}>
          {logoIconType === 'emoji' ? (
            <span className="text-xl">{logoEmoji}</span>
          ) : logoIconType === 'url' && logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold tracking-wider">{logoText || 'GF'}</span>
          )}
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-zinc-100 truncate">
              {restaurantName || t.auth.restaurantName}
            </h1>
            <p className="text-[10px] text-zinc-500 truncate">{t.auth.managementSystem}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {filteredItems.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = currentView === item.view;
            const buttonEl = (
              <Button
                key={item.view}
                variant="ghost"
                onClick={() => setView(item.view)}
                className={cn(
                  'justify-start gap-3 h-10 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors w-full',
                  isActive &&
                    'bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-400',
                  !sidebarOpen && 'justify-center px-0'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {sidebarOpen && (
                  <span className="truncate text-sm">{getNavLabel(item.view, t)}</span>
                )}
                {sidebarOpen && item.view === 'pos' && activeOrdersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-emerald-600/20 text-emerald-400 text-[10px] px-1.5 py-0 h-5"
                  >
                    {activeOrdersCount}
                  </Badge>
                )}
                {sidebarOpen && item.view === 'inventory' && lowStockCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-amber-600/20 text-amber-400 text-[10px] px-1.5 py-0 h-5"
                  >
                    {lowStockCount}
                  </Badge>
                )}
              </Button>
            );

            return sidebarOpen ? (
              buttonEl
            ) : (
              <Tooltip key={item.view} delayDuration={0}>
                <TooltipTrigger asChild>
                  {buttonEl}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-950 border border-zinc-800 text-zinc-200">
                  {getNavLabel(item.view, t)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </ScrollArea>



      {/* User Info & Switch Role */}
      <div className="p-3 space-y-2 shrink-0">
        {sidebarOpen && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                ROLE_COLORS[user.role]
              )}
            />
            <div className="overflow-hidden">
              <p className="text-xs text-zinc-300 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">
                {getTranslatedRoleLabel(user.role, t)}
              </p>
            </div>
          </div>
        )}
        {sidebarOpen ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 gap-2"
          >
            <ArrowLeftRight className="size-3.5" />
            <span className="text-xs">{t.auth.switchRole}</span>
          </Button>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 justify-center px-0 h-9"
              >
                <ArrowLeftRight className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-950 border border-zinc-800 text-zinc-200">
              {t.auth.switchRole}
            </TooltipContent>
          </Tooltip>
        )}
        <LocalExitButton sidebarOpen={sidebarOpen} />
      </div>
    </aside>
  );
}

/* Mobile sidebar using Sheet */
export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentView = useAppStore((s) => s.currentView);
  const setView = useAppStore((s) => s.setView);
  const t = useT();
  const { logoText, logoIconType, logoEmoji, logoUrl, restaurantName } = useBranding();

  const filteredItems = useMemo(() => {
    if (!user) return [];
    return NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  }, [user]);

  if (!user) return null;

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[-1] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-zinc-800 shrink-0">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm shrink-0 overflow-hidden",
          logoIconType === 'url' && logoUrl ? "" : "bg-emerald-600"
        )}>
          {logoIconType === 'emoji' ? (
            <span className="text-xl">{logoEmoji}</span>
          ) : logoIconType === 'url' && logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold tracking-wider">{logoText || 'GF'}</span>
          )}
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-semibold text-zinc-100 truncate">
            {restaurantName || t.auth.restaurantName}
          </h1>
          <p className="text-[10px] text-zinc-500 truncate">{t.auth.managementSystem}</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {filteredItems.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = currentView === item.view;
            return (
              <Button
                key={item.view}
                variant="ghost"
                onClick={() => {
                  setView(item.view);
                  onClose();
                }}
                className={cn(
                  'justify-start gap-3 h-10 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors',
                  isActive &&
                    'bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-400'
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate text-sm">{getNavLabel(item.view, t)}</span>
                {item.view === 'pos' && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-emerald-600/20 text-emerald-400 text-[10px] px-1.5 py-0 h-5"
                  >
                    3
                  </Badge>
                )}
                {item.view === 'inventory' && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-amber-600/20 text-amber-400 text-[10px] px-1.5 py-0 h-5"
                  >
                    2
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>



      {/* User & Switch Role */}
      <div className="p-3 space-y-2 shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              ROLE_COLORS[user.role]
            )}
          />
          <div className="overflow-hidden">
            <p className="text-xs text-zinc-300 truncate">{user.name}</p>
            <p className="text-[10px] text-zinc-500 truncate">
              {getTranslatedRoleLabel(user.role, t)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 gap-2"
        >
          <ArrowLeftRight className="size-3.5" />
          <span className="text-xs">{t.auth.switchRole}</span>
        </Button>
        <LocalExitButton sidebarOpen={true} />
      </div>
    </div>
  );
}
