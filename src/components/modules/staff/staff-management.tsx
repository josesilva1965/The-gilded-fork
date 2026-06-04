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
  Plus,
  Pencil,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { useT, useLocale, useLocaleConfig } from '@/stores/locale-store';
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
  const t = useT();
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
      title: t.common.total,
      value: staff.length.toString(),
      subtitle: `${staff.filter((s) => s.active).length} ${t.common.active}`,
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: t.staff.clockedIn,
      value: clockedInStaff.length.toString(),
      subtitle: clockedInStaff.length > 0 ? clockedInStaff.map((s) => s.name.split(' ')[0]).join(', ') : 'None',
      icon: LogIn,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: t.staff.todayShift,
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
function ScheduleTab({ staff, onRefresh }: { staff: StaffUser[]; onRefresh: () => void }) {
  const t = useT();
  const addNotification = useAppStore((s) => s.addNotification);
  const [weekOffset, setWeekOffset] = useState(0);
  const [referenceDate] = useState(new Date());

  // Views Toggle State
  const [viewMode, setViewMode] = useState<'grid' | 'daily'>('grid');
  const [selectedDayTab, setSelectedDayTab] = useState(0); // 0 = Mon, ..., 6 = Sun

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formUserId, setFormUserId] = useState('');
  const [formTemplateId, setFormTemplateId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formPosition, setFormPosition] = useState('SERVER');
  const [formNotes, setFormNotes] = useState('');

  // Fetch templates from API
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/staff/shifts');
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    }
    fetchTemplates();
  }, []);

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

  const sortedStaff = useMemo(() => {
    return [...staff].sort((a, b) => a.name.localeCompare(b.name));
  }, [staff]);

  const handleTemplateChange = (templateId: string) => {
    setFormTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormStartTime(template.startTime);
      setFormEndTime(template.endTime);
    }
  };

  const openCreateDialog = (user: StaffUser, date: Date) => {
    setEditingAssignment(null);
    setSelectedUser(user);
    setSelectedDate(date);
    
    setFormUserId(user.id);
    setFormDate(date.toISOString().split('T')[0]);
    
    if (templates.length > 0) {
      setFormTemplateId(templates[0].id);
      setFormStartTime(templates[0].startTime);
      setFormEndTime(templates[0].endTime);
    } else {
      setFormTemplateId('');
      setFormStartTime('');
      setFormEndTime('');
    }
    
    setFormPosition(user.role === 'FOH' ? 'SERVER' : user.role === 'KITCHEN' ? 'CHEF' : user.role === 'BAR' ? 'BARTENDER' : 'SERVER');
    setFormNotes('');
    
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: StaffUser, assignment: ShiftAssignment) => {
    setEditingAssignment(assignment);
    setSelectedUser(user);
    setSelectedDate(new Date(assignment.date));
    
    setFormUserId(user.id);
    setFormDate(new Date(assignment.date).toISOString().split('T')[0]);
    setFormTemplateId(assignment.shiftTemplateId);
    setFormStartTime(assignment.startTime || assignment.shiftTemplate.startTime);
    setFormEndTime(assignment.endTime || assignment.shiftTemplate.endTime);
    setFormPosition(assignment.position || 'SERVER');
    setFormNotes(assignment.notes || '');
    
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId || !formTemplateId || !formDate) {
      addNotification(t.staff.requiredFieldsError, 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const isEditing = !!editingAssignment;
      const res = await fetch('/api/staff/shifts', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAssignment?.id,
          userId: formUserId,
          shiftTemplateId: formTemplateId,
          date: formDate,
          startTime: formStartTime,
          endTime: formEndTime,
          position: formPosition,
          notes: formNotes,
        }),
      });

      if (res.ok) {
        addNotification(
          isEditing ? t.staff.shiftUpdated : t.staff.shiftAssigned,
          'success'
        );
        setIsDialogOpen(false);
        onRefresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || t.staff.errorSaveShift);
      }
    } catch (err: any) {
      addNotification(err.message || t.staff.errorSaveShift, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAssignment) return;
    if (!confirm(t.staff.confirmDeleteShift)) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/staff/shifts?id=${editingAssignment.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        addNotification(t.staff.shiftDeleted, 'success');
        setIsDialogOpen(false);
        onRefresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || t.staff.errorDeleteShift);
      }
    } catch (err: any) {
      addNotification(err.message || t.staff.errorDeleteShift, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get shifts for daily view
  const selectedDateObject = weekDates[selectedDayTab];
  const shiftsForSelectedDay = useMemo(() => {
    const list: Array<{ user: StaffUser; shift: ShiftAssignment }> = [];
    for (const user of sortedStaff) {
      const dayShifts = getShiftsForDay(user.shifts, selectedDateObject);
      for (const shift of dayShifts) {
        list.push({ user, shift });
      }
    }
    return list.sort((a, b) => {
      const timeA = a.shift.startTime || a.shift.shiftTemplate.startTime;
      const timeB = b.shift.startTime || b.shift.shiftTemplate.startTime;
      return timeA.localeCompare(timeB);
    });
  }, [sortedStaff, selectedDateObject]);

  return (
    <div className="space-y-4">
      {/* Week Navigation & General Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/85">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 h-8 w-8 p-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="text-center px-2">
            <p className="text-xs font-semibold text-zinc-200">{weekLabel}</p>
            {weekOffset === 0 && (
              <Badge variant="outline" className="text-[9px] h-4 py-0 px-1.5 border-emerald-500/30 text-emerald-400 mt-0.5">
                This Week
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 h-8 w-8 p-0"
          >
            <ChevronRight className="size-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(0)}
              className="text-emerald-400 hover:text-emerald-300 text-[10px] h-8 px-2"
            >
              Today
            </Button>
          )}
        </div>

        {/* View Mode & Add Shift Button */}
        <div className="flex items-center gap-3 justify-between md:justify-end w-full md:w-auto">
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800/70">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                viewMode === 'grid'
                  ? "bg-zinc-800 text-zinc-100 shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={cn(
                "px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                viewMode === 'daily'
                  ? "bg-zinc-800 text-zinc-100 shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Daily List
            </button>
          </div>

          <Button
            onClick={() => {
              if (sortedStaff.length > 0) {
                openCreateDialog(sortedStaff[0], viewMode === 'daily' ? selectedDateObject : new Date());
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 h-8 text-xs rounded-lg px-3 cursor-pointer"
            disabled={sortedStaff.length === 0}
          >
            <Plus className="size-3.5" />
            Assign Shift
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Calendar Grid */
        <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-2">
          <div className="min-w-[850px]">
            {/* Header Row */}
            <div className="grid grid-cols-[160px_repeat(7,1fr)] gap-1 mb-1">
              <div className="p-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">Staff</div>
              {weekDates.map((date, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-2 text-center text-xs font-semibold rounded-lg border',
                    isToday(date)
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-zinc-900/60 text-zinc-400 border-zinc-850'
                  )}
                >
                  <div className="text-[10px] uppercase opacity-70">{DAY_NAMES[i]}</div>
                  <div className={cn('text-lg font-bold mt-0.5', isToday(date) ? 'text-emerald-300' : 'text-zinc-200')}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Staff Rows */}
            <ScrollArea className="max-h-[520px] pr-1">
              {sortedStaff.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Calendar className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t.staff.noStaffOnShift}</p>
                </div>
              ) : (
                sortedStaff.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-[160px_repeat(7,1fr)] gap-1 mb-1 items-stretch"
                  >
                    {/* Staff Name Card */}
                    <div className="p-2.5 bg-zinc-900/40 rounded-lg border border-zinc-850 flex items-center gap-2 min-w-0">
                      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 shadow-inner', isClockedIn(user) ? 'bg-emerald-450 shadow-emerald-400/50' : 'bg-zinc-650')} />
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-200 truncate font-semibold">{user.name}</p>
                        <p className="text-[9px] text-zinc-500 capitalize">{user.role.toLowerCase()}</p>
                      </div>
                    </div>

                    {/* Day Cells */}
                    {weekDates.map((date, dayIdx) => {
                      const dayShifts = getShiftsForDay(user.shifts, date);
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            'p-1.5 min-h-[68px] rounded-lg border relative group transition-all duration-150 flex flex-col justify-start gap-1',
                            isToday(date) ? 'bg-emerald-950/10 border-emerald-500/25' : 'bg-zinc-900/25 border-zinc-850 hover:bg-zinc-800/15'
                          )}
                        >
                          {/* Cell hover add action */}
                          <button
                            onClick={() => openCreateDialog(user, date)}
                            className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 hover:bg-emerald-500 text-white rounded p-0.5 shadow-md z-10 cursor-pointer"
                          >
                            <Plus className="size-3" />
                          </button>

                          <div className="space-y-1 w-full z-0">
                            {dayShifts.map((shift) => {
                              const shiftType = shift.shiftTemplate.type;
                              const start = shift.startTime || shift.shiftTemplate.startTime;
                              const end = shift.endTime || shift.shiftTemplate.endTime;
                              return (
                                <button
                                  key={shift.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(user, shift);
                                  }}
                                  className={cn(
                                    'w-full text-left p-1.5 rounded-md border-l-4 text-[10px] leading-snug font-bold transition-all hover:scale-[1.02] cursor-pointer block bg-zinc-900 border border-zinc-800/60 shadow-sm',
                                    shiftType === 'MORNING' ? 'border-l-amber-500' :
                                    shiftType === 'AFTERNOON' ? 'border-l-sky-500' :
                                    shiftType === 'EVENING' ? 'border-l-purple-500' : 'border-l-zinc-500'
                                  )}
                                >
                                  <div className="text-zinc-100 truncate font-bold">
                                    {shift.position || shift.shiftTemplate.name}
                                  </div>
                                  <div className="text-[8.5px] text-zinc-400 mt-1 font-semibold flex items-center gap-1">
                                    <Clock className="size-2.5 opacity-75 shrink-0" />
                                    <span>{start}–{end}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      ) : (
        /* Daily List View (Focused & Spacious) */
        <div className="space-y-4">
          {/* Day Selector */}
          <div className="flex justify-between gap-1 overflow-x-auto p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
            {weekDates.map((date, idx) => {
              const dayShiftsCount = staff.reduce((count, u) => count + getShiftsForDay(u.shifts, date).length, 0);
              const isSelected = selectedDayTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayTab(idx)}
                  className={cn(
                    "flex-1 min-w-[75px] py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                    isSelected
                      ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  )}
                >
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-85">{DAY_NAMES[idx]}</span>
                  <span className="text-base font-black">{date.getDate()}</span>
                  {dayShiftsCount > 0 && (
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-bold mt-1",
                      isSelected ? "bg-emerald-800 text-emerald-100" : "bg-zinc-800 text-zinc-400"
                    )}>
                      {dayShiftsCount} {dayShiftsCount === 1 ? t.staff.shift : t.staff.shifts}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Daily list cards */}
          {shiftsForSelectedDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/10 rounded-xl border border-dashed border-zinc-800/80">
              <p className="text-sm text-zinc-400">{t.staff.noShiftsScheduled}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (sortedStaff.length > 0) {
                    openCreateDialog(sortedStaff[0], selectedDateObject);
                  }
                }}
                className="mt-4 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
              >
                + {t.staff.assignFirstShift}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shiftsForSelectedDay.map(({ user, shift }) => {
                const shiftType = shift.shiftTemplate.type;
                const start = shift.startTime || shift.shiftTemplate.startTime;
                const end = shift.endTime || shift.shiftTemplate.endTime;
                return (
                  <div
                    key={shift.id}
                    onClick={() => openEditDialog(user, shift)}
                    className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group shadow-sm"
                  >
                    {/* Shift type solid color bar indicator */}
                    <div className={cn("absolute top-0 left-0 right-0 h-1",
                      shiftType === 'MORNING' ? 'bg-amber-500' :
                      shiftType === 'AFTERNOON' ? 'bg-sky-500' :
                      shiftType === 'EVENING' ? 'bg-purple-500' : 'bg-zinc-500'
                    )} />

                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full shrink-0', isClockedIn(user) ? 'bg-emerald-450 shadow-sm shadow-emerald-400/50' : 'bg-zinc-650')} />
                          <p className="text-sm font-bold text-zinc-100">{user.name}</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                          {user.role} &bull; {shift.position || shift.shiftTemplate.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-zinc-950 border-zinc-800 text-zinc-400 uppercase font-semibold">
                        {shiftType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-zinc-200 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/40 mt-1">
                      <Clock className="size-4 text-zinc-500 shrink-0" />
                      <div>
                        <span>{start} &mdash; {end}</span>
                      </div>
                    </div>

                    {shift.notes && (
                      <p className="text-[10.5px] text-zinc-400 bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-800/20 italic mt-1 leading-normal">
                        "{shift.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shift Type Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(SHIFT_TYPE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1.5 rounded-md border border-zinc-800/40 shadow-sm">
            <div className={cn('w-2.5 h-2.5 rounded-sm',
              type === 'MORNING' ? 'bg-amber-500' :
              type === 'AFTERNOON' ? 'bg-sky-500' :
              type === 'EVENING' ? 'bg-purple-500' : 'bg-zinc-500'
            )} />
            <span className="text-[9px] text-zinc-400 capitalize font-medium">{type.toLowerCase()}</span>
          </div>
        ))}
      </div>

      {/* Assign/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-850 text-zinc-100 sm:max-w-md w-[95vw] rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 text-base font-bold">
              {editingAssignment ? t.staff.editShiftAssignment : t.staff.assignShift}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-3">
              {/* Staff Member Select */}
              <div className="space-y-1">
                <Label htmlFor="userId" className="text-xs text-zinc-400 font-medium">{t.staff.staffMember}</Label>
                <select
                  id="userId"
                  value={formUserId}
                  onChange={(e) => {
                    setFormUserId(e.target.value);
                    const user = staff.find(u => u.id === e.target.value);
                    if (user) setSelectedUser(user);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-600 cursor-pointer"
                  required
                  disabled={!!editingAssignment}
                >
                  {sortedStaff.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs text-zinc-400 font-medium">{t.common.date}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10"
                  required
                />
              </div>

              {/* Template Select */}
              <div className="space-y-1">
                <Label htmlFor="templateId" className="text-xs text-zinc-400 font-medium">{t.staff.shiftTemplate}</Label>
                <select
                  id="templateId"
                  value={formTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-600 cursor-pointer"
                  required
                >
                  <option value="" disabled>{t.staff.selectTemplate}</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.startTime} - {t.endTime})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Times Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startTime" className="text-xs text-zinc-400 font-medium">{t.staff.startTimeOverride}</Label>
                  <Input
                    id="startTime"
                    type="text"
                    placeholder="e.g. 10:00"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime" className="text-xs text-zinc-400 font-medium">{t.staff.endTimeOverride}</Label>
                  <Input
                    id="endTime"
                    type="text"
                    placeholder="e.g. 16:00"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10"
                  />
                </div>
              </div>

              {/* Position Select */}
              <div className="space-y-1">
                <Label htmlFor="position" className="text-xs text-zinc-400 font-medium">{t.staff.positionRole}</Label>
                <select
                  id="position"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="SERVER">{t.staff.positionServer}</option>
                  <option value="BARTENDER">{t.staff.positionBartender}</option>
                  <option value="CHEF">{t.staff.positionChef}</option>
                  <option value="HOST">{t.staff.positionHost}</option>
                  <option value="MANAGER">{t.staff.positionManager}</option>
                  <option value="BUSBOY">{t.staff.positionBusboy}</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs text-zinc-400 font-medium">{t.common.notesOptional}</Label>
                <textarea
                  id="notes"
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-600 resize-none"
                  placeholder={t.staff.additionalInstructions}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 flex flex-row items-center justify-between mt-6">
              {editingAssignment ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="h-9 px-3"
                >
                  {t.staff.deleteShift}
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="text-zinc-400 hover:text-zinc-200 h-9 px-3"
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  {editingAssignment ? t.common.save : t.staff.assignShift}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Staff Directory Tab */
function StaffDirectoryTab({ staff }: { staff: StaffUser[] }) {
  const t = useT();
  const locale = useLocale();
  const fmtCur = (a: number) => formatCurrencyByLocale(a, locale);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'FOH',
    pin: '',
    hourlyRate: '15',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const handleEditStaff = async () => {
    if (!editingStaff) return;
    try {
      setIsEditSubmitting(true);
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStaff),
      });
      if (res.ok) {
        setEditingStaff(null);
        window.location.reload();
      } else {
        alert('Failed to edit staff');
      }
    } catch (err) {
      console.error(err);
      alert('Error editing staff');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      });
      if (res.ok) {
        setIsAddStaffOpen(false);
        setNewStaff({ name: '', email: '', role: 'FOH', pin: '', hourlyRate: '15', phone: '' });
        window.location.reload(); // Quick refresh to get new data
      } else {
        alert('Failed to add staff');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding staff');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex gap-1.5 flex-wrap flex-1 justify-end">
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
              {role === 'ALL' ? t.common.all : role}
            </Button>
          ))}
          <div className="w-px h-6 bg-zinc-800 mx-1 self-center" />
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                <Plus className="size-3 mr-1" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-xs text-zinc-400">Name</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-xs text-zinc-400">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right text-xs text-zinc-400">Role</Label>
                  <select
                    id="role"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FOH">FOH</option>
                    <option value="BAR">BAR</option>
                    <option value="KITCHEN">KITCHEN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pin" className="text-right text-xs text-zinc-400">4-Digit PIN</Label>
                  <Input
                    id="pin"
                    maxLength={4}
                    value={newStaff.pin}
                    onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value.replace(/[^0-9]/g, '') })}
                    className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rate" className="text-right text-xs text-zinc-400">Hourly Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={newStaff.hourlyRate}
                    onChange={(e) => setNewStaff({ ...newStaff, hourlyRate: e.target.value })}
                    className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddStaffOpen(false)} className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  Cancel
                </Button>
                <Button onClick={handleAddStaff} disabled={isSubmitting || newStaff.pin.length !== 4 || !newStaff.name} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? 'Adding...' : 'Add Staff'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
              </DialogHeader>
              {editingStaff && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right text-xs text-zinc-400">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingStaff.name}
                      onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                      className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-email" className="text-right text-xs text-zinc-400">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingStaff.email}
                      onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                      className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-role" className="text-right text-xs text-zinc-400">Role</Label>
                    <select
                      id="edit-role"
                      value={editingStaff.role}
                      onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                      className="col-span-3 flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="FOH">FOH</option>
                      <option value="BAR">BAR</option>
                      <option value="KITCHEN">KITCHEN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-pin" className="text-right text-xs text-zinc-400">4-Digit PIN</Label>
                    <Input
                      id="edit-pin"
                      maxLength={4}
                      value={editingStaff.pin}
                      onChange={(e) => setEditingStaff({ ...editingStaff, pin: e.target.value.replace(/[^0-9]/g, '') })}
                      className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-rate" className="text-right text-xs text-zinc-400">Hourly Rate</Label>
                    <Input
                      id="edit-rate"
                      type="number"
                      value={editingStaff.hourlyRate}
                      onChange={(e) => setEditingStaff({ ...editingStaff, hourlyRate: parseFloat(e.target.value) || 0 })}
                      className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-status" className="text-right text-xs text-zinc-400">Status</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Button
                        variant={editingStaff.active ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditingStaff({ ...editingStaff, active: true })}
                        className={editingStaff.active ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"}
                      >
                        Active
                      </Button>
                      <Button
                        variant={!editingStaff.active ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditingStaff({ ...editingStaff, active: false })}
                        className={!editingStaff.active ? "bg-red-600 hover:bg-red-700 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"}
                      >
                        Inactive
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingStaff(null)} className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  Cancel
                </Button>
                <Button onClick={handleEditStaff} disabled={isEditSubmitting || (editingStaff?.pin.length !== 4) || !editingStaff?.name} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Staff Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500 text-xs">{t.common.name}</TableHead>
                  <TableHead className="text-zinc-500 text-xs">{t.staff.role}</TableHead>
                  <TableHead className="text-zinc-500 text-xs hidden md:table-cell">{t.common.email}</TableHead>
                  <TableHead className="text-zinc-500 text-xs hidden lg:table-cell">{t.common.phone}</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-right">{t.staff.hourlyRate}</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-center">PIN</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-center">{t.common.status}</TableHead>
                  <TableHead className="text-zinc-500 text-xs text-center">Actions</TableHead>
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
                          {t.common.active}
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30 text-[10px]">
                          {t.common.inactive}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStaff(user)}
                        className="text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 h-8 w-8 p-0"
                      >
                        <Pencil className="size-4" />
                      </Button>
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
  const t = useT();
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
              {t.staff.clockedIn}
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-auto">
                {clockedInStaff.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clockedInStaff.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Clock className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t.staff.noStaffOnShift}</p>
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
  const t = useT();
  const locale = useLocale();
  const { currencySymbol } = useLocaleConfig();
  const fmtCur = (a: number) => formatCurrencyByLocale(a, locale);
  const [tipPool, setTipPool] = useState<string>('0');
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
        if (typeof data.totalTips === 'number') {
          setTipPool(data.totalTips.toString());
        }
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
                <p className="text-sm font-medium text-zinc-200">{t.staff.totalTips}</p>
                <p className="text-[10px] text-zinc-500">{t.staff.tipDistribution}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-zinc-500">{currencySymbol}</span>
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
            {t.staff.tipDistribution} — Today
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
              <p className="text-sm">{t.staff.noStaffOnShift}</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-xs">{t.staff.title}</TableHead>
                    <TableHead className="text-zinc-500 text-xs">{t.staff.role}</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-center">{t.staff.hoursWorked}</TableHead>
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
                  <span className="text-lg font-bold text-zinc-100">{t.common.total}: {fmtCur(totalDistributed)}</span>
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
                    {t.staff.distribute}
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
          <p className="text-sm text-zinc-500">{t.common.loading}</p>
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
            {t.staff.shiftSchedule}
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
            {`${t.staff.clockIn}/${t.staff.clockOut}`}
          </TabsTrigger>
          <TabsTrigger
            value="tips"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-400 text-xs"
          >
            <DollarSign className="size-3.5 mr-1.5" />
            {t.staff.tips}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab staff={staff} onRefresh={fetchStaff} />
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
