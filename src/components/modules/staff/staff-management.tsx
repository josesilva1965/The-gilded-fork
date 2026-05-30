'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  LogIn,
  LogOut,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Hash,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Timer,
  CircleDollarSign,
  X,
  Delete,
  CornerDownLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale } from '@/stores/locale-store';
import { formatCurrencyByLocale } from '@/lib/i18n/locales';

/* ─── Types ─── */
interface ClockLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  note?: string;
  user?: { id: string; name: string; role: string };
}

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: string;
}

interface ShiftAssignment {
  id: string;
  userId: string;
  shiftTemplateId: string;
  shiftTemplate: ShiftTemplate;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  position?: string | null;
  notes?: string | null;
}

interface StaffUser {
  id: string;
  email: string;
  name: string;
  pin: string;
  role: string;
  phone?: string | null;
  active: boolean;
  hourlyRate: number;
  tipPointValue: number;
  clockLogs: ClockLog[];
  shifts: ShiftAssignment[];
}

interface TipDistribution {
  userId: string;
  name: string;
  role: string;
  hoursWorked: number;
  tipPointValue: number;
  tipPoints: number;
  share: number;
}

/* ─── Constants ─── */
const ROLE_BADGE_COLORS: Record<string, string> = {
  ADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  MANAGER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  KITCHEN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  BAR: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  FOH: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

const SHIFT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MORNING: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  AFTERNOON: { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/30' },
  EVENING: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  NIGHT: { bg: 'bg-zinc-500/20', text: 'text-zinc-300', border: 'border-zinc-500/30' },
};

const POSITION_LABELS: Record<string, string> = {
  BARTENDER: 'Bartender',
  SERVER: 'Server',
  HOST: 'Host',
  CHEF: 'Chef',
  BUSBOY: 'Busboy',
  MANAGER: 'Manager',
};

const POSITION_COLORS: Record<string, string> = {
  BARTENDER: 'bg-purple-500/20 text-purple-300',
  SERVER: 'bg-sky-500/20 text-sky-300',
  HOST: 'bg-pink-500/20 text-pink-300',
  CHEF: 'bg-orange-500/20 text-orange-300',
  BUSBOY: 'bg-zinc-500/20 text-zinc-300',
  MANAGER: 'bg-emerald-500/20 text-emerald-300',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ─── Helpers ─── */
function getWeekDates(referenceDate: Date): Date[] {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getShiftsForDay(shifts: ShiftAssignment[], date: Date): ShiftAssignment[] {
  const key = formatDateKey(date);
  return shifts.filter((s) => {
    const shiftDate = new Date(s.date).toISOString().split('T')[0];
    return shiftDate === key;
  });
}

function isClockedIn(user: StaffUser): boolean {
  const logs = user.clockLogs;
  if (!logs || logs.length === 0) return false;
  const latestLog = logs[0]; // Already sorted desc
  return latestLog.action === 'IN';
}

function getClockedInTime(user: StaffUser): Date | null {
  if (!isClockedIn(user)) return null;
  const inLog = user.clockLogs.find((l) => l.action === 'IN');
  return inLog ? new Date(inLog.timestamp) : null;
}

function getHoursWorkedToday(user: StaffUser): number {
  const today = new Date();
  const todayLogs = user.clockLogs.filter((l) => {
    const logDate = new Date(l.timestamp);
    return isSameDay(logDate, today);
  });

  let totalMinutes = 0;
  let inTime: Date | null = null;

  // Process in reverse chronological to chronological order
  const sorted = [...todayLogs].reverse();
  for (const log of sorted) {
    if (log.action === 'IN') {
      inTime = new Date(log.timestamp);
    } else if (log.action === 'OUT' && inTime) {
      totalMinutes += (new Date(log.timestamp).getTime() - inTime.getTime()) / 60000;
      inTime = null;
    }
  }
  // Still clocked in
  if (inTime) {
    totalMinutes += (Date.now() - inTime.getTime()) / 60000;
  }
  return totalMinutes / 60;
}

function maskPin(pin: string): string {
  return pin.replace(/./g, '•');
}

/* ─── Sub-Components ─── */

/* Summary Cards */
function SummaryCards({ staff }: { staff: StaffUser[] }) {
  const locale = useLocale();
  const fmtCur = useCallback((a: number) => formatCurrencyByLocale(a, locale), [locale]);
  const clockedInStaff = staff.filter(isClockedIn);
  const today = new Date();
  const todayShifts = staff.filter((u) =>
    u.shifts.some((s) => isSameDay(new Date(s.date), today))
  );

  // Weekly labor cost: sum of (hourlyRate * shift hours this week) for each staff
  const weekDates = getWeekDates(new Date());
  let weeklyMinutes = 0;
  let weeklyCost = 0;
  for (const user of staff) {
    for (const date of weekDates) {
      const dayShifts = getShiftsForDay(user.shifts, date);
      for (const shift of dayShifts) {
        const start = shift.startTime || shift.shiftTemplate.startTime;
        const end = shift.endTime || shift.shiftTemplate.endTime;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let minutes = (eh * 60 + em) - (sh * 60 + sm);
        if (minutes < 0) minutes += 24 * 60; // overnight shift
        weeklyMinutes += minutes;
        weeklyCost += (minutes / 60) * user.hourlyRate;
      }
    }
  }

  const cards = [
    {
      title: 'Total Staff',
      value: staff.length.toString(),
      subtitle: `${staff.filter((s) => s.active).length} active`,
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Clocked In',
      value: clockedInStaff.length.toString(),
      subtitle: clockedInStaff.length > 0 ? clockedInStaff.map((s) => s.name.split(' ')[0]).join(', ') : 'None',
      icon: LogIn,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'On Shift Today',
      value: todayShifts.length.toString(),
      subtitle: `${new Set(todayShifts.flatMap((u) => u.shifts.filter((s) => isSameDay(new Date(s.date), today)).map((s) => s.position || 'General'))).size} positions`,
      icon: Calendar,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Weekly Labor Cost',
      value: fmtCur(weeklyCost),
      subtitle: `${Math.round(weeklyMinutes / 60)}h scheduled`,
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {cards.map((card) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-zinc-500 truncate">{card.title}</p>
                  <p className={cn('text-xl md:text-2xl font-bold', card.color)}>{card.value}</p>
                  <p className="text-[10px] text-zinc-600 truncate">{card.subtitle}</p>
                </div>
                <div className={cn('p-2 rounded-lg shrink-0', card.bgColor)}>
                  <card.icon className={cn('size-4', card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* Schedule Tab */
function ScheduleTab({ staff }: { staff: StaffUser[] }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [referenceDate] = useState(new Date());

  const weekDates = useMemo(() => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + weekOffset * 7);
    return getWeekDates(d);
  }, [referenceDate, weekOffset]);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} — ${fmt(end)}`;
  }, [weekDates]);

  const staffWithShifts = useMemo(
    () => staff.filter((u) => u.shifts.length > 0),
    [staff]
  );

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((w) => w - 1)}
          className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-200">{weekLabel}</p>
          {weekOffset === 0 && (
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 mt-1">
              This Week
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((w) => w + 1)}
          className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
        >
          <ChevronRight className="size-4" />
        </Button>
        {weekOffset !== 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
            className="text-emerald-400 hover:text-emerald-300 text-xs"
          >
            Today
          </Button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row */}
          <div className="grid grid-cols-[160px_repeat(7,1fr)] gap-1 mb-1">
            <div className="p-2 text-xs text-zinc-500 font-medium">Staff</div>
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={cn(
                  'p-2 text-center text-xs font-medium rounded-t-lg',
                  isToday(date)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                )}
              >
                <div>{DAY_NAMES[i]}</div>
                <div className={cn('text-lg font-bold', isToday(date) ? 'text-emerald-200' : 'text-zinc-300')}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Staff Rows */}
          <ScrollArea className="max-h-[500px]">
            {staffWithShifts.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Calendar className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No shifts scheduled</p>
              </div>
            ) : (
              staffWithShifts.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[160px_repeat(7,1fr)] gap-1 mb-1"
                >
                  {/* Staff Name */}
                  <div className="p-2 flex items-center gap-2 min-w-0">
                    <div className={cn('w-2 h-2 rounded-full shrink-0', isClockedIn(user) ? 'bg-emerald-400' : 'bg-zinc-600')} />
                    <span className="text-xs text-zinc-300 truncate font-medium">{user.name}</span>
                  </div>

                  {/* Day Cells */}
                  {weekDates.map((date, dayIdx) => {
                    const dayShifts = getShiftsForDay(user.shifts, date);
                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          'p-1 min-h-[48px] rounded border',
                          isToday(date) ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-zinc-900/50 border-zinc-800/50'
                        )}
                      >
                        {dayShifts.map((shift) => {
                          const shiftType = shift.shiftTemplate.type;
                          const colors = SHIFT_TYPE_COLORS[shiftType] || SHIFT_TYPE_COLORS.AFTERNOON;
                          const start = shift.startTime || shift.shiftTemplate.startTime;
                          const end = shift.endTime || shift.shiftTemplate.endTime;
                          return (
                            <div
                              key={shift.id}
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] mb-0.5 border',
                                colors.bg,
                                colors.border
                              )}
                            >
                              <div className={cn('font-semibold', colors.text)}>
                                {shift.position || shift.shiftTemplate.name}
                              </div>
                              <div className="text-zinc-400">
                                {start}–{end}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Shift Type Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(SHIFT_TYPE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded', colors.bg, 'border', colors.border)} />
            <span className="text-[10px] text-zinc-500 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Staff Directory Tab */
function StaffDirectoryTab({ staff }: { staff: StaffUser[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());

  const filteredStaff = useMemo(() => {
    return staff.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, searchQuery, roleFilter]);

  const togglePin = (userId: string) => {
    setVisiblePins((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const roles = ['ALL', 'ADMIN', 'MANAGER', 'KITCHEN', 'BAR', 'FOH'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {roles.map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter(role)}
              className={cn(
                'text-xs',
                roleFilter === role
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              )}
            >
              {role === 'ALL' ? 'All' : role}
            </Button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500 text-xs">Name</TableHead>
                  <TableHead className="text-zinc-500 text-xs">Role</TableHead>
                  <TableHead className="text-zinc-500 text-xs hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-zinc-500 text-xs hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-right">Rate</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-center">PIN</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((user) => (
                  <TableRow key={user.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                          isClockedIn(user) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                        )}>
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-sm text-zinc-200 font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] border', ROLE_BADGE_COLORS[user.role] || ROLE_BADGE_COLORS.FOH)}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Mail className="size-3 text-zinc-600" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Phone className="size-3 text-zinc-600" />
                        {user.phone || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium text-emerald-400">{fmtCur(user.hourlyRate)}</span>
                      <span className="text-[10px] text-zinc-600">/hr</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Hash className="size-3 text-zinc-600" />
                        <span className="text-xs font-mono text-zinc-400">
                          {visiblePins.has(user.id) ? user.pin : maskPin(user.pin)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-zinc-600 hover:text-zinc-300"
                          onClick={() => togglePin(user.id)}
                        >
                          {visiblePins.has(user.id) ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.active ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30 text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <p className="text-xs text-zinc-600 text-center">
        Showing {filteredStaff.length} of {staff.length} staff members
      </p>
    </div>
  );
}

/* Clock In/Out Tab */
function ClockInOutTab({ staff, onClockAction }: { staff: StaffUser[]; onClockAction: () => void }) {
  const [pinInput, setPinInput] = useState('');
  const [clockMessage, setClockMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const clockedInStaff = useMemo(() => staff.filter(isClockedIn), [staff]);

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    setPinInput('');
    setClockMessage(null);
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleSubmit = useCallback(async () => {
    if (pinInput.length !== 4) return;
    const user = staff.find((u) => u.pin === pinInput);
    if (!user) {
      setClockMessage({ text: 'Invalid PIN. Please try again.', type: 'error' });
      setPinInput('');
      return;
    }

    const currentlyIn = isClockedIn(user);
    const action = currentlyIn ? 'OUT' : 'IN';

    setIsProcessing(true);
    try {
      const res = await fetch('/api/staff/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action }),
      });

      if (!res.ok) throw new Error('Clock failed');

      if (action === 'IN') {
        setClockMessage({ text: `Welcome, ${user.name}!`, type: 'success' });
      } else {
        const clockedInTime = getClockedInTime(user);
        let workedText = '';
        if (clockedInTime) {
          const diffMs = Date.now() - clockedInTime.getTime();
          const hours = Math.floor(diffMs / 3600000);
          const minutes = Math.floor((diffMs % 3600000) / 60000);
          workedText = ` Worked: ${hours}h ${minutes}m`;
        }
        setClockMessage({ text: `Goodbye, ${user.name}!${workedText}`, type: 'success' });
      }

      onClockAction();
      setPinInput('');
    } catch {
      setClockMessage({ text: 'Error processing clock. Try again.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [pinInput, staff, onClockAction]);

  // Auto-submit when PIN is 4 digits
  useEffect(() => {
    if (pinInput.length === 4) {
      const timer = setTimeout(() => handleSubmit(), 300);
      return () => clearTimeout(timer);
    }
  }, [pinInput, handleSubmit]);

  const padButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* PIN Pad Section */}
      <div className="space-y-4">
        {/* Current Time */}
        <div className="text-center">
          <p className="text-5xl md:text-6xl font-bold text-zinc-100 font-mono tracking-wider">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <Separator className="bg-zinc-800" />

        {/* PIN Display */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all duration-150',
                i < pinInput.length
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-600'
              )}
            >
              {i < pinInput.length ? '•' : ''}
            </div>
          ))}
        </div>

        {/* Clock Message */}
        <AnimatePresence mode="wait">
          {clockMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                'flex items-center gap-2 justify-center p-3 rounded-lg text-sm font-medium',
                clockMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              )}
            >
              {clockMessage.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              {clockMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIN Pad */}
        <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
          {padButtons.map((btn) => {
            if (btn === 'C') {
              return (
                <Button
                  key={btn}
                  variant="outline"
                  onClick={handleClear}
                  className="h-14 text-lg font-bold bg-zinc-800 border-zinc-700 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                >
                  <X className="size-5" />
                </Button>
              );
            }
            if (btn === '⌫') {
              return (
                <Button
                  key={btn}
                  variant="outline"
                  onClick={handleBackspace}
                  className="h-14 text-lg font-bold bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/30"
                >
                  <Delete className="size-5" />
                </Button>
              );
            }
            return (
              <Button
                key={btn}
                variant="outline"
                onClick={() => handlePinDigit(btn)}
                disabled={isProcessing || pinInput.length >= 4}
                className="h-14 text-xl font-bold bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white active:scale-95 transition-transform"
              >
                {btn}
              </Button>
            );
          })}
        </div>

        {/* Enter Button */}
        <div className="max-w-[280px] mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={pinInput.length !== 4 || isProcessing}
            className={cn(
              'w-full h-14 text-lg font-bold transition-all',
              pinInput.length === 4
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            )}
          >
            {isProcessing ? (
              <div className="animate-spin size-5 border-2 border-zinc-400 border-t-transparent rounded-full" />
            ) : (
              <>
                <CornerDownLeft className="size-4 mr-2" />
                Enter
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Clocked In Staff */}
      <div className="space-y-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <UserCheck className="size-4 text-emerald-400" />
              Currently Clocked In
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-auto">
                {clockedInStaff.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clockedInStaff.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Clock className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No one is clocked in</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clockedInStaff.map((user) => {
                  const clockedInTime = getClockedInTime(user);
                  const elapsed = clockedInTime
                    ? Date.now() - clockedInTime.getTime()
                    : 0;
                  const hours = Math.floor(elapsed / 3600000);
                  const minutes = Math.floor((elapsed % 3600000) / 60000);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-sm">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn('text-[9px] border', ROLE_BADGE_COLORS[user.role])}
                          >
                            {user.role}
                          </Badge>
                          {clockedInTime && (
                            <span className="text-[10px] text-zinc-500">
                              Since {new Date(clockedInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Timer className="size-3" />
                          <span className="text-xs font-mono font-medium">
                            {hours}h {minutes}m
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* Tips Tab */
function TipsTab({ staff }: { staff: StaffUser[] }) {
  const [tipPool, setTipPool] = useState<string>('500');
  const [distributions, setDistributions] = useState<TipDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [distributed, setDistributed] = useState(false);

  const fetchTips = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/staff/tips');
      if (res.ok) {
        const data = await res.json();
        setDistributions(data.distributions || []);
      }
    } catch (err) {
      console.error('Failed to fetch tip distribution:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const totalTipPoints = useMemo(
    () => distributions.reduce((sum, d) => sum + d.tipPoints, 0),
    [distributions]
  );

  const tipPoolAmount = parseFloat(tipPool) || 0;

  const calculatedShares = useMemo(() => {
    if (totalTipPoints === 0 || tipPoolAmount === 0) return distributions;
    return distributions.map((d) => ({
      ...d,
      share: (d.tipPoints / totalTipPoints) * tipPoolAmount,
    }));
  }, [distributions, totalTipPoints, tipPoolAmount]);

  const totalDistributed = useMemo(
    () => calculatedShares.reduce((sum, d) => sum + d.share, 0),
    [calculatedShares]
  );

  return (
    <div className="space-y-6">
      {/* Tip Pool Input */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <CircleDollarSign className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Total Tip Pool</p>
                <p className="text-[10px] text-zinc-500">Enter the total tips to distribute</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-zinc-500">$</span>
              <Input
                type="number"
                value={tipPool}
                onChange={(e) => { setTipPool(e.target.value); setDistributed(false); }}
                className="w-32 text-lg font-bold bg-zinc-800 border-zinc-700 text-zinc-100 text-center"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Calculator className="size-4 text-emerald-400" />
            Tip Distribution — Today
            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 ml-auto">
              {calculatedShares.length} staff
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin size-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : calculatedShares.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Clock className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No staff worked today</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-xs">Staff</TableHead>
                    <TableHead className="text-zinc-500 text-xs">Role</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-center">Hours</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-center">Tip Pts</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-center">Points</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculatedShares.map((d) => (
                    <TableRow key={d.userId} className="border-zinc-800/50 hover:bg-zinc-800/30">
                      <TableCell>
                        <span className="text-sm text-zinc-200 font-medium">{d.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] border', ROLE_BADGE_COLORS[d.role] || ROLE_BADGE_COLORS.FOH)}
                        >
                          {d.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs text-zinc-400 font-mono">
                        {d.hoursWorked.toFixed(1)}h
                      </TableCell>
                      <TableCell className="text-center text-xs text-zinc-400 font-mono">
                        {d.tipPointValue.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center text-xs text-amber-400 font-mono font-medium">
                        {d.tipPoints.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-emerald-400">{fmtCur(d.share)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      {calculatedShares.length > 0 && tipPoolAmount > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-400" />
                  <span className="text-lg font-bold text-zinc-100">Total: {fmtCur(totalDistributed)}</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Pool: {fmtCur(tipPoolAmount)} · Points: {totalTipPoints.toFixed(1)} · Per point: {totalTipPoints > 0 ? fmtCur(tipPoolAmount / totalTipPoints) : fmtCur(0)}
                </p>
              </div>
              <Button
                onClick={() => setDistributed(true)}
                disabled={distributed}
                className={cn(
                  'font-semibold',
                  distributed
                    ? 'bg-emerald-600/50 text-emerald-200 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25'
                )}
              >
                {distributed ? (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Distributed
                  </>
                ) : (
                  <>
                    <DollarSign className="size-4 mr-2" />
                    Distribute Tips
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export function StaffManagement() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const addNotification = useAppStore((s) => s.addNotification);
  const t = useT();
  const locale = useLocale();
  const fmtCur = useCallback((a: number) => formatCurrencyByLocale(a, locale), [locale]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      addNotification('Failed to load staff data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchStaff, 30000);
    return () => clearInterval(interval);
  }, [fetchStaff]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin size-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
          <p className="text-sm text-zinc-500">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCards staff={staff} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto">
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-400 text-xs"
          >
            <Calendar className="size-3.5 mr-1.5" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="directory"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-400 text-xs"
          >
            <Users className="size-3.5 mr-1.5" />
            Staff Directory
          </TabsTrigger>
          <TabsTrigger
            value="clock"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-400 text-xs"
          >
            <Clock className="size-3.5 mr-1.5" />
            Clock In/Out
          </TabsTrigger>
          <TabsTrigger
            value="tips"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-400 text-xs"
          >
            <DollarSign className="size-3.5 mr-1.5" />
            Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab staff={staff} />
        </TabsContent>

        <TabsContent value="directory" className="mt-4">
          <StaffDirectoryTab staff={staff} />
        </TabsContent>

        <TabsContent value="clock" className="mt-4">
          <ClockInOutTab staff={staff} onClockAction={fetchStaff} />
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <TipsTab staff={staff} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
