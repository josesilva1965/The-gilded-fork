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
  Search,
  LayoutGrid,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale } from '@/stores/locale-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getUrgencyLevel } from '@/lib/constants';
import { formatTimeByLocale } from '@/lib/i18n/locales';
import { getSocket } from '@/lib/socket';

/* ─── Types ─── */

type OrderItemStatus = 'PENDING' | 'FIRED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
type ItemStation = 'KITCHEN' | 'BAR';

interface ProductionStats {
  day: { kitchen: number; bar: number };
  week: { kitchen: number; bar: number };
  month: { kitchen: number; bar: number };
}

interface OrderItem {
  id: string;
  orderId?: string;
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
  extras?: {
    id: string;
    name: string;
    price: number;
  }[];
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

function StatsBar({ 
  orders, 
  role, 
  productionStats,
  activeTab,
  onOpenDetails
}: { 
  orders: Order[]; 
  role: UserRole; 
  productionStats: ProductionStats | null;
  activeTab: string;
  onOpenDetails: (period: 'day' | 'week' | 'month') => void;
}) {
  const t = useT();
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

  const isKitchenView = role === 'KITCHEN' || (role !== 'BAR' && activeTab === 'kitchen');
  const stationKey = isKitchenView ? 'kitchen' : 'bar';
  const stationName = isKitchenView ? t.kds.kitchenDisplay : t.kds.barDisplay;
  
  const todayCount = productionStats ? productionStats.day[stationKey] : 0;
  const weekCount = productionStats ? productionStats.week[stationKey] : 0;
  const monthCount = productionStats ? productionStats.month[stationKey] : 0;

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 md:px-4">
        <Bell className="size-4 text-emerald-400" />
        <span className="text-xs text-zinc-500">{t.common.active}</span>
        <span className="text-lg font-bold text-zinc-100">{activeTickets}</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 md:px-4">
        <Timer className="size-4 text-amber-400" />
        <span className="text-xs text-zinc-500">{t.kds.elapsed}</span>
        <span className="text-lg font-bold text-zinc-100">{avgTicketTime}m</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 md:px-4">
        <UtensilsCrossed className="size-4 text-sky-400" />
        <span className="text-xs text-zinc-500">{t.common.pending}</span>
        <span className="text-lg font-bold text-zinc-100">{itemsPending}</span>
      </div>
      
      {productionStats && (
        <div className="flex items-center gap-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850 px-3 py-2 text-xs font-semibold text-zinc-300 shadow-sm">
          <ChefHat className="size-3.5 text-emerald-400 shrink-0" />
          <span>{t.kds.produced} ({stationName}):</span>
          <button
            onClick={() => onOpenDetails('day')}
            className="text-zinc-100 font-bold bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 px-2 py-0.5 rounded shadow-inner cursor-pointer transition-colors"
          >
            {todayCount} {t.kds.today}
          </button>
          <button
            onClick={() => onOpenDetails('week')}
            className="text-zinc-400 hover:text-zinc-350 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 px-2 py-0.5 rounded shadow-inner cursor-pointer transition-colors"
          >
            {weekCount} {t.kds.week}
          </button>
          <button
            onClick={() => onOpenDetails('month')}
            className="text-zinc-400 hover:text-zinc-350 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 px-2 py-0.5 rounded shadow-inner cursor-pointer transition-colors"
          >
            {monthCount} {t.kds.month}
          </button>
        </div>
      )}

      {urgentCount > 0 && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-500/30 px-3 py-2 md:px-4"
        >
          <AlertTriangle className="size-4 text-red-400" />
          <span className="text-xs text-red-300">!</span>
          <span className="text-lg font-bold text-red-400">{urgentCount}</span>
        </motion.div>
      )}
      <div className="ml-auto flex items-center gap-2 text-xs text-zinc-600">
        <Users className="size-3.5" />
        <span>
          {role === 'KITCHEN' ? t.kds.kitchenDisplay : role === 'BAR' ? t.kds.barDisplay : t.kds.allStations}
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
  const t = useT();
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
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-zinc-800 text-sm font-bold text-zinc-200 shrink-0">
        {item.quantity}×
      </div>

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
              {t.pos.seat} {item.seatNumber}
            </Badge>
          )}
        </div>
        {item.extras && item.extras.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.extras.map((ext) => (
              <Badge
                key={ext.id}
                variant="outline"
                className="text-[10px] bg-zinc-800/40 text-zinc-300 border-zinc-700/60 font-medium px-1.5 py-0"
              >
                + {ext.name}
              </Badge>
            ))}
          </div>
        )}
        {item.notes && (
          <p className="text-xs text-amber-400/80 mt-0.5 truncate" title={item.notes}>
            ⚠ {item.notes}
          </p>
        )}
      </div>

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
  const t = useT();
  const locale = useLocale();
  const urgency = getUrgencyLevel(order.createdAt);
  const [, setTick] = useState(0);

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
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                {order.table.name}
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                {order.type === 'DINE_IN' ? t.floorPlan.statusSeated : order.type} · {order.guestCount} {order.guestCount !== 1 ? t.floorPlan.guests : t.floorPlan.guest}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="size-3" />
                {formatTimeByLocale(order.createdAt, locale)}
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

          {urgency === 'red' && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
              <AlertTriangle className="size-3" />
              <span className="font-medium">20+ {t.kds.minutes}!</span>
            </div>
          )}
          {urgency === 'amber' && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
              <Clock className="size-3" />
              <span>{t.kds.elapsed}...</span>
            </div>
          )}
        </CardHeader>

        <Separator className="bg-zinc-800" />

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

