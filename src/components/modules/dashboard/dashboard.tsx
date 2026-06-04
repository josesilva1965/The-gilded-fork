'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Armchair,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Package,
  AlertTriangle,
  Loader2,
  XCircle,
  RefreshCw,
  ChefHat,
  Wine,
  CalendarDays,
  LayoutDashboard,
  LogIn,
  UtensilsCrossed,
  Bell,
  Search,
  LayoutGrid,
  UserCheck,
  Timer,
  ChevronRight,
  CheckSquare,
  History,
  User,
  Coffee,
  Calculator,
  ChevronDown,
  ChevronUp,
  Trash2,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useT, useLocale, useLocaleConfig } from '@/stores/locale-store';
import { formatCurrencyByLocale, formatDateByLocale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils';

/* ─── Types ─── */

interface DailySnapshot {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  laborCost: number;
  laborPercent: number;
  foodCost: number;
}

interface TopItem {
  menuItemId: string;
  name: string;
  _sum: {
    quantity: number | null;
    totalPrice: number | null;
  };
}

interface ActivityItem {
  id: string;
  type: 'order' | 'reservation' | 'clock_in' | 'clock_out';
  description: string;
  time: string;
}

interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

interface DailyOrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  menuItem: {
    id: string;
    name: string;
    price: number;
  };
}

interface DailyOrder {
  id: string;
  tableId: string;
  createdBy: string;
  status: string;
  type: string;
  guestCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  table: {
    id: string;
    number: number;
    name: string;
  };
  creator: {
    id: string;
    name: string;
    role: string;
  };
  items: DailyOrderItem[];
}

interface DashboardData {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueChange: number;
  activeOrders: number;
  totalTables: number;
  occupiedTables: number;
  occupancyRate: number;
  staffOnShift: number;
  clockedIn: number;
  weekSnapshots: DailySnapshot[];
  topItems: TopItem[];
  lowStockCount: number;
  lowStockItems: LowStockItem[];
  recentActivity: ActivityItem[];
  todaySnapshot: DailySnapshot | null;
  dailyOrders: DailyOrder[];
}

/* ─── Constants ─── */

const EMERALD = '#10b981';
const EMERALD_LIGHT = '#34d399';
const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  order: ShoppingCart,
  reservation: CalendarDays,
  clock_in: LogIn,
  clock_out: LogIn,
};

const ACTIVITY_COLORS: Record<string, string> = {
  order: 'text-amber-400 bg-amber-500/10',
  reservation: 'text-sky-400 bg-sky-500/10',
  clock_in: 'text-emerald-400 bg-emerald-500/10',
  clock_out: 'text-zinc-400 bg-zinc-500/10',
};

/* ─── Custom Tooltip ─── */

