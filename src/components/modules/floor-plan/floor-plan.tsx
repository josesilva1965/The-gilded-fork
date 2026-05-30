'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  UtensilsCrossed,
  DollarSign,
  Map,
  RefreshCw,
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
  GripVertical,
  Pencil,
  Save,
  UserCheck,
  Plus,
  Minus,
  Move,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { useT, useLocale } from '@/stores/locale-store';
import { useAppStore } from '@/stores/app-store';
import { formatCurrencyByLocale } from '@/lib/i18n/locales';
import { TABLE_STATUS_COLORS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
type ViewMode = 'sections' | 'floor';

interface ServerInfo {
  id: string;
  name: string;
  role: string;
}

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
  serverId: string | null;
  server: ServerInfo | null;
  notes?: string | null;
  active: boolean;
  orders: Order[];
  reservations: Reservation[];
  createdAt: string;
  updatedAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
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

const SECTION_BG_COLORS: Record<TableSection, string> = {
  MAIN: 'bg-emerald-500/5 border-emerald-500/10',
  BAR: 'bg-purple-500/5 border-purple-500/10',
  PATIO: 'bg-amber-500/5 border-amber-500/10',
  VIP: 'bg-yellow-500/5 border-yellow-500/10',
};

const SECTION_LABEL_BG: Record<TableSection, string> = {
  MAIN: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  BAR: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  PATIO: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  VIP: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
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
const ALL_SHAPES: TableShape[] = ['ROUND', 'SQUARE', 'RECTANGLE'];

const SHAPE_LABELS: Record<TableShape, string> = {
  ROUND: '\u2B24 Round',
  SQUARE: '\u25A0 Square',
  RECTANGLE: '\u25AC Rectangle',
};

const REFRESH_INTERVAL = 30000; // 30 seconds
const CANVAS_MIN_WIDTH = 1200;
const CANVAS_MIN_HEIGHT = 800;

/* ─── Section zone boundaries for canvas view ─── */
/* These define approximate zones on the canvas for each section */

function getSectionZones(): Record<TableSection, { x: number; y: number; w: number; h: number }> {
  return {
    MAIN: { x: 0, y: 0, w: 600, h: 400 },
    BAR: { x: 600, y: 0, w: 600, h: 400 },
    PATIO: { x: 0, y: 400, w: 600, h: 400 },
    VIP: { x: 600, y: 400, w: 600, h: 400 },
  };
}

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

/* ─── Table Card (Grid view - Draggable for swap) ─── */

function TableCard({
  table,
  isSelected,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  table: RestaurantTable;
  isSelected: boolean;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, table: RestaurantTable) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, table: RestaurantTable) => void;
  isDragOver?: boolean;
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, table)}
      onDragOver={(e) => onDragOver?.(e as unknown as React.DragEvent)}
      onDrop={(e) => onDrop?.(e as unknown as React.DragEvent, table)}
      className={cn(
        'relative',
        isDragOver && 'ring-2 ring-emerald-400 rounded-xl'
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          'relative w-full text-left border-2 rounded-xl p-3 transition-all duration-200 cursor-grab active:cursor-grabbing',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          statusColor,
          isSelected && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950',
          isRound && 'rounded-full aspect-square flex flex-col items-center justify-center',
          !isRound && table.shape === 'RECTANGLE' && 'aspect-[2/1]',
          hasActiveOrder && 'shadow-lg',
          isDragOver && 'opacity-50 scale-105'
        )}
      >
        {/* Drag handle */}
        <div className="absolute top-1 left-1 opacity-30 hover:opacity-70 transition-opacity">
          <GripVertical className="size-3" />
        </div>

        {/* Status dot */}
        <div className="absolute top-2 right-2">
          <span className={cn('block size-2 rounded-full', STATUS_DOT_COLORS[table.status])} />
        </div>

        {/* Server indicator */}
        {table.server && (
          <div className="absolute bottom-1.5 right-1.5">
            <span className="text-[8px] bg-zinc-800/80 text-emerald-400 px-1 py-0.5 rounded-full border border-emerald-500/20">
              {table.server.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}

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
      </button>
    </motion.div>
  );
}

