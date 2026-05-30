'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Flame,
  Check,
  ChefHat,
  Wine,
  AlertTriangle,
  Bell,
  UtensilsCrossed,
  ArrowRight,
  Timer,
  Users,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getUrgencyLevel, formatTime } from '@/lib/constants';

/* ─── Types ─── */

type OrderItemStatus = 'PENDING' | 'FIRED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
type ItemStation = 'KITCHEN' | 'BAR';

interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: {
    id: string;
    name: string;
    type: string;
    station: string;
  };
  quantity: number;
  seatNumber: number | null;
  status: OrderItemStatus;
  station: ItemStation;
  notes: string | null;
  firedAt: string | null;
  readyAt: string | null;
  servedAt: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  tableId: string;
  table: {
    id: string;
    number: number;
    name: string;
    section: string;
  };
  createdBy: string;
  creator: {
    id: string;
    name: string;
    role: string;
  };
  status: string;
  type: string;
  guestCount: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Status Config ─── */

const STATUS_CONFIG: Record<OrderItemStatus, { label: string; color: string; bgColor: string; borderColor: string; textColor: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-zinc-500',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/30',
    textColor: 'text-zinc-400',
  },
  FIRED: {
    label: 'Fired',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
  },
  PREPARING: {
    label: 'Prep',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
  },
  READY: {
    label: 'Ready',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
  },
  SERVED: {
    label: 'Served',
    color: 'bg-zinc-600',
    bgColor: 'bg-zinc-600/10',
    borderColor: 'border-zinc-600/30',
    textColor: 'text-zinc-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-600',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/30',
    textColor: 'text-red-400',
  },
};

const STATUS_FLOW: OrderItemStatus[] = ['PENDING', 'FIRED', 'PREPARING', 'READY', 'SERVED'];

function getNextStatus(current: OrderItemStatus): OrderItemStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

/* ─── Urgency helpers ─── */

const URGENCY_BORDER: Record<string, string> = {
  green: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  red: 'border-l-red-500',
};

const URGENCY_BG: Record<string, string> = {
  green: 'bg-emerald-950/20',
  amber: 'bg-amber-950/20',
  red: 'bg-red-950/30',
};

function getElapsedText(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

/* ─── Fetch helpers ─── */

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

async function updateItemStatus(itemId: string, status: OrderItemStatus): Promise<OrderItem> {
  const res = await fetch('/api/orders/items', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, status }),
  });
  if (!res.ok) throw new Error('Failed to update item');
  return res.json();
}

/* ─── Stats Bar ─── */

function StatsBar({ orders, role }: { orders: Order[]; role: UserRole }) {
  const filteredItems = orders.flatMap((o) =>
    o.items.filter(
      (i) =>
        i.status !== 'SERVED' && i.status !== 'CANCELLED' &&
        (role === 'KITCHEN' ? i.station === 'KITCHEN' : role === 'BAR' ? i.station === 'BAR' : true)
    )
  );

  const activeTickets = orders.filter((o) =>
    o.items.some(
      (i) =>
        i.status !== 'SERVED' && i.status !== 'CANCELLED' &&
        (role === 'KITCHEN' ? i.station === 'KITCHEN' : role === 'BAR' ? i.station === 'BAR' : true)
    )
  ).length;

  const itemsPending = filteredItems.filter(
    (i) => i.status === 'PENDING'
  ).length;

  const avgTicketTime =
    activeTickets > 0
      ? Math.round(
          orders
            .filter((o) =>
              o.items.some(
                (i) =>
                  i.status !== 'SERVED' && i.status !== 'CANCELLED' &&
                  (role === 'KITCHEN' ? i.station === 'KITCHEN' : role === 'BAR' ? i.station === 'BAR' : true)
              )
            )
            .reduce((sum, o) => sum + (Date.now() - new Date(o.createdAt).getTime()) / 60000, 0) / activeTickets
        )
      : 0;

  const urgentCount = orders.filter((o) => getUrgencyLevel(o.createdAt) === 'red').length;

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 md:px-4">
        <Bell className="size-4 text-emerald-400" />
        <span className="text-xs text-zinc-500">Active</span>
        <span className="text-lg font-bold text-zinc-100">{activeTickets}</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 md:px-4">
        <Timer className="size-4 text-amber-400" />
        <span className="text-xs text-zinc-500">Avg Time</span>
        <span className="text-lg font-bold text-zinc-100">{avgTicketTime}m</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 md:px-4">
        <UtensilsCrossed className="size-4 text-sky-400" />
        <span className="text-xs text-zinc-500">Pending</span>
        <span className="text-lg font-bold text-zinc-100">{itemsPending}</span>
      </div>
      {urgentCount > 0 && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-500/30 px-3 py-2 md:px-4"
        >
          <AlertTriangle className="size-4 text-red-400" />
          <span className="text-xs text-red-300">Urgent</span>
          <span className="text-lg font-bold text-red-400">{urgentCount}</span>
        </motion.div>
      )}
      <div className="ml-auto flex items-center gap-2 text-xs text-zinc-600">
        <Users className="size-3.5" />
        <span>
          {role === 'KITCHEN' ? 'Kitchen View' : role === 'BAR' ? 'Bar View' : 'All Stations'}
        </span>
      </div>
    </div>
  );
}

