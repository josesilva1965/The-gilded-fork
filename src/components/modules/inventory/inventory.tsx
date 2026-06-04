'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  ChevronRight,
  X,
  Loader2,
  ArrowUpDown,
  Warehouse,
  Snowflake,
  Refrigerator,
  Wine,
  Edit3,
  Check,
  Printer,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useT, useLocale, useLocaleConfig } from '@/stores/locale-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyByLocale, formatDateByLocale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';

/* ─── Types ─── */
interface Vendor {
  id: string;
  name: string;
  category: string | null;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  storageLocation: string | null;
  category: string | null;
  vendorId: string | null;
  vendor: Vendor | null;
  active: boolean;
}

interface WastageLogEntry {
  id: string;
  ingredientId: string;
  quantity: number;
  reason: string;
  notes: string | null;
  value: number;
  createdAt: string;
  ingredient: { id: string; name: string; unit: string; costPerUnit: number };
  reporter: { id: string; name: string };
}

interface PurchaseOrderItem {
  id: string;
  ingredientId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  ingredient: { id: string; name: string; unit: string };
}

interface PurchaseOrder {
  id: string;
  vendorId: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  orderedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  vendor: { id: string; name: string; category: string | null };
  items: PurchaseOrderItem[];
}

/* ─── Constants ─── */
const CATEGORIES = ['ALL', 'PRODUCE', 'MEAT', 'DAIRY', 'DRY', 'BEVERAGE', 'OTHER'] as const;
const STORAGE_LOCATIONS = ['ALL', 'FRIDGE', 'FREEZER', 'DRY_STORAGE', 'BAR'] as const;
const WASTAGE_REASONS = ['SPOILED', 'SPILLED', 'COMPED', 'EXPIRED', 'DAMAGED', 'OTHER'] as const;

const CATEGORY_LABELS: Record<string, string> = {};

function getCategoryLabel(cat: string, t: any): string {
  const map: Record<string, string> = {
    PRODUCE: t.inventory.produce,
    MEAT: t.inventory.meat,
    DAIRY: t.inventory.dairy,
    DRY: t.inventory.dryGoods,
    BEVERAGE: t.inventory.beverages,
    OTHER: t.inventory.other,
  };
  return map[cat] || cat;
}

const STORAGE_LABELS: Record<string, string> = {};

function getStorageLabel(loc: string, t: any): string {
  const map: Record<string, string> = {
    FRIDGE: t.inventory.fridge,
    FREEZER: t.inventory.freezer,
    DRY_STORAGE: t.inventory.dryStorage,
    BAR: t.inventory.bar,
  };
  return map[loc] || loc;
}

const STORAGE_ICONS: Record<string, React.ElementType> = {
  FRIDGE: Refrigerator,
  FREEZER: Snowflake,
  DRY_STORAGE: Warehouse,
  BAR: Wine,
};

const PO_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  SENT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CONFIRMED: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const REASON_COLORS: Record<string, string> = {
  SPOILED: 'bg-orange-500/20 text-orange-400',
  SPILLED: 'bg-sky-500/20 text-sky-400',
  COMPED: 'bg-violet-500/20 text-violet-400',
  EXPIRED: 'bg-amber-500/20 text-amber-400',
  DAMAGED: 'bg-red-500/20 text-red-400',
  OTHER: 'bg-zinc-500/20 text-zinc-400',
};

/* ─── Helpers ─── */
function getStockLevel(current: number, min: number, max: number): 'green' | 'amber' | 'red' {
  if (current <= min) return 'red';
  if (current <= min * 1.5) return 'amber';
  return 'green';
}

function getStockPercent(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((current / max) * 100));
}

function getProgressColor(level: 'green' | 'amber' | 'red'): string {
  switch (level) {
    case 'green': return '[&>[data-slot=progress-indicator]]:bg-emerald-500';
    case 'amber': return '[&>[data-slot=progress-indicator]]:bg-amber-500';
    case 'red': return '[&>[data-slot=progress-indicator]]:bg-red-500';
  }
}

