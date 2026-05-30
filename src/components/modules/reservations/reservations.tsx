'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  Mail,
  Check,
  X,
  AlertCircle,
  Bell,
  Plus,
  UserPlus,
  Armchair,
  StickyNote,
  Search,
  ChevronRight,
  Timer,
  MessageSquare,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  Hash,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { formatDate } from '@/lib/constants';

/* ─── Types ─── */
type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'SEATED' | 'COMPLETED';

interface TableData {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: string;
  section: string;
}

interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  loyaltyTier: string;
}

interface ReservationData {
  id: string;
  tableId: string | null;
  table: TableData | null;
  customerId: string | null;
  customer: CustomerData | null;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  partySize: number;
  status: ReservationStatus;
  reservationDate: string;
  reservationTime: string;
  estimatedDuration: number;
  notes: string | null;
  isWalkIn: boolean;
  waitListPosition: number | null;
  estimatedWait: number | null;
  notifiedAt: string | null;
  seatedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Status Badge Colors ─── */
const STATUS_COLORS: Record<ReservationStatus, { bg: string; text: string; border: string; dot: string }> = {
  CONFIRMED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  CANCELLED: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' },
  NO_SHOW: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  SEATED: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', dot: 'bg-sky-500' },
  COMPLETED: { bg: 'bg-zinc-500/15', text: 'text-zinc-400', border: 'border-zinc-500/30', dot: 'bg-zinc-500' },
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
};

/* ─── Helper: get time slot category ─── */
function getTimeCategory(time: string): 'past' | 'current' | 'future' {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);

  const diffMinutes = (slotDate.getTime() - now.getTime()) / 60000;
  if (diffMinutes < -30) return 'past';
  if (diffMinutes >= -30 && diffMinutes <= 30) return 'current';
  return 'future';
}

const TIME_COLORS: Record<string, { dot: string; line: string; text: string }> = {
  past: { dot: 'bg-zinc-500', line: 'bg-zinc-700', text: 'text-zinc-500' },
  current: { dot: 'bg-emerald-500', line: 'bg-emerald-700', text: 'text-emerald-400' },
  future: { dot: 'bg-zinc-400', line: 'bg-zinc-800', text: 'text-zinc-300' },
};

