'use client';

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  User,
  UserCheck,
  Plus,
  Minus,
  Move,
  LayoutGrid,
  ChevronDown,
  Bell,
  Trash2,
  QrCode,
  Copy,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { useT, useLocale } from '@/stores/locale-store';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { getSocket } from '@/lib/socket';
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

/* ─── Table Card (Grid view - Sortable via @dnd-kit) ─── */

function TableCardContent({
  table,
  isSelected,
  statusColor,
  isDragging,
}: {
  table: RestaurantTable;
  isSelected: boolean;
  statusColor: string;
  isDragging?: boolean;
}) {
  const t = useT();
  const locale = useLocale();
  const hasActiveOrder = (table.orders?.length || 0) > 0;
  const hasReadyItems = table.orders?.some(o => 
    o.items?.some(i => i.status === 'READY')
  );
  const orderTotal = hasActiveOrder && table.orders
    ? table.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    : 0;
  const isRound = table.shape === 'ROUND';
  const ShapeIcon = table.shape === 'ROUND' ? Circle : table.shape === 'SQUARE' ? Square : RectangleHorizontal;

  return (
    <div
      className={cn(
        'relative w-full text-left border-2 rounded-xl p-3 transition-all duration-200 cursor-grab active:cursor-grabbing',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        statusColor,
        isSelected && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950',
        isRound && 'rounded-full aspect-square flex flex-col items-center justify-center',
        !isRound && table.shape === 'RECTANGLE' && 'aspect-[2/1]',
        hasActiveOrder && 'shadow-lg',
        isDragging && 'opacity-60 scale-105 shadow-xl shadow-black/40 ring-2 ring-emerald-400/50',
        hasReadyItems && 'ring-2 ring-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.35)] border-emerald-500',
      )}
    >
      {/* Drag handle */}
      <div className="absolute top-1 left-1 opacity-30 hover:opacity-70 transition-opacity">
        <GripVertical className="size-3" />
      </div>

      {/* Status dot / Ready alert */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
        {hasReadyItems && (
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 flex items-center justify-center">
              <Bell className="size-1.5 text-white fill-white shrink-0" />
            </span>
          </span>
        )}
        <span className={cn('block size-2 rounded-full', STATUS_DOT_COLORS[table.status])} />
      </div>

      {/* Server indicator */}
      {table.server && (
        <div className="absolute bottom-1.5 right-1.5 z-20">
          <span className="text-[8px] bg-zinc-800/80 text-emerald-400 px-1 py-0.5 rounded-full border border-emerald-500/20">
            {table.server.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      )}

      {/* Customer indicator */}
      {(table as any).customer && (
        <div className="absolute bottom-1.5 left-1.5 z-20">
          <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1 py-0.5 rounded border border-purple-500/20 max-w-16 truncate block" title={`${(table as any).customer.firstName} ${(table as any).customer.lastName}`}>
            👤 {(table as any).customer.firstName}
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
        {(table.reservations?.length || 0) > 0 && table.status === 'RESERVED' && table.reservations?.[0] && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="size-3 opacity-60" />
            <span className="text-[10px] opacity-70">{table.reservations[0].reservationTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableTableCard({
  table,
  isSelected,
  onClick,
}: {
  table: RestaurantTable;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColor = TABLE_STATUS_COLORS[table.status] || '';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: table.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="relative"
    >
      <TableCardContent
        table={table}
        isSelected={isSelected}
        statusColor={statusColor}
      />
    </div>
  );
}

/* ─── Canvas Table Card (Floor View) ─── */

/* ─── Guides Drawing Helpers ─── */
function drawGuides(container: HTMLDivElement, guides: Array<{ type: 'h' | 'v'; coord: number; min: number; max: number }>) {
  container.innerHTML = '';
  guides.forEach((g) => {
    const el = document.createElement('div');
    el.className = 'absolute border-cyan-400 pointer-events-none z-40';
    if (g.type === 'v') {
      el.style.borderLeft = '1.5px dashed rgb(34 211 238)'; // cyan-400
      el.style.left = `${g.coord}px`;
      el.style.top = `${g.min}px`;
      el.style.width = '0px';
      el.style.height = `${g.max - g.min}px`;
    } else {
      el.style.borderTop = '1.5px dashed rgb(34 211 238)';
      el.style.left = `${g.min}px`;
      el.style.top = `${g.coord}px`;
      el.style.width = `${g.max - g.min}px`;
      el.style.height = '0px';
    }
    container.appendChild(el);
  });
}

function clearGuides(container: HTMLDivElement) {
  container.innerHTML = '';
}

function CanvasTableCard({
  table,
  x,
  y,
  width,
  height,
  isSelected,
  onClick,
  onDragMove,
  onDragEnd,
  onResize,
  onResizeEnd,
  staff,
  onCapacityChange,
  onServerChange,
  onTableUpdate,
  isLayoutEditable,
  zoom,
  snapToGrid,
  guidesContainerRef,
  getStaticTablesBounds,
}: {
  table: RestaurantTable;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  onClick: () => void;
  onDragMove: (tableId: string, x: number, y: number) => void;
  onDragEnd: (tableId: string) => void;
  onResize: (tableId: string, width: number, height: number) => void;
  onResizeEnd: (tableId: string) => void;
  staff: StaffMember[];
  onCapacityChange: (tableId: string, newCapacity: number) => void;
  onServerChange: (tableId: string, serverId: string | null) => void;
  onTableUpdate: (tableId: string, updates: Record<string, unknown>) => Promise<void>;
  isLayoutEditable: boolean;
  zoom: number;
  snapToGrid: boolean;
  guidesContainerRef: React.RefObject<HTMLDivElement | null>;
  getStaticTablesBounds: (tableId: string) => Array<{
    id: string;
    left: number;
    right: number;
    top: number;
    bottom: number;
    centerX: number;
    centerY: number;
  }>;
}) {
  const t = useT();
  const elementRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [serverPopoverOpen, setServerPopoverOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const statusColor = TABLE_STATUS_COLORS[table.status] || '';
  const hasActiveOrder = (table.orders?.length || 0) > 0;
  const hasReadyItems = table.orders?.some(o => 
    o.items?.some(i => i.status === 'READY')
  );

  // Keep refs of dimensions to avoid constant listener re-bindings
  const tableWidthRef = useRef(width);
  const tableHeightRef = useRef(height);
  useEffect(() => {
    tableWidthRef.current = width;
    tableHeightRef.current = height;
  }, [width, height]);

  // Use refs for callbacks to avoid stale closures in document event listeners
  const onDragMoveRef = useRef(onDragMove);
  const onDragEndRef = useRef(onDragEnd);
  const onResizeRef = useRef(onResize);
  const onResizeEndRef = useRef(onResizeEnd);
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onDragMoveRef.current = onDragMove;
    onDragEndRef.current = onDragEnd;
    onResizeRef.current = onResize;
    onResizeEndRef.current = onResizeEnd;
    onClickRef.current = onClick;
  });

  // Document-level resize handling for robust pointer tracking
  useEffect(() => {
    const handleEl = resizeHandleRef.current;
    if (!handleEl || !isLayoutEditable) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startWidth = tableWidthRef.current;
      const startHeight = tableHeightRef.current;
      const startX = e.clientX;
      const startY = e.clientY;

      const staticTables = getStaticTablesBounds(table.id);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = startWidth + deltaX / zoom;
        let newHeight = startHeight + deltaY / zoom;

        // Snapping bottom-right corner during resize
        let snapR: number | null = null;
        let snapB: number | null = null;
        const guidesToDraw: Array<{ type: 'h' | 'v'; coord: number; min: number; max: number }> = [];

        const SNAP_TOLERANCE = 8;
        const currentX = table.x;
        const currentY = table.y;
        const dR = currentX + newWidth;
        const dB = currentY + newHeight;

        staticTables.forEach((st) => {
          if (Math.abs(dR - st.left) < SNAP_TOLERANCE) {
            snapR = st.left;
            guidesToDraw.push({ type: 'v', coord: st.left, min: Math.min(currentY, st.top), max: Math.max(currentY + newHeight, st.bottom) });
          } else if (Math.abs(dR - st.right) < SNAP_TOLERANCE) {
            snapR = st.right;
            guidesToDraw.push({ type: 'v', coord: st.right, min: Math.min(currentY, st.top), max: Math.max(currentY + newHeight, st.bottom) });
          }
          if (Math.abs(dB - st.top) < SNAP_TOLERANCE) {
            snapB = st.top;
            guidesToDraw.push({ type: 'h', coord: st.top, min: Math.min(currentX, st.left), max: Math.max(currentX + newWidth, st.right) });
          } else if (Math.abs(dB - st.bottom) < SNAP_TOLERANCE) {
            snapB = st.bottom;
            guidesToDraw.push({ type: 'h', coord: st.bottom, min: Math.min(currentX, st.left), max: Math.max(currentX + newWidth, st.right) });
          }
        });

        if (snapR !== null) {
          newWidth = snapR - currentX;
        } else if (snapToGrid) {
          newWidth = Math.round((startWidth + deltaX / zoom) / 20) * 20;
        }

        if (snapB !== null) {
          newHeight = snapB - currentY;
        } else if (snapToGrid) {
          newHeight = Math.round((startHeight + deltaY / zoom) / 20) * 20;
        }

        // Restrict size between 60px and 300px
        newWidth = Math.max(60, Math.min(300, newWidth));
        newHeight = Math.max(40, Math.min(300, newHeight));

        // Directly manipulate style of the card element
        if (elementRef.current) {
          elementRef.current.style.width = `${newWidth}px`;
          elementRef.current.style.height = `${newHeight}px`;
        }

        // Render guides
        if (guidesContainerRef && guidesContainerRef.current) {
          drawGuides(guidesContainerRef.current, guidesToDraw);
        }

        // Collision detection
        const draggedRect = {
          left: currentX,
          right: currentX + newWidth,
          top: currentY,
          bottom: currentY + newHeight
        };
        const hasCollision = staticTables.some((st) => {
          return !(
            st.left >= draggedRect.right ||
            st.right <= draggedRect.left ||
            st.top >= draggedRect.bottom ||
            st.bottom <= draggedRect.top
          );
        });

        // Toggle warning styling directly on card DOM
        if (elementRef.current) {
          const cardEl = elementRef.current.firstElementChild as HTMLDivElement;
          const warningIconEl = elementRef.current.querySelector('[data-warning-icon]') as HTMLElement;
          if (hasCollision) {
            cardEl?.classList.add('ring-red-500', 'border-red-500', 'shadow-[0_0_15px_rgba(239,68,68,0.4)]');
            warningIconEl?.classList.remove('hidden');
            warningIconEl?.classList.add('opacity-100');
          } else {
            cardEl?.classList.remove('ring-red-500', 'border-red-500', 'shadow-[0_0_15px_rgba(239,68,68,0.4)]');
            warningIconEl?.classList.add('hidden');
            warningIconEl?.classList.remove('opacity-100');
          }
        }

        onResizeRef.current(table.id, newWidth, newHeight);
      };

      const handlePointerUp = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        
        if (guidesContainerRef && guidesContainerRef.current) {
          clearGuides(guidesContainerRef.current);
        }

        onResizeEndRef.current(table.id);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
    };

    handleEl.addEventListener('pointerdown', handlePointerDown);

    return () => {
      handleEl.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [table.id, table.x, table.y, isLayoutEditable, zoom, snapToGrid, getStaticTablesBounds, onResize, onResizeEnd]);

  // Document-level drag handling for robust pointer tracking
  useEffect(() => {
    const el = elementRef.current;
    if (!el || !isLayoutEditable) return;

    let dragState: { isDragging: boolean; startX: number; startY: number; startMouseX: number; startMouseY: number } | null = null;

    const handlePointerDown = (e: PointerEvent) => {
      // Don't start drag if clicking on buttons or interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[data-interactive]')) return;

      e.preventDefault();
      e.stopPropagation();

      dragState = {
        isDragging: false,
        startX: table.x,
        startY: table.y,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
      };

      // Attach document-level listeners for reliable tracking
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;

      const deltaMouseX = e.clientX - dragState.startMouseX;
      const deltaMouseY = e.clientY - dragState.startMouseY;

      // Only start dragging after a minimum movement threshold
      if (!dragState.isDragging && (Math.abs(deltaMouseX) > 3 || Math.abs(deltaMouseY) > 3)) {
        dragState.isDragging = true;
        setIsDragging(true);
      }

      if (dragState.isDragging) {
        e.preventDefault();

        let newX = dragState.startX + deltaMouseX / zoom;
        let newY = dragState.startY + deltaMouseY / zoom;

        // Snapping and guides
        const staticTables = getStaticTablesBounds(table.id);
        const w = table.width;
        const h = table.height;

        let snapX: number | null = null;
        let snapY: number | null = null;
        const guidesToDraw: Array<{ type: 'h' | 'v'; coord: number; min: number; max: number }> = [];

        const SNAP_TOLERANCE = 8;

        const dL = newX;
        const dR = newX + w;
        const dC = newX + w / 2;

        const dT = newY;
        const dB = newY + h;
        const dC_y = newY + h / 2;

        // Check vertical alignments
        staticTables.forEach((st) => {
          if (Math.abs(dL - st.left) < SNAP_TOLERANCE) {
            snapX = st.left;
            guidesToDraw.push({ type: 'v', coord: st.left, min: Math.min(newY, st.top), max: Math.max(newY + h, st.bottom) });
          } else if (Math.abs(dR - st.right) < SNAP_TOLERANCE) {
            snapX = st.right - w;
            guidesToDraw.push({ type: 'v', coord: st.right, min: Math.min(newY, st.top), max: Math.max(newY + h, st.bottom) });
          } else if (Math.abs(dC - st.centerX) < SNAP_TOLERANCE) {
            snapX = st.centerX - w / 2;
            guidesToDraw.push({ type: 'v', coord: st.centerX, min: Math.min(newY, st.top), max: Math.max(newY + h, st.bottom) });
          } else if (Math.abs(dL - st.right) < SNAP_TOLERANCE) {
            snapX = st.right;
            guidesToDraw.push({ type: 'v', coord: st.right, min: Math.min(newY, st.top), max: Math.max(newY + h, st.bottom) });
          } else if (Math.abs(dR - st.left) < SNAP_TOLERANCE) {
            snapX = st.left - w;
            guidesToDraw.push({ type: 'v', coord: st.left, min: Math.min(newY, st.top), max: Math.max(newY + h, st.bottom) });
          }
        });

        // Check horizontal alignments
        staticTables.forEach((st) => {
          if (Math.abs(dT - st.top) < SNAP_TOLERANCE) {
            snapY = st.top;
            guidesToDraw.push({ type: 'h', coord: st.top, min: Math.min(newX, st.left), max: Math.max(newX + w, st.right) });
          } else if (Math.abs(dB - st.bottom) < SNAP_TOLERANCE) {
            snapY = st.bottom - h;
            guidesToDraw.push({ type: 'h', coord: st.bottom, min: Math.min(newX, st.left), max: Math.max(newX + w, st.right) });
          } else if (Math.abs(dC_y - st.centerY) < SNAP_TOLERANCE) {
            snapY = st.centerY - h / 2;
            guidesToDraw.push({ type: 'h', coord: st.centerY, min: Math.min(newX, st.left), max: Math.max(newX + w, st.right) });
          } else if (Math.abs(dT - st.bottom) < SNAP_TOLERANCE) {
            snapY = st.bottom;
            guidesToDraw.push({ type: 'h', coord: st.bottom, min: Math.min(newX, st.left), max: Math.max(newX + w, st.right) });
          } else if (Math.abs(dB - st.top) < SNAP_TOLERANCE) {
            snapY = st.top - h;
            guidesToDraw.push({ type: 'h', coord: st.top, min: Math.min(newX, st.left), max: Math.max(newX + w, st.right) });
          }
        });

        // Apply snapping
        if (snapX !== null) {
          newX = snapX;
        } else if (snapToGrid) {
          newX = Math.round(newX / 20) * 20;
        }

        if (snapY !== null) {
          newY = snapY;
        } else if (snapToGrid) {
          newY = Math.round(newY / 20) * 20;
        }

        // Limit coordinates to fit canvas bounds
        newX = Math.max(0, Math.min(newX, CANVAS_MIN_WIDTH - w));
        newY = Math.max(0, Math.min(newY, CANVAS_MIN_HEIGHT - h));

        // Directly manipulate DOM coordinates
        if (elementRef.current) {
          elementRef.current.style.left = `${newX}px`;
          elementRef.current.style.top = `${newY}px`;
        }

        // Render guides
        if (guidesContainerRef && guidesContainerRef.current) {
          drawGuides(guidesContainerRef.current, guidesToDraw);
        }

        // Collision detection
        const draggedRect = {
          left: newX,
          right: newX + w,
          top: newY,
          bottom: newY + h
        };
        const hasCollision = staticTables.some((st) => {
          return !(
            st.left >= draggedRect.right ||
            st.right <= draggedRect.left ||
            st.top >= draggedRect.bottom ||
            st.bottom <= draggedRect.top
          );
        });

        // Toggle warning styling directly on card DOM
        if (elementRef.current) {
          const cardEl = elementRef.current.firstElementChild as HTMLDivElement;
          const warningIconEl = elementRef.current.querySelector('[data-warning-icon]') as HTMLElement;
          if (hasCollision) {
            cardEl?.classList.add('ring-red-500', 'border-red-500', 'shadow-[0_0_15px_rgba(239,68,68,0.4)]');
            warningIconEl?.classList.remove('hidden');
            warningIconEl?.classList.add('opacity-100');
          } else {
            cardEl?.classList.remove('ring-red-500', 'border-red-500', 'shadow-[0_0_15px_rgba(239,68,68,0.4)]');
            warningIconEl?.classList.add('hidden');
            warningIconEl?.classList.remove('opacity-100');
          }
        }

        onDragMove(table.id, newX, newY);
      }
    };

    const handlePointerUp = () => {
      const wasDragging = dragState?.isDragging ?? false;
      if (dragState && !wasDragging) {
        onClickRef.current();
      }
      dragState = null;
      setIsDragging(false);

      if (guidesContainerRef && guidesContainerRef.current) {
        clearGuides(guidesContainerRef.current);
      }

      if (wasDragging) {
        onDragEndRef.current(table.id);
      }

      // Remove document-level listeners
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    el.addEventListener('pointerdown', handlePointerDown);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [table.id, table.x, table.y, table.width, table.height, isLayoutEditable, zoom, snapToGrid, getStaticTablesBounds, onDragMove, onDragEnd, onClick]);

  const eligibleStaff = staff.filter((s) => ['FOH', 'MANAGER', 'ADMIN'].includes(s.role));
  const ShapeIcon = table.shape === 'ROUND' ? Circle : table.shape === 'SQUARE' ? Square : RectangleHorizontal;

  return (
    <div
      ref={elementRef}
      className={cn(
        'absolute group select-none',
        isDragging && 'z-50',
      )}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: isDragging ? 50 : isSelected ? 30 : hovered ? 20 : 10,
        touchAction: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={!isLayoutEditable ? onClick : undefined}
      onDoubleClick={(e) => {
        if (!isLayoutEditable) return;
        e.stopPropagation();
        const shapes: TableShape[] = ['ROUND', 'SQUARE', 'RECTANGLE'];
        const nextIdx = (shapes.indexOf(table.shape) + 1) % shapes.length;
        const nextShape = shapes[nextIdx];
        
        let newW = width;
        let newH = height;
        if (nextShape === 'RECTANGLE' && table.shape !== 'RECTANGLE') {
          newW = 140;
          newH = 70;
        } else if (nextShape !== 'RECTANGLE' && table.shape === 'RECTANGLE') {
          newW = 110;
          newH = 110;
        }

        onTableUpdate(table.id, { shape: nextShape, width: newW, height: newH });
      }}
    >
      <div
        className={cn(
          'relative w-full h-full border-2 rounded-lg transition-shadow duration-200 overflow-hidden',
          isLayoutEditable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
          'focus:outline-none',
          statusColor,
          isSelected && !isDragging && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-950',
          table.shape === 'ROUND' && 'rounded-full',
          hovered && !isSelected && !isDragging && 'ring-1 ring-zinc-500',
          isDragging && 'shadow-xl shadow-black/40 ring-2 ring-emerald-400/50',
          hasReadyItems && 'ring-2 ring-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)] border-emerald-500',
        )}
      >
        {/* Move icon on hover */}
        {isLayoutEditable && (
          <div className={cn(
            'absolute top-1 right-1 transition-opacity duration-200',
            (hovered || isDragging) ? 'opacity-60' : 'opacity-0'
          )}>
            <Move className="size-3" />
          </div>
        )}

        {/* Ready item notification bell */}
        {hasReadyItems && !isLayoutEditable && (
          <div className="absolute top-1 right-1 z-25 text-emerald-400 animate-bounce">
            <Bell className="size-3 fill-emerald-400/20" />
          </div>
        )}

        {/* Status dot / Alert dot / Collision warning */}
        <div className="absolute top-1 left-1 flex items-center gap-1 z-20">
          <span className={cn('block size-2 rounded-full', STATUS_DOT_COLORS[table.status])} />
          {hasReadyItems && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          {/* Collision warning indicator (hidden by default) */}
          <AlertCircle data-warning-icon className="size-3 text-red-500 fill-red-500/10 hidden animate-bounce shrink-0" />
        </div>

        {/* Card content */}
        <div className="flex flex-col items-center justify-center h-full p-1.5 text-center gap-0.5">
          {/* Table name */}
          <div className="flex items-center gap-1 leading-tight max-w-full justify-center">
            <ShapeIcon className="size-2.5 opacity-60 shrink-0" />
            <span className="text-[11px] font-semibold text-zinc-100 truncate max-w-full">
              {table.name}
            </span>
          </div>

          {/* Capacity with +/- buttons - always visible */}
          <div className={cn("flex items-center gap-0.5 transition-opacity duration-150", (hovered || isDragging) ? "opacity-100" : "opacity-50")}>
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
            <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
              <Users className="size-2.5" />
              {table.capacity}
            </span>
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
          </div>

          {/* Server - always visible assign button */}
          <div className={cn("transition-opacity duration-150", (hovered || isDragging) ? "opacity-100" : "opacity-50")}>
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
          </div>

          {/* Order indicator */}
          {hasActiveOrder && !isLayoutEditable && (
            <span className="absolute bottom-1 right-1">
              <span className="block size-1.5 rounded-full bg-amber-400" />
            </span>
          )}

          {/* Resize handle in bottom-right corner */}
          {isLayoutEditable && (
            <div
              ref={resizeHandleRef}
              data-interactive
              className="absolute bottom-1 right-1 size-4 cursor-se-resize flex items-end justify-end p-0.5 z-35"
            >
              <svg
                width="6"
                height="6"
                viewBox="0 0 6 6"
                className="text-zinc-500 hover:text-emerald-400 transition-colors"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 0L0 6M6 3L3 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoizedCanvasTableCard = memo(CanvasTableCard, (prev, next) => {
  return (
    prev.table.id === next.table.id &&
    prev.x === next.x &&
    prev.y === next.y &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.table.status === next.table.status &&
    prev.table.capacity === next.table.capacity &&
    prev.table.serverId === next.table.serverId &&
    (prev.table as any).customerId === (next.table as any).customerId &&
    prev.isSelected === next.isSelected &&
    prev.isLayoutEditable === next.isLayoutEditable &&
    prev.zoom === next.zoom &&
    prev.snapToGrid === next.snapToGrid
  );
});

/* ─── Layout Scaling Helper for Grid Coordinate Translation ─── */

function getInitialPixelPos(table: RestaurantTable): { x: number; y: number } {
  // If coordinates are already absolute pixels (e.g., > 10), keep them as is
  if (table.x > 10 || table.y > 10) {
    return { x: table.x, y: table.y };
  }

  const zone = getSectionZones()[table.section];
  
  // Custom cell positioning designed to fill the 600x400 section zone beautifully
  const colWidth = 135;
  const rowHeight = 110;
  const paddingX = 40;
  const paddingY = 90;

  let posX = zone.x + paddingX + (table.x * colWidth);
  let posY = zone.y + paddingY + (table.y * rowHeight);

  // Bound within the section zone to avoid initial overlaps or clipping
  const width = table.shape === 'RECTANGLE' ? 140 : 110;
  const height = table.shape === 'RECTANGLE' ? 70 : 110;
  posX = Math.round(Math.min(posX, zone.x + zone.w - width - 20));
  posY = Math.round(Math.min(posY, zone.y + zone.h - height - 20));

  return { x: posX, y: posY };
}

/* ─── Floor View Canvas ─── */

function FloorViewCanvas({
  tables,
  selectedTableId,
  onSelectTable,
  onTablePositionChange,
  onTableSizeChange,
  onCapacityChange,
  onServerChange,
  onTableUpdate,
  staff,
  isLayoutEditable,
}: {
  tables: RestaurantTable[];
  selectedTableId: string | null;
  onSelectTable: (table: RestaurantTable) => void;
  onTablePositionChange: (tableId: string, x: number, y: number) => void;
  onTableSizeChange: (tableId: string, width: number, height: number) => void;
  onCapacityChange: (tableId: string, newCapacity: number) => void;
  onServerChange: (tableId: string, serverId: string | null) => void;
  onTableUpdate: (tableId: string, updates: Record<string, unknown>) => Promise<void>;
  staff: StaffMember[];
  isLayoutEditable: boolean;
}) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ref to track which table is currently being dragged (prevents sync from overwriting)
  const draggingTableIdRef = useRef<string | null>(null);
  // Ref to always have latest local positions for drag calculations (avoids stale closures)
  const localPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});
  
  // Resizing tracking state and refs
  const resizingTableIdRef = useRef<string | null>(null);
  const localSizesRef = useRef<Record<string, { w: number; h: number }>>({});
  const [localSizes, setLocalSizes] = useState<Record<string, { w: number; h: number }>>({});
  
  const [initialized, setInitialized] = useState(false);

  // Zoom & Auto-Fit state for Floor Plan
  const [zoom, setZoom] = useState(1);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const guidesContainerRef = useRef<HTMLDivElement>(null);

  const handleAutoFit = useCallback(() => {
    if (canvasWrapperRef.current) {
      const parentWidth = canvasWrapperRef.current.clientWidth;
      const computedScale = Math.min(1.2, parentWidth / (CANVAS_MIN_WIDTH + 20));
      setZoom(Math.max(0.4, computedScale));
    }
  }, []);

  // Autofit on mount and window resize
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoFit();
    }, 150);
    return () => clearTimeout(timer);
  }, [handleAutoFit]);

  useEffect(() => {
    window.addEventListener('resize', handleAutoFit);
    return () => window.removeEventListener('resize', handleAutoFit);
  }, [handleAutoFit]);

  // Use refs to avoid stale closures
  const onTablePositionChangeRef = useRef(onTablePositionChange);
  const onTableSizeChangeRef = useRef(onTableSizeChange);
  useEffect(() => {
    onTablePositionChangeRef.current = onTablePositionChange;
    onTableSizeChangeRef.current = onTableSizeChange;
  });

  // Sync local positions and sizes when tables data changes
  // Skip currently active interactions to prevent jumping
  useEffect(() => {
    setLocalPositions((prev) => {
      const newPos: Record<string, { x: number; y: number }> = {};
      tables.forEach((tbl) => {
        if (draggingTableIdRef.current === tbl.id && prev[tbl.id]) {
          newPos[tbl.id] = prev[tbl.id];
        } else {
          newPos[tbl.id] = getInitialPixelPos(tbl);
        }
      });
      localPositionsRef.current = newPos;
      return newPos;
    });

    setLocalSizes((prev) => {
      const newSizes: Record<string, { w: number; h: number }> = {};
      tables.forEach((tbl) => {
        if (resizingTableIdRef.current === tbl.id && prev[tbl.id]) {
          newSizes[tbl.id] = prev[tbl.id];
        } else {
          newSizes[tbl.id] = {
            w: (!tbl.width || tbl.width <= 10) ? (tbl.shape === 'RECTANGLE' ? 140 : 110) : tbl.width,
            h: (!tbl.height || tbl.height <= 10) ? (tbl.shape === 'RECTANGLE' ? 70 : 110) : tbl.height,
          };
        }
      });
      localSizesRef.current = newSizes;
      return newSizes;
    });

    setInitialized(true);
  }, [tables]);

  // During drag: only update local ref (no state renders)
  const handleDragMove = useCallback((tableId: string, x: number, y: number) => {
    draggingTableIdRef.current = tableId;
    localPositionsRef.current[tableId] = { x, y };
  }, []);

  // On drag end: save the final position to the API
  const handleDragEnd = useCallback((tableId: string) => {
    const finalPos = localPositionsRef.current[tableId];
    if (finalPos) {
      setLocalPositions((prev) => ({ ...prev, [tableId]: finalPos }));
      onTablePositionChangeRef.current(tableId, finalPos.x, finalPos.y);
    }
    setTimeout(() => {
      draggingTableIdRef.current = null;
    }, 100);
  }, []);

  // During resize: only update local ref
  const handleResize = useCallback((tableId: string, width: number, height: number) => {
    resizingTableIdRef.current = tableId;
    localSizesRef.current[tableId] = { w: width, h: height };
  }, []);

  // On resize end: save the final dimensions to the API
  const handleResizeEnd = useCallback((tableId: string) => {
    const finalSize = localSizesRef.current[tableId];
    if (finalSize) {
      setLocalSizes((prev) => ({ ...prev, [tableId]: finalSize }));
      onTableSizeChangeRef.current(tableId, finalSize.w, finalSize.h);
    }
    setTimeout(() => {
      resizingTableIdRef.current = null;
    }, 100);
  }, []);

  const getStaticTablesBounds = useCallback((tableId: string) => {
    return tables
      .filter((t) => t.id !== tableId)
      .map((t) => {
        const pos = localPositionsRef.current[t.id] || getInitialPixelPos(t);
        const size = localSizesRef.current[t.id] || {
          w: (!t.width || t.width <= 10) ? (t.shape === 'RECTANGLE' ? 140 : 110) : t.width,
          h: (!t.height || t.height <= 10) ? (t.shape === 'RECTANGLE' ? 70 : 110) : t.height
        };
        return {
          id: t.id,
          left: pos.x,
          right: pos.x + size.w,
          top: pos.y,
          bottom: pos.y + size.h,
          centerX: pos.x + size.w / 2,
          centerY: pos.y + size.h / 2
        };
      });
  }, [tables]);

  // Keyboard nudge adjustments
  useEffect(() => {
    if (!isLayoutEditable || !selectedTableId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.hasAttribute('contenteditable') || activeEl.closest('[role="combobox"]'))) {
        return;
      }

      const table = tables.find((t) => t.id === selectedTableId);
      if (!table) return;

      const increment = e.shiftKey ? 5 : 20;
      let newX = table.x;
      let newY = table.y;
      let handled = false;

      if (e.key === 'ArrowUp') {
        newY = Math.max(0, table.y - increment);
        handled = true;
      } else if (e.key === 'ArrowDown') {
        newY = Math.min(CANVAS_MIN_HEIGHT - (table.height || 110), table.y + increment);
        handled = true;
      } else if (e.key === 'ArrowLeft') {
        newX = Math.max(0, table.x - increment);
        handled = true;
      } else if (e.key === 'ArrowRight') {
        newX = Math.min(CANVAS_MIN_WIDTH - (table.width || 110), table.x + increment);
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        
        localPositionsRef.current[selectedTableId] = { x: newX, y: newY };
        setLocalPositions((prev) => ({ ...prev, [selectedTableId]: { x: newX, y: newY } }));
        onTablePositionChangeRef.current(selectedTableId, newX, newY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLayoutEditable, selectedTableId, tables]);

  return (
    <div className="space-y-4">
      {/* Zoom Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
        <span className="text-xs font-semibold text-zinc-300">
          Floor Plan Sizing
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Snap to grid toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={cn(
              'h-8 text-xs font-semibold rounded-lg border-zinc-800 gap-1.5 transition-colors',
              snapToGrid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <LayoutGrid className="size-3.5" />
            Snap to Grid
          </Button>

          <Separator orientation="vertical" className="h-6 bg-zinc-800 hidden sm:block mx-1" />

          <div className="flex items-center gap-1.5 bg-zinc-955 border border-zinc-800 p-1 rounded-md">
            <span className="text-[10px] font-bold text-emerald-400 px-2">
              Zoom: {Math.round(zoom * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
              className="size-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <Minus className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setZoom(1)}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              100%
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAutoFit}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              Fit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
              className="size-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Floor plan canvas wrapper - dynamic scale */}
      <div 
        ref={canvasWrapperRef}
        className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-auto w-full p-1"
      >
        <div 
          style={{
            width: `${CANVAS_MIN_WIDTH * zoom}px`,
            height: `${CANVAS_MIN_HEIGHT * zoom}px`,
            transition: 'width 0.2s ease-out, height 0.2s ease-out'
          }}
          className="relative shrink-0 overflow-hidden"
        >
          <div
            ref={containerRef}
            className="absolute top-0 left-0"
            style={{
              width: CANVAS_MIN_WIDTH,
              height: CANVAS_MIN_HEIGHT,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              backgroundImage:
                'radial-gradient(circle, rgba(113,113,122,0.15) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              transition: 'transform 0.2s ease-out',
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

            {/* Smart alignment guides container */}
            <div ref={guidesContainerRef} className="absolute inset-0 pointer-events-none z-45" />

            {/* Table cards */}
            {tables.map((table) => {
              if (!initialized) return null;
              const pixelPos = localPositions[table.id] || getInitialPixelPos(table);
              const tableWidth = localSizes[table.id]?.w ?? ((!table.width || table.width <= 10) ? (table.shape === 'RECTANGLE' ? 140 : 110) : table.width);
              const tableHeight = localSizes[table.id]?.h ?? ((!table.height || table.height <= 10) ? (table.shape === 'RECTANGLE' ? 70 : 110) : table.height);
              return (
                <MemoizedCanvasTableCard
                  key={table.id}
                  table={table}
                  x={pixelPos.x}
                  y={pixelPos.y}
                  width={tableWidth}
                  height={tableHeight}
                  isSelected={selectedTableId === table.id}
                  onClick={() => onSelectTable(table)}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onResize={handleResize}
                  onResizeEnd={handleResizeEnd}
                  staff={staff}
                  onCapacityChange={onCapacityChange}
                  onServerChange={onServerChange}
                  onTableUpdate={onTableUpdate}
                  isLayoutEditable={isLayoutEditable}
                  zoom={zoom}
                  snapToGrid={snapToGrid}
                  guidesContainerRef={guidesContainerRef}
                  getStaticTablesBounds={getStaticTablesBounds}
                />
              );
            })}

            {/* Drag / Edit layout hint */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-zinc-600 text-[10px] pointer-events-none">
              {isLayoutEditable ? (
                <>
                  <Move className="size-3 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">{t.floorPlan.dragToMove}</span>
                </>
              ) : (
                <>
                  <Pencil className="size-3 text-zinc-500" />
                  <span>{t.floorPlan.clickEditLayoutToMove}</span>
                </>
              )}
            </div>
          </div>
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
  onDeleteTable,
  staff,
  customers,
  isLayoutEditable,
}: {
  table: RestaurantTable | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (tableId: string, newStatus: TableStatus) => Promise<void>;
  onTableUpdate: (tableId: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteTable: (tableId: string) => Promise<void>;
  staff: StaffMember[];
  customers: any[];
  isLayoutEditable: boolean;
}) {
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(4);
  const [editSection, setEditSection] = useState<TableSection>('MAIN');
  const [editShape, setEditShape] = useState<TableShape>('ROUND');
  const [editServerId, setEditServerId] = useState<string>('NONE');
  const [editCustomerId, setEditCustomerId] = useState<string>('NONE');
  const [localIp, setLocalIp] = useState<string>('');
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetch('/api/tables/local-ip')
        .then((res) => res.json())
        .then((data) => setLocalIp(data.localIp))
        .catch(() => {});
    }
  }, [open]);

  const qrUrl = useMemo(() => {
    if (!table) return '';
    if (typeof window === 'undefined') return '';
    const ip = localIp && localIp !== 'localhost' ? localIp : window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${ip}${port}/table/${table.number}`;
  }, [table, localIp]);

  // Sync edit state when table changes
  useEffect(() => {
    if (table) {
      const timer = setTimeout(() => {
        setEditName(table.name);
        setEditCapacity(table.capacity);
        setEditSection(table.section);
        setEditShape(table.shape);
        setEditServerId(table.serverId || 'NONE');
        setEditCustomerId((table as any).customerId || 'NONE');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [table]);

  if (!table) return null;

  const hasActiveOrder = (table.orders?.length || 0) > 0;
  const orderTotal = hasActiveOrder && table.orders
    ? table.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    : 0;
  const SectionIcon = SECTION_ICONS[table.section];

  async function handleStatusChange(newStatus: string) {
    if (!table) return;
    setUpdating(true);
    try {
      await onStatusChange(table.id, newStatus as TableStatus);
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveEdit() {
    if (!table) return;
    setUpdating(true);
    try {
      const updates: Record<string, unknown> = {
        name: editName,
        capacity: editCapacity,
        section: editSection,
        shape: editShape,
        serverId: editServerId === 'NONE' ? null : editServerId,
        customerId: editCustomerId === 'NONE' ? null : editCustomerId,
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
    if (!table) return;
    useAppStore.getState().selectTable(table.id);
    if (table.orders && table.orders.length > 0) {
      useAppStore.getState().selectOrder(table.orders[0].id);
    } else {
      useAppStore.getState().selectOrder(null);
    }
    useAppStore.getState().setView('pos');
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
            {(table as any).customer && (
              <Badge variant="outline" className="border-purple-700 text-purple-400 gap-1.5 bg-purple-500/5">
                <User className="size-3 text-purple-400" />
                👤 {(table as any).customer.firstName} {(table as any).customer.lastName}
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

              {/* Customer Assignment */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">{t.pos.customerGuest || 'Customer / Guest'}</Label>
                <Select value={editCustomerId} onValueChange={setEditCustomerId}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                    <SelectValue placeholder={t.pos.noCustomerAssigned || 'Walk-in / No Customer'} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-850 border-zinc-700 max-h-60">
                    <SelectItem value="NONE" className="text-zinc-400 focus:bg-zinc-700 focus:text-zinc-100">
                      <span className="flex items-center gap-2">
                        <XCircle className="size-3 text-zinc-500" />
                        {t.pos.noCustomerAssigned || 'Walk-in / No Customer'}
                      </span>
                    </SelectItem>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                        <span className="flex items-center gap-2">
                          <User className="size-3 text-purple-400" />
                          <span>{c.firstName} {c.lastName}</span>
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

              <Button
                variant="destructive"
                onClick={() => onDeleteTable(table.id)}
                disabled={updating || hasActiveOrder}
                className="w-full bg-red-950/40 border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white border mt-2 gap-2"
              >
                <Trash2 className="size-4" />
                {t.floorPlan.deleteTable}
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
                        {t.floorPlan.server}: {order.creator?.name || 'System'}
                      </span>
                      <span className="text-zinc-500">
                        {order.guestCount} {order.guestCount > 1 ? t.floorPlan.guests : t.floorPlan.guest}
                      </span>
                    </div>

                    <ScrollArea className="max-h-40">
                      <div className="space-y-1.5">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs py-0.5"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-zinc-500 shrink-0">&times;{item.quantity}</span>
                              <span className="text-zinc-300 truncate">{item.menuItem?.name || 'Deleted Item'}</span>
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
          {(table.reservations?.length || 0) > 0 && table.reservations && (
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

          {/* QR Code & Self-Ordering */}
          <>
            <Separator className="bg-zinc-800" />
            <div className="space-y-2.5">
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <QrCode className="size-4 text-emerald-400" />
                Customer QR Ordering
              </h4>
              <Card className="bg-zinc-800/40 border-zinc-700/40 overflow-hidden">
                <CardContent className="p-3.5 space-y-3 flex flex-col items-center">
                  <div className="bg-white p-2.5 rounded-lg shadow-md border border-zinc-200">
                    {/* Dynamic QR code using standard public qr server API */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}&color=000000&bgcolor=ffffff`}
                      alt={`Table ${table.number} QR Code`}
                      className="size-40 select-none object-contain"
                    />
                  </div>
                  
                  <div className="text-center w-full">
                    <p className="text-[11px] font-medium text-zinc-300">Table {table.number} Ordering URL</p>
                    <p className="text-[10px] text-zinc-500 break-all select-all font-mono mt-0.5">
                      {qrUrl}
                    </p>
                  </div>

                  <div className="flex gap-2 w-full pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[11px] h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(qrUrl);
                        toast({
                          title: "Link Copied",
                          description: `Copied Table ${table.number} ordering link to clipboard.`,
                        });
                      }}
                    >
                      <Copy className="size-3" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[11px] h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-1.5"
                      onClick={() => {
                        window.open(qrUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="size-3" />
                      Open Page
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-8 w-8 p-0 border-zinc-700 hover:bg-zinc-800 text-zinc-300 shrink-0"
                      title="Print QR Code"
                      onClick={() => {
                        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Print Table ${table.number} QR</title>
                                <style>
                                  body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                                  .container { text-align: center; border: 2px solid #000; padding: 30px; border-radius: 15px; }
                                  h1 { margin-bottom: 5px; font-size: 28px; }
                                  p { font-size: 16px; color: #555; margin-top: 0; margin-bottom: 20px; }
                                  img { width: 250px; height: 250px; }
                                </style>
                              </head>
                              <body onload="window.print(); window.close();">
                                <div class="container">
                                  <h1>The Gilded Fork</h1>
                                  <p>Scan to Order &middot; Table ${table.number}</p>
                                  <img src="${qrImgUrl}" />
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                    >
                      <Printer className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
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
            {isLayoutEditable && (
              <Button
                variant="destructive"
                onClick={() => onDeleteTable(table.id)}
                disabled={updating || hasActiveOrder}
                className="w-full bg-red-950/40 border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white border mt-2 gap-2"
              >
                <Trash2 className="size-4" />
                {t.floorPlan.deleteTable}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Section Group (with drag-and-drop reorder via @dnd-kit) ─── */

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const tableIds = tables.map((tbl) => tbl.id);
  const activeTable = activeId ? tables.find((tbl) => tbl.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      onTableMove(String(active.id), String(over.id));
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={tableIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {tables.map((table) => (
              <SortableTableCard
                key={table.id}
                table={table}
                isSelected={selectedTableId === table.id}
                onClick={() => onSelectTable(table)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeTable ? (
            <div className="pointer-events-none">
              <TableCardContent
                table={activeTable}
                isSelected={false}
                statusColor={TABLE_STATUS_COLORS[activeTable.status] || ''}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ─── Main Floor Plan Component ─── */

export function FloorPlan() {
  const user = useAuthStore((s) => s.user);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const [isLayoutEditable, setIsLayoutEditable] = useState(false);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();

  /* Create new table */
  async function handleAddTable() {
    setIsAddingTable(true);
    try {
      const activeTabSection = activeSection === 'ALL' ? 'MAIN' : activeSection;
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: activeTabSection, shape: 'ROUND', capacity: 4 }),
      });
      if (!res.ok) throw new Error('Failed to add table');
      const newTable = await res.json();
      
      setTables((prev) => [...prev, newTable]);

      toast({
        title: 'Table Added Successfully',
        description: `${newTable.name} has been added to ${newTable.section} dining area.`,
      });

      // Emit socket status-change
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('table:status-change', {
          tableId: newTable.id,
          status: newTable.status,
          updatedBy: user?.name || 'Staff Member',
        });
      }
    } catch {
      toast({
        title: 'Failed to create table',
        variant: 'destructive',
      });
    } finally {
      setIsAddingTable(false);
    }
  }

  /* Delete table */
  async function handleDeleteTable(tableId: string) {
    try {
      const res = await fetch(`/api/tables?id=${tableId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete table');
      
      setTables((prev) => prev.filter((tbl) => tbl.id !== tableId));
      setSelectedTable(null);
      setSheetOpen(false);

      toast({
        title: 'Table Deleted Successfully',
        description: 'The table has been removed from the floor layout.',
      });

      // Emit socket status-change
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('table:status-change', {
          tableId,
          status: 'FREE',
          updatedBy: user?.name || 'Staff Member',
        });
      }
    } catch {
      toast({
        title: 'Failed to delete table',
        variant: 'destructive',
      });
    }
  }

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

  /* Fetch customers for assignment */
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch {
        // Silently fail
      }
    }
    fetchCustomers();
  }, []);

  /* Initial fetch + auto-refresh */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTables(true);
    }, 0);
    const interval = setInterval(() => fetchTables(false), REFRESH_INTERVAL);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  /* Real-time socket sync for floor plan tables */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      fetchTables(false);
    };

    socket.on('table:status-updated', handleUpdate);
    socket.on('order:updated', handleUpdate);
    socket.on('kitchen:new-ticket', handleUpdate);
    socket.on('bar:new-ticket', handleUpdate);
    socket.on('order:item-updated', handleUpdate);
    socket.on('kitchen:item-updated', handleUpdate);
    socket.on('bar:item-updated', handleUpdate);
    socket.on('reservation:updated', handleUpdate);

    return () => {
      socket.off('table:status-updated', handleUpdate);
      socket.off('order:updated', handleUpdate);
      socket.off('kitchen:new-ticket', handleUpdate);
      socket.off('bar:new-ticket', handleUpdate);
      socket.off('order:item-updated', handleUpdate);
      socket.off('kitchen:item-updated', handleUpdate);
      socket.off('bar:item-updated', handleUpdate);
      socket.off('reservation:updated', handleUpdate);
    };
  }, [fetchTables]);

  const selectedTableId = useAppStore((s) => s.selectedTableId);
  const selectTable = useAppStore((s) => s.selectTable);

  /* Handle table selection from store */
  useEffect(() => {
    if (selectedTableId) {
      const tbl = tables.find((tb) => tb.id === selectedTableId);
      if (tbl) {
        const timer = setTimeout(() => {
          setSelectedTable(tbl);
          setSheetOpen(true);
        }, 0);
        return () => clearTimeout(timer);
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

      // Emit socket status-change
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('table:status-change', {
          tableId,
          status: newStatus,
          updatedBy: user?.name || 'Staff Member',
        });
      }
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

    // Emit socket status-change
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('table:status-change', {
        tableId,
        status: updated.status || tables.find(t => t.id === tableId)?.status || 'FREE',
        updatedBy: user?.name || 'Staff Member',
      });
    }
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

      // Emit socket status-change for both tables
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('table:status-change', {
          tableId: movedTableId,
          status: movedTable.status,
          updatedBy: user?.name || 'Staff Member',
        });
        socket.emit('table:status-change', {
          tableId: targetTableId,
          status: targetTable.status,
          updatedBy: user?.name || 'Staff Member',
        });
      }
    } catch {
      toast({ title: t.floorPlan.failedToUpdateTable, variant: 'destructive' });
      await fetchTables(false);
    }
  }

  /* Floor view: position change handler */
  async function handleTablePositionChange(tableId: string, x: number, y: number) {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);

    // Optimistic update
    setTables((prev) =>
      prev.map((tbl) => (tbl.id === tableId ? { ...tbl, x: roundedX, y: roundedY } : tbl))
    );
    setSelectedTable((prev) =>
      prev && prev.id === tableId ? { ...prev, x: roundedX, y: roundedY } : prev
    );

    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, x: roundedX, y: roundedY }),
      });
      if (!res.ok) throw new Error('Failed to save position');

      // Emit socket status-change
      const socket = getSocket();
      if (socket?.connected) {
        const tableStatus = tables.find(t => t.id === tableId)?.status || 'FREE';
        socket.emit('table:status-change', {
          tableId,
          status: tableStatus,
          updatedBy: user?.name || 'Staff Member',
        });
      }
      // Silent success - no toast for position saves (fires frequently during drag)
    } catch {
      toast({ title: t.floorPlan.positionSaveFailed, variant: 'destructive' });
      // Revert if saving fails
      await fetchTables(false);
    }
  }

  /* Floor view: size change handler */
  async function handleTableSizeChange(tableId: string, width: number, height: number) {
    const roundedW = Math.round(width);
    const roundedH = Math.round(height);

    // Optimistic update
    setTables((prev) =>
      prev.map((tbl) => (tbl.id === tableId ? { ...tbl, width: roundedW, height: roundedH } : tbl))
    );
    setSelectedTable((prev) =>
      prev && prev.id === tableId ? { ...prev, width: roundedW, height: roundedH } : prev
    );

    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, width: roundedW, height: roundedH }),
      });
      if (!res.ok) throw new Error('Failed to save size');

      // Emit socket status-change
      const socket = getSocket();
      if (socket?.connected) {
        const tableStatus = tables.find(t => t.id === tableId)?.status || 'FREE';
        socket.emit('table:status-change', {
          tableId,
          status: tableStatus,
          updatedBy: user?.name || 'Staff Member',
        });
      }
    } catch {
      toast({ title: t.floorPlan.failedToUpdateTable, variant: 'destructive' });
      // Revert if saving fails
      await fetchTables(false);
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

      // Emit socket status-change
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('table:status-change', {
          tableId,
          status: table.status,
          updatedBy: user?.name || 'Staff Member',
        });
      }
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

      // Emit socket status-change
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('table:status-change', {
          tableId,
          status: table.status,
          updatedBy: user?.name || 'Staff Member',
        });
      }
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

    // Stop visual alerts by serving all dishes that are currently READY
    const readyItems = table.orders?.flatMap(o => 
      o.items?.filter(i => i.status === 'READY')
    ) || [];

    if (readyItems.length > 0) {
      // Optimistic update
      setTables((prevTables) =>
        prevTables.map((t) => {
          if (t.id !== table.id) return t;
          return {
            ...t,
            orders: (t.orders || []).map((o) => ({
              ...o,
              items: (o.items || []).map((item) =>
                item.status === 'READY' ? { ...item, status: 'SERVED' } : item
              ),
            })),
          };
        })
      );

      // Perform updates on items
      Promise.all(
        readyItems.map((item) =>
          fetch('/api/orders/items', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id, status: 'SERVED' }),
          }).then((res) => {
            if (!res.ok) throw new Error();
            return res.json();
          })
        )
      )
        .then(() => {
          toast({
            title: `Served ${readyItems.length} ready ${readyItems.length === 1 ? 'dish' : 'dishes'}!`,
            description: `Visual alarm stopped for ${table.name}.`,
          });
        })
        .catch(() => {
          toast({
            title: 'Failed to clear visual alarm',
            variant: 'destructive',
          });
          // Revert / Reload
          fetch('/api/tables')
            .then(res => res.json())
            .then(data => setTables(data));
        });
    }
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
        <div className="flex items-center gap-2 self-start flex-wrap">
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

          {/* Edit Layout Button (Only visible in Floor View) */}
          {viewMode === 'floor' && (
            <div className="flex items-center gap-2">
              {isLayoutEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTable}
                  disabled={isAddingTable}
                  className="border-zinc-700 text-emerald-400 hover:bg-zinc-800 gap-1.5 h-9"
                >
                  {isAddingTable ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  <span>Add Table</span>
                </Button>
              )}
              <Button
                variant={isLayoutEditable ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsLayoutEditable(!isLayoutEditable)}
                className={cn(
                  'gap-2 transition-all duration-200',
                  isLayoutEditable 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                )}
              >
                {isLayoutEditable ? (
                  <>
                    <CheckCircle2 className="size-4 text-white" />
                    <span>{t.floorPlan.doneEditing}</span>
                  </>
                ) : (
                  <>
                    <Pencil className="size-4 text-amber-400 animate-pulse" />
                    <span>{t.floorPlan.editLayout}</span>
                  </>
                )}
              </Button>
            </div>
          )}

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
        <div className="flex items-center justify-between gap-4">
          <StatusLegend />
          <span className={cn("text-[10px] transition-colors duration-200 hidden sm:inline", isLayoutEditable ? "text-emerald-400 font-medium" : "text-zinc-600")}>
            {isLayoutEditable ? t.floorPlan.dragToMove : t.floorPlan.clickEditLayoutToMove}
          </span>
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
          onTableSizeChange={handleTableSizeChange}
          onCapacityChange={handleCapacityChange}
          onServerChange={handleServerChange}
          onTableUpdate={handleTableUpdate}
          staff={staff}
          isLayoutEditable={isLayoutEditable}
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
        onDeleteTable={handleDeleteTable}
        staff={staff}
        customers={customers}
        isLayoutEditable={isLayoutEditable}
      />
    </div>
  );
}
