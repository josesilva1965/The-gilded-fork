'use client';

import { useState, useEffect, useCallback } from 'react';
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
  CheckCircle2,
  XCircle,
  Info,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore, ROLE_COLORS } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale } from '@/stores/locale-store';
import { useBranding } from '@/stores/branding-store';
import { useLocaleConfig } from '@/stores/locale-store';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const FloorPlan = dynamic(() => import('@/components/modules/floor-plan/floor-plan').then((m) => m.FloorPlan), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Floor Plan...</div>,
});
const KitchenDisplay = dynamic(() => import('@/components/modules/kds/kitchen-display').then((m) => m.KitchenDisplay), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading KDS...</div>,
});
const Dashboard = dynamic(() => import('@/components/modules/dashboard/dashboard').then((m) => m.Dashboard), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Dashboard...</div>,
});
const CRMGuests = dynamic(() => import('@/components/modules/crm/crm-guests').then((m) => m.CRMGuests), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Guests...</div>,
});
const POSSystem = dynamic(() => import('@/components/modules/pos/pos-system').then((m) => m.POSSystem), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading POS...</div>,
});
const Inventory = dynamic(() => import('@/components/modules/inventory/inventory').then((m) => m.Inventory), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Inventory...</div>,
});
const Reservations = dynamic(() => import('@/components/modules/reservations/reservations').then((m) => m.Reservations), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Reservations...</div>,
});
const StaffManagement = dynamic(() => import('@/components/modules/staff/staff-management').then((m) => m.StaffManagement), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Staff Management...</div>,
});
const TransactionsLedger = dynamic(() => import('@/components/modules/transactions/transactions-ledger').then((m) => m.TransactionsLedger), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Transactions Ledger...</div>,
});
const MenuManagement = dynamic(() => import('@/components/modules/menu/menu-management').then((m) => m.MenuManagement), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Menu Management...</div>,
});
const Settings = dynamic(() => import('@/components/modules/admin/settings').then((m) => m.Settings), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-zinc-500 py-12">Loading Settings...</div>,
});
import { useSocketSync } from '@/hooks/use-socket-sync';