/* ─── Helper: format 24h time to 12h ─── */
function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/* ─── Status Badge Component ─── */
function StatusBadge({ status }: { status: ReservationStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium text-xs px-2 py-0.5', colors.bg, colors.text, colors.border)}>
      <span className={cn('size-1.5 rounded-full', colors.dot)} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

/* ─── Summary Cards ─── */
function SummaryCards({ reservations, tables }: { reservations: ReservationData[]; tables: TableData[] }) {
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(
    (r) => r.reservationDate.startsWith(today) && !r.isWalkIn
  );
  const walkIns = reservations.filter(
    (r) => r.isWalkIn && r.status === 'CONFIRMED'
  );
  const freeTables = tables.filter((t) => t.status === 'FREE').length;

  // Average wait time for walk-ins
  const avgWait =
    walkIns.length > 0
      ? Math.round(
          walkIns.reduce((sum, w) => sum + (w.estimatedWait || 0), 0) / walkIns.length
        )
      : 0;

  const cards = [
    {
      label: "Today's Reservations",
      value: todayReservations.length,
      icon: CalendarDays,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'Walk-ins Waiting',
      value: walkIns.length,
      icon: UserPlus,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'Available Tables',
      value: freeTables,
      icon: Armchair,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
    },
    {
      label: 'Avg Wait Time',
      value: `${avgWait}m`,
      icon: Timer,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={cn('bg-zinc-900 border-zinc-800', card.borderColor)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex items-center justify-center size-10 rounded-lg shrink-0', card.bgColor)}>
                <card.icon className={cn('size-5', card.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 truncate">{card.label}</p>
                <p className={cn('text-xl font-bold', card.color)}>{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Timeline Reservation Row ─── */
function TimelineReservation({
  reservation,
  onSeat,
  onCancel,
  onNoShow,
  isLast,
}: {
  reservation: ReservationData;
  onSeat: (r: ReservationData) => void;
  onCancel: (r: ReservationData) => void;
  onNoShow: (r: ReservationData) => void;
  isLast: boolean;
}) {
  const timeCat = getTimeCategory(reservation.reservationTime);
  const timeColors = TIME_COLORS[timeCat];
  const isActive = reservation.status === 'CONFIRMED' || reservation.status === 'SEATED';

  return (
    <div className="flex gap-3 md:gap-4 group">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-6">
        <div className={cn('size-3 rounded-full border-2 mt-1.5 shrink-0', timeColors.dot, timeCat === 'current' ? 'ring-2 ring-emerald-500/30' : '')} />
        {!isLast && <div className={cn('w-0.5 flex-1 min-h-[40px]', timeColors.line)} />}
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 pb-4 min-w-0',
        !isActive && 'opacity-60',
      )}>
        <div className={cn(
          'rounded-lg border p-3 md:p-4 transition-colors',
          'bg-zinc-900 border-zinc-800',
          timeCat === 'current' && 'border-emerald-500/30 bg-emerald-950/20',
          'group-hover:border-zinc-700',
        )}>
          {/* Top row: time + status */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock className={cn('size-3.5', timeColors.text)} />
              <span className={cn('text-sm font-semibold', timeColors.text)}>
                {formatTime12(reservation.reservationTime)}
              </span>
              {timeCat === 'current' && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">
                  NOW
                </Badge>
              )}
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          {/* Guest info */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100 truncate">{reservation.guestName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {reservation.partySize}
                </span>
                {reservation.table && (
                  <span className="flex items-center gap-1">
                    <Armchair className="size-3" />
                    {reservation.table.name}
                  </span>
                )}
                {reservation.guestPhone && (
                  <span className="hidden sm:flex items-center gap-1">
                    <Phone className="size-3" />
                    {reservation.guestPhone}
                  </span>
                )}
              </div>
              {reservation.notes && (
                <div className="flex items-start gap-1 mt-1.5 text-xs text-zinc-500">
                  <StickyNote className="size-3 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{reservation.notes}</span>
                </div>
              )}
            </div>

            {/* Quick actions for CONFIRMED */}
            {reservation.status === 'CONFIRMED' && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  onClick={() => onSeat(reservation)}
                  title="Seat Guest"
                >
                  <UserCheck className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-8 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  onClick={() => onNoShow(reservation)}
                  title="No Show"
                >
                  <AlertCircle className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => onCancel(reservation)}
                  title="Cancel"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Waitlist Entry ─── */
function WaitlistEntry({
  entry,
  position,
  onNotify,
  onSeat,
  onRemove,
}: {
  entry: ReservationData;
  position: number;
  onNotify: (r: ReservationData) => void;
  onSeat: (r: ReservationData) => void;
  onRemove: (r: ReservationData) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const createdAt = new Date(entry.createdAt);

  useEffect(() => {
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - createdAt.getTime()) / 60000));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-3 md:gap-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
    >
      {/* Position number */}
      <div className="flex items-center justify-center size-10 rounded-lg bg-amber-500/15 border border-amber-500/30 shrink-0">
        <span className="text-lg font-bold text-amber-400">#{position}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">{entry.guestName}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {entry.partySize}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="size-3" />
            {elapsed}m wait
          </span>
          {entry.estimatedWait && (
            <span className="flex items-center gap-1 text-amber-500">
              <Clock className="size-3" />
              ~{entry.estimatedWait}m est.
            </span>
          )}
          {entry.guestPhone && (
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="size-3" />
              {entry.guestPhone}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="size-8 p-0 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
          onClick={() => onNotify(entry)}
          title="Notify via SMS"
        >
          <MessageSquare className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="size-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
          onClick={() => onSeat(entry)}
          title="Seat Guest"
        >
          <UserCheck className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="size-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={() => onRemove(entry)}
          title="Remove from Waitlist"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Add Walk-in Dialog ─── */
function AddWalkInDialog({
  open,
  onOpenChange,
  tables,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: TableData[];
  onSubmit: (data: { guestName: string; guestPhone: string; partySize: number; estimatedWait: number }) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [estimatedWait, setEstimatedWait] = useState(15);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ guestName: name.trim(), guestPhone: phone.trim(), partySize, estimatedWait });
    setName('');
    setPhone('');
    setPartySize(2);
    setEstimatedWait(15);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-amber-400" />
            Add Walk-in Guest
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Add a walk-in guest to the waitlist
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label className="text-zinc-400 text-xs">Guest Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter guest name"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-400 text-xs">Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0000"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs">Party Size</Label>
              <Select value={String(partySize)} onValueChange={(v) => setPartySize(Number(v))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs">Est. Wait (min)</Label>
              <Select value={String(estimatedWait)} onValueChange={(v) => setEstimatedWait(Number(v))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {[5, 10, 15, 20, 25, 30, 45, 60].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                      {n} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-400 hover:text-zinc-100">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">
            <UserPlus className="size-4 mr-1.5" />
            Add to Waitlist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── New Reservation Dialog ─── */
function NewReservationDialog({
  open,
  onOpenChange,
  tables,
  customers,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: TableData[];
  customers: CustomerData[];
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState('19:00');
  const [tableId, setTableId] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Auto-fill from CRM
  const filteredCustomers = customers.filter(
    (c) =>
      searchQuery.length > 0 &&
      (`${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (c.phone?.includes(searchQuery) ?? false))
  );

  const selectCustomer = (c: CustomerData) => {
    setGuestName(`${c.firstName} ${c.lastName}`);
    setGuestPhone(c.phone || '');
    setGuestEmail(c.email || '');
    setSearchQuery('');
    setShowCustomerSearch(false);
  };

  const handleSubmit = () => {
    if (!guestName.trim()) return;
    onSubmit({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim() || null,
      guestEmail: guestEmail.trim() || null,
      partySize,
      reservationDate: date.toISOString(),
      reservationTime: time,
      tableId: tableId || null,
      notes: notes.trim() || null,
      status: 'CONFIRMED',
      isWalkIn: false,
    });
    // Reset form
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setPartySize(2);
    setDate(new Date());
    setTime('19:00');
    setTableId('');
    setNotes('');
    onOpenChange(false);
  };

  // Filter available tables (free or reserved) with enough capacity
  const availableTables = tables.filter((t) => t.status === 'FREE' || t.status === 'RESERVED');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-emerald-400" />
            New Reservation
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Create a new reservation for a guest
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* CRM Lookup */}
          <div className="grid gap-2 relative">
            <Label className="text-zinc-400 text-xs flex items-center gap-1.5">
              <Search className="size-3" />
              CRM Lookup (optional)
            </Label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowCustomerSearch(e.target.value.length > 0);
                }}
                placeholder="Search by name, email, or phone..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 pr-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0 text-zinc-500 hover:text-zinc-300"
                  onClick={() => { setSearchQuery(''); setShowCustomerSearch(false); }}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
            {showCustomerSearch && filteredCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-zinc-100">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-zinc-500">{c.phone || c.email || 'No contact'}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">
                      {c.loyaltyTier}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Guest Name */}
          <div className="grid gap-2">
            <Label className="text-zinc-400 text-xs">Guest Name *</Label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter guest name"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs flex items-center gap-1">
                <Phone className="size-3" /> Phone
              </Label>
              <Input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+1-555-0000"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs flex items-center gap-1">
                <Mail className="size-3" /> Email
              </Label>
              <Input
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@email.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Party Size + Table */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs flex items-center gap-1">
                <Users className="size-3" /> Party Size
              </Label>
              <Select value={String(partySize)} onValueChange={(v) => setPartySize(Number(v))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs flex items-center gap-1">
                <Armchair className="size-3" /> Table
              </Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="__none__" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                    No table assigned
                  </SelectItem>
                  {availableTables
                    .filter((t) => t.capacity >= partySize)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                        {t.name} ({t.capacity} seats, {t.section})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs flex items-center gap-1">
                <Calendar className="size-3" /> Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 justify-start text-left font-normal"
                  >
                    <CalendarDays className="size-4 mr-2 text-zinc-500" />
                    {formatDate(date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    className="bg-zinc-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-400 text-xs flex items-center gap-1">
                <Clock className="size-3" /> Time
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 max-h-60">
                  {Array.from({ length: 24 }, (_, h) =>
                    [0, 15, 30, 45].map((m) => {
                      const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                      return (
                        <SelectItem key={val} value={val} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                          {formatTime12(val)}
                        </SelectItem>
                      );
                    })
                  ).flat()}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label className="text-zinc-400 text-xs flex items-center gap-1">
              <StickyNote className="size-3" /> Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests, allergies, celebrations..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-400 hover:text-zinc-100">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!guestName.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Check className="size-4 mr-1.5" />
            Create Reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Seat Guest Dialog ─── */
function SeatGuestDialog({
  open,
  onOpenChange,
  reservation,
  tables,
  onSeat,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationData | null;
  tables: TableData[];
  onSeat: (reservationId: string, tableId: string) => void;
}) {
  const [selectedTable, setSelectedTable] = useState('');
  const [prevResId, setPrevResId] = useState<string | null>(null);

  // Sync selected table when reservation changes (different dialog open)
  if (reservation && reservation.id !== prevResId) {
    setPrevResId(reservation.id);
    setSelectedTable(reservation.tableId || '');
  }

  if (!reservation) {
    if (prevResId !== null) {
      setPrevResId(null);
      setSelectedTable('');
    }
    return null;
  }

  const suitableTables = tables.filter(
    (t) => (t.status === 'FREE' || t.status === 'RESERVED') && t.capacity >= reservation.partySize
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-emerald-400" />
            Seat Guest
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Select a table for {reservation.guestName} (party of {reservation.partySize})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label className="text-zinc-400 text-xs">Assign Table</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {suitableTables.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">
                    {t.name} — {t.capacity} seats ({t.section}, {t.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-400 hover:text-zinc-100">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedTable) onSeat(reservation.id, selectedTable);
            }}
            disabled={!selectedTable}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="size-4 mr-1.5" />
            Seat Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Reservations Component ─── */
export function Reservations() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((s) => s.addNotification);

  // Dialog states
  const [newResOpen, setNewResOpen] = useState(false);
  const [addWalkInOpen, setAddWalkInOpen] = useState(false);
  const [seatGuestOpen, setSeatGuestOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);

  // All Reservations tab state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fetch reservations
  const { data: reservations = [], isLoading: reservationsLoading, refetch: refetchReservations } = useQuery<ReservationData[]>({
    queryKey: ['reservations'],
    queryFn: () => fetch('/api/reservations').then((r) => r.json()),
    refetchInterval: 30000,
  });

  // Fetch tables
  const { data: tables = [] } = useQuery<TableData[]>({
    queryKey: ['tables'],
    queryFn: () => fetch('/api/tables').then((r) => r.json()),
    refetchInterval: 30000,
  });

  // Fetch customers for CRM lookup
  const { data: customers = [] } = useQuery<CustomerData[]>({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/customers').then((r) => r.json()),
  });

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchReservations();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchReservations]);

  /* ─── Today's reservations (non-walk-in) ─── */
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations
    .filter((r) => r.reservationDate.startsWith(today) && !r.isWalkIn)
    .sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));

  /* ─── Walk-in waitlist ─── */
  const walkIns = reservations
    .filter((r) => r.isWalkIn && r.status === 'CONFIRMED')
    .sort((a, b) => (a.waitListPosition ?? 999) - (b.waitListPosition ?? 999));

  /* ─── All reservations for selected date ─── */
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dateReservations = reservations
    .filter((r) => {
      const matchesDate = r.reservationDate.startsWith(selectedDateStr);
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesDate && matchesStatus && !r.isWalkIn;
    })
    .sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));

  /* ─── Actions ─── */
  const handleSeatGuest = useCallback((reservation: ReservationData) => {
    setSelectedReservation(reservation);
    setSeatGuestOpen(true);
  }, []);

  const confirmSeatGuest = useCallback(async (reservationId: string, tableId: string) => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}?XTransformPort=3000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SEATED', tableId }),
      });
      if (!res.ok) throw new Error('Failed to seat guest');
      addNotification('Guest seated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setSeatGuestOpen(false);
    } catch {
      addNotification('Failed to seat guest', 'error');
    }
  }, [addNotification, queryClient]);

  const handleCancel = useCallback(async (reservation: ReservationData) => {
    try {
      const res = await fetch(`/api/reservations/${reservation.id}?XTransformPort=3000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (!res.ok) throw new Error('Failed to cancel');
      addNotification(`Reservation for ${reservation.guestName} cancelled`, 'info');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    } catch {
      addNotification('Failed to cancel reservation', 'error');
    }
  }, [addNotification, queryClient]);

  const handleNoShow = useCallback(async (reservation: ReservationData) => {
    try {
      const res = await fetch(`/api/reservations/${reservation.id}?XTransformPort=3000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'NO_SHOW' }),
      });
      if (!res.ok) throw new Error('Failed to mark no-show');
      addNotification(`${reservation.guestName} marked as no-show`, 'warning');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    } catch {
      addNotification('Failed to update reservation', 'error');
    }
  }, [addNotification, queryClient]);

  const handleNotify = useCallback((entry: ReservationData) => {
    addNotification(`SMS notification sent to ${entry.guestName}`, 'info');
  }, [addNotification]);

  const handleRemoveWalkIn = useCallback(async (entry: ReservationData) => {
    try {
      const res = await fetch(`/api/reservations/${entry.id}?XTransformPort=3000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (!res.ok) throw new Error('Failed to remove');
      addNotification(`${entry.guestName} removed from waitlist`, 'info');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    } catch {
      addNotification('Failed to remove from waitlist', 'error');
    }
  }, [addNotification, queryClient]);

  const handleAddWalkIn = useCallback(async (data: { guestName: string; guestPhone: string; partySize: number; estimatedWait: number }) => {
    try {
      const nextPosition = walkIns.length + 1;
      const res = await fetch('/api/reservations?XTransformPort=3000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: data.guestName,
          guestPhone: data.guestPhone || null,
          partySize: data.partySize,
          status: 'CONFIRMED',
          reservationDate: new Date().toISOString(),
          reservationTime: new Date().toTimeString().slice(0, 5),
          isWalkIn: true,
          waitListPosition: nextPosition,
          estimatedWait: data.estimatedWait,
        }),
      });
      if (!res.ok) throw new Error('Failed to add walk-in');
      addNotification(`${data.guestName} added to waitlist (#${nextPosition})`, 'success');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    } catch {
      addNotification('Failed to add walk-in guest', 'error');
    }
  }, [walkIns.length, addNotification, queryClient]);

  const handleNewReservation = useCallback(async (data: Record<string, unknown>) => {
    try {
      const tableId = data.tableId === '__none__' ? null : data.tableId;
      const res = await fetch('/api/reservations?XTransformPort=3000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tableId }),
      });
      if (!res.ok) throw new Error('Failed to create reservation');
      addNotification(`Reservation created for ${data.guestName}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    } catch {
      addNotification('Failed to create reservation', 'error');
    }
  }, [addNotification, queryClient]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarDays className="size-5 text-emerald-400" />
            Reservations & Waitlist
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-zinc-300"
            onClick={() => { refetchReservations(); addNotification('Reservations refreshed', 'info'); }}
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            onClick={() => setAddWalkInOpen(true)}
            variant="outline"
            size="sm"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          >
            <UserPlus className="size-4 mr-1.5" />
            Walk-in
          </Button>
          <Button
            onClick={() => setNewResOpen(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="size-4 mr-1.5" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards reservations={reservations} tables={tables} />

      {/* Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="today" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
            <CalendarDays className="size-4 mr-1.5" />
            Today&apos;s Reservations
            {todayReservations.length > 0 && (
              <Badge variant="outline" className="ml-1.5 text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-400">
                {todayReservations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            <UserPlus className="size-4 mr-1.5" />
            Waitlist
            {walkIns.length > 0 && (
              <Badge variant="outline" className="ml-1.5 text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-400">
                {walkIns.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-sky-600/20 data-[state=active]:text-sky-400">
            <Calendar className="size-4 mr-1.5" />
            All Reservations
          </TabsTrigger>
        </TabsList>

        {/* Today's Reservations Tab */}
        <TabsContent value="today" className="mt-0">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 md:p-6">
              {reservationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 flex flex-col items-center">
                        <div className="size-3 rounded-full bg-zinc-700 animate-pulse" />
                        <div className="w-0.5 flex-1 bg-zinc-800" />
                      </div>
                      <div className="flex-1 h-20 rounded-lg bg-zinc-800/50 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : todayReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                    <CalendarDays className="size-6 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">No reservations for today</p>
                  <p className="text-xs text-zinc-600 mt-1">Create a new reservation or add a walk-in guest</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {todayReservations.map((r, idx) => (
                    <TimelineReservation
                      key={r.id}
                      reservation={r}
                      onSeat={handleSeatGuest}
                      onCancel={handleCancel}
                      onNoShow={handleNoShow}
                      isLast={idx === todayReservations.length - 1}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waitlist Tab */}
        <TabsContent value="waitlist" className="mt-0">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 md:p-6">
              {walkIns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                    <UserPlus className="size-6 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">No guests on the waitlist</p>
                  <p className="text-xs text-zinc-600 mt-1">Add a walk-in guest to get started</p>
                  <Button
                    onClick={() => setAddWalkInOpen(true)}
                    variant="outline"
                    size="sm"
                    className="mt-4 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <UserPlus className="size-4 mr-1.5" />
                    Add Walk-in
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {walkIns.map((entry, idx) => (
                      <WaitlistEntry
                        key={entry.id}
                        entry={entry}
                        position={idx + 1}
                        onNotify={handleNotify}
                        onSeat={handleSeatGuest}
                        onRemove={handleRemoveWalkIn}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Reservations Tab */}
        <TabsContent value="all" className="mt-0">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 justify-start text-left font-normal"
                    >
                      <CalendarDays className="size-4 mr-2 text-zinc-500" />
                      {formatDate(selectedDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      className="bg-zinc-900"
                    />
                  </PopoverContent>
                </Popover>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="ALL" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">All Statuses</SelectItem>
                    <SelectItem value="CONFIRMED" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Confirmed</SelectItem>
                    <SelectItem value="SEATED" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Seated</SelectItem>
                    <SelectItem value="COMPLETED" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Completed</SelectItem>
                    <SelectItem value="CANCELLED" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW" className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100">No Show</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-xs text-zinc-500 ml-auto">
                  {dateReservations.length} reservation{dateReservations.length !== 1 ? 's' : ''}
                </span>
              </div>

              <Separator className="bg-zinc-800 mb-4" />

              {dateReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                    <CalendarDays className="size-6 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">No reservations for {formatDate(selectedDate)}</p>
                  <p className="text-xs text-zinc-600 mt-1">Try selecting a different date or changing the filter</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-2">
                    {dateReservations.map((r) => (
                      <div
                        key={r.id}
                        className={cn(
                          'flex items-center gap-3 md:gap-4 p-3 rounded-lg border transition-colors',
                          'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
                          r.status === 'CANCELLED' || r.status === 'NO_SHOW' ? 'opacity-50' : '',
                        )}
                      >
                        {/* Time */}
                        <div className="shrink-0 w-16 text-center">
                          <p className="text-sm font-semibold text-zinc-300">{formatTime12(r.reservationTime)}</p>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-100 truncate">{r.guestName}</p>
                            {r.customer && (
                              <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-500 shrink-0">
                                CRM
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {r.partySize}
                            </span>
                            {r.table && (
                              <span className="flex items-center gap-1">
                                <Armchair className="size-3" />
                                {r.table.name}
                              </span>
                            )}
                            {r.guestPhone && (
                              <span className="hidden sm:flex items-center gap-1">
                                <Phone className="size-3" />
                                {r.guestPhone}
                              </span>
                            )}
                            {r.notes && (
                              <span className="hidden md:flex items-center gap-1 truncate">
                                <StickyNote className="size-3 shrink-0" />
                                <span className="truncate">{r.notes}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status + Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={r.status} />
                          {r.status === 'CONFIRMED' && (
                            <div className="flex items-center gap-0.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="size-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                onClick={() => handleSeatGuest(r)}
                                title="Seat"
                              >
                                <UserCheck className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="size-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => handleCancel(r)}
                                title="Cancel"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <NewReservationDialog
        open={newResOpen}
        onOpenChange={setNewResOpen}
        tables={tables}
        customers={customers}
        onSubmit={handleNewReservation}
      />

      <AddWalkInDialog
        open={addWalkInOpen}
        onOpenChange={setAddWalkInOpen}
        tables={tables}
        onSubmit={handleAddWalkIn}
      />

      <SeatGuestDialog
        open={seatGuestOpen}
        onOpenChange={setSeatGuestOpen}
        reservation={selectedReservation}
        tables={tables}
        onSeat={confirmSeatGuest}
      />
    </div>
  );
}
