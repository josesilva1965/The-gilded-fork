'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Calendar,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
  FileText,
  X,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Tags,
  Building2,
  AlertTriangle,
  Percent,
  Receipt,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useT, useLocale } from '@/stores/locale-store';
import { formatCurrencyByLocale, formatDateByLocale, formatTimeByLocale, LOCALE_CONFIGS } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'INFLOW' | 'OUTFLOW';
  category: 'SALE' | 'PURCHASE' | 'WASTAGE';
  description: string;
  source: string;
  amount: number;
  paymentMethod: string;
  operator: string;
  status: string;
  createdAt: string;
  details: {
    subtotal?: number;
    taxAmount?: number;
    guestCount?: number;
    notes?: string | null;
    reason?: string;
    deliveredAt?: string | null;
    items?: string[];
  };
}

export function TransactionsLedger() {
  const t = useT();
  const locale = useLocale();
  
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Category', 'Description', 'Source/Party', 'Operator', 'Method', 'Status', 'Amount', 'Date'];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.category,
      tx.description || '',
      tx.partyName || '',
      tx.user?.name || '',
      tx.method || '',
      tx.status || '',
      tx.type === 'OUTFLOW' ? `-${tx.amount}` : `+${tx.amount}`,
      new Date(tx.createdAt).toLocaleDateString()
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        period,
        type: typeFilter,
        search: searchQuery,
      });
      const res = await fetch(`/api/transactions?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data.transactions);
      setLaborCost(data.laborCost);
    } catch (err) {
      console.error(err);
      setError(t.dashboard.failedToLoad || 'Failed to load transactions ledger data');
    } finally {
      setIsLoading(false);
    }
  }, [period, typeFilter, searchQuery, t.dashboard.failedToLoad]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  // Locale-specific tax config
  const localeConfig = LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS['en-GB'];
  const taxRate = localeConfig.taxRate;
  const taxPercent = Math.round(taxRate * 100);
  const taxShort = localeConfig.taxShort;

  // Aggregate stats (Inflow only counts completed/paid sales)
  const totalInflow = transactions
    .filter((tx) => tx.type === 'INFLOW' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = transactions
    .filter((tx) => tx.type === 'OUTFLOW')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netProfit = totalInflow - totalOutflow - laborCost;

  // Tax & VAT Calculations
  const vatReceived = transactions
    .filter((tx) => tx.category === 'SALE' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + (tx.amount * (taxRate / (1 + taxRate))), 0);

  const vatExpected = transactions
    .filter((tx) => tx.category === 'SALE')
    .reduce((sum, tx) => sum + (tx.amount * (taxRate / (1 + taxRate))), 0);

  const vatPaid = transactions
    .filter((tx) => tx.category === 'PURCHASE')
    .reduce((sum, tx) => sum + (tx.amount * (taxRate / (1 + taxRate))), 0);

  const netVatCash = vatReceived - vatPaid;
  const netVatAccrual = vatExpected - vatPaid;

  // Formatting helpers
  const formatMoney = (val: number) => formatCurrencyByLocale(val, locale);
  const formatDate = (dateStr: string) => {
    return `${formatDateByLocale(dateStr, locale)} ${formatTimeByLocale(dateStr, locale)}`;
  };

  return (
    <div className="flex flex-col gap-6 h-full text-zinc-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <TrendingUp className="size-6 text-emerald-500" />
            {t.transactions.title}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {t.transactions.subtitle}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTransactions}
          disabled={isLoading}
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-2 h-9 text-xs"
        >
          <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          {t.common.refresh}
        </Button>
      </div>

      {/* Period Selector Presets */}
      <div className="flex items-center gap-1.5 self-start bg-zinc-950 p-1 border border-zinc-850 rounded-lg shadow-inner">
        {(['day', 'week', 'month', 'all'] as const).map((p) => (
          <Button
            key={p}
            size="sm"
            variant="ghost"
            onClick={() => setPeriod(p)}
            className={cn(
              'h-8 px-4 text-xs font-semibold rounded-md transition-all duration-200 capitalize',
              period === p
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {p === 'day' ? t.transactions.day : p === 'week' ? t.transactions.week : p === 'month' ? t.transactions.month : t.transactions.all}
          </Button>
        ))}
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inflow Card */}
        <Card className="bg-zinc-900 border-zinc-800 hover:border-emerald-500/20 transition-all duration-300 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-400">
              {t.transactions.inflow}
            </CardTitle>
            <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ArrowUpRight className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-emerald-400">
              +{formatMoney(totalInflow)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Sales revenue completed
            </p>
          </CardContent>
        </Card>

        {/* Outflow Card */}
        <Card className="bg-zinc-900 border-zinc-800 hover:border-rose-500/20 transition-all duration-300 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-400">
              {t.transactions.outflow}
            </CardTitle>
            <div className="flex items-center justify-center size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ArrowDownRight className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-rose-400">
              -{formatMoney(totalOutflow)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              PO purchases and wasted goods
            </p>
          </CardContent>
        </Card>

        {/* Labor Card */}
        <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-500/20 transition-all duration-300 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-400">
              {t.transactions.labor}
            </CardTitle>
            <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <User className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-amber-400">
              {formatMoney(laborCost)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Staff shifts labor expenses
            </p>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card className={cn(
          "bg-zinc-900 border-zinc-800 transition-all duration-300 shadow-md",
          netProfit >= 0 ? "hover:border-emerald-500/25" : "hover:border-rose-500/25"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-400">
              {t.transactions.netProfit}
            </CardTitle>
            <div className={cn(
              "flex items-center justify-center size-8 rounded-lg border",
              netProfit >= 0
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            )}>
              {netProfit >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-black", netProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {netProfit >= 0 ? "+" : ""}{formatMoney(netProfit)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Inflows minus outflows & labor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax & VAT Summary Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <Percent className="size-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t.transactions.taxSummary} ({taxShort} {taxPercent}%)
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* VAT Received (Cash Basis) */}
          <Card className="bg-zinc-900/40 border-zinc-850 hover:border-emerald-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 pt-3.5 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {t.transactions.vatReceived}
              </CardTitle>
              <Receipt className="size-3.5 text-emerald-400 opacity-60" />
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-lg font-black text-emerald-400">
                +{formatMoney(vatReceived)}
              </div>
              <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">
                {t.transactions.vatReceivedDesc}
              </p>
            </CardContent>
          </Card>

          {/* VAT Accrued (Accrual Basis) */}
          <Card className="bg-zinc-900/40 border-zinc-850 hover:border-amber-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40" />
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 pt-3.5 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {t.transactions.vatExpected}
              </CardTitle>
              <Percent className="size-3.5 text-amber-400 opacity-60" />
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-lg font-black text-amber-400">
                +{formatMoney(vatExpected)}
              </div>
              <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">
                {t.transactions.vatExpectedDesc}
              </p>
            </CardContent>
          </Card>

          {/* VAT Paid on Purchases */}
          <Card className="bg-zinc-900/40 border-zinc-850 hover:border-rose-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/40" />
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 pt-3.5 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {t.transactions.vatPaid}
              </CardTitle>
              <ArrowDownRight className="size-3.5 text-rose-400 opacity-60" />
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-lg font-black text-rose-400">
                -{formatMoney(vatPaid)}
              </div>
              <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">
                {t.transactions.vatPaidDesc}
              </p>
            </CardContent>
          </Card>

          {/* Net VAT Position */}
          <Card className={cn(
            "bg-zinc-900/40 border-zinc-850 transition-all duration-300 shadow-sm relative overflow-hidden group",
            netVatCash >= 0 ? "hover:border-rose-500/20" : "hover:border-emerald-500/20"
          )}>
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              netVatCash >= 0 ? "bg-rose-500/40" : "bg-emerald-500/40"
            )} />
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 pt-3.5 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {t.transactions.netVat}
              </CardTitle>
              <div className={cn(
                "size-1.5 rounded-full animate-pulse",
                netVatCash >= 0 ? "bg-rose-400" : "bg-emerald-400"
              )} />
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className={cn("text-lg font-black", netVatCash >= 0 ? "text-rose-400" : "text-emerald-400")}>
                {netVatCash >= 0 ? "+" : ""}{formatMoney(netVatCash)}
              </div>
              
              <div className="flex items-center gap-1.5 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[8px] font-extrabold tracking-wide uppercase px-1 py-0.2 rounded border",
                    netVatCash >= 0 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  )}
                >
                  {netVatCash >= 0 ? t.transactions.vatOwedToTaxMan : t.transactions.vatReclaimable}
                </Badge>
              </div>

              <div className="text-[9px] text-zinc-400 mt-2 flex flex-wrap gap-x-2">
                <span>Cash: <strong className={netVatCash >= 0 ? "text-rose-400" : "text-emerald-400"}>{formatMoney(netVatCash)}</strong></span>
                <span className="text-zinc-600">|</span>
                <span>Accrued: <strong className={netVatAccrual >= 0 ? "text-rose-400" : "text-emerald-400"}>{formatMoney(netVatAccrual)}</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ledger Table Section */}
      <Card className="bg-zinc-900 border-zinc-800 flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-md font-bold text-zinc-200">
              {t.transactions.all}
            </CardTitle>
          </div>

          {/* Filtering Panel */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
              <Input
                placeholder={t.transactions.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-zinc-950 border-zinc-800 text-xs placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
              />
            </div>

            <Button
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              variant="outline"
              size="sm"
              className="h-9 border-zinc-850 hover:bg-zinc-800 text-zinc-300 gap-1.5 rounded-lg text-xs cursor-pointer"
            >
              <Download className="size-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </Button>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-lg shrink-0 w-full sm:w-auto">
              {(['all', 'inflow', 'outflow'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded transition-colors flex-1 sm:flex-initial text-center",
                    typeFilter === type
                      ? "bg-zinc-800 text-emerald-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {type === 'all' ? t.transactions.all : type === 'inflow' ? t.transactions.inflows : t.transactions.outflows}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <Separator className="bg-zinc-800" />

        <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-zinc-500">{t.common.loading}</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-3">
              <AlertCircle className="size-8 text-rose-500" />
              <p className="text-sm text-rose-400">{error}</p>
              <Button variant="outline" onClick={fetchTransactions} size="sm" className="border-zinc-800 hover:bg-zinc-800 text-zinc-300">
                {t.common.retry}
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-2">
              <Tags className="size-8 text-zinc-700" />
              <h3 className="text-sm font-semibold text-zinc-500">{t.transactions.noTransactions}</h3>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto min-h-0">
              <Table>
                <TableHeader className="bg-zinc-950/40 border-b border-zinc-800">
                  <TableRow className="hover:bg-transparent border-zinc-800">
                    <TableHead className="text-zinc-500 text-xs w-[120px]">ID</TableHead>
                    <TableHead className="text-zinc-500 text-xs">{t.transactions.category}</TableHead>
                    <TableHead className="text-zinc-500 text-xs">Description</TableHead>
                    <TableHead className="text-zinc-500 text-xs">Source / Party</TableHead>
                    <TableHead className="text-zinc-500 text-xs">{t.transactions.operator}</TableHead>
                    <TableHead className="text-zinc-500 text-xs">Method</TableHead>
                    <TableHead className="text-zinc-500 text-xs">Status</TableHead>
                    <TableHead className="text-zinc-500 text-xs text-right">{t.transactions.amount}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-zinc-800/40 border-zinc-850 cursor-pointer transition-colors group"
                    >
                      <TableCell className="font-mono text-[10px] text-zinc-500 group-hover:text-zinc-300">
                        #{tx.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0 rounded border",
                            tx.category === 'SALE' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                            tx.category === 'PURCHASE' && "bg-sky-500/10 border-sky-500/30 text-sky-400",
                            tx.category === 'WASTAGE' && "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          )}
                        >
                          {tx.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-zinc-300 group-hover:text-white truncate max-w-[200px]">
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-400">
                        {tx.source}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-400">
                        {tx.operator}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500">
                        {tx.paymentMethod}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider",
                          tx.status === 'COMPLETED' || tx.status === 'DELIVERED' ? "text-emerald-400" :
                          tx.status === 'SENT' || tx.status === 'CONFIRMED' ? "text-sky-400" : "text-amber-500"
                        )}>
                          {tx.status}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                        "text-xs font-black text-right",
                        tx.type === 'INFLOW' ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {tx.type === 'INFLOW' ? "+" : "-"}{formatMoney(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Side Drawer */}
      <Sheet open={selectedTx !== null} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <SheetContent className="bg-zinc-950 border-l border-zinc-850 text-zinc-100 max-w-md w-full flex flex-col p-6">
          {selectedTx && (
            <>
              <SheetHeader className="pb-4 border-b border-zinc-850">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded border",
                      selectedTx.category === 'SALE' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      selectedTx.category === 'PURCHASE' && "bg-sky-500/10 border-sky-500/30 text-sky-400",
                      selectedTx.category === 'WASTAGE' && "bg-orange-500/10 border-orange-500/30 text-orange-400"
                    )}
                  >
                    {selectedTx.category}
                  </Badge>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    ID: {selectedTx.id}
                  </span>
                </div>
                <SheetTitle className="text-lg font-bold text-zinc-100 mt-3">
                  {selectedTx.category === 'SALE' ? t.transactions.saleDetails : selectedTx.category === 'PURCHASE' ? t.transactions.poDetails : t.transactions.wastageDetails}
                </SheetTitle>
                <SheetDescription className="text-zinc-500 text-xs">
                  Detailed breakdown of transaction events.
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 -mx-2 px-2 py-4">
                <div className="space-y-6">
                  {/* General Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                      <span className="text-xs text-zinc-400">Total Transacted</span>
                      <span className={cn(
                        "text-lg font-black",
                        selectedTx.type === 'INFLOW' ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {selectedTx.type === 'INFLOW' ? "+" : "-"}{formatMoney(selectedTx.amount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-900/40 border border-zinc-850 p-3 rounded-lg">
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Date & Time</span>
                        <span className="text-zinc-300 font-medium">{formatDate(selectedTx.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Status</span>
                        <span className={cn(
                          "font-bold uppercase",
                          selectedTx.status === 'COMPLETED' || selectedTx.status === 'DELIVERED' ? "text-emerald-400" : "text-sky-400"
                        )}>
                          {selectedTx.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-zinc-500 block mb-0.5">Operator</span>
                        <span className="text-zinc-300 font-medium flex items-center gap-1">
                          <User className="size-3 text-zinc-500" />
                          {selectedTx.operator}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-zinc-500 block mb-0.5">Payment Method</span>
                        <span className="text-zinc-300 font-medium">{selectedTx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Items Breakdown */}
                  {selectedTx.details.items && selectedTx.details.items.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        Transacted Items ({selectedTx.details.items.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedTx.details.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-lg text-xs">
                            <span className="text-zinc-300 font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cost breakdown for sales */}
                  {selectedTx.category === 'SALE' && (
                    <div className="space-y-2 pt-2 border-t border-zinc-850">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Subtotal</span>
                        <span>{formatMoney(selectedTx.details.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Tax Amount</span>
                        <span>{formatMoney(selectedTx.details.taxAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Guest Count</span>
                        <span>{selectedTx.details.guestCount || 1}</span>
                      </div>
                    </div>
                  )}

                  {/* Remarks / Notes */}
                  {selectedTx.details.notes && (
                    <div className="bg-amber-950/20 border border-amber-900/30 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-300/80">
                      <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Operator Note</span>
                        <p className="leading-relaxed">{selectedTx.details.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="pt-4 border-t border-zinc-850 flex justify-end shrink-0">
                <Button variant="ghost" onClick={() => setSelectedTx(null)} className="hover:bg-zinc-900 text-zinc-400 h-9 text-xs">
                  Close Detail
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default TransactionsLedger;
