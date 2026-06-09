'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  UtensilsCrossed,
  Cake,
  Wine,
  Beer,
  Coffee,
  CircleDot,
  ShoppingCart,
  Users,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  X,
  Sparkles,
  Flame,
  Search,
  Check,
  CheckCircle2,
  Trash2,
  ListOrdered
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBranding } from '@/stores/branding-store';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { useT, useLocale } from '@/stores/locale-store';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

interface MenuItemExtra {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  station: string;
  prepTime: number;
  isAvailable: boolean;
  isPopular: boolean;
  imageUrl: string | null;
  allergies: string | null;
  spiceLevel: number;
  extras: MenuItemExtra[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  extras: { id: string; name: string; price: number }[];
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface Table {
  id: string;
  number: number;
  name: string;
  status: string;
  orders: Order[];
}

interface CartItem {
  tempId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  station: string;
  notes: string;
  extras: MenuItemExtra[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  appetizer: UtensilsCrossed,
  starter: UtensilsCrossed,
  main: Utensils,
  entree: Utensils,
  dessert: Cake,
  sweet: Cake,
  cocktail: Wine,
  drink: Wine,
  wine: Beer,
  beer: Beer,
  coffee: Coffee,
  beverage: Coffee,
};

function getCategoryIcon(name: string): React.ElementType {
  const normName = name.toLowerCase();
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (normName.includes(key)) return Icon;
  }
  return CircleDot;
}

// Status mapping helper functions
function getItemStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    FIRED: 'bg-orange-950/40 text-orange-400 border-orange-900/30',
    PREPARING: 'bg-amber-950/40 text-amber-400 border-amber-900/30',
    READY: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 animate-pulse',
    SERVED: 'bg-sky-950/40 text-sky-400 border-sky-900/30',
    CANCELLED: 'bg-red-950/40 text-red-400 border-red-900/30',
  };
  return map[status] || 'bg-zinc-800 text-zinc-400';
}

