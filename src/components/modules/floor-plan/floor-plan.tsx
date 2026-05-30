'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  UtensilsCrossed,
  DollarSign,
  Map,
  RefreshCw,
  ChevronRight,
  Circle,
  Square,
  RectangleHorizontal,
  Armchair,
  Wine,
  Sun,
  Crown,
  Loader2,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  CalendarPlus,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale } from '@/stores/locale-store';
import { formatCurrencyByLocale } from '@/lib/i18n/locales';
import { TABLE_STATUS_COLORS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

/* ─── Types ─── */

type TableStatus =
  | 'FREE'
  | 'RESERVED'
  | 'SEATED'
  | 'ORDER_PLACED'
  | 'APPETIZER'
  | 'MAIN'
  | 'DESSERT'
  | 'BILL_REQUESTED'
  | 'DIRTY';

type TableSection = 'MAIN' | 'BAR' | 'PATIO' | 'VIP';
type TableShape = 'ROUND' | 'SQUARE' | 'RECTANGLE';

interface OrderItem {
  id: string;
  menuItem: { name: string; price: number };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  station: string;
  notes?: string | null;
}

interface Order {
  id: string;
  status: string;
  type: string;
  guestCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  creator: { id: string; name: string };
  items: OrderItem[];
}

interface Reservation {
  id: string;
  guestName: string;
  partySize: number;
  reservationTime: string;
  reservationDate: string;
  status: string;
  notes?: string | null;
}

interface RestaurantTable {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  section: TableSection;
  shape: TableShape;
  notes?: string | null;
  active: boolean;
  orders: Order[];
  reservations: Reservation[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ─── */

const SECTION_ICONS: Record<TableSection, React.ElementType> = {
  MAIN: Armchair,
  BAR: Wine,
  PATIO: Sun,
  VIP: Crown,
};

function getSectionLabels(t: any): Record<TableSection, string> {
  return {
    MAIN: t.floorPlan.mainDining,
    BAR: t.floorPlan.bar,
    PATIO: t.floorPlan.patio,
    VIP: t.floorPlan.vip,
  };
}

const SECTION_COLORS: Record<TableSection, string> = {
  MAIN: 'text-emerald-400',
  BAR: 'text-purple-400',
  PATIO: 'text-amber-400',
  VIP: 'text-yellow-400',
};

function getTableStatusLabel(status: string, t: any): string {
  const keyMap: Record<string, string> = {
    FREE: 'statusFree',
    RESERVED: 'statusReserved',
    SEATED: 'statusSeated',
    ORDER_PLACED: 'statusOrderPlaced',
    APPETIZER: 'statusAppetizer',
    MAIN: 'statusMain',
    DESSERT: 'statusDessert',
    BILL_REQUESTED: 'statusBillRequested',
    DIRTY: 'statusDirty',
  };
  const key = keyMap[status];
  return key ? (t.floorPlan as any)[key] : status;
}

const STATUS_DOT_COLORS: Record<TableStatus, string> = {
  FREE: 'bg-emerald-500',
  RESERVED: 'bg-sky-500',
  SEATED: 'bg-amber-500',
  ORDER_PLACED: 'bg-orange-500',
  APPETIZER: 'bg-yellow-500',
  MAIN: 'bg-red-500',
  DESSERT: 'bg-pink-500',
  BILL_REQUESTED: 'bg-violet-500',
  DIRTY: 'bg-zinc-500',
};

const ALL_STATUSES: TableStatus[] = [
  'FREE',
  'RESERVED',
  'SEATED',
  'ORDER_PLACED',
  'APPETIZER',
  'MAIN',
  'DESSERT',
  'BILL_REQUESTED',
  'DIRTY',
];

const ALL_SECTIONS: TableSection[] = ['MAIN', 'BAR', 'PATIO', 'VIP'];

const REFRESH_INTERVAL = 30000; // 30 seconds

/* ─── Summary Bar ─── */

function SummaryBar({ tables }: { tables: RestaurantTable[] }) {
  const t = useT();
  const total = tables.length;
  const free = tables.filter((tbl) => tbl.status === 'FREE').length;
  const occupied = tables.filter(
    (tbl) => !['FREE', 'RESERVED', 'DIRTY'].includes(tbl.status)
  ).length;
  const reserved = tables.filter((tbl) => tbl.status === 'RESERVED').length;
  const dirty = tables.filter((tbl) => tbl.status === 'DIRTY').length;

  const stats = [
    { label: t.floorPlan.totalTables, value: total, icon: Map, color: 'text-zinc-300' },
    { label: t.floorPlan.occupied, value: occupied, icon: UtensilsCrossed, color: 'text-amber-400' },
    { label: t.floorPlan.free, value: free, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: t.floorPlan.reserved, value: reserved, icon: Clock, color: 'text-sky-400' },
    { label: t.floorPlan.needsCleaning, value: dirty, icon: AlertCircle, color: 'text-zinc-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className={cn('p-2 rounded-lg bg-zinc-800', stat.color)}>
              <stat.icon className="size-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Status Legend ─── */

function StatusLegend() {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {ALL_STATUSES.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span className={cn('size-2.5 rounded-full shrink-0', STATUS_DOT_COLORS[status])} />
          <span className="text-[11px] text-zinc-400">{getTableStatusLabel(status, t)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Table Card ─── */

function TableCard({
  table,
  isSelected,
  onClick,
}: {
  table: RestaurantTable;
  isSelected: boolean;
  onClick: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const statusColor = TABLE_STATUS_COLORS[table.status] || '';
  const hasActiveOrder = table.orders.length > 0;
  const orderTotal = hasActiveOrder
    ? table.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    : 0;
  const isRound = table.shape === 'ROUND';

  const ShapeIcon = table.shape === 'ROUND' ? Circle : table.shape === 'SQUARE' ? Square : RectangleHorizontal;

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative w-full text-left border-2 rounded-xl p-3 transition-all duration-200 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        statusColor,
        isSelected && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950',
        isRound && 'rounded-full aspect-square flex flex-col items-center justify-center',
        !isRound && table.shape === 'RECTANGLE' && 'aspect-[2/1]',
        hasActiveOrder && 'shadow-lg'
      )}
    >
      {/* Hover glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none',
          isRound && 'rounded-full',
          'bg-gradient-to-br from-white/5 to-transparent'
        )}
      />

      {/* Status dot */}
      <div className="absolute top-2 right-2">
        <span className={cn('block size-2 rounded-full', STATUS_DOT_COLORS[table.status])} />
      </div>

      <div className={cn('relative z-10', isRound ? 'text-center' : '')}>
        {/* Table name */}
        <div className="flex items-center gap-1.5 mb-1">
          <ShapeIcon className="size-3 opacity-60 shrink-0" />
          <span className="text-xs font-semibold truncate">{table.name}</span>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1 mb-1.5">
          <Users className="size-3 opacity-60" />
          <span className="text-[10px] opacity-70">{table.capacity}</span>
        </div>

        {/* Status label */}
        <div className="mb-1">
          <span className="text-[9px] font-medium uppercase tracking-wider opacity-80">
            {getTableStatusLabel(table.status, t)}
          </span>
        </div>

        {/* Order total */}
        {hasActiveOrder && (
          <div className="flex items-center gap-1 mt-1">
            <DollarSign className="size-3 opacity-60" />
            <span className="text-[11px] font-bold">{formatCurrencyByLocale(orderTotal, locale)}</span>
          </div>
        )}

        {/* Reservation indicator */}
        {table.reservations.length > 0 && table.status === 'RESERVED' && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="size-3 opacity-60" />
            <span className="text-[10px] opacity-70">{table.reservations[0].reservationTime}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

/* ─── Table Detail Sheet ─── */

function TableDetailSheet({
  table,
  open,
  onClose,
  onStatusChange,
}: {
  table: RestaurantTable | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (tableId: string, newStatus: TableStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const t = useT();
  const locale = useLocale();
  const setView = useAppStore((s) => s.setView);
  const selectTable = useAppStore((s) => s.selectTable);

  if (!table) return null;

  const hasActiveOrder = table.orders.length > 0;
  const orderTotal = hasActiveOrder
    ? table.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    : 0;
  const SectionIcon = SECTION_ICONS[table.section];

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    try {
      await onStatusChange(table.id, newStatus as TableStatus);
    } finally {
      setUpdating(false);
    }
  }

  function handleStartOrder() {
    selectTable(table.id);
    setView('pos');
    onClose();
  }

  function handleAddReservation() {
    setView('reservations');
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="bg-zinc-900 border-zinc-800 w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl border-2',
                TABLE_STATUS_COLORS[table.status]
              )}
            >
              {table.shape === 'ROUND' ? (
                <Circle className="size-6" />
              ) : table.shape === 'SQUARE' ? (
                <Square className="size-6" />
              ) : (
                <RectangleHorizontal className="size-6" />
              )}
            </div>
            <div>
              <SheetTitle className="text-lg text-zinc-100">{table.name}</SheetTitle>
              <SheetDescription className="text-xs text-zinc-500">
                Table #{table.number} &middot; {getSectionLabels(t)[table.section]}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-4 space-y-5">
          {/* Info badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-zinc-700 text-zinc-300 gap-1.5">
              <Users className="size-3" />
              {table.capacity} {t.floorPlan.seats}
            </Badge>
            <Badge
              variant="outline"
              className={cn('gap-1.5', TABLE_STATUS_COLORS[table.status])}
            >
              <span className={cn('size-2 rounded-full', STATUS_DOT_COLORS[table.status])} />
              {getTableStatusLabel(table.status, t)}
            </Badge>
            <Badge variant="outline" className={cn('gap-1.5 border-zinc-700', SECTION_COLORS[table.section])}>
              <SectionIcon className="size-3" />
              {getSectionLabels(t)[table.section]}
            </Badge>
          </div>

          {/* Change Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {t.floorPlan.changeStatus}
            </label>
            <div className="flex items-center gap-2">
              <Select
                value={table.status}
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-200">
                  {updating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t.common.updating}</span>
                    </div>
                  ) : (
                    <SelectValue />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className={cn('size-2 rounded-full', STATUS_DOT_COLORS[s])} />
                        {getTableStatusLabel(s, t)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Current Order */}
          {hasActiveOrder ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <ShoppingCart className="size-4 text-amber-400" />
                  {t.floorPlan.currentOrder}
                </h4>
                <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-[10px]">
                  {table.orders.length} order{table.orders.length > 1 ? 's' : ''}
                </Badge>
              </div>

              {table.orders.map((order) => (
                <Card key={order.id} className="bg-zinc-800/50 border-zinc-700/50">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">
                        {t.floorPlan.server}: {order.creator.name}
                      </span>
                      <span className="text-zinc-500">
                        {order.guestCount} {order.guestCount > 1 ? t.floorPlan.guests : t.floorPlan.guest}
                      </span>
                    </div>

                    <ScrollArea className="max-h-40">
                      <div className="space-y-1.5">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs py-0.5"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-zinc-500 shrink-0">×{item.quantity}</span>
                              <span className="text-zinc-300 truncate">{item.menuItem.name}</span>
                            </div>
                            <span className="text-zinc-400 shrink-0 ml-2">
                              {formatCurrencyByLocale(item.totalPrice, locale)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Separator className="bg-zinc-700/50" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{t.common.total}</span>
                      <span className="text-sm font-bold text-zinc-100">
                        {formatCurrencyByLocale(order.totalAmount, locale)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center justify-between text-sm font-semibold pt-1">
                <span className="text-zinc-300">{t.floorPlan.orderTotal}</span>
                <span className="text-emerald-400">{formatCurrencyByLocale(orderTotal, locale)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                <ShoppingCart className="size-5 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500">{t.floorPlan.noActiveOrder}</p>
              <p className="text-[11px] text-zinc-600">{t.floorPlan.startOrderToBegin}</p>
            </div>
          )}

          {/* Reservation info */}
          {table.reservations.length > 0 && (
            <>
              <Separator className="bg-zinc-800" />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Clock className="size-4 text-sky-400" />
                  {t.floorPlan.upcomingReservation}
                </h4>
                {table.reservations.map((res) => (
                  <Card key={res.id} className="bg-zinc-800/50 border-zinc-700/50">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{res.guestName}</span>
                        <Badge variant="outline" className="border-sky-700 text-sky-400 text-[9px] px-1.5 py-0">
                          {res.reservationTime}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {res.partySize} {t.floorPlan.guests}
                        </span>
                      </div>
                      {res.notes && (
                        <p className="text-[11px] text-zinc-500 italic">&ldquo;{res.notes}&rdquo;</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Table notes */}
          {table.notes && (
            <>
              <Separator className="bg-zinc-800" />
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Notes</h4>
                <p className="text-xs text-zinc-500">{table.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <SheetFooter className="pt-4 border-t border-zinc-800 mt-4">
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleStartOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <ShoppingCart className="size-4" />
              {hasActiveOrder ? 'Continue Order' : 'Start Order'}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAddReservation}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
              >
                <CalendarPlus className="size-4" />
                Reservation
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('FREE')}
                disabled={updating || table.status === 'FREE'}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
              >
                <CheckCircle2 className="size-4" />
                Clear Table
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Section Group ─── */

function SectionGroup({
  section,
  tables,
  selectedTableId,
  onSelectTable,
}: {
  section: TableSection;
  tables: RestaurantTable[];
  selectedTableId: string | null;
  onSelectTable: (table: RestaurantTable) => void;
}) {
  const t = useT();
  const Icon = SECTION_ICONS[section];
  const sectionLabels = getSectionLabels(t);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={cn('size-4', SECTION_COLORS[section])} />
        <h3 className={cn('text-sm font-semibold', SECTION_COLORS[section])}>
          {sectionLabels[section]}
        </h3>
        <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px] px-1.5 py-0">
          {tables.length} table{tables.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <AnimatePresence mode="popLayout">
          {tables.map((table) => (
            <motion.div
              key={table.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <TableCard
                table={table}
                isSelected={selectedTableId === table.id}
                onClick={() => onSelectTable(table)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Main Floor Plan Component ─── */

export function FloorPlan() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const t = useT();
  const locale = useLocale();

  const selectedTableId = useAppStore((s) => s.selectedTableId);
  const selectTable = useAppStore((s) => s.selectTable);

  /* Fetch tables */
  const fetchTables = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/tables');
      if (!res.ok) throw new Error('Failed to fetch tables');
      const data = await res.json();
      setTables(data);
      setLastRefresh(new Date());

      // Update selected table if it exists
      if (selectedTable) {
        const updated = data.find((tbl: RestaurantTable) => tbl.id === selectedTable.id);
        if (updated) setSelectedTable(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTable]);

  /* Initial fetch + auto-refresh */
  useEffect(() => {
    fetchTables(true);
    const interval = setInterval(() => fetchTables(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /* Handle table selection from store */
  useEffect(() => {
    if (selectedTableId) {
      const tbl = tables.find((tb) => tb.id === selectedTableId);
      if (tbl) {
        setSelectedTable(tbl);
        setSheetOpen(true);
      }
    }
  }, [selectedTableId, tables]);

  /* Status change handler */
  async function handleStatusChange(tableId: string, newStatus: TableStatus) {
    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update table status');
      const updated = await res.json();

      // Update local state optimistically
      setTables((prev) =>
        prev.map((tbl) => (tbl.id === tableId ? { ...tbl, status: newStatus, updatedAt: updated.updatedAt } : tbl))
      );
      setSelectedTable((prev) =>
        prev && prev.id === tableId ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error('Status change error:', err);
      // Re-fetch to ensure consistency
      await fetchTables(false);
    }
  }

  /* Handle table card click */
  function handleSelectTable(table: RestaurantTable) {
    selectTable(table.id);
    setSelectedTable(table);
    setSheetOpen(true);
  }

  /* Filter tables by section */
  const filteredTables =
    activeSection === 'ALL'
      ? tables
      : tables.filter((tbl) => tbl.section === activeSection);

  /* Group by section for ALL view */
  const groupedTables: Record<TableSection, RestaurantTable[]> = {
    MAIN: [],
    BAR: [],
    PATIO: [],
    VIP: [],
  };
  filteredTables.forEach((tbl) => {
    if (groupedTables[tbl.section]) {
      groupedTables[tbl.section].push(tbl);
    }
  });

  /* Loading state */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-sm text-zinc-500">{t.floorPlan.loadingFloorPlan}</p>
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="size-8 text-red-500 mb-3" />
        <p className="text-sm text-zinc-400 mb-2">{t.floorPlan.failedToLoad}</p>
        <p className="text-xs text-zinc-600 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => fetchTables(true)}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className="size-4 mr-2" />
          {t.common.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Map className="size-5 text-emerald-400" />
            {t.floorPlan.title}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t.floorPlan.lastUpdated}: {lastRefresh.toLocaleTimeString(locale)}
            {refreshing && (
              <span className="ml-2 text-emerald-400 flex items-center gap-1 inline-flex">
                <Loader2 className="size-3 animate-spin" />
                {t.floorPlan.refreshing}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTables(false)}
          disabled={refreshing}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2 self-start"
        >
          <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Summary Bar */}
      <SummaryBar tables={tables} />

      {/* Section Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-zinc-900 border border-zinc-800 h-9 p-0.5">
            <TabsTrigger
              value="ALL"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 px-3 h-8 text-xs"
            >
              All
            </TabsTrigger>
            {ALL_SECTIONS.map((sec) => {
              const Icon = SECTION_ICONS[sec];
              return (
                <TabsTrigger
                  key={sec}
                  value={sec}
                  className={cn(
                    'data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 px-3 h-8 text-xs gap-1.5',
                    activeSection === sec && SECTION_COLORS[sec]
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{getSectionLabels(t)[sec]}</span>
                  <span className="sm:hidden">{sec}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Status Legend */}
        <StatusLegend />
      </div>

      {/* Floor Grid */}
      {activeSection === 'ALL' ? (
        <div className="space-y-6">
          {ALL_SECTIONS.map((section) => {
            const sectionTables = groupedTables[section];
            if (sectionTables.length === 0) return null;
            return (
              <SectionGroup
                key={section}
                section={section}
                tables={sectionTables}
                selectedTableId={selectedTable?.id ?? null}
                onSelectTable={handleSelectTable}
              />
            );
          })}
        </div>
      ) : (
        <SectionGroup
          section={activeSection as TableSection}
          tables={filteredTables}
          selectedTableId={selectedTable?.id ?? null}
          onSelectTable={handleSelectTable}
        />
      )}

      {/* Table Detail Sheet */}
      <TableDetailSheet
        table={selectedTable}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          selectTable(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