function CustomTooltip({ active, payload, label, locale, t }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string; locale: string; t: any }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} className="text-xs font-medium" style={{ color: item.color }}>
          {item.name}: {typeof item.value === 'number' && item.name.toLowerCase().includes('revenue')
            ? formatCurrencyByLocale(item.value, locale as any)
            : item.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ─── KPI Card ─── */

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: number | null;
  trendLabel?: string;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2.5 rounded-lg', iconBg)}>
            <Icon className={cn('size-5', iconColor)} />
          </div>
          {trend !== null && trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded',
                trend >= 0
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-red-400 bg-red-500/10'
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">{title}</p>
        {trendLabel && (
          <p className="text-[10px] text-zinc-600 mt-0.5">{trendLabel}</p>
        )}
        {subtitle && (
          <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Occupancy Gauge ─── */

function OccupancyGauge({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (rate / 100) * circumference;
  const color =
    rate >= 80
      ? '#ef4444'
      : rate >= 50
        ? '#f59e0b'
        : '#10b981';

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#27272a"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-zinc-100">{rate}%</span>
      </div>
    </div>
  );
}

/* ─── Main Dashboard Component ─── */

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opSearchQuery, setOpSearchQuery] = useState('');
  const [opStatusFilter, setOpStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SERVED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [opExpandedOrderId, setOpExpandedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const t = useT();
  const locale = useLocale();
  const localeConfig = useLocaleConfig();

  const fmtCurrency = useCallback((amount: number) => formatCurrencyByLocale(amount, locale), [locale]);

  const fetchDashboard = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetOperations = useCallback(async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to reset operations');
      await fetchDashboard(false);
      setResetDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to reset daily operations.');
    } finally {
      setIsResetting(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard(true);
    const interval = setInterval(() => fetchDashboard(false), 60000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  /* Loading state */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-sm text-zinc-500">{t.dashboard.loadingDashboard}</p>
      </div>
    );
  }

  /* Error state */
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="size-8 text-red-500 mb-3" />
        <p className="text-sm text-zinc-400 mb-2">{t.dashboard.failedToLoad}</p>
        <p className="text-xs text-zinc-600 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => fetchDashboard(true)}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className="size-4 mr-2" />
          {t.common.retry}
        </Button>
      </div>
    );
  }

  /* Prepare chart data */
  const revenueChartData = [...data.weekSnapshots]
    .reverse()
    .map((s) => ({
      date: formatDateByLocale(s.date, locale, { month: 'short', day: 'numeric' }),
      revenue: Math.round(s.totalRevenue * 100) / 100,
    }));

  const topItemsData = data.topItems
    .map((item) => ({
      name: item.name,
      quantity: item._sum.quantity || 0,
      revenue: item._sum.totalPrice || 0,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  /* Labor vs Revenue pie data */
  const todaySnap = data.todaySnapshot;
  const laborCostPct = todaySnap?.laborPercent ?? 28;
  const foodCostPct = todaySnap?.foodCost
    ? Math.round((todaySnap.foodCost / (todaySnap.totalRevenue || 1)) * 100)
    : 32;
  const otherPct = Math.max(0, 100 - laborCostPct - foodCostPct);

  const pieData = [
    { name: t.dashboard.laborCost, value: laborCostPct, color: '#f59e0b' },
    { name: t.dashboard.foodCost, value: foodCostPct, color: '#10b981' },
    { name: t.dashboard.other, value: otherPct, color: '#6366f1' },
  ];

  // ─── Live Operations Calculations ───
  const dailyOrders = data.dailyOrders || [];

  const opTotalOrders = dailyOrders.length;
  const opTotalRevenue = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const opAvgCheck = opTotalOrders > 0 ? opTotalRevenue / opTotalOrders : 0;
  
  const opActiveOrdersCount = dailyOrders.filter((o) =>
    ['PENDING', 'IN_PROGRESS', 'READY'].includes(o.status)
  ).length;

  const opServedCount = dailyOrders.filter((o) =>
    o.status === 'SERVED' && o.paymentStatus !== 'COMPLETED'
  ).length;

  // Payment Breakdown
  const paymentsCash = dailyOrders
    .filter((o) => o.paymentStatus === 'COMPLETED' && o.paymentMethod === 'CASH')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const paymentsCard = dailyOrders
    .filter((o) => o.paymentStatus === 'COMPLETED' && o.paymentMethod === 'CARD')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const paymentsCredit = dailyOrders
    .filter((o) => o.paymentStatus === 'COMPLETED' && o.paymentMethod === 'CREDIT')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Table sales
  const tableSalesMap = dailyOrders.reduce((acc, order) => {
    const key = order.table.id;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        number: order.table.number,
        name: order.table.name,
        totalSales: 0,
        orderCount: 0,
        activeCount: 0,
      };
    }
    acc[key].totalSales += order.totalAmount;
    acc[key].orderCount += 1;
    if (['PENDING', 'IN_PROGRESS', 'READY'].includes(order.status)) {
      acc[key].activeCount += 1;
    }
    return acc;
  }, {} as Record<string, { id: string; number: number; name: string; totalSales: number; orderCount: number; activeCount: number }>);

  const tableSalesList = Object.values(tableSalesMap).sort((a, b) => b.totalSales - a.totalSales);

  // Server performance
  const serverSalesMap = dailyOrders.reduce((acc, order) => {
    const key = order.creator.id;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: order.creator.name,
        role: order.creator.role,
        totalSales: 0,
        orderCount: 0,
        guestCount: 0,
      };
    }
    acc[key].totalSales += order.totalAmount;
    acc[key].orderCount += 1;
    acc[key].guestCount += order.guestCount;
    return acc;
  }, {} as Record<string, { id: string; name: string; role: string; totalSales: number; orderCount: number; guestCount: number }>);

  const serverSalesList = Object.values(serverSalesMap).sort((a, b) => b.totalSales - a.totalSales);

  // Filtered orders
  const filteredDailyOrders = dailyOrders.filter((order) => {
    if (opStatusFilter === 'ACTIVE') {
      if (!['PENDING', 'IN_PROGRESS', 'READY'].includes(order.status)) return false;
    } else if (opStatusFilter === 'SERVED') {
      if (order.status !== 'SERVED' || order.paymentStatus === 'COMPLETED') return false;
    } else if (opStatusFilter === 'COMPLETED') {
      if (order.paymentStatus !== 'COMPLETED' && order.status !== 'SERVED') return false;
    } else if (opStatusFilter === 'CANCELLED') {
      if (order.status !== 'CANCELLED') return false;
    }

    if (opSearchQuery.trim()) {
      const q = opSearchQuery.toLowerCase();
      const matchTable = order.table.name.toLowerCase().includes(q) || order.table.number.toString().includes(q);
      const matchServer = order.creator.name.toLowerCase().includes(q);
      return matchTable || matchServer;
    }

    return true;
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <LayoutDashboard className="size-5 text-emerald-400" />
            {t.dashboard.title}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t.dashboard.realtimeOverview} ·{' '}
            {new Date().toLocaleDateString(locale, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'operations' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              className="border-red-900/20 text-red-400 hover:bg-red-950/20 hover:border-red-900/40 gap-2 h-9 text-xs font-medium"
            >
              <Trash2 className="size-3.5" />
              Reset Shift
            </Button>
          )}
          
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-9 rounded-lg">
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
            >
              <Activity className="size-3.5" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="operations"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
            >
              <Timer className="size-3.5" />
              Live Operations
            </TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboard(false)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2 h-9 text-xs font-medium"
          >
            <RefreshCw className="size-3.5" />
            {t.common.refresh}
          </Button>

          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogContent className="bg-zinc-950 border border-zinc-850 max-w-md rounded-xl text-zinc-100">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-zinc-150 flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-500" />
                  Clear Shift Operations?
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs mt-2 leading-relaxed">
                  This will completely clear all orders, item allocations, and shift statistics for today. All occupied restaurant tables will be instantly reset to FREE. 
                  <span className="block mt-2 text-red-400 font-medium">This action is permanent and cannot be undone.</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setResetDialogOpen(false)}
                  className="hover:bg-zinc-900 text-zinc-400 h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetOperations}
                  disabled={isResetting}
                  className="bg-red-650 hover:bg-red-600 text-white font-semibold h-9 text-xs px-4 flex items-center gap-1.5"
                >
                  {isResetting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Clear All Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TAB 1: ANALYTICS OVERVIEW */}
      <TabsContent value="analytics" className="space-y-5 m-0 border-0 p-0 focus-visible:ring-0">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            title={t.dashboard.todaysRevenue}
            value={fmtCurrency(data.todayRevenue)}
            icon={DollarSign}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
            trend={data.revenueChange}
            trendLabel={t.dashboard.vsYesterday}
          />
          <KPICard
            title={t.dashboard.activeOrders}
            value={data.activeOrders.toString()}
            icon={ShoppingCart}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-sky-500/10">
                  <Armchair className="size-5 text-sky-400" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <OccupancyGauge rate={data.occupancyRate} />
                <div>
                  <p className="text-2xl font-bold text-zinc-100">
                    {data.occupancyRate}%
                  </p>
                  <p className="text-[11px] text-zinc-500">{t.dashboard.tableOccupancy}</p>
                  <p className="text-[10px] text-zinc-600">
                    {data.occupiedTables} / {data.totalTables} {t.dashboard.tables}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <KPICard
            title={t.dashboard.staffOnShift}
            value={data.clockedIn.toString()}
            subtitle={`${data.staffOnShift} ${t.dashboard.scheduledToday}`}
            icon={Users}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Revenue Chart - Takes 2 columns */}
          <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-400" />
                {t.dashboard.sevenDayRevenue}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={EMERALD} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#71717a', fontSize: 11 }}
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={{ stroke: '#27272a' }}
                    />
                    <YAxis
                      tick={{ fill: '#71717a', fontSize: 11 }}
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={{ stroke: '#27272a' }}
                      tickFormatter={(val) => `${localeConfig.currencySymbol}${(val / 1000).toFixed(1)}k`}
                    />
                    <Tooltip content={<CustomTooltip locale={locale} t={t} />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name={t.dashboard.revenue}
                      stroke={EMERALD}
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      dot={{ fill: EMERALD, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: EMERALD_LIGHT, stroke: EMERALD, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Items */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <ChefHat className="size-4 text-amber-400" />
                {t.dashboard.topSellingItems}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topItemsData}
                    layout="vertical"
                    margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={{ stroke: '#27272a' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#a1a1aa', fontSize: 10 }}
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={{ stroke: '#27272a' }}
                      width={90}
                    />
                    <Tooltip content={<CustomTooltip locale={locale} t={t} />} />
                    <Bar
                      dataKey="quantity"
                      name={t.dashboard.qtySold}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                    >
                      {topItemsData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Activity Feed */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Activity className="size-4 text-sky-400" />
                {t.dashboard.recentActivity}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[300px]">
                {data.recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {data.recentActivity.map((activity, idx) => {
                      const Icon = ACTIVITY_ICONS[activity.type] || Bell;
                      const colorClass = ACTIVITY_COLORS[activity.type] || 'text-zinc-400 bg-zinc-500/10';
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.2 }}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className={cn('p-1.5 rounded-md shrink-0', colorClass)}>
                            <Icon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-zinc-300 truncate">
                              {activity.description}
                            </p>
                            <p className="text-[10px] text-zinc-600 flex items-center gap-1">
                              <Clock className="size-2.5" />
                              {activity.time}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Activity className="size-6 text-zinc-700 mb-2" />
                    <p className="text-xs text-zinc-600">{t.dashboard.noRecentActivity}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <DollarSign className="size-4 text-amber-400" />
                {t.dashboard.costBreakdown}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#18181b"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e4e4e7',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-[11px] text-zinc-400">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-1">
                {pieData.map((item) => (
                  <div key={item.name} className="text-center">
                    <p className="text-sm font-bold text-zinc-200">{item.value}%</p>
                    <p className="text-[10px] text-zinc-500">{item.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Package className="size-4 text-purple-400" />
                {t.dashboard.inventoryAlerts}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertTriangle className="size-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">
                    {data.lowStockCount}
                  </p>
                  <p className="text-[11px] text-zinc-500">{t.dashboard.lowStockItems}</p>
                </div>
              </div>
              <Separator className="bg-zinc-800 mb-3" />
              {data.lowStockItems.length > 0 ? (
                <div className="space-y-2.5">
                  {data.lowStockItems.map((item) => {
                    const pct =
                      item.minStock > 0
                        ? Math.round((item.currentStock / item.minStock) * 100)
                        : 0;
                    const isCritical = pct < 50;
                    return (
                      <div key={item.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-300 font-medium">
                            {item.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px] px-1.5 py-0',
                              isCritical
                                ? 'border-red-800/50 text-red-400'
                                : 'border-amber-800/50 text-amber-400'
                            )}
                          >
                            {isCritical ? t.dashboard.critical : t.dashboard.low}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(pct, 100)}
                            className={cn(
                              'h-1.5 bg-zinc-800',
                              isCritical
                                ? '[&>div]:bg-red-500'
                                : '[&>div]:bg-amber-500'
                            )}
                          />
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            {item.currentStock} / {item.minStock} {item.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <Package className="size-6 text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-600">{t.dashboard.allStockOk}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* TAB 2: LIVE OPERATIONS MONITOR */}
      <TabsContent value="operations" className="space-y-5 m-0 border-0 p-0 focus-visible:ring-0">
        {/* Operations KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.dashboard.todaysSales}</p>
                <p className="text-xl font-bold text-emerald-400">{fmtCurrency(opTotalRevenue)}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                <DollarSign className="size-5 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.dashboard.qtySold}</p>
                <p className="text-xl font-bold text-zinc-100">{opTotalOrders}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                <ShoppingCart className="size-5 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.dashboard.avgCheckSize}</p>
                <p className="text-xl font-bold text-sky-400">{fmtCurrency(opAvgCheck)}</p>
              </div>
              <div className="p-2 bg-sky-500/10 rounded-lg shrink-0">
                <Calculator className="size-5 text-sky-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.dashboard.activeServedChecks}</p>
                <p className="text-xl font-bold text-purple-400">
                  {opActiveOrdersCount} <span className="text-xs font-normal text-zinc-500">active</span> / {opServedCount} <span className="text-xs font-normal text-zinc-500">dining</span>
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                <Timer className="size-5 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-zinc-900 border-zinc-800 border-t-2 border-t-emerald-500/40">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.dashboard.cashPayments}</p>
                <p className="text-xl font-bold text-emerald-400">{fmtCurrency(paymentsCash)}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <DollarSign className="size-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 border-t-2 border-t-sky-500/40">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.dashboard.cardPayments}</p>
                <p className="text-xl font-bold text-sky-400">{fmtCurrency(paymentsCard)}</p>
              </div>
              <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                <CreditCard className="size-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 border-t-2 border-t-purple-500/40">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.dashboard.creditPayments}</p>
                <p className="text-xl font-bold text-purple-400">{fmtCurrency(paymentsCredit)}</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Wallet className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* LEFT COLUMN: Table Tallies & Staff Leaders */}
          <div className="space-y-4 lg:col-span-1">
            {/* Table Distribution */}
            <Card className="bg-zinc-900 border-zinc-800 flex flex-col h-[320px]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <LayoutGrid className="size-4 text-emerald-400" />
                  Table Tallies
                </CardTitle>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
                  {tableSalesList.length} tables active
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-0 px-4 pb-4">
                <ScrollArea className="h-full">
                  {tableSalesList.length > 0 ? (
                    <div className="space-y-2">
                      {tableSalesList.map((tbl) => (
                        <div
                          key={tbl.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700/50 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                              {tbl.name}
                              {tbl.activeCount > 0 && (
                                <span className="size-2 bg-amber-500 rounded-full animate-pulse" title="Ongoing Order" />
                              )}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {tbl.orderCount} check{tbl.orderCount > 1 ? 's' : ''} today
                            </p>
                          </div>
                          <span className="text-xs font-bold text-zinc-100 shrink-0">
                            {fmtCurrency(tbl.totalSales)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <LayoutGrid className="size-6 text-zinc-750 mb-2" />
                      <p className="text-xs text-zinc-600">{t.dashboard.noActiveTablesToday}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Server Leaderboard */}
            <Card className="bg-zinc-900 border-zinc-800 flex flex-col h-[320px]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <UserCheck className="size-4 text-purple-400" />
                  Server Sales
                </CardTitle>
                <Badge className="bg-purple-500/10 text-purple-400 border-0 text-[10px]">
                  Leaderboard
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-0 px-4 pb-4">
                <ScrollArea className="h-full">
                  {serverSalesList.length > 0 ? (
                    <div className="space-y-2">
                      {serverSalesList.map((srv, idx) => (
                        <div
                          key={srv.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                              idx === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                              idx === 1 ? "bg-zinc-300/20 text-zinc-300 border border-zinc-300/30" :
                              "bg-purple-500/10 text-purple-400"
                            )}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-200 truncate">{srv.name}</p>
                              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">
                                {srv.orderCount} check{srv.orderCount > 1 ? 's' : ''} &middot; {srv.guestCount} guest{srv.guestCount > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-zinc-100 shrink-0">
                            {fmtCurrency(srv.totalSales)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <UserCheck className="size-6 text-zinc-755 mb-2" />
                      <p className="text-xs text-zinc-600">{t.dashboard.noServerRecordsToday}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Interactive Order Monitor */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900 border-zinc-800 flex flex-col h-[656px] min-h-0">
              <CardHeader className="pb-3 space-y-3 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
                  <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <ShoppingCart className="size-4 text-amber-400" />
                    Daily Check Monitor
                  </CardTitle>
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-zinc-500" />
                    <Input
                      placeholder="Search Table or Server..."
                      value={opSearchQuery}
                      onChange={(e) => setOpSearchQuery(e.target.value)}
                      className="pl-8 bg-zinc-850 border-zinc-700 h-9 text-xs text-zinc-200 focus-visible:ring-emerald-500/20"
                    />
                  </div>
                </div>
                
                {/* Status Sub-Filters */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-800/40">
                  {(['ALL', 'ACTIVE', 'SERVED', 'COMPLETED', 'CANCELLED'] as const).map((filter) => {
                    const count = filter === 'ALL' ? dailyOrders.length :
                      filter === 'ACTIVE' ? opActiveOrdersCount :
                      filter === 'SERVED' ? opServedCount :
                      filter === 'COMPLETED' ? dailyOrders.filter(o => o.paymentStatus === 'COMPLETED' || o.status === 'SERVED').length :
                      dailyOrders.filter(o => o.status === 'CANCELLED').length;
                    
                    return (
                      <button
                        key={filter}
                        onClick={() => {
                          setOpStatusFilter(filter);
                          setOpExpandedOrderId(null);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all flex items-center gap-1.5",
                          opStatusFilter === filter
                            ? "bg-zinc-800 text-zinc-100 border border-zinc-700/30 font-bold shadow-sm"
                            : "text-zinc-500 hover:text-zinc-300 bg-transparent border border-transparent"
                        )}
                      >
                        {filter === 'ALL' && <History className="size-3 shrink-0" />}
                        {filter === 'ACTIVE' && <Timer className="size-3 text-amber-400 shrink-0" />}
                        {filter === 'SERVED' && <Coffee className="size-3 text-sky-400 shrink-0" />}
                        {filter === 'COMPLETED' && <CheckSquare className="size-3 text-emerald-400 shrink-0" />}
                        {filter === 'CANCELLED' && <XCircle className="size-3 text-red-400 shrink-0" />}
                        {filter}
                        <Badge className={cn(
                          "px-1 py-0 text-[8px] h-3.5 leading-none bg-zinc-900 border-0",
                          opStatusFilter === filter ? "bg-zinc-950 text-emerald-400 font-bold" : "text-zinc-500"
                        )}>
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-0 px-4 pb-4">
                <ScrollArea className="h-full">
                  {filteredDailyOrders.length > 0 ? (
                    <div className="space-y-3">
                      {filteredDailyOrders.map((order) => {
                        const isActive = ['PENDING', 'IN_PROGRESS', 'READY'].includes(order.status);
                        const isServed = order.status === 'SERVED' && order.paymentStatus !== 'COMPLETED';
                        const isCompleted = order.paymentStatus === 'COMPLETED' || order.status === 'COMPLETED';
                        const isCancelled = order.status === 'CANCELLED';
                        
                        return (
                          <div
                            key={order.id}
                            className={cn(
                              "p-3 rounded-xl border transition-all hover:bg-zinc-850/20 cursor-pointer bg-zinc-800/30",
                              opExpandedOrderId === order.id ? "border-zinc-700/60 bg-zinc-800/50" : "border-zinc-800/60"
                            )}
                            onClick={() => setOpExpandedOrderId(opExpandedOrderId === order.id ? null : order.id)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-zinc-100 text-sm">{order.table.name}</span>
                                  <span className="text-[10px] text-zinc-500">#{order.table.number}</span>
                                  
                                  {/* Badges */}
                                  {isActive && (
                                    <Badge className="bg-amber-600/10 text-amber-400 border border-amber-600/20 text-[9px] px-1.5 py-0 h-4 font-semibold">
                                      {order.status}
                                    </Badge>
                                  )}
                                  {isServed && (
                                    <Badge className="bg-sky-600/10 text-sky-400 border border-sky-600/20 text-[9px] px-1.5 py-0 h-4 font-semibold">
                                      Served (Dining)
                                    </Badge>
                                  )}
                                  {isCompleted && (
                                    <>
                                      <Badge className="bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 text-[9px] px-1.5 py-0 h-4 font-semibold">
                                        Closed
                                      </Badge>
                                      {order.paymentMethod && (
                                        <Badge className={cn(
                                          "text-[9px] px-1.5 py-0 h-4 font-semibold border",
                                          order.paymentMethod === 'CASH' ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20' :
                                          order.paymentMethod === 'CARD' ? 'bg-sky-600/15 text-sky-400 border-sky-500/20' :
                                          'bg-purple-600/15 text-purple-400 border-purple-500/20'
                                        )}>
                                          {order.paymentMethod === 'CASH' ? t.pos.cash :
                                           order.paymentMethod === 'CARD' ? t.pos.card : t.pos.credit}
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                  {isCancelled && (
                                    <Badge className="bg-red-600/10 text-red-400 border border-red-600/20 text-[9px] px-1.5 py-0 h-4 font-semibold">
                                      Cancelled
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5">
                                  <User className="size-3 text-zinc-600" />
                                  Server: <span className="text-zinc-400 font-medium">{order.creator.name}</span>
                                  &middot;
                                  <Clock className="size-3 text-zinc-600" />
                                  {new Date(order.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              
                              <div className="text-right shrink-0 flex items-center gap-2.5">
                                <div>
                                  <p className="text-sm font-bold text-zinc-100">{fmtCurrency(order.totalAmount)}</p>
                                  <p className="text-[9px] text-zinc-500">{order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)</p>
                                </div>
                                <ChevronRight className={cn("size-4 text-zinc-600 transition-transform shrink-0", opExpandedOrderId === order.id && "rotate-90")} />
                              </div>
                            </div>

                            {/* Itemized Expansion Details */}
                            {opExpandedOrderId === order.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2.5 text-xs text-zinc-400"
                                onClick={(e) => e.stopPropagation()} // Stop propagation from collapsing
                              >
                                <div className="font-semibold text-zinc-300">Items Ordered:</div>
                                <div className="space-y-1">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-0.5">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-zinc-500 shrink-0 font-medium">&times;{item.quantity}</span>
                                        <span className="text-zinc-300 truncate">{item.menuItem.name}</span>
                                        {item.status && (
                                          <Badge className={cn("text-[8px] px-1 py-0 h-3.5 leading-none", 
                                            item.status === 'SERVED' ? 'bg-sky-600/10 text-sky-400 border border-sky-600/10' :
                                            item.status === 'READY' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/10' :
                                            item.status === 'PREPARING' ? 'bg-amber-600/10 text-amber-400 border border-amber-600/10' :
                                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                                          )}>
                                            {item.status.toLowerCase()}
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-zinc-400 ml-2">
                                        {fmtCurrency(item.totalPrice)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                {order.notes && (
                                  <div className="text-[10px] text-zinc-500 italic bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                                    <span className="font-semibold text-zinc-400 block not-italic mb-0.5 text-[9px] uppercase tracking-wider">Kitchen Notes</span>
                                    &ldquo;{order.notes}&rdquo;
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : dailyOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-sm mx-auto">
                      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-4 text-zinc-600 animate-pulse">
                        <UtensilsCrossed className="size-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-300">{t.dashboard.serviceNotStartedYet}</h3>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">
                        No checks or daily orders have been opened today (June 1st, 2026).
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-3.5 bg-zinc-950 px-3.5 py-2.5 rounded-lg border border-zinc-900 leading-normal">
                        Tip: Open the <span className="text-emerald-500 font-semibold">POS</span> or <span className="text-emerald-500 font-semibold">Floor Plan</span>, pick an active table, and submit a test order to see it populate here instantly!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                      <div className="p-3.5 rounded-full bg-zinc-900 border border-zinc-800 mb-4 text-zinc-500">
                        <ShoppingCart className="size-7" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-350">{t.dashboard.noMatchingOrdersFound}</p>
                      <p className="text-xs text-zinc-500 mt-1">Try adapting your search query or status filters above.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
