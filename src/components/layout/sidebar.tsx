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
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Map,
  ShoppingCart,
  ChefHat,
  CalendarDays,
  Package,
  Users,
  Heart,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? LayoutDashboard;
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentView = useAppStore((s) => s.currentView);
  const setView = useAppStore((s) => s.setView);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

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
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm shrink-0">
          GF
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-zinc-100 truncate">
              The Gilded Fork
            </h1>
            <p className="text-[10px] text-zinc-500 truncate">Management System</p>
          </div>
        )}
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
                onClick={() => setView(item.view)}
                className={cn(
                  'justify-start gap-3 h-10 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors',
                  isActive &&
                    'bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-400',
                  !sidebarOpen && 'justify-center px-0'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {sidebarOpen && (
                  <span className="truncate text-sm">{item.label}</span>
                )}
                {sidebarOpen && item.view === 'pos' && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-emerald-600/20 text-emerald-400 text-[10px] px-1.5 py-0 h-5"
                  >
                    3
                  </Badge>
                )}
                {sidebarOpen && item.view === 'inventory' && (
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

      <Separator className="bg-zinc-800" />

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
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            'w-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 gap-2',
            !sidebarOpen && 'px-0 justify-center'
          )}
        >
          <ArrowLeftRight className="size-3.5" />
          {sidebarOpen && <span className="text-xs">Switch Role</span>}
        </Button>
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
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm shrink-0">
          GF
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-semibold text-zinc-100 truncate">
            The Gilded Fork
          </h1>
          <p className="text-[10px] text-zinc-500 truncate">Management System</p>
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
                <span className="truncate text-sm">{item.label}</span>
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

      <Separator className="bg-zinc-800" />

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
              {ROLE_LABELS[user.role]}
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
          <span className="text-xs">Switch Role</span>
        </Button>
      </div>
    </div>
  );
}