export function TableOrderClient({ table, menu }: { table: Table; menu: MenuCategory[] }) {
  const { toast } = useToast();
  const { logoText, logoIconType, logoEmoji, logoUrl, restaurantName } = useBranding();
  const t = useT();
  const locale = useLocale();

  const getItemStatusLabel = useCallback((status: string): string => {
    const map: Record<string, string> = {
      PENDING: t.tableOrder.prepStatusOrdered,
      FIRED: t.tableOrder.prepStatusPreparing,
      PREPARING: t.tableOrder.prepStatusPreparing,
      READY: t.tableOrder.prepStatusReady,
      SERVED: t.tableOrder.prepStatusServed,
      CANCELLED: t.common.cancelled,
    };
    return map[status] || status;
  }, [t]);
  
  // State variables
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'menu' | 'status'>('menu');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<MenuItemExtra[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  // Poll the active table orders in real-time
  const { data: currentTable, refetch: refetchTable } = useQuery({
    queryKey: ['table-data', table.number],
    queryFn: async () => {
      const res = await fetch('/api/tables');
      if (!res.ok) throw new Error('Failed to fetch table details');
      const allTables = await res.json();
      const match = allTables.find((t: any) => t.number === table.number);
      if (!match) throw new Error('Table not found');
      return match as Table;
    },
    initialData: table,
    refetchInterval: 8000, // Refresh every 8 seconds
  });

  // Listen on the real-time socket connection for order item changes
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const handleUpdate = () => {
      refetchTable();
    };

    socket.on('order:item-updated', handleUpdate);
    socket.on('kitchen:item-updated', handleUpdate);
    socket.on('bar:item-updated', handleUpdate);
    socket.on('order:updated', handleUpdate);

    return () => {
      socket.off('order:item-updated', handleUpdate);
      socket.off('kitchen:item-updated', handleUpdate);
      socket.off('bar:item-updated', handleUpdate);
      socket.off('order:updated', handleUpdate);
    };
  }, [refetchTable]);

  // Derived state calculations
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const extrasCost = item.extras.reduce((s, ext) => s + ext.price, 0);
      return sum + (item.price + extrasCost) * item.quantity;
    }, 0);
  }, [cart]);

  const activeOrders = useMemo(() => currentTable?.orders || [], [currentTable]);
  
  const activeBillTotal = useMemo(() => {
    return activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [activeOrders]);

  const filteredMenuItems = useMemo(() => {
    let list: MenuItem[] = [];
    if (selectedCategoryId === 'all') {
      menu.forEach((cat) => list.push(...cat.items));
    } else {
      const cat = menu.find((c) => c.id === selectedCategoryId);
      if (cat) list = cat.items;
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [menu, selectedCategoryId, searchQuery]);

  console.log('DEBUG TableOrderClient:', {
    menuLength: menu?.length,
    selectedCategoryId,
    filteredMenuItemsLength: filteredMenuItems?.length,
    menuSerialized: JSON.stringify(menu).substring(0, 300)
  });

  // Actions
  const handleAddToCart = useCallback((item: MenuItem, extras: MenuItemExtra[] = []) => {
    setCart((prev) => {
      // Find matching item with same exact extras
      const match = prev.find(
        (c) =>
          c.menuItemId === item.id &&
          c.notes === '' &&
          c.extras.length === extras.length &&
          c.extras.every((ext) => extras.some((e) => e.id === ext.id))
      );
      if (match) {
        return prev.map((c) =>
          c.tempId === match.tempId ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          tempId: Math.random().toString(36).substring(7),
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          station: item.station,
          notes: '',
          extras,
        },
      ];
    });
    
    toast({
      title: 'Added to Cart',
      description: `${item.name} has been added to your table order.`,
    });
  }, [toast]);

  const updateCartQuantity = useCallback((tempId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.tempId === tempId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleCustomizationConfirm = () => {
    if (!customizingItem) return;
    handleAddToCart(customizingItem, selectedExtras);
    setCustomizingItem(null);
    setSelectedExtras([]);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmittingOrder(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: currentTable.id,
          createdBy: 'self-service',
          items: cart.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.price,
            notes: item.notes || null,
            extras: item.extras.map((ext) => ({
              id: ext.id,
              name: ext.name,
              price: ext.price,
            })),
          })),
          guestCount,
          notes: orderNotes || null,
          locale: locale,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit order');
      }

      const order = await res.json();

      // Emit socket notification to update KDS/POS
      const socket = getSocket();
      socket.emit('order:created', order);

      setCart([]);
      setOrderNotes('');
      setCartOpen(false);
      setOrderPlacedSuccess(true);
      refetchTable();
      setActiveTab('status');
      
      setTimeout(() => {
        setOrderPlacedSuccess(false);
      }, 5000);
      
    } catch {
      toast({
        title: 'Ordering Failed',
        description: 'Something went wrong while placing your order. Please try again or call staff.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col pb-24 touch-scroll tap-transparent">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-emerald-600/5 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden shrink-0",
            logoIconType === 'url' && logoUrl
              ? ""
              : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/10"
          )}>
            {logoIconType === 'emoji' ? (
              <span className="text-2xl">{logoEmoji}</span>
            ) : logoIconType === 'url' && logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold tracking-wider">{logoText || 'GF'}</span>
            )}
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-100 tracking-tight leading-none">
              {restaurantName || 'The Gilded Fork'}
            </h1>
            <p className="text-[10px] text-emerald-500 font-medium tracking-wide uppercase mt-0.5">{t.tableOrder.premiumSelfService}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="flag-only" />
          <Badge className="bg-zinc-900 border-zinc-800 text-zinc-300 gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg shadow-sm">
            <Users className="size-3.5 text-emerald-500" />
            <span>{currentTable.name}</span>
          </Badge>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="relative z-10 px-4 mt-4">
        <div className="grid grid-cols-2 p-0.5 rounded-lg border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${
              activeTab === 'menu'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ListOrdered className="size-3.5" />
            {t.tableOrder.browseMenu}
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all duration-200 relative ${
              activeTab === 'status'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="size-3.5" />
            {t.tableOrder.trackOrders}
            {activeOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 px-4 mt-4">
        {/* Tab 1: Browse Menu */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            
            {/* Table Settings Panel */}
            <Card className="bg-zinc-900/40 border-zinc-900 p-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-zinc-500" />
                  <span className="text-xs text-zinc-400">{t.tableOrder.guestsSeated}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-950/60 p-0.5 rounded-md border border-zinc-800">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-400 hover:text-white"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-5 text-center text-xs font-semibold text-zinc-100">{guestCount}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-400 hover:text-white"
                    onClick={() => setGuestCount(Math.min(12, guestCount + 1))}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Search menu */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input
                type="text"
                placeholder={t.tableOrder.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/60 border-zinc-800 pl-10 text-zinc-100 text-xs h-9 rounded-xl placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category Select (horizontal scroll) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  selectedCategoryId === 'all'
                    ? 'bg-emerald-500 text-primary-foreground border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.common.all}
              </button>
              {menu.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                      isSelected
                        ? 'bg-emerald-500 text-primary-foreground border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <div key={item.id}>
                    <Card 
                      onClick={() => {
                        setCustomizingItem(item);
                        setSelectedExtras([]);
                      }}
                      className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700/80 overflow-hidden flex flex-col h-full shadow-md group relative rounded-2xl transition-all duration-300 cursor-pointer"
                    >
                      {/* Popular indicator */}
                      {item.isPopular && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <Badge className="bg-emerald-500 text-primary-foreground border-none text-[8px] font-extrabold uppercase px-1.5 py-0.5 h-4.5 rounded shadow-md flex items-center gap-0.5">
                            <Sparkles className="size-2.5 fill-current" />
                            {t.tableOrder.popularBadge}
                          </Badge>
                        </div>
                      )}

                      {/* Image / Graphic Display */}
                      <div className="w-full h-32 sm:h-40 bg-zinc-950 relative overflow-hidden flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                          <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center text-zinc-700 group-hover:text-emerald-500/50 transition-colors">
                            {item.type === 'DRINK' ? (
                              <Wine className="size-10 opacity-40" />
                            ) : (
                              <Utensils className="size-10 opacity-40" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                              {item.name}
                            </h3>
                            <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-auto">
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[9px] text-zinc-500 flex items-center gap-0.5 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800/80">
                              <Clock className="size-2.5" />
                              {item.prepTime}m
                            </span>
                            {item.spiceLevel > 0 && (
                              <span className="text-[9px] text-red-400 bg-red-950/10 px-1 py-0.5 rounded flex items-center">
                                {'🌶'.repeat(item.spiceLevel)}
                              </span>
                            )}
                          </div>

                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid triggering card details popup
                              handleAddToCart(item);
                            }}
                            className="bg-zinc-800 hover:bg-emerald-500 hover:text-primary-foreground text-zinc-200 h-7 px-3 rounded-lg text-[10px] font-bold border border-zinc-700 transition-all shadow-sm"
                          >
                            <Plus className="size-3 mr-1" /> {t.common.add}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                  <Search className="size-8 text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-400">{t.tableOrder.noItemsFound}</p>
                  <p className="text-xs text-zinc-600 mt-1">{t.pos.tryDifferentSearch}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Track Orders */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {orderPlacedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-center shadow-lg">
                <CheckCircle2 className="size-6 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-emerald-200">{t.tableOrder.orderSubmitted}</h4>
                <p className="text-[10px] text-emerald-400 mt-1">{t.tableOrder.liveBillTracker}</p>
              </div>
            )}

            {activeOrders.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{t.tableOrder.tableBillTotal}</h3>
                  <span className="text-sm font-black text-emerald-400">${activeBillTotal.toFixed(2)}</span>
                </div>

                {activeOrders.map((order) => (
                  <Card key={order.id} className="bg-zinc-900/60 border-zinc-800/80 shadow-md">
                    <CardContent className="p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Order Ref: #{order.id.slice(-6).toUpperCase()}</span>
                        <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <Separator className="bg-zinc-800/60" />

                      <div className="space-y-2.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-zinc-400 shrink-0">&times;{item.quantity}</span>
                                <span className="font-semibold text-zinc-200 truncate">{item.menuItem.name}</span>
                              </div>
                              
                              {item.extras && item.extras.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.extras.map((ext, idx) => (
                                    <span key={idx} className="text-[9px] text-zinc-500">
                                      + {ext.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {item.notes && (
                                <p className="text-[9px] text-zinc-500 italic">
                                  Note: &ldquo;{item.notes}&rdquo;
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="font-semibold text-zinc-300">
                                ${item.totalPrice.toFixed(2)}
                              </span>
                              <Badge className={`text-[8px] font-extrabold px-1.5 h-4.5 rounded uppercase border ${getItemStatusColor(item.status)}`}>
                                {getItemStatusLabel(item.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-zinc-800/60" />

                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <span className="text-zinc-400">Total Fired</span>
                        <span className="text-zinc-200">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-4">
                  <ShoppingCart className="size-6 text-zinc-700" />
                </div>
                <h3 className="text-sm font-bold text-zinc-300">{t.tableOrder.noActiveOrders}</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
                  {t.tableOrder.addItemsToOrder}{' '}
                  <button onClick={() => setActiveTab('menu')} className="text-emerald-500 font-semibold hover:underline">
                    {t.tableOrder.browseMenu}
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Persistent Floating Bottom Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-40">
          <Button
            onClick={() => setCartOpen(true)}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-primary-foreground font-extrabold rounded-2xl shadow-xl shadow-emerald-500/10 flex items-center justify-between px-5 transition-all border-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-black/10 rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                <ShoppingCart className="size-4.5" />
              </div>
              <span className="text-xs tracking-tight">{t.tableOrder.viewCart} ({cartItemCount})</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span>{t.tableOrder.reviewOrder} &middot;</span>
              <span className="font-black text-sm">${cartSubtotal.toFixed(2)}</span>
              <ChevronRight className="size-4" />
            </div>
          </Button>
        </div>
      )}

      {/* Cart Drawer */}
      <Drawer open={cartOpen} onOpenChange={setCartOpen}>
        <DrawerContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[85vh] flex flex-col">
          <DrawerHeader className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <DrawerTitle className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <ShoppingCart className="size-4 text-emerald-500" />
              {t.tableOrder.cartTitle}
            </DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-200"
              onClick={() => setCartOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </DrawerHeader>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="space-y-3">
              {cart.map((item) => {
                const extrasCost = item.extras.reduce((s, ext) => s + ext.price, 0);
                return (
                  <div key={item.tempId} className="bg-zinc-955/50 border border-zinc-850 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          ${(item.price + extrasCost).toFixed(2)} {t.pos.each}
                        </p>
                        
                        {item.extras.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.extras.map((ext) => (
                              <Badge key={ext.id} variant="outline" className="text-[9px] px-1.5 py-0 h-4.5 text-zinc-400 border-zinc-800">
                                + {ext.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <span className="font-black text-emerald-400 shrink-0">
                        ${((item.price + extrasCost) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Cooking instruction notes for item */}
                      <Input
                        type="text"
                        placeholder={t.tableOrder.specialRequests}
                        value={item.notes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCart((prev) =>
                            prev.map((c) =>
                              c.tempId === item.tempId ? { ...c, notes: val } : c
                            )
                          );
                        }}
                        className="bg-zinc-900 border-zinc-800 text-[10px] text-zinc-300 h-7 flex-1 mr-3 rounded-lg placeholder:text-zinc-600 focus-visible:ring-emerald-500/30"
                      />

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-1.5 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400 hover:text-white"
                          onClick={() => updateCartQuantity(item.tempId, -1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-5 text-center text-xs font-semibold text-zinc-100">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400 hover:text-white"
                          onClick={() => updateCartQuantity(item.tempId, 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="bg-zinc-800" />

            {/* Global kitchen notes */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400 font-medium">{t.tableOrder.notesTitle}</Label>
              <Textarea
                placeholder={t.tableOrder.specialRequests}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs min-h-[60px] rounded-xl placeholder:text-zinc-600 focus-visible:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Footer Checkout Actions */}
          <div className="border-t border-zinc-800 p-4 bg-zinc-900/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{t.common.tax} &amp; Service Charges</span>
              <span className="text-zinc-500 font-semibold">
                {locale.startsWith('pt') ? 'Incluído' : locale.startsWith('es') ? 'Incluido' : locale.startsWith('fr') ? 'Inclus' : 'Included'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-200">{t.common.totalAmount}</span>
              <span className="text-base font-black text-emerald-400">${cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCartOpen(false)}
                className="flex-1 border-zinc-800 text-zinc-400 hover:bg-zinc-850 h-11 text-xs rounded-xl"
              >
                {locale.startsWith('pt') ? 'Continuar a ver' : locale.startsWith('es') ? 'Seguir mirando' : locale.startsWith('fr') ? 'Continuer' : 'Keep Browsing'}
              </Button>
              
              <Button
                onClick={handlePlaceOrder}
                disabled={submittingOrder}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-primary-foreground font-extrabold h-11 text-xs rounded-xl shadow-lg border-none"
              >
                {submittingOrder ? t.common.updating : t.tableOrder.placeOrderBtn}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Product Details & Extras Card Modal */}
      <Dialog open={customizingItem !== null} onOpenChange={(v) => !v && setCustomizingItem(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 p-0 overflow-hidden max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" showCloseButton={false}>
          {customizingItem && (
            <>
              {/* Card Image */}
              <div className="w-full h-52 shrink-0 bg-zinc-950 relative overflow-hidden">
                {customizingItem.imageUrl ? (
                  <img
                    src={customizingItem.imageUrl}
                    alt={customizingItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center text-zinc-700">
                    {customizingItem.type === 'DRINK' ? (
                      <Wine className="size-16 opacity-30" />
                    ) : (
                      <Utensils className="size-16 opacity-30" />
                    )}
                  </div>
                )}
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/20" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/45 hover:bg-black/60 text-zinc-300 hover:text-white backdrop-blur-sm border-none z-20"
                  onClick={() => setCustomizingItem(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Card Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Title & Price */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <DialogTitle className="text-lg font-bold text-zinc-100 tracking-tight leading-snug">
                      {customizingItem.name}
                    </DialogTitle>
                    <span className="text-base font-black text-emerald-400 shrink-0">
                      ${customizingItem.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Description */}
                  {customizingItem.description && (
                    <DialogDescription className="text-xs text-zinc-400 leading-relaxed font-normal pt-1">
                      {customizingItem.description}
                    </DialogDescription>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <Badge className="bg-zinc-800/80 border-zinc-750 text-zinc-300 gap-1 text-[9px] font-semibold rounded-lg shadow-xs py-0.5 px-2">
                    <Clock className="size-3 text-emerald-500" />
                    Prep: {customizingItem.prepTime}m
                  </Badge>
                  {customizingItem.spiceLevel > 0 && (
                    <Badge className="bg-red-950/20 text-red-400 border-red-900/10 text-[9px] font-semibold rounded-lg shadow-xs py-0.5 px-2">
                      {'🌶'.repeat(customizingItem.spiceLevel)}
                    </Badge>
                  )}
                  {customizingItem.isPopular && (
                    <Badge className="bg-emerald-550/10 text-emerald-400 border-emerald-500/20 text-[9px] font-semibold rounded-lg shadow-xs py-0.5 px-2">
                      <Sparkles className="size-2.5 mr-0.5 fill-emerald-400 text-emerald-400" />
                      {t.tableOrder.popularBadge}
                    </Badge>
                  )}
                </div>

                <Separator className="bg-zinc-800/60" />

                {/* Extras/Customizations (Modifiers) */}
                {customizingItem.extras && customizingItem.extras.length > 0 ? (
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-zinc-400 tracking-wide uppercase">{t.tableOrder.extrasTitle}</Label>
                    <div className="grid gap-2">
                      {customizingItem.extras.map((extra) => {
                        const isSelected = selectedExtras.some((e) => e.id === extra.id);
                        return (
                          <button
                            key={extra.id}
                            onClick={() => {
                              setSelectedExtras((prev) =>
                                prev.some((e) => e.id === extra.id)
                                  ? prev.filter((e) => e.id !== extra.id)
                                  : [...prev, extra]
                              );
                            }}
                            className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 shadow-sm shadow-emerald-500/5'
                                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-emerald-500 border-emerald-500 text-primary-foreground' : 'border-zinc-700 bg-zinc-950'
                              }`}>
                                {isSelected && <Check className="size-3 stroke-[3]" />}
                              </div>
                              <span>{extra.name}</span>
                            </div>
                            
                            <span className="font-bold text-zinc-300">
                              +${extra.price.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center text-[10px] text-zinc-500 italic">
                    {locale.startsWith('pt') ? 'Sem acompanhamentos disponíveis.' : locale.startsWith('es') ? 'No hay extras disponibles.' : locale.startsWith('fr') ? 'Aucun supplément disponible.' : 'No optional modifiers available for this item.'}
                  </div>
                )}
              </div>

              {/* Confirm / Checkout Action Footer */}
              <div className="border-t border-zinc-800/80 p-4 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{t.common.totalAmount}</span>
                  <span className="text-base font-black text-emerald-400">
                    ${(
                      customizingItem.price +
                      selectedExtras.reduce((sum, e) => sum + e.price, 0)
                    ).toFixed(2)}
                  </span>
                </div>
                
                <Button
                  onClick={handleCustomizationConfirm}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-primary-foreground font-black px-6 rounded-xl text-xs h-10 border-none shadow-lg shadow-emerald-500/10 transition-transform active:scale-[0.98]"
                >
                  {t.tableOrder.addToCart}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