// Force hot reload
/* ─── Mock user data ─── */
const MOCK_USERS: Record<string, { id: string; email: string; name: string; pin: string }> = {
  ADMIN: { id: 'cmpwrzrqc0000j7hw4g7fhh34', email: 'admin@thebar.com', name: 'Marco Rossi', pin: '1001' },
  MANAGER: { id: 'cmpwrzrqe0002j7hwnykw2ts2', email: 'manager@thebar.com', name: 'Sarah Chen', pin: '2001' },
  KITCHEN: { id: 'cmpwrzrqe0001j7hwp1uvn8nq', email: 'chef@thebar.com', name: 'Antoine Dubois', pin: '3001' },
  BAR: { id: 'cmpwrzrqh0006j7hwdh9y6x9x', email: 'bartender@thebar.com', name: 'Jake Morrison', pin: '4001' },
  FOH: { id: 'cmpwrzrqg0004j7hw0pxtsaip', email: 'server1@thebar.com', name: 'Emma Wilson', pin: '5001' },
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

/* ─── Role Selection Screen with PIN verification ─── */
function RoleSelectionScreen() {
  const login = useAuthStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const t = useT();
  const { logoText, logoIconType, logoEmoji, logoUrl, restaurantName } = useBranding();

  // Load the active staff list (without PINs)
  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch('/api/staff');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setStaff(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch staff list:', err);
      } finally {
        setIsLoadingStaff(false);
      }
    }
    loadStaff();
  }, []);

  const roles = ['ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH'];

  // Handle clicking a role
  function handleRoleSelect(role: string) {
    setSelectedRole(role);
    setLoginError(null);
    setPinInput('');
    
    // Find staff members matching this role
    const matchingStaff = staff.filter((s) => s.role === role);
    
    if (matchingStaff.length === 1) {
      // If exactly one user has this role, auto-select them
      setSelectedUser(matchingStaff[0]);
    } else if (matchingStaff.length === 0) {
      // Fallback to mock user if no staff in DB matches this role
      const mockUser = MOCK_USERS[role];
      if (mockUser) {
        setSelectedUser({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: role,
        });
      }
    }
    // If matchingStaff.length > 1, selectedUser remains null so they can choose which name they are
  }

  // Handle clicking a specific staff member name (if multiple users have the same role)
  function handleUserSelect(user: any) {
    setSelectedUser(user);
    setLoginError(null);
    setPinInput('');
  }

  // Handle PIN pad digit click
  function handlePinDigit(digit: string) {
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
      setLoginError(null);
    }
  }

  // Handle backspace
  function handleBackspace() {
    setPinInput((prev) => prev.slice(0, -1));
  }

  // Handle clearing PIN
  function handleClear() {
    setPinInput('');
    setLoginError(null);
  }

  // Submit PIN for verification
  const handleVerify = useCallback(async (pinToVerify: string) => {
    if (!selectedUser) return;
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, pin: pinToVerify }),
      });

      if (res.ok) {
        const data = await res.json();
        login({
          ...data.user,
          pin: pinToVerify,
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || 'Invalid PIN');
        setPinInput('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Server connection failed. Try again.');
      setPinInput('');
    } finally {
      setIsLoggingIn(false);
    }
  }, [selectedUser, login]);

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pinInput.length === 4) {
      const timer = setTimeout(() => {
        handleVerify(pinInput);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pinInput, handleVerify]);

  function handleBack() {
    if (selectedUser && staff.filter((s) => s.role === selectedRole).length > 1) {
      setSelectedUser(null);
    } else {
      setSelectedRole(null);
      setSelectedUser(null);
    }
    setPinInput('');
    setLoginError(null);
  }

  const roleStaffList = selectedRole ? staff.filter((s) => s.role === selectedRole) : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-955 p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-955 to-zinc-955" />
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-350">
          <CardHeader className="text-center pb-2 relative">
            {(selectedRole !== null) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="absolute left-4 top-4 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div className="flex items-center justify-center mb-4">
              <div className={cn(
                "flex items-center justify-center w-16 h-16 rounded-2xl text-white shadow-lg overflow-hidden shrink-0",
                logoIconType === 'url' && logoUrl ? "" : "bg-emerald-600 shadow-emerald-600/25"
              )}>
                {logoIconType === 'emoji' ? (
                  <span className="text-3xl">{logoEmoji}</span>
                ) : logoIconType === 'url' && logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold tracking-wider">{logoText || 'GF'}</span>
                )}
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-zinc-100 tracking-tight">
              {restaurantName || t.auth.restaurantName}
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">
              {selectedUser ? `${getRoleLabel(selectedUser.role, t)} / ${selectedUser.name}` : t.auth.managementSystem}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Role */}
              {selectedRole === null && (
                <motion.div
                  key="role-select"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-3"
                >
                  <p className="text-center text-xs text-zinc-500 mb-2">
                    {t.auth.selectRole}
                  </p>
                  {roles.map((role, idx) => {
                    const IconComp = ROLE_ICON_COMPONENTS[role];
                    const colors = ROLE_CARD_COLORS[role];

                    return (
                      <Button
                        key={role}
                        variant="outline"
                        onClick={() => handleRoleSelect(role)}
                        className={cn(
                          'w-full h-14 justify-start gap-4 px-4 border transition-all duration-200',
                          'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
                          colors.bg,
                          colors.hover,
                          colors.border
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border',
                            colors.bg,
                            colors.border
                          )}
                        >
                          <IconComp className={cn('size-4', colors.icon)} />
                        </div>
                        <div className="text-left">
                          <p className={cn('text-sm font-semibold', colors.text)}>
                            {getRoleLabel(role, t)}
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
                    );
                  })}
                </motion.div>
              )}

              {/* Step 2: Select Name (if multiple users for a role) */}
              {selectedRole !== null && selectedUser === null && (
                <motion.div
                  key="name-select"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-center text-xs text-zinc-400 mb-2">
                    Select your name:
                  </p>
                  <div className="grid gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {roleStaffList.map((member) => (
                      <Button
                        key={member.id}
                        variant="outline"
                        onClick={() => handleUserSelect(member)}
                        className="w-full h-12 justify-start px-4 bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                      >
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className="ml-auto text-[10px] text-zinc-500">{member.email}</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Enter PIN */}
              {selectedUser !== null && (
                <motion.div
                  key="pin-entry"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="text-center">
                    <p className="text-xs text-zinc-400">
                      Enter 4-digit PIN for
                    </p>
                    <p className="text-sm font-semibold text-zinc-200 mt-0.5">
                      {selectedUser.name}
                    </p>
                  </div>

                  {/* Dot Indicators */}
                  <div className="flex gap-4 my-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-3.5 h-3.5 rounded-full border border-zinc-700 transition-all duration-150',
                          i < pinInput.length
                            ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110'
                            : 'bg-zinc-950 scale-100'
                        )}
                      />
                    ))}
                  </div>

                  {loginError ? (
                    <p className="text-xs font-medium text-red-400 min-h-4">
                      {loginError}
                    </p>
                  ) : (
                    <div className="h-4" />
                  )}

                  {/* PIN Pad Grid */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mx-auto pb-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        disabled={isLoggingIn}
                        onClick={() => handlePinDigit(num)}
                        className="h-12 text-lg font-mono font-bold bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 shadow-md"
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      disabled={isLoggingIn}
                      onClick={handleClear}
                      className="h-12 text-xs font-semibold bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400"
                    >
                      CLEAR
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isLoggingIn}
                      onClick={() => handlePinDigit('0')}
                      className="h-12 text-lg font-mono font-bold bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 shadow-md"
                    >
                      0
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isLoggingIn || pinInput.length === 0}
                      onClick={handleBackspace}
                      className="h-12 text-xs font-semibold bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400"
                    >
                      ⌫
                    </Button>
                  </div>

                  {isLoggingIn && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                      <div className="animate-spin size-3.5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                      <span>Verifying PIN...</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {selectedRole === null && (
              <p className="text-center text-[10px] text-zinc-600 mt-6">
                {t.auth.demoMode}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ─── Toast Notification System ─── */
function ToastNotifications() {
  const notifications = useAppStore((s) => s.notifications);
  const removeNotification = useAppStore((s) => s.removeNotification);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    for (const n of notifications) {
      const t = setTimeout(() => removeNotification(n.id), 4000);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  const toastConfig: Record<string, { icon: React.ElementType; bg: string; border: string; text: string; iconColor: string }> = {
    success: { icon: CheckCircle2, bg: 'bg-emerald-950/90', border: 'border-emerald-600/40', text: 'text-emerald-200', iconColor: 'text-emerald-400' },
    error: { icon: XCircle, bg: 'bg-red-950/90', border: 'border-red-600/40', text: 'text-red-200', iconColor: 'text-red-400' },
    info: { icon: Info, bg: 'bg-sky-950/90', border: 'border-sky-600/40', text: 'text-sky-200', iconColor: 'text-sky-400' },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((n) => {
          const config = toastConfig[n.type] || toastConfig.info;
          const IconComp = config.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-lg shadow-2xl shadow-black/40',
                config.bg, config.border
              )}
            >
              <IconComp className={cn('size-5 shrink-0 mt-0.5', config.iconColor)} />
              <p className={cn('text-sm font-medium flex-1', config.text)}>{n.message}</p>
              <button
                onClick={() => removeNotification(n.id)}
                className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main App Layout ─── */
function MainLayout() {
  useSocketSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentView = useAppStore((s) => s.currentView);
  const t = useT();
  const localeConfig = useLocaleConfig();

  // Collapse sidebar by default on tablet-sized viewports (< 1024px) to maximize workspace
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const state = useAppStore.getState();
      if (state.sidebarOpen) {
        state.toggleSidebar();
      }
    }
  }, []);

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
            'flex-1',
            currentView === 'kds' || currentView === 'pos' ? 'overflow-hidden' : 'overflow-y-auto',
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
                  ) : currentView === 'transactions' ? (
                    <TransactionsLedger />
                  ) : currentView === 'menu' ? (
                    <MenuManagement />
                  ) : currentView === 'settings' ? (
                    <Settings />
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

      {/* Toast Notifications */}
      <ToastNotifications />
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
