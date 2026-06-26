'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { generateId } from '@/lib/generate-id';
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
  X,
  CreditCard,
  Wallet,
  DollarSign,
  Check,
  Pencil,
} from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale, useLocaleConfig } from '@/stores/locale-store';
import { type Translations } from '@/lib/i18n/translations';
import { formatCurrencyByLocale, getTaxRate, LOCALE_CONFIGS } from '@/lib/i18n/locales';
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

interface MenuItemExtra {
  id: string;
  name: string;
  price: number;
}

type SplitMethod = 'full' | 'equal' | 'seat' | 'item';

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
  imageUrl?: string | null;
  extras?: MenuItemExtra[];
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
  extras?: MenuItemExtra[];
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
  paymentStatus?: string;
  paymentMethod?: string;
  payments?: { id: string; amount: number; method: string; status: string; reference: string | null }[];
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

function StationBadge({ station, t }: { station: string; t: Translations }) {
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

function ItemStatusBadge({ status, t }: { status: string; t: Translations }) {
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

function OrderStatusBadge({ status, t }: { status: string; t: Translations }) {
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

function isDrinksCategory(cat: MenuCategoryData) {
  const nameLower = cat.name.toLowerCase();
  return (
    nameLower.includes('cocktail') ||
    nameLower.includes('beer') ||
    nameLower.includes('wine') ||
    nameLower.includes('drink') ||
    nameLower.includes('beverage') ||
    nameLower.includes('non-alcoholic') ||
    cat.items.some(item => item.type === 'DRINK' || item.station === 'BAR')
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN POS SYSTEM COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function POSSystem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addNotification = useAppStore((s) => s.addNotification);
  const selectedOrderId = useAppStore((s) => s.selectedOrderId);
  const selectedTableIdFromStore = useAppStore((s) => s.selectedTableId);
  const selectOrderStore = useAppStore((s) => s.selectOrder);
  const selectTableStore = useAppStore((s) => s.selectTable);
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

  const quickBarTableId = useMemo(() => {
    return tables.find((t) => t.number === 99 || t.name === 'Quick Bar')?.id || 'quick-bar';
  }, [tables]);

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
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('full');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fireConfirmOpen, setFireConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ActiveOrderData | null>(null);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');

  const [activePayShare, setActivePayShare] = useState<{ reference: string; amount: number } | null>(null);
  const [splitPaymentMethod, setSplitPaymentMethod] = useState<'CASH' | 'CARD' | 'CREDIT'>('CASH');
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [splitTipAmount, setSplitTipAmount] = useState('');
  const [splitCardStep, setSplitCardStep] = useState<number>(0);
  const [splitSelectedCustId, setSplitSelectedCustId] = useState<string>('');
  const [isProcessingSplitPay, setIsProcessingSplitPay] = useState(false);

  const [customizingItem, setCustomizingItem] = useState<MenuItemData | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<MenuItemExtra[]>([]);

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/customers').then((r) => r.json()),
  });

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
    if (user?.role === 'BAR') {
      return [...items].sort((a, b) => {
        const aIsDrink = a.type === 'DRINK' || a.station === 'BAR';
        const bIsDrink = b.type === 'DRINK' || b.station === 'BAR';
        if (aIsDrink && !bIsDrink) return -1;
        if (!aIsDrink && bIsDrink) return 1;
        return 0;
      });
    }
    return items;
  }, [categories, selectedCategoryId, searchQuery, user?.role]);

  const subtotal = useMemo(
    () => orderItems.reduce((sum, i) => {
      const extrasCost = (i.extras || []).reduce((s, ext) => s + ext.price, 0);
      return sum + (i.price + extrasCost) * i.quantity;
    }, 0),
    [orderItems]
  );
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  const allDrinksInOrder = useMemo(() => {
    return orderItems.length > 0 && orderItems.every((item) => item.station === 'BAR');
  }, [orderItems]);

  const canFireWithoutTable = user?.role === 'BAR' || allDrinksInOrder;

  /* ─── Order Item Actions ─── */
  const addItemToOrder = useCallback(
    (menuItem: MenuItemData, extras: MenuItemExtra[] = []) => {
      setOrderItems((prev) => {
        const existing = extras.length === 0 ? prev.find(
          (i) => i.menuItemId === menuItem.id && i.seatNumber === 1 && i.notes === '' && (!i.extras || i.extras.length === 0)
        ) : undefined;
        if (existing) {
          return prev.map((i) =>
            i.tempId === existing.tempId ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            tempId: generateId(),
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            seatNumber: 1,
            station: menuItem.station === 'BOTH' ? 'KITCHEN' : menuItem.station,
            notes: '',
            extras,
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
    setOrderType('DINE_IN');
  }, []);

  /* ─── Submit Order ─── */
  const handleSubmitOrder = useCallback(async () => {
    const targetTableId = orderType === 'TAKEAWAY' ? quickBarTableId : (selectedTableId || quickBarTableId);
    if (!targetTableId || orderItems.length === 0 || !user) return;
    setIsSubmitting(true);
    const isEditing = !!editingOrder;
    try {
      const body = {
        tableId: targetTableId,
        createdBy: user.id,
        items: orderItems.map((i) => ({
          id: editingOrder?.items.some((oi) => oi.id === i.tempId) ? i.tempId : undefined,
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          unitPrice: i.price,
          seatNumber: i.seatNumber,
          station: i.station,
          notes: i.notes || null,
          extras: i.extras || [],
        })),
        type: orderType,
        guestCount: orderType === 'TAKEAWAY' ? 1 : guestCount,
        notes: orderNotes || null,
      };
      const res = await fetch('/api/orders', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...body, id: editingOrder.id } : body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${isEditing ? 'update' : 'create'} order`);
      }
      const order = await res.json();
      
      // Emit socket updates
      const socket = getSocket();
      if (socket?.connected) {
        if (isEditing) {
          socket.emit('order:status-change', {
            orderId: editingOrder.id,
            status: 'IN_PROGRESS',
          });
        } else {
          socket.emit('order:created', order);
        }
      }

      const notificationMsg = orderType === 'TAKEAWAY'
        ? (isEditing ? 'Takeaway order updated' : 'Takeaway order fired')
        : (isEditing
            ? `Order updated for ${tables.find(t => t.id === targetTableId)?.name ?? (targetTableId === quickBarTableId ? 'Quick Bar' : '')}`
            : `Order fired for ${tables.find(t => t.id === targetTableId)?.name ?? (targetTableId === quickBarTableId ? 'Quick Bar' : '')}`);

      addNotification(notificationMsg, 'success');
      clearOrder();
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    } catch (err: any) {
      addNotification(err.message || 'Failed to create order', 'error');
    } finally {
      setIsSubmitting(false);
      setFireConfirmOpen(false);
    }
  }, [selectedTableId, orderItems, user, guestCount, orderNotes, tables, addNotification, clearOrder, queryClient, quickBarTableId, orderType]);

  /* ─── Confirm Split Payment ─── */
  const handleConfirmSplitPayment = useCallback(async () => {
    if (!editingOrder || !activePayShare) return;
    setIsProcessingSplitPay(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOrder.id,
          action: 'PAY_SPLIT',
          amount: activePayShare.amount,
          tipAmount: splitTipAmount ? parseFloat(splitTipAmount) : 0,
          paymentMethod: splitPaymentMethod,
          reference: activePayShare.reference,
          customerId: splitPaymentMethod === 'CREDIT' ? splitSelectedCustId : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to process payment');
      }

      const updatedOrder = await res.json();

      // Check if order is fully paid
      const totalPaid = updatedOrder.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      const isFullyPaid = totalPaid >= (updatedOrder.totalAmount - 0.05);

      addNotification(
        isFullyPaid
          ? `Order fully settled. Table ${updatedOrder.table.number} is now free.`
          : `Processed payment of ${fmtCurrency(activePayShare.amount)} for ${activePayShare.reference}`,
        'success'
      );

      // Invalidate queries to refresh POS lists and floor plan
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });

      // Socket emits for real-time synchronization
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('order:status-change', {
          orderId: editingOrder.id,
          status: isFullyPaid ? 'SERVED' : updatedOrder.status,
        });
        if (isFullyPaid) {
          socket.emit('table:status-change', {
            tableId: editingOrder.tableId,
            status: 'FREE',
            updatedBy: user?.name || 'System',
          });
        }
      }

      if (isFullyPaid) {
        setSplitBillOpen(false);
        clearOrder();
      } else {
        // Update local editingOrder with the newly fetched database state
        setActivePayShare(null);
        setSplitCashAmount('');
        setSplitTipAmount('');
        setSplitCardStep(0);
      }
    } catch (err: any) {
      addNotification(err.message || 'Payment failed', 'error');
    } finally {
      setIsProcessingSplitPay(false);
    }
  }, [editingOrder, activePayShare, splitPaymentMethod,    splitSelectedCustId,
    splitTipAmount,
    user,
    addNotification,
    clearOrder,
    queryClient,
    fmtCurrency
  ]);

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
    setOrderType(order.type === 'TAKEAWAY' ? 'TAKEAWAY' : 'DINE_IN');
    setOrderItems(
      order.items.map((i: any) => ({
        tempId: i.id,
        menuItemId: i.menuItemId,
        name: i.menuItem.name,
        price: i.unitPrice,
        quantity: i.quantity,
        seatNumber: i.seatNumber ?? 1,
        station: i.station,
        notes: i.notes ?? '',
        extras: i.extras?.map((e: any) => ({ id: e.menuItemExtraId, name: e.name, price: e.price })) || [],
      }))
    );
    setActiveTab('new-order');
  }, []);

  /* ─── Checkout an existing order directly ─── */
  const handleCheckoutDirectly = useCallback((order: ActiveOrderData) => {
    setEditingOrder(order);
    setSelectedTableId(order.tableId);
    setGuestCount(order.guestCount);
    setOrderType(order.type === 'TAKEAWAY' ? 'TAKEAWAY' : 'DINE_IN');
    setOrderItems(
      order.items.map((i: any) => ({
        tempId: i.id,
        menuItemId: i.menuItemId,
        name: i.menuItem.name,
        price: i.unitPrice,
        quantity: i.quantity,
        seatNumber: i.seatNumber ?? 1,
        station: i.station,
        notes: i.notes ?? '',
        extras: i.extras?.map((e: any) => ({ id: e.menuItemExtraId, name: e.name, price: e.price })) || [],
      }))
    );
    const totalPaid = order.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
    const remainingAmount = Math.max(0, order.totalAmount - totalPaid);
    setSplitMethod('full');
    setActivePayShare({ reference: 'Full Bill', amount: remainingAmount });
    setSplitBillOpen(true);
  }, []);

  /* ─── Handle Store Selection (Floor Plan integration) ─── */
  useEffect(() => {
    if (selectedOrderId && activeOrders.length > 0) {
      const orderToEdit = activeOrders.find(o => o.id === selectedOrderId);
      if (orderToEdit && (!editingOrder || editingOrder.id !== selectedOrderId)) {
        const timer = setTimeout(() => {
          handleEditOrder(orderToEdit);
          selectOrderStore(null); // Clear after loading
        }, 0);
        return () => clearTimeout(timer);
      }
    } else if (selectedTableIdFromStore && !editingOrder) {
      const timer = setTimeout(() => {
        setSelectedTableId(selectedTableIdFromStore);
        selectTableStore(null); // Clear after loading
        setActiveTab('new-order');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedOrderId, selectedTableIdFromStore, activeOrders, editingOrder, handleEditOrder, selectOrderStore, selectTableStore]);

  /* ─── Split Bill Logic ─── */
  const splitBillResults = useMemo(() => {
    const totalPaid = editingOrder?.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
    const remainingAmount = Math.max(0, totalAmount - totalPaid);

    if (splitMethod === 'full') {
      return [
        {
          label: 'Full Remaining Balance',
          amount: remainingAmount,
          reference: 'Full Bill',
        },
      ];
    }
    if (splitMethod === 'equal') {
      const perGuest = Math.round((remainingAmount / guestCount) * 100) / 100;
      return Array.from({ length: guestCount }, (_, i) => ({
        label: `Guest ${i + 1}`,
        amount: perGuest,
        reference: `Guest ${i + 1}`,
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
        reference: `Seat ${seat}`,
      }));
    }
    // By item
    return orderItems.map((i) => {
      const extrasCost = (i.extras || []).reduce((s, e) => s + e.price, 0);
      return {
        label: `${i.name} x${i.quantity}`,
        amount: Math.round(((i.price + extrasCost) * i.quantity * (1 + taxRate)) * 100) / 100,
        reference: `Item: ${i.tempId}`,
      };
    });
  }, [splitMethod, guestCount, totalAmount, orderItems, taxRate, editingOrder]);

  /* ─── Category tab labels in order ─── */
  const sortedCategories = useMemo(() => {
    const list = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    if (user?.role === 'BAR') {
      return [...list].sort((a, b) => {
        const aIsDrink = isDrinksCategory(a);
        const bIsDrink = isDrinksCategory(b);
        if (aIsDrink && !bIsDrink) return -1;
        if (!aIsDrink && bIsDrink) return 1;
        return a.sortOrder - b.sortOrder;
      });
    }
    return list;
  }, [categories, user?.role]);

  // Bartender default state initialization
  const [hasInitializedBartender, setHasInitializedBartender] = useState(false);
  useEffect(() => {
    if (user?.role === 'BAR' && categories.length > 0 && !hasInitializedBartender && quickBarTableId) {
      const timer = setTimeout(() => {
        setSelectedTableId(quickBarTableId);
        const firstDrinksCat = sortedCategories.find(isDrinksCategory);
        if (firstDrinksCat) {
          setSelectedCategoryId(firstDrinksCat.id);
        }
        setHasInitializedBartender(true);
      }, 0);
      return () => clearTimeout(timer);
    } else if (user?.role !== 'BAR' && hasInitializedBartender) {
      const timer = setTimeout(() => {
        setHasInitializedBartender(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user?.role, categories, sortedCategories, hasInitializedBartender, quickBarTableId]);

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
          onClick={() => {
            if (item.extras && item.extras.length > 0) {
              setCustomizingItem(item);
              setSelectedExtras([]);
            } else {
              addItemToOrder(item);
            }
          }}
        >
          {/* Popular badge */}
          {item.isPopular && (
            <div className="absolute top-1.5 right-1.5 z-10">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] px-1.5 py-0 h-4 backdrop-blur-md">
                <Star className="size-2.5 mr-0.5 fill-amber-400" />
                {t.pos.popular}
              </Badge>
            </div>
          )}
          {item.imageUrl && (
            <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-950 relative">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60"></div>
            </div>
          )}
          <CardContent className="p-2">
            <div className="flex flex-col gap-0.5 mb-1">
              <h4 className="text-[13px] font-bold text-zinc-100 leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                {item.name}
              </h4>
              <span className="text-[13px] font-bold text-emerald-400 whitespace-nowrap">
                {fmtCurrency(item.price)}
              </span>
            </div>
            {!item.imageUrl && item.description && (
              <p className="text-[10px] text-zinc-500 line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              <StationBadge station={item.station} t={t} />
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-zinc-400 border-zinc-700">
                <Clock className="size-2 mr-0.5" />
                {item.prepTime}m
              </Badge>
              {item.spiceLevel > 0 && <SpiceLevel level={item.spiceLevel} />}
            </div>
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
            <span className="text-xs text-zinc-500">
              {fmtCurrency(item.price + (item.extras?.reduce((s, e) => s + e.price, 0) || 0))} {t.pos.each}
            </span>
            {item.extras && item.extras.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.extras.map((ext, idx) => (
                  <Badge key={idx} variant="outline" className="text-[9px] px-1 py-0 h-4 bg-zinc-800 text-zinc-400 border-zinc-700">
                    + {ext.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-emerald-400">
              {fmtCurrency((item.price + (item.extras?.reduce((s, e) => s + e.price, 0) || 0)) * item.quantity)}
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
              <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg font-bold text-sm",
                order.type === 'TAKEAWAY' ? "bg-emerald-600/20 text-emerald-400" : "bg-zinc-800 text-zinc-200"
              )}>
                {order.type === 'TAKEAWAY' ? <ShoppingBag className="size-4" /> : order.table.number}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {order.type === 'TAKEAWAY' ? t.pos.takeaway : order.table.name}
                </p>
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
            {order.type === 'TAKEAWAY' ? (
              <Badge className="bg-emerald-600/20 text-emerald-400 border-none text-[9px] h-4 py-0 px-1 font-semibold">
                {t.pos.takeaway}
              </Badge>
            ) : (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {order.guestCount} guests
              </span>
            )}
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
                  <Button
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => handleCheckoutDirectly(order)}
                  >
                    <CreditCard className="size-3" />
                    Checkout / Get Bill
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
          <div className="flex flex-col md:flex-row gap-4 h-full min-h-0">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-4">
                    {filteredItems.map(renderMenuItem)}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* ─── RIGHT PANEL: Current Order ─── */}
            <div className="w-full md:w-[340px] lg:w-[420px] shrink-0 flex flex-col min-h-0">
              <Card className="bg-zinc-900 border-zinc-800 h-fit max-h-full flex flex-col min-h-0">
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
                <CardContent className="flex flex-col min-h-0 px-4 pb-4 gap-3">
                  {/* Order Type Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Order Type
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-zinc-800 p-1 rounded-lg border border-zinc-700">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 text-xs font-semibold gap-1.5 transition-all",
                          orderType === 'DINE_IN'
                            ? "bg-zinc-700 text-white shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                        onClick={() => setOrderType('DINE_IN')}
                      >
                        <UtensilsCrossed className="size-3.5" />
                        {t.pos.dineIn}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 text-xs font-semibold gap-1.5 transition-all",
                          orderType === 'TAKEAWAY'
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                        onClick={() => setOrderType('TAKEAWAY')}
                      >
                        <ShoppingBag className="size-3.5" />
                        {t.pos.takeaway}
                      </Button>
                    </div>
                  </div>

                  {/* Table Selector */}
                  {orderType === 'DINE_IN' ? (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{t.pos.table}</label>
                      <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 h-11 text-zinc-200">
                          <SelectValue placeholder={t.pos.selectTable} />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          <SelectItem value={quickBarTableId} className="text-zinc-200 focus:bg-zinc-850 focus:text-emerald-400 font-semibold text-emerald-500">
                            ⚡ Quick Bar Order (No Table)
                          </SelectItem>
                          {occupiedTables
                            .filter((tbl) => tbl.id !== quickBarTableId && tbl.number !== 99 && tbl.name !== 'Quick Bar')
                            .map((tbl) => (
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
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{t.pos.table}</label>
                      <div className="flex items-center justify-between bg-zinc-800/40 border border-zinc-800 h-11 px-3 rounded-md text-zinc-400 text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <ShoppingBag className="size-4 text-emerald-400" />
                          Takeaway Order
                        </span>
                        <Badge className="bg-emerald-600/20 text-emerald-400 text-[10px]">
                          No Table
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Guest Count */}
                  {orderType === 'DINE_IN' && (
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
                  )}

                  <Separator className="bg-zinc-800" />

                  {/* Order Items List */}
                  <ScrollArea className="flex-shrink min-h-0">
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
                  <div className="space-y-2 shrink-0 mt-2">
                    {editingOrder ? (
                      <Button
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20 font-bold text-base transition-all"
                        onClick={() => {
                          const totalPaid = editingOrder.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
                          const remainingAmount = Math.max(0, totalAmount - totalPaid);
                          setSplitMethod('full');
                          setActivePayShare({ reference: 'Full Bill', amount: remainingAmount });
                          setSplitBillOpen(true);
                        }}
                        disabled={orderItems.length === 0}
                      >
                        <CreditCard className="size-5" />
                        Pay / Checkout
                      </Button>
                    ) : null}
                    
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
                        className={cn(
                          "h-11 text-white gap-2 shadow-lg font-semibold transition-all",
                          editingOrder 
                            ? "bg-zinc-700 hover:bg-zinc-600 shadow-zinc-900/20" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                        )}
                        disabled={orderItems.length === 0 || isSubmitting || (orderType === 'DINE_IN' && !selectedTableId && !canFireWithoutTable)}
                        onClick={() => setFireConfirmOpen(true)}
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Flame className="size-4" />
                        )}
                        {editingOrder ? 'Update Order' : 'Fire Order'}
                      </Button>
                    </div>
                    {orderType === 'TAKEAWAY' && orderItems.length > 0 && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="size-3" />
                        Takeaway Order (Will be prepared for pickup)
                      </p>
                    )}
                    {orderType === 'DINE_IN' && !selectedTableId && orderItems.length > 0 && (
                      canFireWithoutTable ? (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Check className="size-3" />
                          Quick Bar Order (Will be filed under Bar Tab)
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="size-3" />
                          Select a table to fire the order
                        </p>
                      )
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

      {/* ─── Customize Item Dialog ─── */}
      <Dialog open={!!customizingItem} onOpenChange={(open) => !open && setCustomizingItem(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{customizingItem?.name}</DialogTitle>
            <DialogDescription className="text-zinc-400">Select optional additions</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {customizingItem?.extras?.map((ext) => {
              const isSelected = selectedExtras.some(e => e.id === ext.id);
              return (
                <Button
                  key={ext.id}
                  variant="outline"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedExtras(prev => prev.filter(e => e.id !== ext.id));
                    } else {
                      setSelectedExtras(prev => [...prev, ext]);
                    }
                  }}
                  className={cn(
                    "w-full justify-between h-12 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors",
                    isSelected && "border-emerald-500/50 bg-emerald-950/20 text-emerald-400"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isSelected ? <Check className="size-4 text-emerald-400" /> : <Plus className="size-4 text-zinc-500" />}
                    {ext.name}
                  </span>
                  <span>+{fmtCurrency(ext.price)}</span>
                </Button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCustomizingItem(null)} className="text-zinc-400">Cancel</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (customizingItem) {
                  addItemToOrder(customizingItem, selectedExtras);
                  setCustomizingItem(null);
                }
              }}
            >
              Add to Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Split Bill Dialog ─── */}
      <Dialog open={splitBillOpen} onOpenChange={(open) => {
        setSplitBillOpen(open);
        if (!open) {
          setActivePayShare(null);
          setSplitTipAmount('');
        }
      }}>
        <DialogContent className={cn("bg-zinc-950 border-zinc-800 transition-all duration-300 w-full", activePayShare ? "sm:max-w-4xl" : "sm:max-w-2xl")}>
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Split className="size-5 text-emerald-400" />
                Split Bill {editingOrder ? `— Table ${editingOrder.table.number}` : ''}
              </span>
              {editingOrder && (
                <Badge variant="outline" className="text-zinc-400 border-zinc-800">
                  Total: {fmtCurrency(editingOrder.totalAmount)}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingOrder 
                ? "Settle individual shares by seat, equal guest split, or by item. The table remains occupied until the bill is fully paid."
                : "Choose how to split the bill for this order. (Fire the order to process payments)"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Split Method Selector */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'full' as const, label: 'Full Bill', icon: CreditCard },
                { value: 'equal' as const, label: 'Equal Split', icon: Users },
                { value: 'seat' as const, label: 'By Seat', icon: UtensilsCrossed },
                { value: 'item' as const, label: 'By Item', icon: Receipt },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  variant={splitMethod === opt.value ? 'default' : 'outline'}
                  onClick={() => {
                    setSplitMethod(opt.value);
                    setActivePayShare(null);
                  }}
                  className={cn(
                    'h-auto py-2.5 flex-col gap-1.5 text-xs rounded-xl transition-all duration-200',
                    splitMethod === opt.value
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                      : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900'
                  )}
                >
                  <opt.icon className="size-4" />
                  {opt.label}
                </Button>
              ))}
            </div>

            <Separator className="bg-zinc-800/60" />

            <div className={cn("grid gap-6", activePayShare ? "grid-cols-1 md:grid-cols-5" : "grid-cols-1")}>
              {/* Left Column: List of splits */}
              <div className={cn("space-y-3", activePayShare ? "col-span-1 md:col-span-3" : "w-full")}>
                <ScrollArea className="max-h-[380px] pr-3">
                  <div className="space-y-2.5">
                    {splitBillResults.map((result, idx) => {
                      const shareRef = result.reference;
                      const isPaid = editingOrder?.payments?.some(p => p.reference === shareRef) ?? false;
                      const isSelected = activePayShare?.reference === shareRef;

                      // For Seat or Item, display items detail if possible
                      let itemsDetail: string[] = [];
                      if (splitMethod === 'seat') {
                        // parse seat number from label, e.g. "Seat 3" -> 3
                        const seatNum = parseInt(shareRef.replace('Seat ', ''));
                        itemsDetail = orderItems
                          .filter(i => i.seatNumber === seatNum)
                          .map(i => `${i.name} x${i.quantity}`);
                      }

                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex flex-col p-4 rounded-xl border transition-all duration-200",
                            isPaid 
                              ? "bg-emerald-950/10 border-emerald-900/30 opacity-75"
                              : isSelected
                                ? "bg-zinc-800/80 border-emerald-500/50 shadow-md shadow-emerald-500/5"
                                : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-sm font-semibold text-zinc-100">{result.label}</span>
                              {itemsDetail.length > 0 && (
                                <p className="text-[11px] text-zinc-500 flex flex-wrap gap-1">
                                  {itemsDetail.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-emerald-400">{fmtCurrency(result.amount)}</span>
                              
                              {isPaid ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 px-2.5 py-1">
                                  <Check className="size-3" />
                                  PAID
                                </Badge>
                              ) : !editingOrder ? (
                                <Badge variant="outline" className="text-zinc-650 border-zinc-800 text-[10px]">
                                  Unfired
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant={isSelected ? "secondary" : "outline"}
                                  onClick={() => {
                                    setActivePayShare({ reference: shareRef, amount: result.amount });
                                    setSplitPaymentMethod('CASH');
                                    setSplitCashAmount('');
                                    setSplitCardStep(0);
                                    setSplitSelectedCustId('');
                                  }}
                                  className={cn(
                                    "h-8 text-xs font-medium px-3.5 rounded-lg transition-all",
                                    isSelected 
                                      ? "bg-emerald-600 text-white hover:bg-emerald-500 border-none"
                                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                  )}
                                >
                                  {isSelected ? "Paying..." : "Pay Share"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Column: Checkout Panel */}
              {activePayShare && (
                <div className="col-span-1 md:col-span-2 bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-xl flex flex-col justify-between min-h-[380px] animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                        <CreditCard className="size-4 text-emerald-400" />
                        Settle {activePayShare.reference}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white"
                        onClick={() => {
                          setActivePayShare(null);
                          setSplitTipAmount('');
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    <div className="bg-zinc-950 rounded-lg border border-zinc-800/50 overflow-hidden">
                      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                        <span className="text-sm text-zinc-400 font-medium">Subtotal</span>
                        <span className="text-lg font-bold text-zinc-200">{fmtCurrency(activePayShare.amount)}</span>
                      </div>
                      
                      <div className="p-4 border-b border-zinc-800/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-400 font-medium">Add Tip</span>
                          <div className="relative w-40">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{localeConfig.currencySymbol}</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={splitTipAmount}
                              onChange={(e) => setSplitTipAmount(e.target.value)}
                              placeholder="0.00"
                              className="pl-7 bg-zinc-900 border-zinc-700 text-zinc-100 text-right h-9 text-sm focus:border-emerald-600/50"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[10, 15, 20, 25].map(pct => (
                            <Button
                              key={pct}
                              variant="outline"
                              size="sm"
                              className="h-8 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                              onClick={() => setSplitTipAmount((activePayShare.amount * (pct / 100)).toFixed(2))}
                            >
                              {pct}%
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between bg-zinc-900/50">
                        <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">Total Due</span>
                        <span className="text-3xl font-black text-emerald-400">
                          {fmtCurrency(activePayShare.amount + (parseFloat(splitTipAmount) || 0))}
                        </span>
                      </div>
                    </div>

                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/50">
                      {[
                        { value: 'CASH' as const, icon: Wallet, label: 'Cash' },
                        { value: 'CARD' as const, icon: CreditCard, label: 'Card' },
                        { value: 'CREDIT' as const, icon: Users, label: 'Credit' }
                      ].map(m => (
                        <button
                          key={m.value}
                          onClick={() => setSplitPaymentMethod(m.value)}
                          className={cn(
                            "flex flex-col items-center justify-center py-2 px-1 rounded-md text-[10px] font-medium transition-all gap-1",
                            splitPaymentMethod === m.value 
                              ? "bg-zinc-800 text-zinc-100 shadow" 
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          <m.icon className="size-4" />
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Cash Form */}
                    {splitPaymentMethod === 'CASH' && (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Cash Tendered</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{localeConfig.currencySymbol}</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={splitCashAmount}
                              onChange={(e) => setSplitCashAmount(e.target.value)}
                              placeholder="0.00"
                              className="pl-7 bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-emerald-600/50"
                            />
                          </div>
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Exact', val: activePayShare.amount + (parseFloat(splitTipAmount) || 0) },
                            { label: `${localeConfig.currencySymbol}10`, val: 10 },
                            { label: `${localeConfig.currencySymbol}20`, val: 20 },
                            { label: `${localeConfig.currencySymbol}50`, val: 50 },
                            { label: `${localeConfig.currencySymbol}100`, val: 100 }
                          ].map((p, idx) => {
                            if (p.val < (activePayShare.amount + (parseFloat(splitTipAmount) || 0)) && p.label !== 'Exact') return null;
                            const presetVal = p.label === 'Exact' ? p.val : p.val;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSplitCashAmount(presetVal.toFixed(2))}
                                className="text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-800 text-zinc-300 py-1 px-2.5 rounded-md transition-colors"
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Change calculation */}
                        {parseFloat(splitCashAmount) >= (activePayShare.amount + (parseFloat(splitTipAmount) || 0)) && (
                          <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-lg p-2.5 text-center flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Change Back:</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {fmtCurrency(parseFloat(splitCashAmount) - (activePayShare.amount + (parseFloat(splitTipAmount) || 0)))}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Form */}
                    {splitPaymentMethod === 'CARD' && (
                      <div className="space-y-3 animate-in fade-in duration-150 py-2">
                        {splitCardStep === 0 && (
                          <Button
                            onClick={() => {
                              setSplitCardStep(1);
                              setTimeout(() => {
                                setSplitCardStep(2);
                              }, 1500);
                            }}
                            className="w-full h-10 bg-emerald-600 hover:bg-emerald-705 text-white font-medium gap-2 rounded-xl transition-all"
                          >
                            <CreditCard className="size-4 animate-pulse" />
                            Simulate Terminal Tap
                          </Button>
                        )}
                        {splitCardStep === 1 && (
                          <div className="flex flex-col items-center justify-center py-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                            <Loader2 className="size-6 text-emerald-400 animate-spin" />
                            <span className="text-xs text-zinc-400 font-medium">Please Tap / Insert Card...</span>
                          </div>
                        )}
                        {splitCardStep === 2 && (
                          <div className="flex flex-col items-center justify-center py-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl space-y-1">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Check className="size-5" />
                            </div>
                            <span className="text-xs text-emerald-400 font-bold mt-1">Payment Authorized!</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Store Credit Form */}
                    {splitPaymentMethod === 'CREDIT' && (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Select Customer</label>
                          <Select
                            value={splitSelectedCustId}
                            onValueChange={setSplitSelectedCustId}
                          >
                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                              <SelectValue placeholder="Choose account..." />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                              {customers.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.firstName} {c.lastName} ({c.loyaltyTier})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Customer status validation */}
                        {splitSelectedCustId && (() => {
                          const customer = customers.find(c => c.id === splitSelectedCustId);
                          if (!customer) return null;
                          if (customer.allowedCredit) {
                            return (
                              <div className="bg-emerald-950/15 border border-emerald-900/30 rounded-lg p-3 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-400">Account Approved:</span>
                                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0 h-4.5">
                                    Approved
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                  <span>Current loyalty tier:</span>
                                  <span>{customer.loyaltyTier}</span>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-red-950/15 border border-red-900/30 rounded-lg p-3 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-400">Account Approved:</span>
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px] px-1.5 py-0 h-4.5">
                                    Denied
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-red-400 leading-tight">
                                  This customer is not authorized for store credit charges.
                                </p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80">
                    <Button
                      onClick={handleConfirmSplitPayment}
                      disabled={
                        isProcessingSplitPay ||
                        (splitPaymentMethod === 'CASH' && (!splitCashAmount || parseFloat(splitCashAmount) < (activePayShare.amount + (parseFloat(splitTipAmount) || 0)))) ||
                        (splitPaymentMethod === 'CARD' && splitCardStep !== 2) ||
                        (splitPaymentMethod === 'CREDIT' && (!splitSelectedCustId || !customers.find(c => c.id === splitSelectedCustId)?.allowedCredit))
                      }
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-50 text-white font-semibold gap-2 rounded-xl transition-all shadow-lg shadow-emerald-600/10"
                    >
                      {isProcessingSplitPay ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      {isProcessingSplitPay ? 'Processing...' : 'Confirm Payment'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-400">Status:</span>
                {editingOrder ? (
                  (() => {
                    const totalPaid = editingOrder.payments?.reduce((s, p) => s + p.amount, 0) || 0;
                    return (
                      <span className="text-xs text-zinc-300 font-semibold bg-zinc-800 px-2 py-0.5 rounded">
                        Paid: {fmtCurrency(totalPaid)} / {fmtCurrency(editingOrder.totalAmount)}
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-xs text-zinc-500 font-medium italic">Unfired local order draft</span>
                )}
              </div>
              <span className="text-base font-black text-emerald-400">{fmtCurrency(editingOrder ? editingOrder.totalAmount : totalAmount)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSplitBillOpen(false);
                setActivePayShare(null);
              }}
              className="border-zinc-800 text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-850"
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
              <span className="text-zinc-200">
                {orderType === 'TAKEAWAY'
                  ? 'Takeaway (No Table)'
                  : (tables.find((t) => t.id === selectedTableId)?.name ?? (selectedTableId === quickBarTableId || !selectedTableId ? 'Quick Bar' : '—'))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Items</span>
              <span className="text-zinc-200">{orderItems.length} items ({orderItems.reduce((s, i) => s + i.quantity, 0)} total)</span>
            </div>
            {orderType === 'DINE_IN' && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Guests</span>
                <span className="text-zinc-200">{guestCount}</span>
              </div>
            )}
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