/* ─── Synthesized Ready Chime ─── */
function playReadyChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25;
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Tone 2: E5 (659.25 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 659.25;
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);
    
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (err) {
    console.error('Failed to play ready chime:', err);
  }
}

/* ─── Synthesized New Ticket Alert Beep ─── */
function playNewTicketChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First high beep: A5 (880 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.value = 880;
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Second high beep: A5 (880 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = 880;
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.18);
    gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.21);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.33);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    
    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 0.38);
  } catch (err) {
    console.error('Failed to play new ticket chime:', err);
  }
}

/* ─── Kanban Card Component ─── */
function KanbanCard({
  item,
  onUpdateItem,
  onDragStart,
  updating,
}: {
  item: OrderItem & { tableName: string; orderCreatedAt: string; orderId: string };
  onUpdateItem: (itemId: string, status: OrderItemStatus) => void;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  updating: boolean;
}) {
  const t = useT();
  const nextStatus = getNextStatus(item.status);
  const nextConfig = nextStatus ? STATUS_CONFIG[nextStatus] : null;
  const urgency = getUrgencyLevel(item.createdAt);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      className={cn(
        'group cursor-grab active:cursor-grabbing select-none',
        'flex flex-col gap-2 rounded-xl border p-3.5 transition-all duration-200',
        'bg-zinc-900 border-zinc-800 hover:border-zinc-700/80 shadow-md',
        urgency === 'red' && 'border-l-4 border-l-red-500 bg-red-950/5',
        urgency === 'amber' && 'border-l-4 border-l-amber-500 bg-amber-950/5',
        urgency === 'green' && 'border-l-4 border-l-emerald-500 bg-emerald-950/5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-zinc-100">
            {item.quantity}×
          </span>
          <span className="text-sm font-semibold text-zinc-200">
            {item.menuItem.name}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-400 bg-zinc-950/50">
          {item.tableName}
        </Badge>
      </div>

      {item.extras && item.extras.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {item.extras.map((ext) => (
            <Badge
              key={ext.id}
              variant="outline"
              className="text-[9px] bg-zinc-800/45 text-zinc-350 border-zinc-750 font-medium px-1 py-0"
            >
              + {ext.name}
            </Badge>
          ))}
        </div>
      )}

      {item.notes && (
        <div className="flex items-start gap-1 rounded bg-amber-500/5 border border-amber-500/10 p-1.5 text-xs text-amber-405 font-medium leading-relaxed">
          <span>⚠</span>
          <span className="break-words">{item.notes}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-1 border-t border-zinc-850 pt-2 text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>{getElapsedText(item.createdAt)}</span>
        </div>
        {item.seatNumber && (
          <span>
            {t.pos.seat} {item.seatNumber}
          </span>
        )}
      </div>

      {nextStatus && nextConfig && (
        <div className="mt-1">
          <Button
            size="sm"
            onClick={() => onUpdateItem(item.id, nextStatus)}
            disabled={updating}
            className={cn(
              'w-full h-8 text-xs font-bold gap-1 mt-1 cursor-pointer transition-colors',
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
            <span>
              {nextStatus === 'FIRED' && 'Fire'}
              {nextStatus === 'PREPARING' && 'Start Prep'}
              {nextStatus === 'READY' && 'Mark Ready'}
              {nextStatus === 'SERVED' && 'Serve'}
            </span>
            <ArrowRight className="size-3 ml-auto opacity-60" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Kitchen Display Component ─── */

export function KitchenDisplay() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role as UserRole;
  const t = useT();
  const locale = useLocale();

  interface PreparedItem {
    id: string;
    name: string;
    quantity: number;
    station: ItemStation;
    preparedAt: string;
    tableName: string;
  }

  const [productionStats, setProductionStats] = useState<{
    day: { kitchen: number; bar: number };
    week: { kitchen: number; bar: number };
    month: { kitchen: number; bar: number };
  } | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsPeriod, setDetailsPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [preparedItemsList, setPreparedItemsList] = useState<PreparedItem[]>([]);
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('');
  const [detailsViewMode, setDetailsViewMode] = useState<'grouped' | 'log'>('grouped');

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [flashNewOrder, setFlashNewOrder] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('kitchen');
  const prevOrderCountRef = useRef<number>(0);
  const [, setTick] = useState(0);

  // Kanban and Web Audio Chimes State
  const [viewMode, setViewMode] = useState<'tickets' | 'kanban'>('tickets');
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const knownReadyItemIdsRef = useRef<Set<string>>(new Set());
  const [activeAlertItem, setActiveAlertItem] = useState<{
    id: string;
    name: string;
    quantity: number;
    tableName: string;
    station: ItemStation;
  } | null>(null);

  // Sync effect to detect new READY items and trigger chime and banner
  useEffect(() => {
    if (orders.length === 0) return;

    const currentReadyItems = orders.flatMap(o =>
      o.items
        .filter(i => i.status === 'READY')
        .map(i => ({
          id: i.id,
          name: i.menuItem.name,
          quantity: i.quantity,
          tableName: o.table.name,
          station: i.station
        }))
    );

    let playsChime = false;
    let newReadyItemToShow: {
      id: string;
      name: string;
      quantity: number;
      tableName: string;
      station: ItemStation;
    } | null = null;

    currentReadyItems.forEach(item => {
      if (!knownReadyItemIdsRef.current.has(item.id)) {
        knownReadyItemIdsRef.current.add(item.id);
        playsChime = true;
        newReadyItemToShow = item;
      }
    });

    const currentReadyIds = new Set(currentReadyItems.map(item => item.id));
    knownReadyItemIdsRef.current.forEach(id => {
      if (!currentReadyIds.has(id)) {
        knownReadyItemIdsRef.current.delete(id);
      }
    });

    if (playsChime) {
      playReadyChime();
      if (newReadyItemToShow) {
        setActiveAlertItem(newReadyItemToShow);
      }
    }
  }, [orders]);

  useEffect(() => {
    if (activeAlertItem) {
      const timer = setTimeout(() => {
        setActiveAlertItem(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeAlertItem]);

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: OrderItemStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const itemId = e.dataTransfer.getData('text/plain');
    if (!itemId) return;

    await handleUpdateItem(itemId, targetStatus);
  };

  const getKanbanItems = (station: string) => {
    return orders.flatMap(order => 
      order.items.map(item => ({
        ...item,
        tableName: order.table.name,
        orderCreatedAt: order.createdAt,
        orderId: order.id
      }))
    ).filter(item => {
      if (item.status === 'SERVED' || item.status === 'CANCELLED') return false;
      
      const matchesStation = 
        station === 'all' ? true :
        station === 'kitchen' ? item.station === 'KITCHEN' :
        station === 'bar' ? item.station === 'BAR' :
        true;
      
      return matchesStation;
    });
  };

  const renderKanbanBoard = (station: string) => {
    const items = getKanbanItems(station);
    const queuedItems = items.filter(i => i.status === 'PENDING' || i.status === 'FIRED');
    const preparingItems = items.filter(i => i.status === 'PREPARING');
    const readyItems = items.filter(i => i.status === 'READY');

    const columns = [
      {
        id: 'queued' as const,
        title: t.kds.queued || 'Queued',
        items: queuedItems,
        targetStatus: 'FIRED' as OrderItemStatus,
        color: 'border-t-orange-500 bg-orange-950/5 border-orange-500/10',
        headerColor: 'text-orange-400'
      },
      {
        id: 'preparing' as const,
        title: t.kds.preparing || 'Preparing',
        items: preparingItems,
        targetStatus: 'PREPARING' as OrderItemStatus,
        color: 'border-t-amber-500 bg-amber-950/5 border-amber-500/10',
        headerColor: 'text-amber-400'
      },
      {
        id: 'ready' as const,
        title: t.kds.ready || 'Ready',
        items: readyItems,
        targetStatus: 'READY' as OrderItemStatus,
        color: 'border-t-emerald-500 bg-emerald-950/5 border-emerald-500/10',
        headerColor: 'text-emerald-400'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-250px)] min-h-[400px]">
        {columns.map((col) => {
          const isOver = draggedOverColumn === col.id;
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.targetStatus)}
              className={cn(
                "flex flex-col rounded-xl border border-zinc-800 border-t-4 p-3 transition-all duration-200",
                col.color,
                isOver ? "border-zinc-500 ring-2 ring-zinc-500/20 scale-[1.01]" : ""
              )}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className={cn("font-bold text-sm", col.headerColor)}>
                  {col.title}
                </h3>
                <Badge variant="outline" className="text-zinc-400 border-zinc-800 text-[10px]">
                  {col.items.length}
                </Badge>
              </div>

              <ScrollArea className="flex-1 pr-1">
                <div className="flex flex-col gap-2 pb-4">
                  {col.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-zinc-500 font-medium">
                      <span>No items in this stage</span>
                    </div>
                  ) : (
                    col.items.map((item) => (
                      <KanbanCard
                        key={item.id}
                        item={item}
                        onUpdateItem={handleUpdateItem}
                        onDragStart={handleDragStart}
                        updating={updatingItemId === item.id}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    );
  };

  const showKitchen = role === 'KITCHEN' || role === 'ADMIN' || role === 'MANAGER';
  const showBar = role === 'BAR' || role === 'ADMIN' || role === 'MANAGER';

  useEffect(() => {
    if (role === 'KITCHEN') setActiveTab('kitchen');
    else if (role === 'BAR') setActiveTab('bar');
  }, [role]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders((prev) => {
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

  const loadProductionStats = useCallback(async () => {
    try {
      const res = await fetch('/api/kds/production');
      if (res.ok) {
        const data = await res.json();
        setProductionStats(data);
        setPreparedItemsList(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load KDS production stats:', err);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadProductionStats();
    const interval = setInterval(() => {
        loadOrders();
        loadProductionStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadOrders, loadProductionStats]);

  // Listen for real-time WebSocket events to update KDS instantly
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewTicket = () => {
      // Trigger new ticket sound alert
      playNewTicketChime();
      // Reload orders and stats
      loadOrders();
      loadProductionStats();
    };

    const handleUpdate = () => {
      loadOrders();
      loadProductionStats();
    };

    socket.on('kitchen:new-ticket', handleNewTicket);
    socket.on('bar:new-ticket', handleNewTicket);
    socket.on('order:updated', handleUpdate);
    socket.on('order:item-updated', handleUpdate);
    socket.on('kitchen:item-updated', handleUpdate);
    socket.on('bar:item-updated', handleUpdate);
    socket.on('table:status-updated', handleUpdate);

    return () => {
      socket.off('kitchen:new-ticket', handleNewTicket);
      socket.off('bar:new-ticket', handleNewTicket);
      socket.off('order:updated', handleUpdate);
      socket.off('order:item-updated', handleUpdate);
      socket.off('kitchen:item-updated', handleUpdate);
      socket.off('bar:item-updated', handleUpdate);
      socket.off('table:status-updated', handleUpdate);
    };
  }, [loadOrders, loadProductionStats]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateItem = useCallback(async (itemId: string, status: OrderItemStatus) => {
    setUpdatingItemId(itemId);
    try {
      const updatedItem = await updateItemStatus(itemId, status);

      // Emit socket event to notify other clients
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('order:item-status-change', {
          orderId: updatedItem.orderId,
          itemId: updatedItem.id,
          status: updatedItem.status,
          station: updatedItem.station,
        });
      }

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        }))
      );
    } catch {
      await loadOrders();
    } finally {
      setUpdatingItemId(null);
    }
  }, [loadOrders]);

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

      // Emit socket event for each bumped item
      const socket = getSocket();
      if (socket?.connected) {
        readyItems.forEach((item) => {
          socket.emit('order:item-status-change', {
            orderId,
            itemId: item.id,
            status: 'SERVED',
            station: item.station,
          });
        });
      }

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

  const kitchenOrders = orders
    .filter((o) => o.items.some((i) => i.station === 'KITCHEN' && i.status !== 'SERVED' && i.status !== 'CANCELLED'))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const barOrders = orders
    .filter((o) => o.items.some((i) => i.station === 'BAR' && i.status !== 'SERVED' && i.status !== 'CANCELLED'))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getVisibleOrders = (): Order[] => {
    if (role === 'KITCHEN') return kitchenOrders;
    if (role === 'BAR') return barOrders;
    if (activeTab === 'kitchen') return kitchenOrders;
    if (activeTab === 'bar') return barOrders;
    return kitchenOrders;
  };

  const visibleOrders = getVisibleOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="outline" onClick={loadOrders}>
            {t.common.retry}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Ready Alert Flash Banner */}
      <AnimatePresence>
        {activeAlertItem && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-zinc-950/95 border border-emerald-500/40 text-emerald-100 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[320px] max-w-[450px]"
          >
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <Check className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400/80 block">
                {activeAlertItem.station === 'KITCHEN' ? t.kds.kitchenDisplay : t.kds.barDisplay}
              </span>
              <p className="text-sm font-bold text-zinc-100 truncate mt-0.5">
                {activeAlertItem.quantity}x {activeAlertItem.name}
              </p>
              <p className="text-xs text-emerald-300/80 font-medium">
                {t.pos.table || 'Table'} {activeAlertItem.tableName}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveAlertItem(null)}
              className="h-8 px-2 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 cursor-pointer text-xs"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flashNewOrder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg shadow-emerald-600/30"
          >
            <Bell className="size-5 animate-bounce" />
            <span className="text-sm font-semibold">{t.pos.newOrder}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <StatsBar 
        orders={orders} 
        role={role} 
        productionStats={productionStats} 
        activeTab={activeTab} 
        onOpenDetails={(period) => {
          setDetailsPeriod(period);
          setIsDetailsOpen(true);
        }}
      />

      {showKitchen && showBar ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-3">
              <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="kitchen" className="gap-1.5 data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-400">
                  <ChefHat className="size-4" />
                  {t.kds.kitchenDisplay}
                  {kitchenOrders.length > 0 && (
                    <Badge className="ml-1 bg-orange-600/20 text-orange-400 border-orange-500/30 text-[10px] h-4 px-1.5">
                      {kitchenOrders.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="bar" className="gap-1.5 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                  <Wine className="size-4" />
                  {t.kds.barDisplay}
                  {barOrders.length > 0 && (
                    <Badge className="ml-1 bg-purple-600/20 text-purple-400 border-purple-500/30 text-[10px] h-4 px-1.5">
                      {barOrders.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
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

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('tickets')}
                className={cn(
                  'text-xs h-8 px-3 gap-1.5 font-semibold transition-all',
                  viewMode === 'tickets' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <Clock className="size-3.5" />
                {t.kds.activeTickets}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'text-xs h-8 px-3 gap-1.5 font-semibold transition-all',
                  viewMode === 'kanban' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <LayoutGrid className="size-3.5" />
                {t.kds.kanbanBoard}
              </Button>
            </div>
          </div>

          {viewMode === 'kanban' ? (
            <div className="flex-1 min-h-0 mt-1">
              {renderKanbanBoard(activeTab)}
            </div>
          ) : activeTab === 'all' ? (
            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden mt-2">
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="size-5 text-orange-400" />
                  <h3 className="text-sm font-semibold text-orange-400">{t.kds.kitchenDisplay}</h3>
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
                  <h3 className="text-sm font-semibold text-purple-400">{t.kds.barDisplay}</h3>
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
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ChefHat className="size-5 text-zinc-400" />
              <h2 className="text-sm font-bold text-zinc-300">
                {role === 'KITCHEN' ? t.kds.kitchenDisplay : t.kds.barDisplay}
              </h2>
            </div>

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('tickets')}
                className={cn(
                  'text-xs h-8 px-3 gap-1.5 font-semibold transition-all',
                  viewMode === 'tickets' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <Clock className="size-3.5" />
                {t.kds.activeTickets}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'text-xs h-8 px-3 gap-1.5 font-semibold transition-all',
                  viewMode === 'kanban' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <LayoutGrid className="size-3.5" />
                {t.kds.kanbanBoard}
              </Button>
            </div>
          </div>

          {viewMode === 'kanban' ? (
            <div className="flex-1 min-h-0">
              {renderKanbanBoard(role === 'KITCHEN' ? 'kitchen' : 'bar')}
            </div>
          ) : (
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
      )}

      {(() => {
        const isKitchenView = role === 'KITCHEN' || (role !== 'BAR' && activeTab === 'kitchen');
        const isBarView = role === 'BAR' || (role !== 'KITCHEN' && activeTab === 'bar');

        const filteredPreparedItems = preparedItemsList.filter((item) => {
          const matchesStation = 
            isKitchenView ? item.station === 'KITCHEN' :
            isBarView ? item.station === 'BAR' :
            true;
          if (!matchesStation) return false;

          const itemDate = new Date(item.preparedAt);
          const now = new Date();
          let matchesPeriod = false;
          if (detailsPeriod === 'day') {
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            matchesPeriod = itemDate >= todayStart;
          } else if (detailsPeriod === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - 7);
            matchesPeriod = itemDate >= weekStart;
          } else if (detailsPeriod === 'month') {
            const monthStart = new Date(now);
            monthStart.setDate(monthStart.getDate() - 30);
            matchesPeriod = itemDate >= monthStart;
          }
          if (!matchesPeriod) return false;

          if (detailsSearchQuery.trim()) {
            const query = detailsSearchQuery.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(query);
            const matchesTable = item.tableName.toLowerCase().includes(query);
            if (!matchesName && !matchesTable) return false;
          }

          return true;
        });

        const groupedItems = filteredPreparedItems.reduce((acc: Record<string, { name: string; quantity: number; station: 'KITCHEN' | 'BAR' }>, item) => {
          const key = item.name;
          if (!acc[key]) {
            acc[key] = {
              name: item.name,
              quantity: 0,
              station: item.station
            };
          }
          acc[key].quantity += item.quantity;
          return acc;
        }, {});

        const groupedItemsList = Object.values(groupedItems).sort((a, b) => b.quantity - a.quantity);
        const chronologicalLogList = [...filteredPreparedItems].sort((a, b) => new Date(b.preparedAt).getTime() - new Date(a.preparedAt).getTime());

        return (
          <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <SheetContent side="right" className="w-[100vw] sm:w-[500px] border-zinc-800 bg-zinc-950/95 backdrop-blur-md text-zinc-100 flex flex-col h-full p-6 shadow-2xl">
              <SheetHeader className="space-y-1.5 pb-4 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <ChefHat className="size-5 text-emerald-400" />
                  <SheetTitle className="text-xl font-bold tracking-tight text-zinc-100">
                    {t.kds.productionDetails}
                  </SheetTitle>
                </div>
                <SheetDescription className="text-xs text-zinc-400">
                  {isKitchenView 
                    ? (t.kds.kitchenDisplay || 'Kitchen') 
                    : isBarView 
                      ? (t.kds.barDisplay || 'Bar') 
                      : (t.kds.allStations || 'All Stations')}
                  {' · '}
                  {detailsPeriod === 'day' 
                    ? t.kds.today 
                    : detailsPeriod === 'week' 
                      ? t.kds.week 
                      : t.kds.month}
                </SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-4 shrink-0 border-b border-zinc-850">
                <div className="flex items-center gap-1 rounded-lg bg-zinc-900/60 p-1 border border-zinc-850">
                  {(['day', 'week', 'month'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setDetailsPeriod(period)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                        detailsPeriod === period
                          ? "bg-zinc-800 text-zinc-100 shadow"
                          : "text-zinc-400 hover:text-zinc-250"
                      )}
                    >
                      {period === 'day' ? t.kds.today : period === 'week' ? t.kds.week : t.kds.month}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-550" />
                  <Input
                    value={detailsSearchQuery}
                    onChange={(e) => setDetailsSearchQuery(e.target.value)}
                    placeholder={t.kds.searchItems || "Search items..."}
                    className="w-full bg-zinc-900/40 border-zinc-800/80 focus:border-zinc-700/80 focus:ring-emerald-500/20 pl-9 text-sm text-zinc-105 placeholder:text-zinc-550 rounded-xl"
                  />
                </div>

                <Tabs 
                  value={detailsViewMode} 
                  onValueChange={(val) => setDetailsViewMode(val as 'grouped' | 'log')}
                  className="w-full"
                >
                  <TabsList className="w-full bg-zinc-900/60 border border-zinc-850 grid grid-cols-2">
                    <TabsTrigger value="grouped" className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-105">
                      {t.kds.groupedSummary || 'Grouped Summary'}
                    </TabsTrigger>
                    <TabsTrigger value="log" className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-105">
                      {t.kds.chronologicalLog || 'Chronological Log'}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="flex-1 -mx-6 px-6 py-4">
                {detailsViewMode === 'grouped' ? (
                  groupedItemsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-zinc-550 font-medium">
                      <ChefHat className="size-8 text-zinc-750 mb-3 animate-pulse" />
                      <span>{t.kds.noItemsPrepared || 'No items prepared in this period'}</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {groupedItemsList.map((item) => (
                        <div 
                          key={item.name}
                          className="flex items-center justify-between p-3 rounded-xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/45 hover:border-zinc-850 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg shrink-0",
                              item.station === 'KITCHEN' ? "bg-orange-950/30 text-orange-400 border border-orange-500/10" : "bg-purple-950/30 text-purple-400 border border-purple-500/10"
                            )}>
                              {item.station === 'KITCHEN' ? <ChefHat className="size-4" /> : <Wine className="size-4" />}
                            </div>
                            <span className="text-sm font-semibold text-zinc-200">{item.name}</span>
                          </div>
                          <Badge className="bg-zinc-900 hover:bg-zinc-900 border-zinc-800 text-zinc-300 text-xs font-extrabold px-2.5 py-0.5 rounded-md shadow-inner">
                            {t.kds.qty || 'Qty'}: {item.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  chronologicalLogList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-zinc-550 font-medium">
                      <Clock className="size-8 text-zinc-750 mb-3 animate-pulse" />
                      <span>{t.kds.noItemsPrepared || 'No items prepared in this period'}</span>
                    </div>
                  ) : (
                    <div className="relative border-l border-zinc-850 pl-4 ml-3.5 space-y-5">
                      {chronologicalLogList.map((item) => {
                        const timeStr = formatTimeByLocale(item.preparedAt, locale);
                        return (
                          <div key={item.id} className="relative">
                            <div className={cn(
                              "absolute -left-[25px] top-1.5 size-4 rounded-full border-2 border-zinc-950 flex items-center justify-center shrink-0 shadow-sm",
                              item.station === 'KITCHEN' ? "bg-orange-500" : "bg-purple-500"
                            )}>
                              <div className="size-1 bg-white rounded-full" />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-500 font-mono">{timeStr}</span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-800 text-zinc-400 font-bold bg-zinc-900/30">
                                  {item.tableName}
                                </Badge>
                              </div>
                              <div className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">{item.quantity}×</span>
                                <span>{item.name}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>
        );
      })()}
    </div>
  );
}

/* ─── Empty State ─── */

function EmptyState({ station }: { station: 'kitchen' | 'bar' }) {
  const t = useT();
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
        {t.kds.noTickets} — {station === 'kitchen' ? t.kds.kitchenDisplay : t.kds.barDisplay}
      </h3>
      <p className="text-sm text-zinc-600 max-w-xs">
        {t.kds.allCaughtUp}
      </p>
    </div>
  );
}

export default KitchenDisplay;
