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
} from 'lucide-react';
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

  useEffect(() => {
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboard(false)}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
        >
          <RefreshCw className="size-3.5" />
          {t.common.refresh}
        </Button>
      </div>

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

        {/* Top Selling Items - Horizontal Bar */}
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

      {/* Bottom Row: Activity + Pie + Inventory Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Recent Activity Feed */}
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

        {/* Labor vs Revenue Pie */}
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
    </div>
  );
}