/* ─── Summary Cards ─── */
function SummaryCards({
  totalValue,
  lowStockCount,
  wastageValue,
  activePOCount,
}: {
  totalValue: number;
  lowStockCount: number;
  wastageValue: number;
  activePOCount: number;
}) {
  const t = useT();
  const locale = useLocale();
  const fmtCur = useCallback((a: number) => formatCurrencyByLocale(a, locale), [locale]);
  const cards = [
    {
      label: t.inventory.totalInventoryValue,
      value: fmtCur(totalValue),
      icon: Package,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: t.inventory.lowStockAlerts,
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: lowStockCount > 0 ? 'text-red-400' : 'text-zinc-400',
      bg: lowStockCount > 0 ? 'bg-red-500/10' : 'bg-zinc-500/10',
      border: lowStockCount > 0 ? 'border-red-500/20' : 'border-zinc-500/20',
      pulse: lowStockCount > 0,
    },
    {
      label: t.inventory.wastageThisWeek,
      value: fmtCur(wastageValue),
      icon: TrendingDown,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: t.inventory.activePurchaseOrders,
      value: activePOCount.toString(),
      icon: FileText,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn('bg-zinc-900 border', card.border)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] md:text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      {card.label}
                    </p>
                    <p className={cn('text-xl md:text-2xl font-bold', card.color)}>
                      {card.value}
                    </p>
                  </div>
                  <div className={cn('p-2 rounded-lg', card.bg)}>
                    <Icon className={cn('size-5', card.color, card.pulse && 'animate-pulse')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Ingredient Row ─── */
function IngredientRow({
  ingredient,
  onEditStock,
  onSaveStock,
}: {
  ingredient: Ingredient;
  onEditStock: (ing: Ingredient) => void;
  onSaveStock: (id: string, data: any) => Promise<void>;
}) {
  const t = useT();
  const locale = useLocale();
  const [quickAddQty, setQuickAddQty] = useState('');
  const [savingQuickAdd, setSavingQuickAdd] = useState(false);
  const level = getStockLevel(ingredient.currentStock, ingredient.minStock, ingredient.maxStock);
  const percent = getStockPercent(ingredient.currentStock, ingredient.maxStock);
  const isLow = ingredient.currentStock <= ingredient.minStock;
  const StorageIcon = STORAGE_ICONS[ingredient.storageLocation || ''] || Warehouse;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_1.5fr_0.8fr_0.8fr_1fr_auto] gap-2 md:gap-3 items-center p-3 md:p-4 rounded-lg border transition-colors cursor-pointer hover:bg-zinc-800/50',
        isLow ? 'border-red-500/30 bg-red-950/10' : 'border-zinc-800 bg-zinc-900/50'
      )}
      onClick={() => onEditStock(ingredient)}
    >
      {/* Name + Category */}
      <div className="flex items-center gap-2 min-w-0">
        {isLow && (
          <AlertTriangle className="size-4 text-red-400 shrink-0 animate-pulse" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">{ingredient.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-500">
              {getCategoryLabel(ingredient.category || 'OTHER', t)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stock Level with Progress Bar - hidden on mobile, shown in compact below */}
      <div className="hidden md:block min-w-[120px]">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
          <span className={cn('font-mono', level === 'red' ? 'text-red-400' : level === 'amber' ? 'text-amber-400' : 'text-emerald-400')}>
            {ingredient.currentStock}
          </span>
          <span>/</span>
          <span>{ingredient.minStock}</span>
          <span className="text-zinc-600">{ingredient.unit}</span>
        </div>
        <Progress
          value={percent}
          className={cn('h-1.5 bg-zinc-800', getProgressColor(level))}
        />
      </div>

      {/* Unit + Cost - desktop only */}
      <div className="hidden md:block">
        <p className="text-sm text-zinc-300">{formatCurrencyByLocale(ingredient.costPerUnit, locale)}</p>
        <p className="text-[10px] text-zinc-600">{t.common.per} {ingredient.unit}</p>
      </div>

      {/* Storage Location - desktop only */}
      <div className="hidden md:flex items-center gap-1.5">
        <StorageIcon className="size-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-400">
          {getStorageLabel(ingredient.storageLocation || '', t)}
        </span>
      </div>

      {/* Vendor - desktop only */}
      <div className="hidden md:block">
        <p className="text-xs text-zinc-400 truncate max-w-[120px]">
          {ingredient.vendor?.name || '—'}
        </p>
      </div>

      {/* Quick Add input - desktop only */}
      <div className="hidden md:block">
        <Input
          type="number"
          placeholder={t.kds.qty}
          value={quickAddQty}
          onChange={(e) => setQuickAddQty(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-800 border-zinc-700 text-zinc-100 h-8 text-xs font-mono w-20 focus:border-emerald-600/40"
        />
      </div>

      {/* Quick Add button - desktop only */}
      <div className="hidden md:block">
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300 text-[10px] h-8 px-2.5"
          onClick={async (e) => {
            e.stopPropagation();
            const val = parseFloat(quickAddQty);
            if (!isNaN(val) && val !== 0) {
              setSavingQuickAdd(true);
              await onSaveStock(ingredient.id, {
                currentStock: ingredient.currentStock + val,
                reason: val > 0 ? 'RESTOCK' : 'ADJUSTMENT',
              });
              setQuickAddQty('');
              setSavingQuickAdd(false);
            }
          }}
          disabled={savingQuickAdd || !quickAddQty || isNaN(parseFloat(quickAddQty))}
        >
          {savingQuickAdd ? (
            <Loader2 className="size-3 animate-spin mr-1" />
          ) : (
            <Plus className="size-3 mr-1" />
          )}
          {t.common.add}
        </Button>
      </div>

      {/* Mobile: compact stock info */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="text-right">
          <p className={cn('text-sm font-mono', level === 'red' ? 'text-red-400' : level === 'amber' ? 'text-amber-400' : 'text-emerald-400')}>
            {ingredient.currentStock}/{ingredient.minStock}
          </p>
          <p className="text-[10px] text-zinc-600">{ingredient.unit}</p>
        </div>
        <Edit3 className="size-3.5 text-zinc-600" />
      </div>

      {/* Edit button - desktop */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex size-8 text-zinc-500 hover:text-emerald-400"
        onClick={(e) => {
          e.stopPropagation();
          onEditStock(ingredient);
        }}
      >
        <Edit3 className="size-3.5" />
      </Button>
    </motion.div>
  );
}

/* ─── Edit Stock Dialog ─── */
function EditStockDialog({
  ingredient,
  open,
  onClose,
  onSave,
  vendors,
}: {
  ingredient: Ingredient | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
  vendors: { id: string; name: string }[];
}) {
  const { currencySymbol } = useLocaleConfig();
  const t = useT();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ingredient && open) {
      setName(ingredient.name);
      setUnit(ingredient.unit);
      setCategory(ingredient.category || 'OTHER');
      setStorageLocation(ingredient.storageLocation || 'DRY_STORAGE');
      setVendorId(ingredient.vendorId || 'none');
      setCurrentStock(ingredient.currentStock.toString());
      setMinStock(ingredient.minStock.toString());
      setMaxStock(ingredient.maxStock.toString());
      setCostPerUnit(ingredient.costPerUnit.toString());
      setAdjustQty('');
    }
  }, [ingredient, open]);

  const handleSave = async () => {
    if (!ingredient) return;
    setSaving(true);
    const finalStock = parseFloat(currentStock || '0');
    await onSave(ingredient.id, {
      name,
      unit,
      category,
      storageLocation,
      vendorId: vendorId === 'none' ? null : vendorId,
      currentStock: finalStock,
      minStock: parseFloat(minStock || '0'),
      maxStock: parseFloat(maxStock || '0'),
      costPerUnit: parseFloat(costPerUnit || '0'),
      reason: finalStock > ingredient.currentStock ? 'RESTOCK' : 'ADJUSTMENT',
    });
    setSaving(false);
    onClose();
  };

  if (!ingredient) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{t.inventory.editProductStock}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {t.inventory.configureThresholds} for {ingredient.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-3 col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{t.inventory.productInfo}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.productName}</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.unitLabel}</label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm focus:border-emerald-600/40" />
              </div>
            </div>
          </div>

          <div className="space-y-3 col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.category}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {CATEGORIES.filter(c => c !== 'ALL').map((c) => (
                      <SelectItem key={c} value={c} className="text-zinc-200 focus:bg-zinc-700">
                        {getCategoryLabel(c, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.storageLocation}</label>
                <Select value={storageLocation} onValueChange={setStorageLocation}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {STORAGE_LOCATIONS.filter(l => l !== 'ALL').map((l) => (
                      <SelectItem key={l} value={l} className="text-zinc-200 focus:bg-zinc-700">
                        {getStorageLabel(l, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.vendorLabel}</label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="none" className="text-zinc-400 focus:bg-zinc-700">{t.common.none}</SelectItem>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-zinc-200 focus:bg-zinc-700">
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3 col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{t.inventory.stockCostLevels}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.currentStock}</label>
                <Input type="number" step="0.1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.addToStock}</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. +10 or -5"
                  value={adjustQty}
                  onChange={(e) => {
                    setAdjustQty(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setCurrentStock((ingredient.currentStock + val).toString());
                    } else {
                      setCurrentStock(ingredient.currentStock.toString());
                    }
                  }}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.minLevelAlert}</label>
                <Input type="number" step="0.1" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.maxLevelTarget}</label>
                <Input type="number" step="0.1" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.costPerUnitLabel} ({currencySymbol})</label>
                <Input type="number" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-400">
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name || !unit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Check className="size-4 mr-1" />}
            {t.inventory.saveChanges}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Add Product Dialog ─── */
function AddProductDialog({
  open,
  onClose,
  onAdd,
  vendors,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  vendors: { id: string; name: string }[];
}) {
  const { currencySymbol } = useLocaleConfig();
  const t = useT();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [storageLocation, setStorageLocation] = useState('DRY_STORAGE');
  const [vendorId, setVendorId] = useState('none');
  const [currentStock, setCurrentStock] = useState('0');
  const [minStock, setMinStock] = useState('5');
  const [maxStock, setMaxStock] = useState('20');
  const [costPerUnit, setCostPerUnit] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setUnit('');
      setCategory('OTHER');
      setStorageLocation('DRY_STORAGE');
      setVendorId('none');
      setCurrentStock('0');
      setMinStock('5');
      setMaxStock('20');
      setCostPerUnit('0');
    }
  }, [open]);

  const handleAdd = async () => {
    setSaving(true);
    await onAdd({
      name,
      unit,
      category,
      storageLocation,
      vendorId: vendorId === 'none' ? null : vendorId,
      currentStock: parseFloat(currentStock || '0'),
      minStock: parseFloat(minStock || '0'),
      maxStock: parseFloat(maxStock || '0'),
      costPerUnit: parseFloat(costPerUnit || '0'),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{t.inventory.addNewProduct}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {t.inventory.createProductDesc}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-3 col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{t.inventory.productInfo}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.productName}</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fresh Lemons" className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.unitLabel}</label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. KG" className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm focus:border-emerald-600/40" />
              </div>
            </div>
          </div>

          <div className="space-y-3 col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.category}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {CATEGORIES.filter(c => c !== 'ALL').map((c) => (
                      <SelectItem key={c} value={c} className="text-zinc-200 focus:bg-zinc-700">
                        {getCategoryLabel(c, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.storageLocation}</label>
                <Select value={storageLocation} onValueChange={setStorageLocation}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {STORAGE_LOCATIONS.filter(l => l !== 'ALL').map((l) => (
                      <SelectItem key={l} value={l} className="text-zinc-200 focus:bg-zinc-700">
                        {getStorageLabel(l, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.vendorLabel}</label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="none" className="text-zinc-400 focus:bg-zinc-700">{t.common.none}</SelectItem>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-zinc-200 focus:bg-zinc-700">
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3 col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{t.inventory.stockCostLevels}</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.currentStock}</label>
                <Input type="number" step="0.1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.minLevelAlert}</label>
                <Input type="number" step="0.1" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.maxLevelTarget}</label>
                <Input type="number" step="0.1" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">{t.inventory.costPerUnitLabel} ({currencySymbol})</label>
                <Input type="number" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm font-mono focus:border-emerald-600/40" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-400">
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleAdd}
            disabled={saving || !name || !unit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Plus className="size-4 mr-1" />}
            {t.inventory.addProduct}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Log Wastage Dialog ─── */
function LogWastageDialog({
  ingredients,
  open,
  onClose,
  onSaved,
}: {
  ingredients: Ingredient[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const locale = useLocale();
  const { toast } = useToast();
  const t = useT();
  const fmtCur = useCallback((a: number) => formatCurrencyByLocale(a, locale), [locale]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setPopoverOpen(false);
    }
  }, [open]);

  const filteredIngs = useMemo(() => {
    if (!searchTerm.trim()) return ingredients;
    return ingredients.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ingredients, searchTerm]);

  const ingredient = ingredients.find((i) => i.id === selectedIngredient);
  const autoValue = ingredient && quantity
    ? (parseFloat(quantity) * ingredient.costPerUnit).toFixed(2)
    : '0.00';

  const handleSubmit = async () => {
    if (!selectedIngredient || !quantity || !reason || !user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory/wastage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: selectedIngredient,
          quantity: parseFloat(quantity),
          reason,
          notes: notes || undefined,
          reportedBy: user.id,
        }),
      });
      if (res.ok) {
        setSelectedIngredient('');
        setQuantity('');
        setReason('');
        setNotes('');
        onSaved();
        onClose();
        toast({ title: t.inventory.wastageLog, description: t.inventory.stockUpdated });
      } else {
        toast({ title: t.common.error, description: t.inventory.failedToUpdateStock, variant: 'destructive' });
      }
    } catch (err) {
      console.error('Failed to log wastage:', err);
      toast({ title: t.common.error, description: t.inventory.failedToUpdateStock, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Log Wastage</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Record wasted ingredient and deduct from stock
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2 flex flex-col">
            <label className="text-sm text-zinc-400">Ingredient</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-200 text-left font-normal"
                >
                  {selectedIngredient
                    ? ingredients.find((i) => i.id === selectedIngredient)?.name
                    : t.inventory.selectIngredient}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-800 border-zinc-700 z-50">
                <div className="flex flex-col h-60">
                  <div className="p-2 border-b border-zinc-700">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                      <Input
                        placeholder={t.inventory.searchIngredients}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-emerald-600/40"
                      />
                    </div>
                  </div>
                  <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-1">
                      {filteredIngs.length === 0 ? (
                        <p className="p-2 text-xs text-zinc-500 text-center">{t.inventory.noIngredientsFound}</p>
                      ) : (
                        filteredIngs.map((ing) => (
                          <button
                            key={ing.id}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded-sm hover:bg-zinc-700 text-zinc-200 transition-colors flex justify-between items-center",
                              selectedIngredient === ing.id && "bg-zinc-700 font-medium text-emerald-400"
                            )}
                            onClick={() => {
                              setSelectedIngredient(ing.id);
                              setPopoverOpen(false);
                              setSearchTerm('');
                            }}
                          >
                            <span>{ing.name}</span>
                            <span className="text-[10px] text-zinc-500">
                              ({ing.currentStock} {ing.unit})
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Quantity</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono"
              />
              {ingredient && (
                <p className="text-[10px] text-zinc-600">{ingredient.unit}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Reason</label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {WASTAGE_REASONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
            <span className="text-sm text-zinc-400">Auto-calculated Value</span>
            <span className="font-mono font-bold text-amber-400">{fmtCur(parseFloat(autoValue))}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[60px] resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-400">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !selectedIngredient || !quantity || !reason}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <TrendingDown className="size-4 mr-1" />}
            Log Wastage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── PO Card ─── */
function POCard({ po }: { po: PurchaseOrder }) {
  const [expanded, setExpanded] = useState(false);
  const locale = useLocale();
  const fmtCur = useCallback((a: number) => formatCurrencyByLocale(a, locale), [locale]);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <ChevronRight className={cn('size-4 text-zinc-500 transition-transform', expanded && 'rotate-90')} />
                <FileText className="size-4 text-zinc-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{po.vendor.name}</p>
                <p className="text-[10px] text-zinc-600">
                  {po.orderedAt ? formatDateByLocale(po.orderedAt, locale) : 'Not ordered yet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-zinc-300">
                {fmtCur(po.totalAmount)}
              </span>
              <Badge variant="outline" className={cn('text-[10px] px-2', PO_STATUS_COLORS[po.status] || PO_STATUS_COLORS.DRAFT)}>
                {po.status}
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Separator className="bg-zinc-800 mb-3" />
            <div className="space-y-2">
              {po.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="size-3 text-zinc-600" />
                    <span className="text-zinc-300">{item.ingredient.name}</span>
                    <span className="text-zinc-600">× {item.quantity} {item.ingredient.unit}</span>
                  </div>
                  <span className="font-mono text-zinc-400">{fmtCur(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            {po.notes && (
              <p className="text-[11px] text-zinc-600 mt-2 italic">Note: {po.notes}</p>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/* ─── Main Inventory Component ─── */
export function Inventory() {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useT();
  const locale = useLocale();
  
  const fmtCur = useCallback((amount: number) => formatCurrencyByLocale(amount, locale), [locale]);
  const fmtDate = useCallback((date: string | Date) => formatDateByLocale(date, locale), [locale]);

  /* State */
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [storageFilter, setStorageFilter] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [wastageDialogOpen, setWastageDialogOpen] = useState(false);
  const [generatingPOId, setGeneratingPOId] = useState<string | null>(null);
  const [lowStockPanelOpen, setLowStockPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('stock');
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);

  /* Data Fetching */
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json() as Promise<{
        ingredients: Ingredient[];
        lowStock: Ingredient[];
        totalValue: number;
      }>;
    },
    refetchInterval: 30000,
  });

  const { data: wastageData, isLoading: wastageLoading } = useQuery({
    queryKey: ['wastage'],
    queryFn: async () => {
      const res = await fetch('/api/inventory/wastage');
      if (!res.ok) throw new Error('Failed to fetch wastage');
      return res.json() as Promise<{
        wastageLogs: WastageLogEntry[];
        weekWastageValue: number;
      }>;
    },
    refetchInterval: 30000,
  });

  const { data: poData, isLoading: poLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const res = await fetch('/api/inventory/po');
      if (!res.ok) throw new Error('Failed to fetch purchase orders');
      return res.json() as Promise<{ purchaseOrders: PurchaseOrder[] }>;
    },
    refetchInterval: 30000,
  });

  /* Derived */
  const ingredients = inventoryData?.ingredients || [];
  const lowStockItems = inventoryData?.lowStock || [];
  const totalValue = inventoryData?.totalValue || 0;
  const vendors = (inventoryData as any)?.vendors || [];
  const weekWastageValue = wastageData?.weekWastageValue || 0;
  const purchaseOrders = poData?.purchaseOrders || [];
  const activePOs = purchaseOrders.filter((po) =>
    ['DRAFT', 'SENT', 'CONFIRMED'].includes(po.status)
  );

  /* Filtered Ingredients */
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || ing.category === categoryFilter;
    const matchesStorage = storageFilter === 'ALL' || ing.storageLocation === storageFilter;
    const matchesLowStock = !showLowStockOnly || ing.currentStock <= ing.minStock;
    return matchesSearch && matchesCategory && matchesStorage && matchesLowStock;
  });

  /* Handlers */
  const handleEditStock = useCallback((ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setEditDialogOpen(true);
  }, []);

  const handleSaveStock = useCallback(async (id: string, data: any) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast({ title: t.inventory.stockUpdated });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: t.common.error, description: err.error || t.inventory.failedToUpdateStock, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.inventory.failedToUpdateStock, variant: 'destructive' });
    }
  }, [queryClient, toast, t]);

  const handlePrintShoppingList = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: t.inventory.popupBlockedTitle,
        description: t.inventory.popupBlockedDesc,
        variant: 'destructive',
      });
      return;
    }

    const lowStockList = ingredients.filter(i => i.currentStock <= i.minStock);

    const html = `
      <html>
        <head>
          <title>${t.auth.restaurantName} - ${t.inventory.shoppingList}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #18181b;
              padding: 40px;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e4e4e7;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
            }
            .date {
              font-size: 14px;
              color: #71717a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              text-align: left;
              padding: 12px 8px;
              border-bottom: 2px solid #e4e4e7;
              color: #71717a;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            td {
              padding: 14px 8px;
              border-bottom: 1px solid #f4f4f5;
              font-size: 14px;
            }
            .item-name {
              font-weight: 600;
              color: #0f172a;
            }
            .number {
              font-family: monospace;
              font-size: 13px;
            }
            .reorder-qty {
              font-weight: 700;
              color: #059669;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #e4e4e7;
              padding-top: 20px;
              font-size: 12px;
              color: #a1a1aa;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              body { padding: 20px 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${t.auth.restaurantName} - ${t.inventory.shoppingList}</h1>
              <div class="date">${t.inventory.generatedOn} ${new Date().toLocaleString()}</div>
            </div>
            <div style="font-size: 14px; font-weight: 600; color: #e11d48; background: #ffe4e6; padding: 6px 12px; border-radius: 9999px;">
              ${lowStockList.length} ${t.inventory.itemsLowInStock}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t.inventory.ingredientProduct}</th>
                <th>${t.inventory.category}</th>
                <th>${t.inventory.currentStock}</th>
                <th>${t.inventory.maxLevelTarget}</th>
                <th style="text-align: right;">${t.inventory.suggestedReorder}</th>
                <th>${t.inventory.vendorLabel}</th>
                <th style="text-align: right;">${t.inventory.estCost}</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockList.map(item => {
                const reorderQty = Math.max(0, item.maxStock - item.currentStock);
                const estCost = reorderQty * item.costPerUnit;
                return `
                  <tr>
                    <td>
                      <div class="item-name">${item.name}</div>
                    </td>
                    <td>${item.category ? getCategoryLabel(item.category, t) : t.inventory.other}</td>
                    <td class="number">${item.currentStock} ${item.unit}</td>
                    <td class="number">${item.maxStock} ${item.unit}</td>
                    <td class="number reorder-qty" style="text-align: right;">${reorderQty.toFixed(1)} ${item.unit}</td>
                    <td>${item.vendor?.name || '—'}</td>
                    <td class="number" style="text-align: right; font-weight: 600;">
                      ${estCost > 0 ? fmtCur(estCost) : '—'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <span>${t.inventory.totalEstRestockValue}: ${fmtCur(lowStockList.reduce((sum, item) => sum + (Math.max(0, item.maxStock - item.currentStock) * item.costPerUnit), 0))}</span>
            <span>${t.auth.restaurantName} CRM & Operations Management</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }, [ingredients, toast, t]);

  const handleAddProduct = useCallback(async (data: any) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast({ title: 'Product Added Successfully' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: t.common.error, description: err.error || 'Failed to add product', variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: 'Failed to add product', variant: 'destructive' });
    }
  }, [queryClient, toast, t]);

  const handleGeneratePO = useCallback(async (ingredient: Ingredient) => {
    if (!ingredient.vendorId) {
      toast({ title: t.common.error, description: t.inventory.noVendorAssigned, variant: 'destructive' });
      return;
    }
    setGeneratingPOId(ingredient.id);
    const reorderQty = ingredient.maxStock - ingredient.currentStock;
    const totalPrice = parseFloat((reorderQty * ingredient.costPerUnit).toFixed(2));
    try {
      const res = await fetch('/api/inventory/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: ingredient.vendorId,
          items: [{
            ingredientId: ingredient.id,
            quantity: reorderQty,
            unitPrice: ingredient.costPerUnit,
            totalPrice,
          }],
          notes: `Auto-generated for low stock: ${ingredient.name}`,
        }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast({ title: t.inventory.draftPOCreated, description: `${ingredient.name} — ${reorderQty.toFixed(1)} ${ingredient.unit}` });
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: t.common.error, description: data.error || t.inventory.failedToCreatePO, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.inventory.failedToCreatePO, variant: 'destructive' });
    } finally {
      setGeneratingPOId(null);
    }
  }, [queryClient, toast, t]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['wastage'] });
  }, [queryClient]);

  /* Loading state */
  if (inventoryLoading && !inventoryData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <SummaryCards
        totalValue={totalValue}
        lowStockCount={lowStockItems.length}
        wastageValue={weekWastageValue}
        activePOCount={activePOs.length}
      />

      {/* Low Stock Alert Panel (collapsible) */}
      {lowStockItems.length > 0 && (
        <Collapsible open={lowStockPanelOpen} onOpenChange={setLowStockPanelOpen}>
          <Card className="bg-zinc-900 border-red-500/20 overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-950/10 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-400 animate-pulse" />
                  <CardTitle className="text-sm font-semibold text-red-400">
                    {t.inventory.lowStockAlerts}
                  </CardTitle>
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                    {lowStockItems.length}
                  </Badge>
                </div>
                {lowStockPanelOpen ? (
                  <ChevronUp className="size-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="size-4 text-zinc-500" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <Separator className="bg-red-500/10 mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {lowStockItems.map((item) => {
                    const reorderQty = item.maxStock - item.currentStock;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 bg-red-950/20 border border-red-500/10 rounded-lg p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                          <p className="text-[11px] text-zinc-500">
                            <span className="text-red-400 font-mono">{item.currentStock}</span>
                            {' / '}{item.minStock} {item.unit}
                          </p>
                          <p className="text-[10px] text-zinc-600">
                            {t.inventory.suggestReorder}: {reorderQty > 0 ? `${reorderQty.toFixed(1)} ${item.unit}` : '—'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-[11px] h-8"
                          onClick={() => handleGeneratePO(item)}
                          disabled={!item.vendorId || generatingPOId === item.id}
                        >
                          {generatingPOId === item.id ? (
                            <Loader2 className="size-3 mr-1 animate-spin" />
                          ) : (
                            <FileText className="size-3 mr-1" />
                          )}
                          {generatingPOId === item.id ? t.common.updating : t.inventory.generatePO}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800 h-10">
          <TabsTrigger value="stock" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-xs">
            <Package className="size-3.5 mr-1.5" />
            {t.inventory.stock}
          </TabsTrigger>
          <TabsTrigger value="wastage" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 text-xs">
            <TrendingDown className="size-3.5 mr-1.5" />
            {t.inventory.wastage}
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-sky-600/20 data-[state=active]:text-sky-400 text-xs">
            <FileText className="size-3.5 mr-1.5" />
            {t.inventory.purchaseOrders}
          </TabsTrigger>
        </TabsList>

        {/* ─── Stock Tab ─── */}
        <TabsContent value="stock" className="mt-4 space-y-3">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input
                placeholder={t.inventory.searchIngredients}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px] bg-zinc-900 border-zinc-800 text-zinc-300 h-10 text-xs">
                  <Filter className="size-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                      {cat === 'ALL' ? t.inventory.allCategories : getCategoryLabel(cat, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={storageFilter} onValueChange={setStorageFilter}>
                <SelectTrigger className="w-[130px] bg-zinc-900 border-zinc-800 text-zinc-300 h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {STORAGE_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc} className="text-zinc-200 focus:bg-zinc-700 focus:text-zinc-100">
                      {loc === 'ALL' ? t.inventory.allLocations : getStorageLabel(loc, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={showLowStockOnly ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-10 text-xs shrink-0',
                  showLowStockOnly
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30'
                )}
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              >
                <AlertTriangle className="size-3.5 mr-1.5" />
                {t.inventory.lowStock}
              </Button>
              {lowStockItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs shrink-0 border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 gap-1.5"
                  onClick={handlePrintShoppingList}
                >
                  <Printer className="size-3.5" />
                  {t.inventory.printList}
                </Button>
              )}
              <Button
                className="h-10 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => setAddProductDialogOpen(true)}
              >
                <Plus className="size-3.5" />
                {t.inventory.addProduct}
              </Button>
            </div>
          </div>

          {/* Ingredient List */}
          <div className="space-y-1.5">
            {/* Desktop header row */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.5fr_0.8fr_0.8fr_1fr_auto] gap-3 items-center px-4 py-2 text-[11px] text-zinc-600 uppercase tracking-wider font-medium">
              <span>{t.inventory.ingredient}</span>
              <span>{t.inventory.stockLevel}</span>
              <span>{t.inventory.costPerUnit}</span>
              <span>{t.inventory.storage}</span>
              <span>{t.inventory.vendor}</span>
              <span>{t.inventory.quickAdd}</span>
              <span></span>
              <span></span>
            </div>
            <ScrollArea className="max-h-[calc(100vh-420px)]">
              <div className="space-y-1.5 pr-1">
                {filteredIngredients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="size-10 text-zinc-700 mb-2" />
                    <p className="text-sm text-zinc-500">No ingredients found</p>
                    <p className="text-xs text-zinc-600">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredIngredients.map((ing) => (
                    <IngredientRow
                      key={ing.id}
                      ingredient={ing}
                      onEditStock={handleEditStock}
                      onSaveStock={handleSaveStock}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <p className="text-[10px] text-zinc-600 text-center">
            Showing {filteredIngredients.length} of {ingredients.length} ingredients
            {lowStockItems.length > 0 && ` · ${lowStockItems.length} low stock`}
          </p>
        </TabsContent>

        {/* ─── Wastage Tab ─── */}
        <TabsContent value="wastage" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Wastage Log</h3>
              <p className="text-[11px] text-zinc-600">
                This week&apos;s wastage: <span className="text-amber-400 font-mono">{fmtCur(weekWastageValue)}</span>
              </p>
            </div>
            <Button
              onClick={() => setWastageDialogOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9"
            >
              <Plus className="size-3.5 mr-1" />
              Log Wastage
            </Button>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <ScrollArea className="max-h-[calc(100vh-380px)]">
              <div className="divide-y divide-zinc-800/50">
                {wastageLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 text-zinc-600 animate-spin" />
                  </div>
                ) : wastageData?.wastageLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingDown className="size-10 text-zinc-700 mb-2" />
                    <p className="text-sm text-zinc-500">No wastage logged</p>
                  </div>
                ) : (
                  wastageData?.wastageLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 md:p-4 hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Trash2 className="size-4 text-zinc-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-200 truncate">{log.ingredient.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 h-4', REASON_COLORS[log.reason] || REASON_COLORS.OTHER)}>
                              {log.reason}
                            </Badge>
                            <span className="text-[10px] text-zinc-600">
                              {log.quantity} {log.ingredient.unit}
                            </span>
                            {log.notes && (
                              <span className="text-[10px] text-zinc-600 hidden sm:inline truncate max-w-[150px]">
                                — {log.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-mono text-amber-400">{fmtCur(log.value)}</p>
                        <p className="text-[10px] text-zinc-600">
                          {log.reporter.name} · {formatDateByLocale(log.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* ─── Purchase Orders Tab ─── */}
        <TabsContent value="orders" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-300">{t.inventory.purchaseOrders}</h3>
              <p className="text-[11px] text-zinc-600">
                {purchaseOrders.length} {t.common.total.toLowerCase()} · {activePOs.length} {t.common.active.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {poLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 text-zinc-600 animate-spin" />
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="size-10 text-zinc-700 mb-2" />
                <p className="text-sm text-zinc-500">No purchase orders</p>
              </div>
            ) : (
              purchaseOrders.map((po) => (
                <POCard key={po.id} po={po} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditStockDialog
        key={editingIngredient?.id ?? 'none'}
        ingredient={editingIngredient}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingIngredient(null);
        }}
        onSave={handleSaveStock}
        vendors={vendors}
      />

      <AddProductDialog
        open={addProductDialogOpen}
        onClose={() => setAddProductDialogOpen(false)}
        onAdd={handleAddProduct}
        vendors={vendors}
      />

      <LogWastageDialog
        ingredients={ingredients}
        open={wastageDialogOpen}
        onClose={() => setWastageDialogOpen(false)}
        onSaved={invalidateAll}
      />
    </div>
  );
}
