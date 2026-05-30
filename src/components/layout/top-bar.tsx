'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const VIEW_TITLES: Record<string, string> = {};
NAV_ITEMS.forEach((item) => {
  VIEW_TITLES[item.view] = item.label;
});

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentView = useAppStore((s) => s.currentView);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const notifications = useAppStore((s) => s.notifications);

  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 60_000);
    return () => clearInterval(interval);
  }, []);

  const title = VIEW_TITLES[currentView] ?? 'Dashboard';

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-zinc-900 border-b border-zinc-800 shrink-0 gap-4">
      {/* Left: Menu + Toggle + Title */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shrink-0"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <Separator orientation="vertical" className="h-6 bg-zinc-700 hidden md:block" />

        <h2 className="text-sm font-medium text-zinc-100 truncate">
          {title}
        </h2>
      </div>

      {/* Right: Clock, Notifications, User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Clock */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
          <span>{date}</span>
          <Separator orientation="vertical" className="h-3.5 bg-zinc-700" />
          <span className="font-mono tabular-nums">{time}</span>
        </div>

        <Separator orientation="vertical" className="h-6 bg-zinc-700 hidden sm:block" />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shrink-0"
        >
          <Bell className="size-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 px-2 hover:bg-zinc-800"
              >
                <Avatar className="size-7">
                  <AvatarFallback
                    className={cn(
                      'text-[10px] font-semibold text-white',
                      ROLE_COLORS[user.role]
                    )}
                  >
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs text-zinc-200 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 leading-tight">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-zinc-900 border-zinc-800"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
                <Badge
                  className={cn(
                    'mt-1.5 text-[10px] text-white border-0',
                    ROLE_COLORS[user.role]
                  )}
                >
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-400 focus:text-red-300 focus:bg-zinc-800 cursor-pointer"
              >
                <LogOut className="size-3.5 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
