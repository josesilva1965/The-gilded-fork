'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  Trash2,
  Send,
  Split,
  Clock,
  ChefHat,
  Wine,
  Star,
  Search,
  ShoppingBag,
  UtensilsCrossed,
  Salad,
  Cake,
  Coffee,
  Beer,
  CircleDot,
  Flame,
  Pause,
  XCircle,
  ChevronDown,
  ChevronUp,
  Users,
  MessageSquare,
  Receipt,
  Eye,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale, useLocaleConfig } from '@/stores/locale-store';
import { formatCurrencyByLocale, getTaxRate } from '@/lib/i18n/locales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getUrgencyLevel } from '@/lib/constants';

/* ─── Types ─── */

interface MenuItemData {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  station: string;
  prepTime: number;
  isAvailable: boolean;
  isPopular: boolean;
  allergies: string | null;
  spiceLevel: number;
}

interface MenuCategoryData {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  active: boolean;
  items: MenuItemData[];
}

interface TableData {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: string;
  section: string;
}

interface OrderItemDraft {
  tempId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  seatNumber: number;
  station: string;
  notes: string;
}

interface ActiveOrderItem {
  id: string;
  menuItemId: string;
  menuItem: { name: string; price: number; station: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  seatNumber: number | null;
  status: string;
  station: string;
  notes: string | null;
}

interface ActiveOrderData {
  id: string;
  tableId: string;
  status: string;
  type: string;
  guestCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  table: { id: string; number: number; name: string };
  creator: { id: string; name: string; role: string };
  items: ActiveOrderItem[];
}

/* ─── Category Icon Map ─── */

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Salad,
  UtensilsCrossed,
  Cake,
  Wine,
  Beer,
  Coffee,
  CircleDot,
};

/* ─── Station Badge Colors ─── */

function StationBadge({ station, t }: { station: string; t: any }) {
  if (station === 'BAR') {
    return (
      <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-[10px] px-1.5 py-0 h-5 font-medium">
        <Wine className="size-3 mr-0.5" />
        {t.pos.stationBar}
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30 text-[10px] px-1.5 py-0 h-5 font-medium">
      <ChefHat className="size-3 mr-0.5" />
      {t.pos.stationKitchen}
    </Badge>
  );
}

/* ─── Spice Level Display ─── */

function SpiceLevel({ level }: { level: number }) {
  if (level === 0) return null;
  return (
    <span className="text-[10px] text-red-400">
      {'🌶'.repeat(level)}
    </span>
  );
}

/* ─── Allergy Tags ─── */

function AllergyTags({ allergies }: { allergies: string | null }) {
  if (!allergies) return null;
  const tags = allergies.split(',').filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="text-[9px] px-1 py-0 h-4 text-amber-400 border-amber-600/30 bg-amber-600/5"
        >
          {tag.trim()}
        </Badge>
      ))}
    </div>
  );
}

/* ─── Time Elapsed ─── */

