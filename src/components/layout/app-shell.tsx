'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ClipboardList,
  ChefHat,
  Wine,
  UtensilsCrossed,
  Utensils,
  LayoutDashboard,
  ShoppingCart,
  CalendarDays,
  Package,
  Users,
  Heart,
} from 'lucide-react';
import { useAuthStore, ROLE_COLORS } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale } from '@/stores/locale-store';
import { useLocaleConfig } from '@/stores/locale-store';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { FloorPlan } from '@/components/modules/floor-plan/floor-plan';
import { KitchenDisplay } from '@/components/modules/kds/kitchen-display';
import { Dashboard } from '@/components/modules/dashboard/dashboard';
import { CRMGuests } from '@/components/modules/crm/crm-guests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { POSSystem } from '@/components/modules/pos/pos-system';
import { Inventory } from '@/components/modules/inventory/inventory';
import { Reservations } from '@/components/modules/reservations/reservations';
import { StaffManagement } from '@/components/modules/staff/staff-management';

/* ─── Mock user data ─── */
const MOCK_USERS: Record<string, { id: string; email: string; name: string; pin: string }> = {
  ADMIN: { id: 'cmpsacytk0004pj0wu32tub4c', email: 'admin@thebar.com', name: 'Marco Rossi', pin: '1001' },
  MANAGER: { id: 'cmpsacyto0009pj0wapz3cmnj', email: 'manager@thebar.com', name: 'Sarah Chen', pin: '2001' },
  KITCHEN: { id: 'cmpsacytg0000pj0wnvrdbwsf', email: 'chef@thebar.com', name: 'Antoine Dubois', pin: '3001' },
  BAR: { id: 'cmpsacyth0001pj0wvxye3k1m', email: 'bartender@thebar.com', name: 'Jake Morrison', pin: '4001' },
  FOH: { id: 'cmpsacytl0005pj0wh9ew50jx', email: 'server1@thebar.com', name: 'Emma Wilson', pin: '5001' },
};

/* ─── Icon map for role selection ─── */
const ROLE_ICON_COMPONENTS: Record<string, React.ElementType> = {
  ADMIN: Shield,
  MANAGER: ClipboardList,
  KITCHEN: ChefHat,
  BAR: Wine,
  FOH: UtensilsCrossed,
};

/* ─── Role selection colors for the card buttons ─── */
const ROLE_CARD_COLORS: Record<string, { bg: string; hover: string; border: string; text: string; icon: string }> = {
  ADMIN: {
    bg: 'bg-amber-600/10',
    hover: 'hover:bg-amber-600/20',
    border: 'border-amber-600/30',
    text: 'text-amber-400',
    icon: 'text-amber-500',
  },
  MANAGER: {
    bg: 'bg-emerald-600/10',
    hover: 'hover:bg-emerald-600/20',
    border: 'border-emerald-600/30',
    text: 'text-emerald-400',
    icon: 'text-emerald-500',
  },
  KITCHEN: {
    bg: 'bg-orange-600/10',
    hover: 'hover:bg-orange-600/20',
    border: 'border-orange-600/30',
    text: 'text-orange-400',
    icon: 'text-orange-500',
  },
  BAR: {
    bg: 'bg-purple-600/10',
    hover: 'hover:bg-purple-600/20',
    border: 'border-purple-600/30',
    text: 'text-purple-400',
    icon: 'text-purple-500',
  },
  FOH: {
    bg: 'bg-sky-600/10',
    hover: 'hover:bg-sky-600/20',
    border: 'border-sky-600/30',
    text: 'text-sky-400',
    icon: 'text-sky-500',
  },
};

/* ─── Role label map ─── */
function getRoleLabel(role: string, t: any): string {
  const map: Record<string, string> = {
    ADMIN: t.roles.admin,
    MANAGER: t.roles.manager,
    KITCHEN: t.roles.kitchen,
    BAR: t.roles.bar,
    FOH: t.roles.foh,
  };
  return map[role] || role;
}

/* ─── Role Selection Screen ─── */
function RoleSelectionScreen() {
  const login = useAuthStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const t = useT();

  function handleRoleSelect(role: string) {
    setSelectedRole(role);
    const mockUser = MOCK_USERS[role];
    if (!mockUser) return;
    login({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: role as any,
      pin: mockUser.pin,
    });
  }

  const roles = ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/50">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                <Utensils className="size-7" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100 tracking-tight">
              {t.auth.restaurantName}
            </CardTitle>
            <CardDescription className="text-zinc-500 text-sm">
              {t.auth.managementSystem}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-center text-xs text-zinc-500 mb-6">
              {t.auth.selectRole}
            </p>
            <div className="grid gap-3">
              {roles.map((role, idx) => {
                const IconComp = ROLE_ICON_COMPONENTS[role];
                const colors = ROLE_CARD_COLORS[role];
                const isSelected = selectedRole === role;

                return (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      disabled={selectedRole !== null && !isSelected}
                      onClick={() => handleRoleSelect(role)}
                      className={cn(
                        'w-full h-16 justify-start gap-4 px-4 border transition-all duration-200',
                        'bg-zinc-900 border-zinc-700/50 hover:border-zinc-600',
                        colors.bg,
                        colors.hover,
                        colors.border,
                        isSelected && 'ring-2 ring-emerald-500/50',
                        selectedRole !== null && !isSelected && 'opacity-30'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                          colors.bg,
                          colors.border,
                          'border'
                        )}
                      >
                        <IconComp className={cn('size-5', colors.icon)} />
                      </div>
                      <div className="text-left">
                        <p className={cn('text-sm font-semibold', colors.text)}>
                          {getRoleLabel(role, t)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {MOCK_USERS[role]?.email}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            ROLE_COLORS[role as keyof typeof ROLE_COLORS]
                          )}
                        />
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-center text-[10px] text-zinc-600 mt-6">
              {t.auth.demoMode}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ─── Main App Layout ─── */
function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentView = useAppStore((s) => s.currentView);
  const t = useT();
  const localeConfig = useLocaleConfig();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Column */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top Bar */}
          <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

          {/* Content Area */}
          <main className={cn(
            'flex-1 overflow-y-auto',
            currentView === 'kds' ? 'p-2 md:p-3' : currentView === 'pos' ? 'p-3 md:p-4' : 'p-4 md:p-6'
          )}>
            <div className={cn(
              currentView === 'kds' ? 'h-full' : currentView === 'pos' ? 'h-full' : 'max-w-7xl mx-auto'
            )}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={currentView === 'kds' || currentView === 'pos' ? 'h-full' : ''}
                >
                  {currentView === 'dashboard' ? (
                    <Dashboard />
                  ) : currentView === 'floor-plan' ? (
                    <FloorPlan />
                  ) : currentView === 'kds' ? (
                    <KitchenDisplay />
                  ) : currentView === 'pos' ? (
                    <POSSystem />
                  ) : currentView === 'reservations' ? (
                    <Reservations />
                  ) : currentView === 'inventory' ? (
                    <Inventory />
                  ) : currentView === 'crm' ? (
                    <CRMGuests />
                  ) : currentView === 'staff' ? (
                    <StaffManagement />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-auto border-t border-zinc-800 bg-zinc-900 px-4 py-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-600">
              <span>{t.footer.copyright} &copy; {new Date().getFullYear()}</span>
              <span>{t.footer.version} · {localeConfig.taxShort} {Math.round(localeConfig.taxRate * 100)}%</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ─── App Shell ─── */
export function AppShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="role-selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RoleSelectionScreen />
        </motion.div>
      ) : (
        <motion.div
          key="main-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-zinc-950"
        >
          <MainLayout />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
