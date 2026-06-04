'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Heart,
  Crown,
  Star,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Gift,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Loader2,
  XCircle,
  RefreshCw,
  Send,
  TrendingUp,
  Award,
  Cake,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/stores/app-store';
import { useT, useLocale } from '@/stores/locale-store';
import { formatCurrencyByLocale, formatDateByLocale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils';

/* ─── Types ─── */

type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

interface CustomerFavorite {
  id: string;
  menuItem: { id: string; name: string; price: number };
}

interface CustomerVisit {
  id: string;
  visitDate: string;
  totalSpend: number;
  partySize: number;
  notes: string | null;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  allergies: string | null;
  notes: string | null;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  lifetimeSpend: number;
  visitCount: number;
  lastVisit: string | null;
  marketingOptIn: boolean;
  allowedCredit: boolean;
  createdAt: string;
  updatedAt: string;
  favorites: CustomerFavorite[];
  visits: CustomerVisit[];
}

type SortField = 'name' | 'lifetimeSpend' | 'visits' | 'lastVisit';
type SortDir = 'asc' | 'desc';

/* ─── Constants ─── */

const TIER_BADGE_COLORS: Record<LoyaltyTier, string> = {
  BRONZE: 'bg-amber-700/20 text-amber-700 border-amber-700/40',
  SILVER: 'bg-zinc-400/20 text-zinc-400 border-zinc-400/40',
  GOLD: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40',
  PLATINUM: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
};

const TIER_DOT_COLORS: Record<LoyaltyTier, string> = {
  BRONZE: 'bg-amber-700',
  SILVER: 'bg-zinc-400',
  GOLD: 'bg-yellow-500',
  PLATINUM: 'bg-emerald-400',
};

const TIER_ICONS: Record<LoyaltyTier, React.ElementType> = {
  BRONZE: Award,
  SILVER: Award,
  GOLD: Star,
  PLATINUM: Crown,
};

const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 2500,
  PLATINUM: 5000,
};

const ALL_TIERS: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

/* ─── Helpers ─── */

function getNextTier(current: LoyaltyTier): LoyaltyTier | null {
  const idx = ALL_TIERS.indexOf(current);
  return idx < ALL_TIERS.length - 1 ? ALL_TIERS[idx + 1] : null;
}