function calcElapsed(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function TimeElapsed({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(() => calcElapsed(createdAt));
  useEffect(() => {
    const interval = setInterval(() => setElapsed(calcElapsed(createdAt)), 30000);
    return () => clearInterval(interval);
  }, [createdAt]);
  return <span>{elapsed}</span>;
}

/* ─── Order Item Status Badge ─── */

function ItemStatusBadge({ status, t }: { status: string; t: any }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: t.pos.pending, className: 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30' },
    FIRED: { label: t.pos.fired, className: 'bg-orange-600/20 text-orange-400 border-orange-600/30' },
    PREPARING: { label: t.pos.preparing, className: 'bg-amber-600/20 text-amber-400 border-amber-600/30' },
    READY: { label: t.pos.ready, className: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' },
    SERVED: { label: t.pos.served, className: 'bg-sky-600/20 text-sky-400 border-sky-600/30' },
    CANCELLED: { label: t.common.cancelled, className: 'bg-red-600/20 text-red-400 border-red-600/30' },
  };
  const config = map[status] || map.PENDING;
  return (
    <Badge className={cn('text-[9px] px-1.5 py-0 h-4 font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}

/* ─── Order Status Badge ─── */

function OrderStatusBadge({ status, t }: { status: string; t: any }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: t.pos.pending, className: 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30' },
    IN_PROGRESS: { label: t.pos.inProgress, className: 'bg-amber-600/20 text-amber-400 border-amber-600/30' },
    READY: { label: t.pos.ready, className: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' },
    SERVED: { label: t.pos.served, className: 'bg-sky-600/20 text-sky-400 border-sky-600/30' },
    CANCELLED: { label: t.common.cancelled, className: 'bg-red-600/20 text-red-400 border-red-600/30' },
  };
  const config = map[status] || map.PENDING;
  return (
    <Badge className={cn('text-[10px] px-2 py-0.5 h-5 font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN POS SYSTEM COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function POSSystem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addNotification = useAppStore((s) => s.addNotification);
  const t = useT();
  const locale = useLocale();
  const localeConfig = useLocaleConfig();

  const fmtCurrency = useCallback((amount: number) => formatCurrencyByLocale(amount, locale), [locale]);
  const taxRate = localeConfig.taxRate;

  /* ─── Data Fetching ─── */
  const { data: categories = [], isLoading: menuLoading } = useQuery<MenuCategoryData[]>({
    queryKey: ['menu'],
    queryFn: () => fetch('/api/menu').then((r) => r.json()),
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery<TableData[]>({
    queryKey: ['tables'],
    queryFn: () => fetch('/api/tables').then((r) => r.json()),
  });

  const { data: activeOrders = [], isLoading: ordersLoading } = useQuery<ActiveOrderData[]>({
    queryKey: ['active-orders'],
    queryFn: () => fetch('/api/orders').then((r) => r.json()),
    refetchInterval: 15000,
  });

  /* ─── Local State ─── */
  const [activeTab, setActiveTab] = useState<'new-order' | 'active-orders'>('new-order');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [guestCount, setGuestCount] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [splitMethod, setSplitMethod] = useState<'seat' | 'item' | 'equal'>('equal');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fireConfirmOpen, setFireConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ActiveOrderData | null>(null);

  /* ─── Derived State ─── */
  const occupiedTables = useMemo(
    () => tables.filter((t) => ['SEATED', 'ORDER_PLACED', 'APPETIZER', 'MAIN', 'DESSERT', 'BILL_REQUESTED', 'FREE'].includes(t.status)),
    [tables]
  );

  const filteredItems = useMemo(() => {
    let items: MenuItemData[] = [];
    if (selectedCategoryId === 'all') {
      categories.forEach((cat) => items.push(...cat.items));
    } else {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (cat) items = cat.items;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }
    return items;
  }, [categories, selectedCategoryId, searchQuery]);

  const subtotal = useMemo(
    () => orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [orderItems]
  );
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  /* ─── Order Item Actions ─── */
  const addItemToOrder = useCallback(
    (menuItem: MenuItemData) => {
      setOrderItems((prev) => {
        const existing = prev.find(
          (i) => i.menuItemId === menuItem.id && i.seatNumber === 1 && i.notes === ''
        );
        if (existing) {
          return prev.map((i) =>
            i.tempId === existing.tempId ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            tempId: crypto.randomUUID(),
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            seatNumber: 1,
            station: menuItem.station === 'BOTH' ? 'KITCHEN' : menuItem.station,
            notes: '',
          },
        ];
      });
    },
    []
  );

  const updateItemQuantity = useCallback((tempId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) => (i.tempId === tempId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const updateItemSeat = useCallback((tempId: string, seat: number) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, seatNumber: Math.max(1, seat) } : i))
    );
  }, []);

  const updateItemNotes = useCallback((tempId: string, notes: string) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, notes } : i))
    );
  }, []);

  const removeItem = useCallback((tempId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }, []);

  const clearOrder = useCallback(() => {
    setOrderItems([]);
    setSelectedTableId('');
    setGuestCount(1);
    setOrderNotes('');
    setEditingOrder(null);
  }, []);

  /* ─── Submit Order ─── */
  const handleSubmitOrder = useCallback(async () => {
    if (!selectedTableId || orderItems.length === 0 || !user) return;
    setIsSubmitting(true);
    try {
      const body = {
        tableId: selectedTableId,
        createdBy: user.id,
        items: orderItems.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          unitPrice: i.price,
          seatNumber: i.seatNumber,
          station: i.station,
          notes: i.notes || null,
        })),
        type: 'DINE_IN',
        guestCount,
        notes: orderNotes || null,
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create order');
      }
      addNotification(`Order fired for Table ${tables.find(t => t.id === selectedTableId)?.number ?? ''}`, 'success');
      clearOrder();
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    } catch (err: any) {
      addNotification(err.message || 'Failed to create order', 'error');
    } finally {
      setIsSubmitting(false);
      setFireConfirmOpen(false);
    }
  }, [selectedTableId, orderItems, user, guestCount, orderNotes, tables, addNotification, clearOrder, queryClient]);

  /* ─── Update Order Item Status ─── */
  const handleUpdateItemStatus = useCallback(
    async (itemId: string, status: string) => {
      try {
        const res = await fetch('/api/orders/items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, status }),
        });
        if (!res.ok) throw new Error('Failed to update item');
        queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      } catch {
        addNotification('Failed to update item status', 'error');
      }
    },
    [queryClient, addNotification]
  );

  /* ─── Edit an existing order ─── */
  const handleEditOrder = useCallback((order: ActiveOrderData) => {
    setEditingOrder(order);
    setSelectedTableId(order.tableId);
    setGuestCount(order.guestCount);
    setOrderItems(
      order.items.map((i) => ({
        tempId: i.id,
        menuItemId: i.menuItemId,
        name: i.menuItem.name,
        price: i.unitPrice,
        quantity: i.quantity,
        seatNumber: i.seatNumber ?? 1,
        station: i.station,
        notes: i.notes ?? '',
      }))
    );
    setActiveTab('new-order');
  }, []);

  /* ─── Split Bill Calculations ─── */
  const splitBillResults = useMemo(() => {
    if (splitMethod === 'equal') {
      const perGuest = Math.round((totalAmount / guestCount) * 100) / 100;
      return Array.from({ length: guestCount }, (_, i) => ({
        label: `Guest ${i + 1}`,
        amount: perGuest,
      }));
    }
    if (splitMethod === 'seat') {
      const seatMap = new Map<number, number>();
      orderItems.forEach((i) => {
        const current = seatMap.get(i.seatNumber) ?? 0;
        seatMap.set(i.seatNumber, current + i.price * i.quantity);
      });
      const seatTax = (seat: number) => Math.round((seat * taxRate) * 100) / 100;
      const seats = Array.from(seatMap.entries()).sort(([a], [b]) => a - b);
      return seats.map(([seat, sub]) => ({
        label: `Seat ${seat}`,
        amount: Math.round((sub + seatTax(sub)) * 100) / 100,
      }));
    }
    // By item
    return orderItems.map((i) => ({
      label: `${i.name} x${i.quantity}`,
      amount: Math.round((i.price * i.quantity * (1 + taxRate)) * 100) / 100,
    }));
  }, [splitMethod, guestCount, totalAmount, orderItems]);

  /* ─── Category tab labels in order ─── */
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  /* ─── Render: Menu Item Card ─── */
  function renderMenuItem(item: MenuItemData) {
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <Card
          className="bg-zinc-900 border-zinc-800 hover:border-emerald-600/40 transition-colors cursor-pointer group relative overflow-hidden"
          onClick={() => addItemToOrder(item)}
        >
          {/* Popular badge */}
          {item.isPopular && (
            <div className="absolute top-1.5 right-1.5 z-10">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] px-1.5 py-0 h-4">
                <Star className="size-2.5 mr-0.5 fill-amber-400" />
                {t.pos.popular}
              </Badge>
            </div>
          )}
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-zinc-100 leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                {item.name}
              </h4>
              <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                {fmtCurrency(item.price)}
              </span>
            </div>
            {item.description && (
              <p className="text-[11px] text-zinc-500 line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              <StationBadge station={item.station} t={t} />
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 text-zinc-400 border-zinc-700"
              >
                <Clock className="size-2.5 mr-0.5" />
                {item.prepTime}m
              </Badge>
              <SpiceLevel level={item.spiceLevel} />
            </div>
            <AllergyTags allergies={item.allergies} />
            {/* Add button overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Plus className="size-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  /* ─── Render: Order Item Row ─── */
  function renderOrderItemRow(item: OrderItemDraft) {
    return (
      <div key={item.tempId} className="bg-zinc-800/50 rounded-lg p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-100 truncate">{item.name}</span>
              <StationBadge station={item.station} t={t} />
            </div>
            <span className="text-xs text-zinc-500">{fmtCurrency(item.price)} {t.pos.each}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-emerald-400">
              {fmtCurrency(item.price * item.quantity)}
            </span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quantity controls */}
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={(e) => { e.stopPropagation(); updateItemQuantity(item.tempId, -1); }}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium text-zinc-100">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={(e) => { e.stopPropagation(); updateItemQuantity(item.tempId, 1); }}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          {/* Seat selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <Users className="size-3 text-zinc-500" />
            <span className="text-zinc-500">{t.pos.seat}</span>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-white"
                onClick={(e) => { e.stopPropagation(); updateItemSeat(item.tempId, item.seatNumber - 1); }}
              >
                <Minus className="size-2.5" />
              </Button>
              <span className="w-4 text-center text-xs font-medium text-zinc-200">{item.seatNumber}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-white"
                onClick={(e) => { e.stopPropagation(); updateItemSeat(item.tempId, item.seatNumber + 1); }}
              >
                <Plus className="size-2.5" />
              </Button>
            </div>
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto text-red-400 hover:text-red-300 hover:bg-red-600/10"
            onClick={(e) => { e.stopPropagation(); removeItem(item.tempId); }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {/* Notes */}
        <div className="flex items-center gap-2">
          <MessageSquare className="size-3 text-zinc-500 shrink-0" />
          <Input
            value={item.notes}
            onChange={(e) => updateItemNotes(item.tempId, e.target.value)}
            placeholder={t.pos.specialNotes}
            className="h-7 text-xs bg-zinc-900 border-zinc-700 placeholder:text-zinc-600 focus:border-emerald-600/50"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }

  /* ─── Render: Active Order Card ─── */
  function renderActiveOrderCard(order: ActiveOrderData) {
    const urgency = getUrgencyLevel(order.createdAt);
    const isExpanded = expandedOrderId === order.id;
    const urgencyClass =
      urgency === 'red'
        ? 'border-l-red-500 bg-red-950/20'
        : urgency === 'amber'
          ? 'border-l-amber-500 bg-amber-950/10'
          : 'border-l-emerald-500 bg-emerald-950/10';

    return (
      <Card
        key={order.id}
        className={cn('bg-zinc-900 border-zinc-800 border-l-4', urgencyClass)}
      >
        <CardContent className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800 text-zinc-200 font-bold text-sm">
                {order.table.number}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">{order.table.name}</p>
                <p className="text-[11px] text-zinc-500">
                  {order.creator.name} · <TimeElapsed createdAt={order.createdAt} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} t={t} />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400"
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-[11px] text-zinc-400 mb-2">
            <span className="flex items-center gap-1">
              <ShoppingBag className="size-3" />
              {order.items.length} items
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {order.guestCount} guests
            </span>
            <span className="font-bold text-emerald-400">{fmtCurrency(order.totalAmount)}</span>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Separator className="bg-zinc-800 my-3" />
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-zinc-200 truncate">{item.menuItem.name}</span>
                        <span className="text-[10px] text-zinc-500">x{item.quantity}</span>
                        {item.seatNumber && (
                          <Badge className="text-[9px] px-1 py-0 h-4 bg-zinc-700 text-zinc-300">
                            S{item.seatNumber}
                          </Badge>
                        )}
                        <StationBadge station={item.station} t={t} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ItemStatusBadge status={item.status} t={t} />
                        {/* Quick status change buttons */}
                        {item.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-orange-400 hover:text-orange-300 hover:bg-orange-600/10"
                            onClick={() => handleUpdateItemStatus(item.id, 'FIRED')}
                          >
                            <Flame className="size-3 mr-1" />
                            Fire
                          </Button>
                        )}
                        {item.status === 'FIRED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-600/10"
                            onClick={() => handleUpdateItemStatus(item.id, 'PREPARING')}
                          >
                            <ChefHat className="size-3 mr-1" />
                            Prep
                          </Button>
                        )}
                        {item.status === 'PREPARING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/10"
                            onClick={() => handleUpdateItemStatus(item.id, 'READY')}
                          >
                            Ready
                          </Button>
                        )}
                        {item.status === 'READY' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-sky-400 hover:text-sky-300 hover:bg-sky-600/10"
                            onClick={() => handleUpdateItemStatus(item.id, 'SERVED')}
                          >
                            Served
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => handleEditOrder(order)}
                  >
                    <Eye className="size-3 mr-1" />
                    Edit Order
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Tab Selector */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-zinc-900 border border-zinc-800 w-fit">
          <TabsTrigger
            value="new-order"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-400"
          >
            <ShoppingBag className="size-4 mr-2" />
            {t.pos.newOrder}
            {orderItems.length > 0 && (
              <Badge className="ml-2 bg-emerald-600/30 text-emerald-400 text-[10px] px-1.5 py-0 h-4">
                {orderItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="active-orders"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-400"
          >
            <Clock className="size-4 mr-2" />
            {t.pos.activeOrders}
            {activeOrders.length > 0 && (
              <Badge className="ml-2 bg-amber-600/30 text-amber-400 text-[10px] px-1.5 py-0 h-4">
                {activeOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── NEW ORDER TAB ─── */}
        <TabsContent value="new-order" className="flex-1 min-h-0 mt-4">
          <div className="flex gap-4 h-full min-h-0">
            {/* ─── LEFT PANEL: Menu Browser ─── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.pos.searchMenu}
                  className="pl-9 bg-zinc-900 border-zinc-800 placeholder:text-zinc-600 focus:border-emerald-600/50 h-11"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-zinc-500"
                    onClick={() => setSearchQuery('')}
                  >
                    <XCircle className="size-4" />
                  </Button>
                )}
              </div>

              {/* Category Tabs */}
              <div className="mb-3 overflow-x-auto pb-1 -mx-1 px-1">
                <div className="flex gap-1.5 min-w-max">
                  <Button
                    variant={selectedCategoryId === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategoryId('all')}
                    className={cn(
                      'h-9 text-xs shrink-0',
                      selectedCategoryId === 'all'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 bg-zinc-900'
                    )}
                  >
                    All
                  </Button>
                  {sortedCategories.map((cat) => {
                    const IconComp = CATEGORY_ICON_MAP[cat.icon ?? ''] ?? CircleDot;
                    return (
                      <Button
                        key={cat.id}
                        variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={cn(
                          'h-9 text-xs shrink-0 gap-1.5',
                          selectedCategoryId === cat.id
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 bg-zinc-900'
                        )}
                      >
                        <IconComp className="size-3.5" />
                        {cat.name}
                        <span className="text-[10px] opacity-60">({cat.items.length})</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Menu Items Grid */}
              <ScrollArea className="flex-1 min-h-0">
                {menuLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 text-zinc-600 animate-spin" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="size-8 text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-500">{t.pos.noItemsFound}</p>
                    <p className="text-xs text-zinc-600 mt-1">{t.pos.tryDifferentSearch}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 pb-4">
                    {filteredItems.map(renderMenuItem)}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* ─── RIGHT PANEL: Current Order ─── */}
            <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col min-h-0">
              <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-3 shrink-0">
                  <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <Receipt className="size-4 text-emerald-400" />
                    {editingOrder ? t.pos.editOrder : t.pos.currentOrder}
                    {editingOrder && (
                      <Badge className="bg-amber-600/20 text-amber-400 text-[10px]">
                        #{editingOrder.table.number}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 px-4 pb-4 gap-3">
                  {/* Table Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{t.pos.table}</label>
                    <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 h-11 text-zinc-200">
                        <SelectValue placeholder={t.pos.selectTable} />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {occupiedTables.map((tbl) => (
                          <SelectItem key={tbl.id} value={tbl.id} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{tbl.name}</span>
                              <span className="text-[10px] text-zinc-500">({tbl.capacity} {t.floorPlan.seats})</span>
                              {tbl.status !== 'FREE' && (
                                <Badge className="text-[9px] px-1 py-0 h-3.5 bg-amber-600/20 text-amber-400">
                                  {tbl.status}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Guest Count */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{t.pos.guests}</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 bg-zinc-800"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <div className="flex items-center justify-center w-12 h-9 bg-zinc-800 rounded-md border border-zinc-700">
                        <span className="text-sm font-medium text-zinc-100">{guestCount}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 bg-zinc-800"
                        onClick={() => setGuestCount(guestCount + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800" />

                  {/* Order Items List */}
                  <ScrollArea className="flex-1 min-h-0">
                    {orderItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <ShoppingBag className="size-8 text-zinc-700 mb-3" />
                        <p className="text-sm text-zinc-500">{t.pos.noItemsYet}</p>
                        <p className="text-xs text-zinc-600 mt-1">{t.pos.clickMenuToAdd}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pr-1 pb-2">
                        {orderItems.map(renderOrderItemRow)}
                      </div>
                    )}
                  </ScrollArea>

                  <Separator className="bg-zinc-800" />

                  {/* Totals */}
                  <div className="space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">{t.common.subtotal}</span>
                      <span className="text-zinc-200">{fmtCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">{localeConfig.taxShort} ({Math.round(taxRate * 100)}%)</span>
                      <span className="text-zinc-200">{fmtCurrency(taxAmount)}</span>
                    </div>
                    <Separator className="bg-zinc-800" />
                    <div className="flex items-center justify-between text-base font-bold">
                      <span className="text-zinc-100">{t.common.totalAmount}</span>
                      <span className="text-emerald-400">{fmtCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 shrink-0">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
                        onClick={() => setSplitBillOpen(true)}
                        disabled={orderItems.length === 0}
                      >
                        <Split className="size-4" />
                        Split Bill
                      </Button>
                      <Button
                        variant="outline"
                        className="h-11 border-zinc-700 text-amber-400 hover:bg-amber-600/10 hover:border-amber-600/30 gap-2"
                        disabled={orderItems.length === 0}
                        onClick={() => {
                          addNotification('Order held', 'info');
                        }}
                      >
                        <Pause className="size-4" />
                        Hold
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-11 border-red-600/30 text-red-400 hover:bg-red-600/10 hover:border-red-600/50 gap-2"
                        onClick={() => setCancelConfirmOpen(true)}
                        disabled={orderItems.length === 0}
                      >
                        <XCircle className="size-4" />
                        Cancel
                      </Button>
                      <Button
                        className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20 font-semibold"
                        disabled={orderItems.length === 0 || !selectedTableId || isSubmitting}
                        onClick={() => setFireConfirmOpen(true)}
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Flame className="size-4" />
                        )}
                        Fire Order
                      </Button>
                    </div>
                    {!selectedTableId && orderItems.length > 0 && (
                      <p className="text-[11px] text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="size-3" />
                        Select a table to fire the order
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── ACTIVE ORDERS TAB ─── */}
        <TabsContent value="active-orders" className="flex-1 min-h-0 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordersLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <Loader2 className="size-8 text-zinc-600 animate-spin" />
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <Clock className="size-10 text-zinc-700 mb-3" />
                <p className="text-lg font-medium text-zinc-400">No active orders</p>
                <p className="text-sm text-zinc-600 mt-1">Orders will appear here when created</p>
              </div>
            ) : (
              activeOrders.map(renderActiveOrderCard)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Split Bill Dialog ─── */}
      <Dialog open={splitBillOpen} onOpenChange={setSplitBillOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Split className="size-5 text-emerald-400" />
              Split Bill
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Choose how to split the bill for this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Split Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'equal' as const, label: 'Equal Split', icon: Users },
                { value: 'seat' as const, label: 'By Seat', icon: UtensilsCrossed },
                { value: 'item' as const, label: 'By Item', icon: Receipt },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  variant={splitMethod === opt.value ? 'default' : 'outline'}
                  onClick={() => setSplitMethod(opt.value)}
                  className={cn(
                    'h-auto py-3 flex-col gap-1.5 text-xs',
                    splitMethod === opt.value
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 bg-zinc-800'
                  )}
                >
                  <opt.icon className="size-4" />
                  {opt.label}
                </Button>
              ))}
            </div>

            <Separator className="bg-zinc-800" />

            {/* Results */}
            <div className="space-y-2">
              {splitBillResults.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-sm text-zinc-300">{result.label}</span>
                  <span className="text-sm font-bold text-emerald-400">{fmtCurrency(result.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-sm font-medium text-zinc-200">Total</span>
              <span className="text-base font-bold text-emerald-400">{fmtCurrency(totalAmount)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSplitBillOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Fire Order Confirmation Dialog ─── */}
      <Dialog open={fireConfirmOpen} onOpenChange={setFireConfirmOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Flame className="size-5 text-orange-400" />
              Fire Order?
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Send this order to the kitchen/bar. This action will start preparation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Table</span>
              <span className="text-zinc-200">{tables.find((t) => t.id === selectedTableId)?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Items</span>
              <span className="text-zinc-200">{orderItems.length} items ({orderItems.reduce((s, i) => s + i.quantity, 0)} total)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Guests</span>
              <span className="text-zinc-200">{guestCount}</span>
            </div>
            <Separator className="bg-zinc-800" />
            <div className="flex justify-between text-base font-bold">
              <span className="text-zinc-100">Total</span>
              <span className="text-emerald-400">{fmtCurrency(totalAmount)}</span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFireConfirmOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isSubmitting ? 'Sending...' : 'Fire!'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Cancel Order Confirmation Dialog ─── */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <XCircle className="size-5 text-red-400" />
              Cancel Order?
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will remove all items from the current order. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelConfirmOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearOrder();
                setCancelConfirmOpen(false);
              }}
              className="gap-2"
            >
              <XCircle className="size-4" />
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