/* ─── Order Item Row ─── */

function OrderItemRow({
  item,
  onUpdate,
  updating,
}: {
  item: OrderItem;
  onUpdate: (itemId: string, status: OrderItemStatus) => void;
  updating: boolean;
}) {
  const nextStatus = getNextStatus(item.status);
  const config = STATUS_CONFIG[item.status];

  const nextConfig = nextStatus ? STATUS_CONFIG[nextStatus] : null;

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border p-2 transition-all duration-200',
        item.status === 'SERVED' || item.status === 'CANCELLED'
          ? 'opacity-40 border-zinc-800 bg-zinc-900/30'
          : cn(config.bgColor, config.borderColor)
      )}
    >
      {/* Quantity */}
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-zinc-800 text-sm font-bold text-zinc-200 shrink-0">
        {item.quantity}×
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              item.status === 'SERVED' || item.status === 'CANCELLED'
                ? 'text-zinc-500 line-through'
                : 'text-zinc-100'
            )}
          >
            {item.menuItem.name}
          </span>
          {item.seatNumber && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-400"
            >
              Seat {item.seatNumber}
            </Badge>
          )}
        </div>
        {item.notes && (
          <p className="text-xs text-amber-400/80 mt-0.5 truncate" title={item.notes}>
            ⚠ {item.notes}
          </p>
        )}
      </div>

      {/* Status & Action */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge
          className={cn(
            'text-[10px] font-semibold h-6 px-2 border',
            config.bgColor,
            config.borderColor,
            config.textColor
          )}
          variant="outline"
        >
          {config.label}
        </Badge>

        {nextStatus && nextConfig && (
          <Button
            size="sm"
            onClick={() => onUpdate(item.id, nextStatus)}
            disabled={updating}
            className={cn(
              'h-8 min-w-[48px] text-xs font-semibold gap-1',
              nextStatus === 'FIRED' && 'bg-orange-600 hover:bg-orange-500 text-white',
              nextStatus === 'PREPARING' && 'bg-amber-600 hover:bg-amber-500 text-white',
              nextStatus === 'READY' && 'bg-emerald-600 hover:bg-emerald-500 text-white',
              nextStatus === 'SERVED' && 'bg-zinc-600 hover:bg-zinc-500 text-white'
            )}
          >
            {nextStatus === 'FIRED' && <Flame className="size-3" />}
            {nextStatus === 'PREPARING' && <ChefHat className="size-3" />}
            {nextStatus === 'READY' && <Check className="size-3" />}
            {nextStatus === 'SERVED' && <UtensilsCrossed className="size-3" />}
            <span className="hidden sm:inline">{nextConfig.label}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Order Ticket ─── */

function OrderTicket({
  order,
  onUpdateItem,
  onBump,
  updatingItemId,
}: {
  order: Order;
  onUpdateItem: (itemId: string, status: OrderItemStatus) => void;
  onBump: (orderId: string) => void;
  updatingItemId: string | null;
}) {
  const urgency = getUrgencyLevel(order.createdAt);
  const [, setTick] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const allReady = order.items
    .filter((i) => i.status !== 'CANCELLED')
    .every((i) => i.status === 'READY' || i.status === 'SERVED');

  const allServed = order.items
    .filter((i) => i.status !== 'CANCELLED')
    .every((i) => i.status === 'SERVED');

  if (allServed) return null;

  const hasUnserved = order.items.some(
    (i) => i.status !== 'SERVED' && i.status !== 'CANCELLED'
  );

  if (!hasUnserved) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'w-[320px] md:w-[360px] border-l-4 shrink-0',
          URGENCY_BORDER[urgency],
          URGENCY_BG[urgency],
          urgency === 'red' && 'animate-kds-pulse',
          'bg-zinc-900 border-t border-r border-b border-zinc-800'
        )}
      >
        {/* Ticket Header */}
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                {order.table.name}
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                {order.type === 'DINE_IN' ? 'Dine In' : order.type} · {order.guestCount} guest{order.guestCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="size-3" />
                {formatTime(order.createdAt)}
              </div>
              <div
                className={cn(
                  'text-sm font-mono font-bold mt-0.5',
                  urgency === 'green' && 'text-emerald-400',
                  urgency === 'amber' && 'text-amber-400',
                  urgency === 'red' && 'text-red-400'
                )}
              >
                {getElapsedText(order.createdAt)}
              </div>
            </div>
          </div>

          {/* Urgency indicator */}
          {urgency === 'red' && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
              <AlertTriangle className="size-3" />
              <span className="font-medium">Over 20 minutes!</span>
            </div>
          )}
          {urgency === 'amber' && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
              <Clock className="size-3" />
              <span>Approaching deadline</span>
            </div>
          )}
        </CardHeader>

        <Separator className="bg-zinc-800" />

        {/* Items */}
        <CardContent className="p-3 flex flex-col gap-2 max-h-80 overflow-y-auto custom-scrollbar">
          {order.items
            .filter((i) => i.status !== 'CANCELLED' && i.status !== 'SERVED')
            .sort((a, b) => {
              const statusOrder: Record<string, number> = { PENDING: 0, FIRED: 1, PREPARING: 2, READY: 3 };
              return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
            })
            .map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                onUpdate={onUpdateItem}
                updating={updatingItemId === item.id}
              />
            ))}
        </CardContent>

        {/* BUMP button */}
        {allReady && (
          <div className="p-3 pt-0">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onBump(order.id)}
                className="w-full h-14 text-lg font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:shadow-emerald-600/40 transition-all"
              >
                <Check className="size-5" />
                BUMP
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/* ─── Main Kitchen Display Component ─── */

export function KitchenDisplay() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role as UserRole;
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [flashNewOrder, setFlashNewOrder] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('kitchen');
  const prevOrderCountRef = useRef<number>(0);
  const [, setTick] = useState(0);

  // Role-based station filter
  const showKitchen = role === 'KITCHEN' || role === 'ADMIN' || role === 'MANAGER';
  const showBar = role === 'BAR' || role === 'ADMIN' || role === 'MANAGER';

  // If single role, auto-select tab
  useEffect(() => {
    if (role === 'KITCHEN') setActiveTab('kitchen');
    else if (role === 'BAR') setActiveTab('bar');
  }, [role]);

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders((prev) => {
        // Detect new orders for flash notification
        if (prev.length > 0 && data.length > prevOrderCountRef.current) {
          setFlashNewOrder(true);
          setTimeout(() => setFlashNewOrder(false), 2000);
        }
        prevOrderCountRef.current = data.length;
        return data;
      });
      setError(null);
    } catch {
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Tick every second for elapsed time updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Update item status
  const handleUpdateItem = useCallback(async (itemId: string, status: OrderItemStatus) => {
    setUpdatingItemId(itemId);
    try {
      await updateItemStatus(itemId, status);
      // Optimistic update
      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        }))
      );
    } catch {
      // Revert on error by reloading
      await loadOrders();
    } finally {
      setUpdatingItemId(null);
    }
  }, [loadOrders]);

  // Bump order - mark all READY items as SERVED
  const handleBump = useCallback(async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const readyItems = order.items.filter(
      (i) => i.status === 'READY'
    );

    try {
      await Promise.all(
        readyItems.map((item) => updateItemStatus(item.id, 'SERVED'))
      );
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            items: o.items.map((item) =>
              item.status === 'READY' ? { ...item, status: 'SERVED' as OrderItemStatus } : item
            ),
          };
        })
      );
    } catch {
      await loadOrders();
    }
  }, [orders, loadOrders]);

  // Filter orders by station
  const kitchenOrders = orders
    .filter((o) => o.items.some((i) => i.station === 'KITCHEN' && i.status !== 'SERVED' && i.status !== 'CANCELLED'))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const barOrders = orders
    .filter((o) => o.items.some((i) => i.station === 'BAR' && i.status !== 'SERVED' && i.status !== 'CANCELLED'))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Determine which orders to show based on role + tab
  const getVisibleOrders = (): Order[] => {
    if (role === 'KITCHEN') return kitchenOrders;
    if (role === 'BAR') return barOrders;
    if (activeTab === 'kitchen') return kitchenOrders;
    if (activeTab === 'bar') return barOrders;
    return kitchenOrders;
  };

  const visibleOrders = getVisibleOrders();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="outline" onClick={loadOrders}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Flash notification for new orders */}
      <AnimatePresence>
        {flashNewOrder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg shadow-emerald-600/30"
          >
            <Bell className="size-5 animate-bounce" />
            <span className="text-sm font-semibold">New Order!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <StatsBar orders={orders} role={role} />

      {/* Tab Navigation — only show for ADMIN/MANAGER who can see both */}
      {showKitchen && showBar ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-3">
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="kitchen" className="gap-1.5 data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-400">
                <ChefHat className="size-4" />
                Kitchen
                {kitchenOrders.length > 0 && (
                  <Badge className="ml-1 bg-orange-600/20 text-orange-400 border-orange-500/30 text-[10px] h-4 px-1.5">
                    {kitchenOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bar" className="gap-1.5 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                <Wine className="size-4" />
                Bar
                {barOrders.length > 0 && (
                  <Badge className="ml-1 bg-purple-600/20 text-purple-400 border-purple-500/30 text-[10px] h-4 px-1.5">
                    {barOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Side-by-side toggle for wide screens */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'all' ? 'kitchen' : 'all')}
              className={cn(
                'text-xs gap-1',
                activeTab === 'all' && 'bg-zinc-800 text-emerald-400'
              )}
            >
              {activeTab === 'all' ? 'Split View' : 'Split View'}
            </Button>
          </div>

          {/* All — Side by side on wide screens */}
          {activeTab === 'all' ? (
            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden mt-2">
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="size-5 text-orange-400" />
                  <h3 className="text-sm font-semibold text-orange-400">Kitchen Orders</h3>
                  <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
                    {kitchenOrders.length}
                  </Badge>
                </div>
                <ScrollArea className="flex-1">
                  <div className="flex flex-wrap gap-3 pb-4">
                    {kitchenOrders.length === 0 ? (
                      <EmptyState station="kitchen" />
                    ) : (
                      kitchenOrders.map((order) => (
                        <OrderTicket
                          key={order.id}
                          order={order}
                          onUpdateItem={handleUpdateItem}
                          onBump={handleBump}
                          updatingItemId={updatingItemId}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
              <Separator orientation="vertical" className="bg-zinc-800" />
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <Wine className="size-5 text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-400">Bar Orders</h3>
                  <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                    {barOrders.length}
                  </Badge>
                </div>
                <ScrollArea className="flex-1">
                  <div className="flex flex-wrap gap-3 pb-4">
                    {barOrders.length === 0 ? (
                      <EmptyState station="bar" />
                    ) : (
                      barOrders.map((order) => (
                        <OrderTicket
                          key={order.id}
                          order={order}
                          onUpdateItem={handleUpdateItem}
                          onBump={handleBump}
                          updatingItemId={updatingItemId}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="kitchen" className="flex-1 min-h-0 mt-2">
                <ScrollArea className="h-full">
                  <div className="flex flex-wrap gap-3 pb-4">
                    {kitchenOrders.length === 0 ? (
                      <EmptyState station="kitchen" />
                    ) : (
                      kitchenOrders.map((order) => (
                        <OrderTicket
                          key={order.id}
                          order={order}
                          onUpdateItem={handleUpdateItem}
                          onBump={handleBump}
                          updatingItemId={updatingItemId}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="bar" className="flex-1 min-h-0 mt-2">
                <ScrollArea className="h-full">
                  <div className="flex flex-wrap gap-3 pb-4">
                    {barOrders.length === 0 ? (
                      <EmptyState station="bar" />
                    ) : (
                      barOrders.map((order) => (
                        <OrderTicket
                          key={order.id}
                          order={order}
                          onUpdateItem={handleUpdateItem}
                          onBump={handleBump}
                          updatingItemId={updatingItemId}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </Tabs>
      ) : (
        /* Single-station view for KITCHEN or BAR role */
        <ScrollArea className="flex-1">
          <div className="flex flex-wrap gap-3 pb-4">
            {visibleOrders.length === 0 ? (
              <EmptyState station={role === 'KITCHEN' ? 'kitchen' : 'bar'} />
            ) : (
              visibleOrders.map((order) => (
                <OrderTicket
                  key={order.id}
                  order={order}
                  onUpdateItem={handleUpdateItem}
                  onBump={handleBump}
                  updatingItemId={updatingItemId}
                />
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

/* ─── Empty State ─── */

function EmptyState({ station }: { station: 'kitchen' | 'bar' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 w-full text-center">
      <div
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
          station === 'kitchen' ? 'bg-orange-600/10' : 'bg-purple-600/10'
        )}
      >
        {station === 'kitchen' ? (
          <ChefHat className="size-8 text-orange-400/50" />
        ) : (
          <Wine className="size-8 text-purple-400/50" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-zinc-400 mb-1">
        No {station} orders
      </h3>
      <p className="text-sm text-zinc-600 max-w-xs">
        Active {station} orders will appear here. Hang tight!
      </p>
    </div>
  );
}

export default KitchenDisplay;