function getTierProgress(points: number, tier: LoyaltyTier): number {
  const nextTier = getNextTier(tier);
  if (!nextTier) return 100;
  const currentThreshold = TIER_THRESHOLDS[tier];
  const nextThreshold = TIER_THRESHOLDS[nextTier];
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/* ─── Summary Cards ─── */

function SummaryCards({ customers }: { customers: Customer[] }) {
  const locale = useLocale();
  const totalCustomers = customers.length;
  const goldPlatinum = customers.filter(
    (c) => c.loyaltyTier === 'GOLD' || c.loyaltyTier === 'PLATINUM'
  ).length;
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const avgSpend =
    totalCustomers > 0
      ? customers.reduce((sum, c) => sum + c.lifetimeSpend, 0) / totalCustomers
      : 0;

  const t = useT();

  const cards = [
    {
      label: t.crm.totalGuests,
      value: totalCustomers,
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: t.crm.vipGuests,
      value: goldPlatinum,
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: t.crm.loyaltyPoints,
      value: totalPoints.toLocaleString(),
      icon: Gift,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: t.crm.averageSpend,
      value: formatCurrencyByLocale(avgSpend, locale),
      icon: TrendingUp,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', card.bgColor)}>
              <card.icon className={cn('size-5', card.color)} />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{card.value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {card.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Customer Detail Sheet ─── */

function CustomerDetailSheet({
  customer,
  open,
  onClose,
  onAddPoints,
  onToggleCreditAuth,
}: {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onAddPoints: (customerId: string, points: number) => Promise<void>;
  onToggleCreditAuth: (customerId: string, allowedCredit: boolean) => Promise<void>;
}) {
  const [addingPoints, setAddingPoints] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(100);
  const [togglingCredit, setTogglingCredit] = useState(false);
  const t = useT();
  const locale = useLocale();

  if (!customer) return null;

  const TierIcon = TIER_ICONS[customer.loyaltyTier];
  const nextTier = getNextTier(customer.loyaltyTier);
  const progress = getTierProgress(customer.loyaltyPoints, customer.loyaltyTier);
  const allergies = customer.allergies
    ? customer.allergies.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  async function handleAddPoints() {
    if (!customer) return;
    setAddingPoints(true);
    try {
      await onAddPoints(customer.id, pointsToAdd);
    } finally {
      setAddingPoints(false);
    }
  }

  async function handleToggleCreditAuth(checked: boolean) {
    if (!customer) return;
    setTogglingCredit(true);
    try {
      await onToggleCreditAuth(customer.id, checked);
    } finally {
      setTogglingCredit(false);
    }
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
                'flex items-center justify-center w-12 h-12 rounded-xl',
                TIER_BADGE_COLORS[customer.loyaltyTier],
                'border'
              )}
            >
              <TierIcon className="size-6" />
            </div>
            <div>
              <SheetTitle className="text-lg text-zinc-100">
                {customer.firstName} {customer.lastName}
              </SheetTitle>
              <SheetDescription className="text-xs text-zinc-500">
                {t.crm.memberSince} {formatDateByLocale(customer.createdAt, locale)}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-4 space-y-5">
          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {t.crm.contactInfo}
            </h4>
            <div className="space-y-1.5">
              {customer.email && (
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Mail className="size-3.5 text-zinc-500" />
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Phone className="size-3.5 text-zinc-500" />
                  {customer.phone}
                </div>
              )}
              {customer.birthday && (
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Cake className="size-3.5 text-zinc-500" />
                  {formatDateByLocale(customer.birthday, locale)}
                </div>
              )}
            </div>
          </div>

          {/* Allergies */}
          {allergies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {t.crm.allergies}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant="outline"
                    className="border-red-800/50 text-red-400 text-[10px]"
                  >
                    <AlertTriangle className="size-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-zinc-800" />

          {/* Loyalty Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {t.crm.loyaltyProgram}
            </h4>
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn('gap-1.5 text-xs', TIER_BADGE_COLORS[customer.loyaltyTier])}
              >
                <span className={cn('size-2 rounded-full', TIER_DOT_COLORS[customer.loyaltyTier])} />
                {customer.loyaltyTier}
              </Badge>
              <span className="text-sm font-semibold text-zinc-200">
                {customer.loyaltyPoints.toLocaleString()} pts
              </span>
            </div>
            {nextTier && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">
                    {t.crm.progressTo} {nextTier}
                  </span>
                  <span className="text-zinc-400">{Math.round(progress)}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 bg-zinc-800 [&>div]:bg-emerald-500"
                />
                <p className="text-[10px] text-zinc-600">
                  {TIER_THRESHOLDS[nextTier] - customer.loyaltyPoints} {t.crm.pointsTo}{' '}
                  {nextTier}
                </p>
              </div>
            )}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Visit History */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {t.crm.visitHistory}
            </h4>
            {customer.visits.length > 0 ? (
              <div className="space-y-2">
                {customer.visits.map((visit) => (
                  <Card key={visit.id} className="bg-zinc-800/50 border-zinc-700/50">
                    <CardContent className="p-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-300 font-medium">
                          {formatDateByLocale(visit.visitDate, locale)}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {visit.partySize} {visit.partySize === 1 ? t.floorPlan.guest : t.floorPlan.guests}
                          {visit.notes && ` · ${visit.notes}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400">
                        {formatCurrencyByLocale(visit.totalSpend, locale)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">{t.common.noData}</p>
            )}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Favorite Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {t.crm.preferences}
            </h4>
            {customer.favorites.length > 0 ? (
              <div className="space-y-1.5">
                {customer.favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="size-3 text-red-400" />
                      <span className="text-xs text-zinc-300">{fav.menuItem.name}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      {formatCurrencyByLocale(fav.menuItem.price, locale)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">{t.common.noData}</p>
            )}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {t.common.actions}
            </h4>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-[11px] text-zinc-400 mb-1">{t.crm.addPoints}</Label>
                <Input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(Number(e.target.value))}
                  min={1}
                  className="h-9 bg-zinc-800 border-zinc-700 text-zinc-200 text-sm"
                />
              </div>
              <Button
                onClick={handleAddPoints}
                disabled={addingPoints}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9"
              >
                {addingPoints ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                {t.common.add}
              </Button>
            </div>

            {/* Store Credit Authorization Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/50 my-2">
              <div className="space-y-0.5">
                <Label htmlFor="allowed-credit" className="text-xs font-semibold text-zinc-200 cursor-pointer">
                  {t.pos.authorizeStoreCredit}
                </Label>
                <p className="text-[10px] text-zinc-500 leading-normal">{t.pos.allowedCreditDesc}</p>
              </div>
              <Switch
                id="allowed-credit"
                checked={customer.allowedCredit}
                onCheckedChange={handleToggleCreditAuth}
                disabled={togglingCredit}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2 h-9"
              onClick={() => {
                alert(`${t.crm.marketingEmailAlert} ${customer.email || t.crm.noEmailOnFile}`);
              }}
            >
              <Send className="size-3.5" />
              {t.crm.sendMarketingEmail}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Add Customer Dialog ─── */

interface NewCustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  allergies: string;
  marketingOptIn: boolean;
}

function AddCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<NewCustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    allergies: '',
    marketingOptIn: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  function resetForm() {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthday: '',
      allergies: '',
      marketingOptIn: false,
    });
    setError(null);
  }

  async function handleSubmit() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(t.crm.nameRequired);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        birthday: form.birthday || null,
        allergies: form.allergies.trim() || null,
        marketingOptIn: form.marketingOptIn,
        loyaltyTier: 'BRONZE',
        loyaltyPoints: 0,
        lifetimeSpend: 0,
        visitCount: 0,
      };
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t.crm.errorCreateCustomer);
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{t.crm.addNewCustomer}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {t.crm.addNewCustomerDesc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">{t.crm.firstName} *</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="John"
                className="h-9 bg-zinc-800 border-zinc-700 text-zinc-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">{t.crm.lastName} *</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Doe"
                className="h-9 bg-zinc-800 border-zinc-700 text-zinc-200"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">{t.common.email}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
              className="h-9 bg-zinc-800 border-zinc-700 text-zinc-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">{t.common.phone}</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1-555-0100"
              className="h-9 bg-zinc-800 border-zinc-700 text-zinc-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">{t.crm.birthday}</Label>
            <Input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              className="h-9 bg-zinc-800 border-zinc-700 text-zinc-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">{t.crm.allergies}</Label>
            <Input
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder={t.crm.allergiesPlaceholder}
              className="h-9 bg-zinc-800 border-zinc-700 text-zinc-200"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="marketing"
              checked={form.marketingOptIn}
              onCheckedChange={(checked) =>
                setForm({ ...form, marketingOptIn: checked === true })
              }
              className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <Label htmlFor="marketing" className="text-xs text-zinc-400 cursor-pointer">
              {t.crm.marketingOptIn}
            </Label>
          </div>
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="size-3" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { resetForm(); onOpenChange(false); }}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {t.crm.addCustomer}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Sort Icon ─── */

function SortIcon({ field, currentSort, currentDir }: { field: SortField; currentSort: SortField; currentDir: SortDir }) {
  if (field !== currentSort) return null;
  return currentDir === 'asc' ? (
    <ChevronUp className="size-3 inline ml-0.5" />
  ) : (
    <ChevronDown className="size-3 inline ml-0.5" />
  );
}

/* ─── Main CRM Guests Component ─── */

export function CRMGuests() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('lifetimeSpend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addNotification = useAppStore((s) => s.addNotification);
  const t = useT();
  const locale = useLocale();

  /* Fetch customers */
  const fetchCustomers = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(true);
  }, [fetchCustomers]);

  /* Handle sort click */
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  /* Add points */
  async function handleAddPoints(customerId: string, points: number) {
    try {
      const res = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerId, loyaltyPoints: points }),
      });
      if (!res.ok) throw new Error(t.crm.errorAddPoints);
      addNotification(t.crm.pointsAdded, 'success');
      await fetchCustomers(false);
      // Update selected customer
      const updated = customers.find((c) => c.id === customerId);
      if (updated) {
        setSelectedCustomer({
          ...updated,
          loyaltyPoints: updated.loyaltyPoints + points,
        });
      }
    } catch (err) {
      addNotification(t.crm.errorAddPoints, 'error');
    }
  }

  /* Toggle store credit authorization */
  async function handleToggleCreditAuth(customerId: string, allowedCredit: boolean) {
    try {
      const res = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerId, allowedCredit }),
      });
      if (!res.ok) throw new Error(t.crm.errorUpdateCredit);
      addNotification(
        allowedCredit 
          ? t.crm.creditAuthorized 
          : t.crm.creditRevoked, 
        'success'
      );
      await fetchCustomers(false);
      // Update selected customer
      const updated = customers.find((c) => c.id === customerId);
      if (updated) {
        setSelectedCustomer({
          ...updated,
          allowedCredit,
        });
      }
    } catch (err) {
      addNotification(t.crm.errorUpdateCredit, 'error');
    }
  }

  /* Filter + Sort */
  const filteredCustomers = customers
    .filter((c) => {
      const matchesSearch =
        !search.trim() ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
      const matchesTier = tierFilter === 'ALL' || c.loyaltyTier === tierFilter;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':
          return dir * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'lifetimeSpend':
          return dir * (a.lifetimeSpend - b.lifetimeSpend);
        case 'visits':
          return dir * (a.visitCount - b.visitCount);
        case 'lastVisit':
          const aDate = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
          const bDate = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
          return dir * (aDate - bDate);
        default:
          return 0;
      }
    });

  /* Handle row click */
  function handleRowClick(customer: Customer) {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  }

  /* Loading state */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-sm text-zinc-500">{t.common.loading}</p>
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="size-8 text-red-500 mb-3" />
        <p className="text-sm text-zinc-400 mb-2">{t.crm.errorLoadCustomers}</p>
        <p className="text-xs text-zinc-600 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => fetchCustomers(true)}
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
            <Heart className="size-5 text-red-400" />
            {t.crm.title}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {customers.length} {t.crm.totalGuests}
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 self-start"
        >
          <Plus className="size-4" />
          {t.crm.addCustomer}
        </Button>
      </div>

      {/* Summary Cards */}
      <SummaryCards customers={customers} />

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            placeholder={t.crm.searchGuests}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 h-9"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200 h-9">
            <SelectValue placeholder={t.crm.filterByTier} />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="ALL" className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
              {t.common.all}
            </SelectItem>
            {ALL_TIERS.map((tier) => (
              <SelectItem
                key={tier}
                value={tier}
                className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100"
              >
                <div className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', TIER_DOT_COLORS[tier])} />
                  {tier}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customer Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead
                  className="text-zinc-400 cursor-pointer select-none hover:text-zinc-200"
                  onClick={() => handleSort('name')}
                >
                  {t.common.name} <SortIcon field="name" currentSort={sortField} currentDir={sortDir} />
                </TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">{t.common.email}</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">{t.common.phone}</TableHead>
                <TableHead className="text-zinc-400">{t.crm.tier}</TableHead>
                <TableHead
                  className="text-zinc-400 cursor-pointer select-none hover:text-zinc-200 text-right"
                  onClick={() => handleSort('visits')}
                >
                  {t.crm.totalVisits} <SortIcon field="visits" currentSort={sortField} currentDir={sortDir} />
                </TableHead>
                <TableHead
                  className="text-zinc-400 cursor-pointer select-none hover:text-zinc-200 text-right"
                  onClick={() => handleSort('lifetimeSpend')}
                >
                  {t.crm.totalSpent} <SortIcon field="lifetimeSpend" currentSort={sortField} currentDir={sortDir} />
                </TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell text-right">{t.crm.loyaltyPoints}</TableHead>
                <TableHead
                  className="text-zinc-400 cursor-pointer select-none hover:text-zinc-200 text-right hidden md:table-cell"
                  onClick={() => handleSort('lastVisit')}
                >
                  {t.crm.lastVisit} <SortIcon field="lastVisit" currentSort={sortField} currentDir={sortDir} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => handleRowClick(customer)}
                      className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="font-medium text-zinc-200">
                        {customer.firstName} {customer.lastName}
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden md:table-cell">
                        {customer.email || '—'}
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden lg:table-cell">
                        {customer.phone || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'gap-1 text-[10px] px-1.5 py-0',
                            TIER_BADGE_COLORS[customer.loyaltyTier]
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 rounded-full',
                              TIER_DOT_COLORS[customer.loyaltyTier]
                            )}
                          />
                          {customer.loyaltyTier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {customer.visitCount}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">
                        {formatCurrencyByLocale(customer.lifetimeSpend, locale)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-300 hidden sm:table-cell">
                        {customer.loyaltyPoints.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-zinc-400 hidden md:table-cell">
                        {customer.lastVisit ? formatDateByLocale(customer.lastVisit, locale) : '—'}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-zinc-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="size-6 text-zinc-600" />
                        <p className="text-sm">{t.crm.noGuestsFound}</p>
                        <p className="text-xs text-zinc-600">
                          {t.inventory.tryAdjusting}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerDetailSheet
        customer={selectedCustomer}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedCustomer(null);
        }}
        onAddPoints={handleAddPoints}
        onToggleCreditAuth={handleToggleCreditAuth}
      />

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={() => fetchCustomers(false)}
      />
    </div>
  );
}