/* ─── Canvas Table Card (Floor View) ─── */

function CanvasTableCard({
  table,
  isSelected,
  onClick,
  onDragMove,
  staff,
  onCapacityChange,
  onServerChange,
}: {
  table: RestaurantTable;
  isSelected: boolean;
  onClick: () => void;
  onDragMove: (tableId: string, deltaX: number, deltaY: number) => void;
  staff: StaffMember[];
  onCapacityChange: (tableId: string, newCapacity: number) => void;
  onServerChange: (tableId: string, serverId: string | null) => void;
}) {
  const t = useT();
  const dragRef = useRef<{ startX: number; startY: number; isDragging: boolean }>({
    startX: 0,
    startY: 0,
    isDragging: false,
  });
  const [hovered, setHovered] = useState(false);
  const [serverPopoverOpen, setServerPopoverOpen] = useState(false);
  const statusColor = TABLE_STATUS_COLORS[table.status] || '';
  const hasActiveOrder = table.orders.length > 0;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't start drag if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-interactive]')) return;

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    // Only start dragging after a minimum movement threshold
    if (!dragRef.current.isDragging && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      dragRef.current.isDragging = true;
    }

    if (dragRef.current.isDragging) {
      onDragMove(table.id, deltaX, deltaY);
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    }
  }, [table.id, onDragMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current && !dragRef.current.isDragging) {
      onClick();
    }
    dragRef.current = { startX: 0, startY: 0, isDragging: false };
  }, [onClick]);

  const eligibleStaff = staff.filter((s) => ['FOH', 'MANAGER', 'ADMIN'].includes(s.role));

  return (
    <div
      className={cn(
        'absolute group select-none',
        table.shape === 'ROUND' ? '' : '',
      )}
      style={{
        left: table.x,
        top: table.y,
        width: table.width || (table.shape === 'RECTANGLE' ? 140 : 110),
        height: table.height || (table.shape === 'RECTANGLE' ? 70 : 110),
        zIndex: isSelected ? 30 : hovered ? 20 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          'relative w-full h-full border-2 rounded-lg transition-shadow duration-200 cursor-grab active:cursor-grabbing overflow-hidden',
          'focus:outline-none',
          statusColor,
          isSelected && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-950',
          table.shape === 'ROUND' && 'rounded-full',
          hovered && !isSelected && 'ring-1 ring-zinc-500',
        )}
      >
        {/* Move icon on hover */}
        <div className={cn(
          'absolute top-1 right-1 transition-opacity duration-200',
          hovered ? 'opacity-60' : 'opacity-0'
        )}>
          <Move className="size-3" />
        </div>

        {/* Status dot */}
        <div className="absolute top-1 left-1">
          <span className={cn('block size-2 rounded-full', STATUS_DOT_COLORS[table.status])} />
        </div>

        {/* Card content */}
        <div className="flex flex-col items-center justify-center h-full p-1.5 text-center gap-0.5">
          {/* Table name */}
          <span className="text-[11px] font-semibold text-zinc-100 truncate max-w-full leading-tight">
            {table.name}
          </span>

          {/* Capacity with +/- buttons (show on hover) */}
          <div className="flex items-center gap-0.5">
            {hovered && (
              <button
                data-interactive
                onClick={(e) => {
                  e.stopPropagation();
                  onCapacityChange(table.id, Math.max(1, table.capacity - 1));
                }}
                className="size-4 flex items-center justify-center rounded bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 transition-colors"
              >
                <Minus className="size-2.5" />
              </button>
            )}
            <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
              <Users className="size-2.5" />
              {table.capacity}
            </span>
            {hovered && (
              <button
                data-interactive
                onClick={(e) => {
                  e.stopPropagation();
                  onCapacityChange(table.id, Math.min(20, table.capacity + 1));
                }}
                className="size-4 flex items-center justify-center rounded bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 transition-colors"
              >
                <Plus className="size-2.5" />
              </button>
            )}
          </div>

          {/* Server - quick assign popover on hover */}
          {hovered ? (
            <Popover open={serverPopoverOpen} onOpenChange={setServerPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  data-interactive
                  onClick={(e) => {
                    e.stopPropagation();
                    setServerPopoverOpen(true);
                  }}
                  className="text-[9px] px-1.5 py-0 rounded-full bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 flex items-center gap-0.5 transition-colors"
                >
                  <UserCheck className="size-2.5" />
                  {table.server ? table.server.name.split(' ')[0] : t.floorPlan.quickAssignServer}
                  <ChevronDown className="size-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-48 p-1 bg-zinc-800 border-zinc-700 rounded-lg"
                align="start"
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="space-y-0.5">
                  <button
                    data-interactive
                    className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-zinc-700 flex items-center gap-2 text-zinc-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServerChange(table.id, null);
                      setServerPopoverOpen(false);
                    }}
                  >
                    <XCircle className="size-3 text-zinc-500" />
                    {t.floorPlan.noServer}
                  </button>
                  {eligibleStaff.map((s) => (
                    <button
                      key={s.id}
                      data-interactive
                      className={cn(
                        'w-full text-left px-2 py-1.5 text-xs rounded hover:bg-zinc-700 flex items-center gap-2 transition-colors',
                        table.serverId === s.id ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-200'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onServerChange(table.id, s.id);
                        setServerPopoverOpen(false);
                      }}
                    >
                      <UserCheck className="size-3 text-emerald-400" />
                      {s.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : table.server ? (
            <span className="text-[8px] bg-zinc-800/80 text-emerald-400 px-1 py-0 rounded-full border border-emerald-500/20 truncate max-w-full">
              {table.server.name.split(' ').map(n => n[0]).join('')}
            </span>
          ) : null}

          {/* Order indicator */}
          {hasActiveOrder && (
            <span className="absolute bottom-1 right-1">
              <span className="block size-1.5 rounded-full bg-amber-400" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Floor View Canvas ─── */

function FloorViewCanvas({
  tables,
  selectedTableId,
  onSelectTable,
  onTablePositionChange,
  onCapacityChange,
  onServerChange,
  staff,
}: {
  tables: RestaurantTable[];
  selectedTableId: string | null;
  onSelectTable: (table: RestaurantTable) => void;
  onTablePositionChange: (tableId: string, x: number, y: number) => void;
  onCapacityChange: (tableId: string, newCapacity: number) => void;
  onServerChange: (tableId: string, serverId: string | null) => void;
  staff: StaffMember[];
}) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const localPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>({});
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Sync local positions when tables data changes
  useEffect(() => {
    const newPos: Record<string, { x: number; y: number }> = {};
    tables.forEach((tbl) => {
      newPos[tbl.id] = { x: tbl.x, y: tbl.y };
    });
    localPositionsRef.current = newPos;
    setLocalPositions(newPos);
  }, [tables]);

  const handleDragMove = useCallback((tableId: string, deltaX: number, deltaY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const current = localPositionsRef.current[tableId];
    if (!current) return;

    const newX = Math.max(0, Math.min(current.x + deltaX, CANVAS_MIN_WIDTH - 80));
    const newY = Math.max(0, Math.min(current.y + deltaY, CANVAS_MIN_HEIGHT - 60));

    localPositionsRef.current[tableId] = { x: newX, y: newY };

    // Update the DOM position directly for smooth rendering
    const el = container.querySelector(`[data-table-id="${tableId}"]`) as HTMLElement;
    if (el) {
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    }

    // Debounce save and state sync
    if (saveTimeoutRef.current[tableId]) {
      clearTimeout(saveTimeoutRef.current[tableId]);
    }
    saveTimeoutRef.current[tableId] = setTimeout(() => {
      onTablePositionChange(tableId, newX, newY);
      setLocalPositions((prev) => ({ ...prev, [tableId]: { x: newX, y: newY } }));
    }, 300);
  }, [onTablePositionChange]);

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-auto">
      <div
        ref={containerRef}
        className="relative"
        style={{
          minWidth: CANVAS_MIN_WIDTH,
          minHeight: CANVAS_MIN_HEIGHT,
          backgroundImage:
            'radial-gradient(circle, rgba(113,113,122,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Section zone labels */}
        {ALL_SECTIONS.map((section) => {
          const zone = getSectionZones()[section];
          const sectionTables = tables.filter((tbl) => tbl.section === section);
          if (sectionTables.length === 0) return null;
          const Icon = SECTION_ICONS[section];
          return (
            <div
              key={section}
              className={cn('absolute border rounded-lg pointer-events-none', SECTION_BG_COLORS[section])}
              style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
            >
              <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md border m-2 w-fit', SECTION_LABEL_BG[section])}>
                <Icon className="size-3" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{getSectionLabels(t)[section]}</span>
                <Badge variant="outline" className="border-current/20 text-current text-[8px] px-1 py-0 h-3.5 ml-1">
                  {sectionTables.length}
                </Badge>
              </div>
            </div>
          );
        })}

        {/* Table cards */}
        {tables.map((table) => (
          <div key={table.id} data-table-id={table.id}>
            <CanvasTableCard
              table={{
                ...table,
                x: localPositions[table.id]?.x ?? table.x,
                y: localPositions[table.id]?.y ?? table.y,
              }}
              isSelected={selectedTableId === table.id}
              onClick={() => onSelectTable(table)}
              onDragMove={handleDragMove}
              staff={staff}
              onCapacityChange={onCapacityChange}
              onServerChange={onServerChange}
            />
          </div>
        ))}

        {/* Drag hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-zinc-600 text-[10px] pointer-events-none">
          <Move className="size-3" />
          {t.floorPlan.dragToMove}
        </div>
      </div>
    </div>
  );
}

/* ─── Table Detail Sheet ─── */

function TableDetailSheet({
  table,
  open,
  onClose,
  onStatusChange,
  onTableUpdate,
  staff,
}: {
  table: RestaurantTable | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (tableId: string, newStatus: TableStatus) => Promise<void>;
  onTableUpdate: (tableId: string, updates: Record<string, unknown>) => Promise<void>;
  staff: StaffMember[];
}) {
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(4);
  const [editSection, setEditSection] = useState<TableSection>('MAIN');
  const [editShape, setEditShape] = useState<TableShape>('ROUND');
  const [editServerId, setEditServerId] = useState<string>('NONE');
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();

  // Sync edit state when table changes
  useEffect(() => {
    if (table) {
      setEditName(table.name);
      setEditCapacity(table.capacity);
      setEditSection(table.section);
      setEditShape(table.shape);
      setEditServerId(table.serverId || 'NONE');
    }
  }, [table]);

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

  async function handleSaveEdit() {
    setUpdating(true);
    try {
      const updates: Record<string, unknown> = {
        name: editName,
        capacity: editCapacity,
        section: editSection,
        shape: editShape,
        serverId: editServerId === 'NONE' ? null : editServerId,
      };
      await onTableUpdate(table.id, updates);
      setEditing(false);
      toast({ title: t.floorPlan.tableUpdated });
    } catch {
      toast({ title: t.floorPlan.failedToUpdateTable, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  function handleStartOrder() {
    useAppStore.getState().selectTable(table.id);
    useAppStore.getState().setView('pos');
    onClose();
  }

  function handleAddReservation() {
    useAppStore.getState().setView('reservations');
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
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg text-zinc-100">{table.name}</SheetTitle>
              <SheetDescription className="text-xs text-zinc-500">
                Table #{table.number} &middot; {getSectionLabels(t)[table.section]}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(!editing)}
              className={cn(
                'shrink-0 gap-1.5 text-xs',
                editing ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Pencil className="size-3.5" />
              {editing ? t.common.close : t.floorPlan.editTable}
            </Button>
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
            {table.server && (
              <Badge variant="outline" className="border-emerald-700 text-emerald-400 gap-1.5">
                <UserCheck className="size-3" />
                {table.server.name}
              </Badge>
            )}
          </div>

          {/* Edit Panel */}
          {editing && (
            <div className="space-y-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Pencil className="size-4 text-amber-400" />
                {t.floorPlan.editTable}
              </h4>

              {/* Table Name */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">{t.floorPlan.tableName}</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 h-9"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">{t.floorPlan.capacity}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 border-zinc-700 text-zinc-300"
                    onClick={() => setEditCapacity(Math.max(1, editCapacity - 1))}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <div className="flex items-center justify-center h-9 w-16 bg-zinc-900 border border-zinc-700 rounded-md">
                    <span className="text-lg font-bold text-zinc-100">{editCapacity}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 border-zinc-700 text-zinc-300"
                    onClick={() => setEditCapacity(Math.min(20, editCapacity + 1))}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <span className="text-xs text-zinc-500">{t.floorPlan.seats}</span>
                </div>
              </div>

              {/* Server Assignment */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">{t.floorPlan.assignServer}</Label>
                <Select value={editServerId} onValueChange={setEditServerId}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="NONE" className="text-zinc-400 focus:bg-zinc-700 focus:text-zinc-100">
                      <span className="flex items-center gap-2">
                        <XCircle className="size-3 text-zinc-500" />
                        {t.floorPlan.noServer}
                      </span>
                    </SelectItem>
                    {staff
                      .filter((s) => ['FOH', 'MANAGER', 'ADMIN'].includes(s.role))
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                          <span className="flex items-center gap-2">
                            <UserCheck className="size-3 text-emerald-400" />
                            {s.name}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">{t.floorPlan.tableSection}</Label>
                <Select value={editSection} onValueChange={(v) => setEditSection(v as TableSection)}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {ALL_SECTIONS.map((sec) => {
                      const Icon = SECTION_ICONS[sec];
                      return (
                        <SelectItem key={sec} value={sec} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                          <span className="flex items-center gap-2">
                            <Icon className={cn('size-3', SECTION_COLORS[sec])} />
                            {getSectionLabels(t)[sec]}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Shape */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">{t.floorPlan.tableShape}</Label>
                <Select value={editShape} onValueChange={(v) => setEditShape(v as TableShape)}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {ALL_SHAPES.map((shape) => (
                      <SelectItem key={shape} value={shape} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                        {SHAPE_LABELS[shape]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Save button */}
              <Button
                onClick={handleSaveEdit}
                disabled={updating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {updating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {t.floorPlan.saveChanges}
              </Button>
            </div>
          )}

          {/* Change Status */}
          {!editing && (
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
          )}

          <Separator className="bg-zinc-800" />

          {/* Server info (non-editing) */}
          {!editing && table.server && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <UserCheck className="size-4 text-emerald-400" />
                  {t.floorPlan.server}
                </h4>
                <Card className="bg-zinc-800/50 border-zinc-700/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold">
                      {table.server.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{table.server.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{table.server.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Separator className="bg-zinc-800" />
            </>
          )}

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
                              <span className="text-zinc-500 shrink-0">&times;{item.quantity}</span>
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
              {hasActiveOrder ? t.floorPlan.continueOrder : t.floorPlan.startOrder}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAddReservation}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
              >
                <CalendarPlus className="size-4" />
                {t.floorPlan.reservation}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('FREE')}
                disabled={updating || table.status === 'FREE'}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
              >
                <CheckCircle2 className="size-4" />
                {t.floorPlan.clearTable}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Section Group (with drag-and-drop reorder) ─── */

function SectionGroup({
  section,
  tables,
  selectedTableId,
  onSelectTable,
  onTableMove,
}: {
  section: TableSection;
  tables: RestaurantTable[];
  selectedTableId: string | null;
  onSelectTable: (table: RestaurantTable) => void;
  onTableMove: (movedTableId: string, targetTableId: string) => void;
}) {
  const t = useT();
  const Icon = SECTION_ICONS[section];
  const sectionLabels = getSectionLabels(t);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

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
        <span className="text-[10px] text-zinc-600 ml-1">{t.floorPlan.dragToReorder}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <AnimatePresence mode="popLayout">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              isSelected={selectedTableId === table.id}
              onClick={() => onSelectTable(table)}
              isDragOver={dragOverId === table.id}
              onDragStart={(e, tbl) => {
                setDraggedId(tbl.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverId(table.id);
              }}
              onDrop={(e, targetTable) => {
                e.preventDefault();
                setDragOverId(null);
                if (draggedId && draggedId !== targetTable.id) {
                  onTableMove(draggedId, targetTable.id);
                }
                setDraggedId(null);
              }}
            />
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
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();

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

  /* Fetch staff for server assignment */
  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch('/api/staff');
        if (res.ok) {
          const data = await res.json();
          setStaff(data.map((u: any) => ({ id: u.id, name: u.name, role: u.role })));
        }
      } catch {
        // Silently fail - staff dropdown just won't populate
      }
    }
    fetchStaff();
  }, []);

  /* Initial fetch + auto-refresh */
  useEffect(() => {
    fetchTables(true);
    const interval = setInterval(() => fetchTables(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const selectedTableId = useAppStore((s) => s.selectedTableId);
  const selectTable = useAppStore((s) => s.selectTable);

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

      setTables((prev) =>
        prev.map((tbl) => (tbl.id === tableId ? { ...tbl, status: newStatus, updatedAt: updated.updatedAt } : tbl))
      );
      setSelectedTable((prev) =>
        prev && prev.id === tableId ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error('Status change error:', err);
      await fetchTables(false);
    }
  }

  /* Table update handler (capacity, server, section, shape, name) */
  async function handleTableUpdate(tableId: string, updates: Record<string, unknown>) {
    const res = await fetch('/api/tables', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tableId, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update table');
    const updated = await res.json();

    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        return {
          ...tbl,
          ...updates,
          serverId: updates.serverId as string | null,
          server: updated.server || (updates.serverId ? staff.find(s => s.id === updates.serverId) || null : null),
          updatedAt: updated.updatedAt,
        };
      })
    );
    setSelectedTable((prev) => {
      if (!prev || prev.id !== tableId) return prev;
      return {
        ...prev,
        ...updates,
        serverId: updates.serverId as string | null,
        server: updated.server || (updates.serverId ? staff.find(s => s.id === updates.serverId) || null : null),
      };
    });
  }

  /* Drag-and-drop: swap positions of two tables (section view) */
  async function handleTableMove(movedTableId: string, targetTableId: string) {
    const movedTable = tables.find((t) => t.id === movedTableId);
    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!movedTable || !targetTable) return;

    // Swap x,y positions
    try {
      await Promise.all([
        fetch('/api/tables', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: movedTableId, x: targetTable.x, y: targetTable.y }),
        }),
        fetch('/api/tables', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetTableId, x: movedTable.x, y: movedTable.y }),
        }),
      ]);

      // Optimistic update
      setTables((prev) =>
        prev.map((tbl) => {
          if (tbl.id === movedTableId) return { ...tbl, x: targetTable.x, y: targetTable.y };
          if (tbl.id === targetTableId) return { ...tbl, x: movedTable.x, y: movedTable.y };
          return tbl;
        })
      );
      toast({ title: t.floorPlan.tableUpdated });
    } catch {
      toast({ title: t.floorPlan.failedToUpdateTable, variant: 'destructive' });
      await fetchTables(false);
    }
  }

  /* Floor view: position change handler */
  async function handleTablePositionChange(tableId: string, x: number, y: number) {
    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, x, y }),
      });
      if (!res.ok) throw new Error('Failed to save position');

      setTables((prev) =>
        prev.map((tbl) => (tbl.id === tableId ? { ...tbl, x, y } : tbl))
      );
      setSelectedTable((prev) =>
        prev && prev.id === tableId ? { ...prev, x, y } : prev
      );
      toast({ title: t.floorPlan.positionSaved });
    } catch {
      toast({ title: t.floorPlan.positionSaveFailed, variant: 'destructive' });
    }
  }

  /* Floor view: quick capacity change handler */
  async function handleCapacityChange(tableId: string, newCapacity: number) {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.capacity === newCapacity) return;

    // Optimistic update
    setTables((prev) =>
      prev.map((tbl) => (tbl.id === tableId ? { ...tbl, capacity: newCapacity } : tbl))
    );
    setSelectedTable((prev) =>
      prev && prev.id === tableId ? { ...prev, capacity: newCapacity } : prev
    );

    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, capacity: newCapacity }),
      });
      if (!res.ok) throw new Error('Failed to update capacity');
      toast({ title: t.floorPlan.tableUpdated });
    } catch {
      toast({ title: t.floorPlan.failedToUpdateTable, variant: 'destructive' });
      // Revert optimistic update
      setTables((prev) =>
        prev.map((tbl) => (tbl.id === tableId ? { ...tbl, capacity: table.capacity } : tbl))
      );
      setSelectedTable((prev) =>
        prev && prev.id === tableId ? { ...prev, capacity: table.capacity } : prev
      );
    }
  }

  /* Floor view: quick server change handler */
  async function handleServerChange(tableId: string, serverId: string | null) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const newServer = serverId ? staff.find(s => s.id === serverId) || null : null;

    // Optimistic update
    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === tableId ? { ...tbl, serverId, server: newServer } : tbl
      )
    );
    setSelectedTable((prev) =>
      prev && prev.id === tableId ? { ...prev, serverId, server: newServer } : prev
    );

    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, serverId }),
      });
      if (!res.ok) throw new Error('Failed to update server');
      const updated = await res.json();
      // Use server data from API response if available
      if (updated.server) {
        setTables((prev) =>
          prev.map((tbl) =>
            tbl.id === tableId ? { ...tbl, server: updated.server } : tbl
          )
        );
        setSelectedTable((prev) =>
          prev && prev.id === tableId ? { ...prev, server: updated.server } : prev
        );
      }
      toast({ title: t.floorPlan.tableUpdated });
    } catch {
      toast({ title: t.floorPlan.failedToUpdateTable, variant: 'destructive' });
      // Revert optimistic update
      setTables((prev) =>
        prev.map((tbl) =>
          tbl.id === tableId ? { ...tbl, serverId: table.serverId, server: table.server } : tbl
        )
      );
      setSelectedTable((prev) =>
        prev && prev.id === tableId ? { ...prev, serverId: table.serverId, server: table.server } : prev
      );
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
        <div className="flex items-center gap-2 self-start">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
            <button
              onClick={() => setViewMode('sections')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                viewMode === 'sections'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <LayoutGrid className="size-3.5" />
              {t.floorPlan.sectionView}
            </button>
            <button
              onClick={() => setViewMode('floor')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                viewMode === 'floor'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Map className="size-3.5" />
              {t.floorPlan.floorView}
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTables(false)}
            disabled={refreshing}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
          >
            <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
            {t.common.refresh}
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      <SummaryBar tables={tables} />

      {/* Section Tabs (only in sections view) */}
      {viewMode === 'sections' && (
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
                {t.common.all}
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
      )}

      {/* Status Legend for floor view */}
      {viewMode === 'floor' && (
        <div className="flex items-center justify-between">
          <StatusLegend />
          <span className="text-[10px] text-zinc-600 hidden sm:inline">{t.floorPlan.dragToMove}</span>
        </div>
      )}

      {/* Floor Content */}
      {viewMode === 'sections' ? (
        /* Section View (Grid) */
        activeSection === 'ALL' ? (
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
                  onTableMove={handleTableMove}
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
            onTableMove={handleTableMove}
          />
        )
      ) : (
        /* Floor View (Canvas) */
        <FloorViewCanvas
          tables={viewMode === 'floor' ? tables : filteredTables}
          selectedTableId={selectedTable?.id ?? null}
          onSelectTable={handleSelectTable}
          onTablePositionChange={handleTablePositionChange}
          onCapacityChange={handleCapacityChange}
          onServerChange={handleServerChange}
          staff={staff}
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
        onTableUpdate={handleTableUpdate}
        staff={staff}
      />
    </div>
  );
}
