'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  Info, 
  Check, 
  AlertCircle,
  Download,
  Loader2,
  ChevronRight,
  BookOpen,
  Map,
  ArrowRight,
  Compass,
  Utensils,
  Minus,
  Plus
} from 'lucide-react';
import { useBranding } from '@/stores/branding-store';
import { useT, useLocale } from '@/stores/locale-store';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TableInfo {
  id: string;
  number: number;
  name: string;
  active: boolean;
  capacity: number;
  status: string;
  x: number;
  y: number;
  width: number;
  height: number;
  section: string;
  shape: string;
}

interface Reservation {
  id: string;
  tableId: string | null;
  guestName: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: string;
}

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
];

function getTableCoords(table: TableInfo) {
  let width = table.width;
  let height = table.height;

  if (!width || width <= 10) {
    width = table.shape === 'RECTANGLE' ? 140 : 110;
  }
  if (!height || height <= 10) {
    height = table.shape === 'RECTANGLE' ? 70 : 110;
  }

  if (table.x > 10 || table.y > 10) {
    return { x: table.x, y: table.y, w: width, h: height };
  }

  const zones: Record<string, { x: number; y: number; w: number; h: number }> = {
    MAIN: { x: 0, y: 0, w: 600, h: 400 },
    BAR: { x: 600, y: 0, w: 600, h: 400 },
    PATIO: { x: 0, y: 400, w: 600, h: 400 },
    VIP: { x: 600, y: 400, w: 600, h: 400 },
  };

  const zone = zones[table.section] || zones.MAIN;
  const colWidth = 135;
  const rowHeight = 110;
  const paddingX = 40;
  const paddingY = 90;

  let posX = zone.x + paddingX + (table.x * colWidth);
  let posY = zone.y + paddingY + (table.y * rowHeight);

  posX = Math.round(Math.min(posX, zone.x + zone.w - width - 20));
  posY = Math.round(Math.min(posY, zone.y + zone.h - height - 20));

  return { x: posX, y: posY, w: width, h: height };
}

export default function LandingPage() {
  const router = useRouter();
  const t = useT();
  const activeLocale = useLocale();
  const { toast } = useToast();
  
  const { logoText, logoIconType, logoEmoji, logoUrl, restaurantName } = useBranding();
  const { isInstallable, isInstalled, install } = usePwaInstall();

  // Dialog Overlay Visibility States
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  // Zoom & Auto-Fit state for Floor Plan
  const [zoom, setZoom] = useState(1);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const handleAutoFit = () => {
    if (canvasWrapperRef.current) {
      const parentWidth = canvasWrapperRef.current.clientWidth;
      const computedScale = Math.min(1.2, parentWidth / 1210);
      setZoom(Math.max(0.4, computedScale));
    }
  };

  useEffect(() => {
    if (isPlanOpen) {
      const timer = setTimeout(() => {
        handleAutoFit();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isPlanOpen]);

  useEffect(() => {
    if (isPlanOpen) {
      window.addEventListener('resize', handleAutoFit);
      return () => window.removeEventListener('resize', handleAutoFit);
    }
  }, [isPlanOpen]);

  // Core Data States
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Logo 3D Tilt Effect State
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // Reservation Form State
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resGuests, setResGuests] = useState('2');
  const [resDate, setResDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [resTime, setResTime] = useState('19:00');
  const [resNotes, setResNotes] = useState('');
  const [resTableId, setResTableId] = useState('any');
  const [submittingRes, setSubmittingRes] = useState(false);

  // Detect iOS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(ios);
    }
  }, []);

  // Fetch tables and reservations
  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/tables').then(res => res.json()),
      fetch('/api/reservations').then(res => res.json())
    ])
      .then(([tablesData, reservationsData]) => {
        if (Array.isArray(tablesData)) {
          setTables(tablesData.filter((tbl: any) => tbl.active));
        }
        if (Array.isArray(reservationsData)) {
          setReservations(reservationsData);
        }
      })
      .catch(err => {
        console.error('Error loading landing page data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate table availability for the chosen Date & Time
  const tableAvailability = useMemo(() => {
    if (!resDate || !resTime) return {};

    const selectedDateTime = new Date(`${resDate}T${resTime}:00`);
    const selectionTimeMs = selectedDateTime.getTime();
    const twoHoursMs = 120 * 60 * 1000;

    const availabilityMap: Record<string, { available: boolean; reason?: string }> = {};

    tables.forEach(table => {
      availabilityMap[table.id] = { available: true };
    });

    reservations.forEach(res => {
      if (!res.tableId || res.status === 'CANCELLED') return;

      const resDateOnly = res.reservationDate.split('T')[0];
      if (resDateOnly !== resDate) return;

      const resTimeStr = res.reservationTime;
      const resDateTime = new Date(`${resDateOnly}T${resTimeStr}:00`);
      const resTimeMs = resDateTime.getTime();

      const diff = Math.abs(selectionTimeMs - resTimeMs);
      if (diff < twoHoursMs) {
        availabilityMap[res.tableId] = { 
          available: false, 
          reason: `Reserved at ${resTimeStr}` 
        };
      }
    });

    return availabilityMap;
  }, [tables, reservations, resDate, resTime]);

  // Handle 3D Parallax Tilt for Brand Logo Card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    const rX = -(mouseY / height) * 15;
    const rY = (mouseX / width) * 15;
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  // Fixed browse menu logic (never disabled)
  const handleBrowseMenu = () => {
    if (selectedTableId) {
      const table = tables.find(t => t.id === selectedTableId);
      if (table) {
        router.push(`/table/${table.number}`);
        return;
      }
    }
    
    // Fallback: browse using the first active table
    const firstTable = tables.length > 0 ? tables[0] : null;
    if (firstTable) {
      router.push(`/table/${firstTable.number}?preview=true`);
      toast({
        title: 'Entering Menu Preview',
        description: `Browsing menu as guest. Select Table ${firstTable.number} or select another table on the plan to start ordering.`,
      });
    } else {
      router.push('/table/1?preview=true');
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for the reservation.',
        variant: 'destructive'
      });
      return;
    }

    setSubmittingRes(true);

    try {
      let assignedTableId = resTableId === 'any' ? null : resTableId;
      if (resTableId === 'any') {
        const availableTable = tables.find(table => {
          const avail = tableAvailability[table.id];
          return avail ? avail.available : true;
        });
        if (availableTable) {
          assignedTableId = availableTable.id;
        }
      }

      const dateIso = new Date(`${resDate}T12:00:00.000Z`).toISOString();

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: resName,
          guestPhone: resPhone || null,
          guestEmail: resEmail || null,
          partySize: Number(resGuests),
          reservationDate: dateIso,
          reservationTime: resTime,
          tableId: assignedTableId,
          notes: resNotes || null,
          status: 'CONFIRMED'
        })
      });

      if (!res.ok) throw new Error('Failed to save reservation');
      
      toast({
        title: 'Booking Confirmed!',
        description: 'Your reservation has been booked and confirmed successfully.',
      });

      // Reset form & Close Dialog
      setResName('');
      setResPhone('');
      setResEmail('');
      setResNotes('');
      setResTableId('any');
      setIsReserveOpen(false);
      
      loadData();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Reservation Failed',
        description: 'Failed to complete online reservation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmittingRes(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } catch (err) {
      console.error(err);
    } finally {
      setInstalling(false);
    }
  };

  const getAddress = (locale: string) => {
    switch (locale) {
      case 'pt-PT':
        return 'Avenida da Gastronomia, 12, Lisboa, Portugal';
      case 'fr-FR':
        return '12 Rue de la Cuisine, Paris, France';
      case 'es-ES':
        return 'Plaza del Sabor, 12, Madrid, España';
      default:
        return '12 Chef\'s Square, London, UK';
    }
  };

  const renderLogo = () => {
    if (logoIconType === 'emoji') {
      return (
        <span className="text-7xl sm:text-8xl filter drop-shadow-[0_10px_20px_rgba(188,155,106,0.4)] animate-bounce-slow select-none">
          {logoEmoji}
        </span>
      );
    }
    if (logoIconType === 'url' && logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt={restaurantName} 
          className="h-28 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(188,155,106,0.3)]" 
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-24 w-24 rounded-3xl bg-[#005d2f]/10 border-2 border-[#BC9B6A] text-[#BC9B6A] font-serif font-bold text-4xl tracking-widest shadow-[0_0_40px_rgba(188,155,106,0.2)] select-none">
        {logoText || 'GF'}
      </div>
    );
  };

  const activeTableName = useMemo(() => {
    const selected = tables.find(t => t.id === selectedTableId);
    return selected ? selected.name : null;
  }, [tables, selectedTableId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative flex flex-col justify-between overflow-x-hidden selection:bg-[#BC9B6A] selection:text-zinc-950">
      
      {/* Premium Ambient Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,_rgba(0,93,47,0.15)_0%,_transparent_70%)] opacity-[0.8] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-[#005d2f]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[450px] h-[450px] bg-[#BC9B6A]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Centered S&W Header Layout */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col items-center gap-6 border-b border-[#BC9B6A]/10">
        <div className="flex items-center gap-3">
          {logoIconType === 'url' && logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-9 w-auto object-contain" />
          ) : (
            <span className="font-serif font-black text-xl text-[#BC9B6A] tracking-widest">{logoText || 'GF'}</span>
          )}
          <div className="h-4 w-px bg-[#BC9B6A]/30" />
          <span className="font-serif font-medium text-base tracking-widest uppercase text-zinc-200">
            {restaurantName}
          </span>
        </div>
        
        {/* Decorative thin line layout */}
        <div className="w-16 h-px bg-[#BC9B6A]/40" />

        {/* Global Controls */}
        <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-[#BC9B6A]">
          <LanguageSwitcher variant="flag-only" />
        </div>
      </header>

      {/* Main Luxury Hero Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center gap-12">
        
        {/* Brand Logo & Presentation */}
        <div className="flex flex-col items-center gap-6">
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(800px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="cursor-default"
          >
            {renderLogo()}
          </div>
          
          <div className="space-y-4 max-w-2xl mt-4">
            <h1 className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-zinc-100 leading-tight">
              {restaurantName}
            </h1>
            <h2 className="font-serif text-lg sm:text-xl italic text-[#BC9B6A] font-medium tracking-wide">
              {t.landing.tagline}
            </h2>
          </div>
        </div>

        {/* Dynamic Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full max-w-lg mt-4">
          <Button
            onClick={() => setIsReserveOpen(true)}
            className="w-full sm:flex-1 h-14 bg-[#005d2f] text-[#F1F6E7] border border-[#BC9B6A] hover:bg-[#005d2f]/90 transition-all font-serif font-bold text-sm uppercase tracking-wider rounded-none shadow-[0_4px_15px_rgba(0,93,47,0.25)]"
          >
            <Calendar className="size-4.5 mr-2 text-[#BC9B6A]" />
            Book a Table
          </Button>

          <Button
            onClick={() => setIsPlanOpen(true)}
            className="w-full sm:flex-1 h-14 bg-transparent text-[#BC9B6A] border border-[#BC9B6A] hover:bg-[#BC9B6A]/10 transition-all font-serif font-bold text-sm uppercase tracking-wider rounded-none"
          >
            <Map className="size-4.5 mr-2" />
            {activeTableName ? `Table: ${activeTableName}` : 'Select Table & Order'}
          </Button>
        </div>

        {/* Direct Menu Preview Trigger */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleBrowseMenu}
            className="font-serif text-sm tracking-widest uppercase font-semibold text-[#BC9B6A] hover:text-[#BC9B6A]/80 transition-colors flex items-center gap-1.5 border-b border-dashed border-[#BC9B6A] pb-1"
          >
            <span>Browse Menu & Order</span>
            <ChevronRight className="size-4" />
          </button>
          {activeTableName && (
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              Selected: {activeTableName} (unlocked for order placement)
            </p>
          )}
        </div>

        {/* Address Card */}
        <div className="mt-8 p-6 w-full max-w-md border border-[#BC9B6A]/20 bg-zinc-950/40 backdrop-blur-md rounded-none text-left flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="p-2.5 h-10 w-10 border border-[#BC9B6A]/30 text-[#BC9B6A] flex items-center justify-center shrink-0">
              <MapPin className="size-4.5" />
            </div>
            <div>
              <h3 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest font-sans">Our Address</h3>
              <p className="font-serif text-sm text-[#F1F6E7] mt-1 tracking-wide">{getAddress(activeLocale)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-[#BC9B6A]/10 pt-4 text-[9px] uppercase font-bold tracking-widest text-[#BC9B6A]">
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" />
              <span>+351 210 987 654</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Mail className="size-3.5 shrink-0" />
              <span>info@gildedfork.com</span>
            </div>
          </div>
        </div>

      </main>

      {/* ============================================================ */}
      {/* 1. RESERVATION CARD OVERLAY MODAL */}
      {/* ============================================================ */}
      <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
        <DialogContent className="max-w-xl bg-zinc-900 border-[#BC9B6A]/30 text-zinc-100 rounded-none p-6 sm:p-8">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle className="font-serif text-2xl font-bold tracking-wide text-zinc-100">
              Book Your Table
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-1 font-sans">
              Instant verification. Reserve online seamlessly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReservation} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                  {t.reservations.guestName}
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Marco Rossi"
                  value={resName}
                  onChange={e => setResName(e.target.value)}
                  className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-[#BC9B6A] focus-visible:ring-0 rounded-none px-0 h-10 text-xs placeholder:text-zinc-700"
                />
              </div>
              
              {/* Phone */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                  {t.reservations.phone}
                </label>
                <Input
                  type="tel"
                  placeholder="+351 912 345 678"
                  value={resPhone}
                  onChange={e => setResPhone(e.target.value)}
                  className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-[#BC9B6A] focus-visible:ring-0 rounded-none px-0 h-10 text-xs placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Date */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                  {t.reservations.date}
                </label>
                <Input
                  type="date"
                  required
                  value={resDate}
                  onChange={e => setResDate(e.target.value)}
                  className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-[#BC9B6A] focus-visible:ring-0 rounded-none px-0 h-10 text-xs"
                />
              </div>

              {/* Time Slot */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                  {t.reservations.time}
                </label>
                <Select value={resTime} onValueChange={setResTime}>
                  <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-[#BC9B6A] focus:ring-0 rounded-none px-0 h-10 text-xs text-zinc-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                    {TIME_SLOTS.map(slot => (
                      <SelectItem key={slot} value={slot} className="cursor-pointer">
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Party Size */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                  {t.reservations.partySize}
                </label>
                <Select value={resGuests} onOpenChange={() => {}} onValueChange={setResGuests}>
                  <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-[#BC9B6A] focus:ring-0 rounded-none px-0 h-10 text-xs text-zinc-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                      <SelectItem key={n} value={n.toString()} className="cursor-pointer">
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                  Email (Optional)
                </label>
                <Input
                  type="email"
                  placeholder="client@gildedfork.com"
                  value={resEmail}
                  onChange={e => setResEmail(e.target.value)}
                  className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-[#BC9B6A] focus-visible:ring-0 rounded-none px-0 h-10 text-xs placeholder:text-zinc-700"
                />
              </div>

              {/* Preferred Available Table Select */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                  Table (Optional)
                </label>
                <Select value={resTableId} onValueChange={setResTableId}>
                  <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-[#BC9B6A] focus:ring-0 rounded-none px-0 h-10 text-xs text-zinc-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                    <SelectItem value="any" className="cursor-pointer font-bold">Auto Assign Table</SelectItem>
                    {tables.map(table => {
                      const avail = tableAvailability[table.id];
                      const isAvailable = avail ? avail.available : true;
                      return (
                        <SelectItem 
                          key={table.id} 
                          value={table.id}
                          disabled={!isAvailable}
                          className="cursor-pointer"
                        >
                          {table.name} ({table.capacity}p) {isAvailable ? '' : '— ❌ Occupied'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Notes */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#BC9B6A] font-sans">
                {t.reservations.notes}
              </label>
              <Textarea
                placeholder="Allergies, high chair, window table, birthday..."
                value={resNotes}
                onChange={e => setResNotes(e.target.value)}
                className="bg-transparent border border-zinc-800 focus:border-[#BC9B6A] rounded-none px-3 py-2 text-xs placeholder:text-zinc-700 h-16 min-h-16 max-h-16"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingRes}
              className="w-full h-12 bg-[#005d2f] text-[#F1F6E7] border border-[#BC9B6A] hover:bg-transparent hover:text-[#BC9B6A] transition-all font-serif font-bold text-xs uppercase tracking-widest rounded-none mt-2"
            >
              {submittingRes ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Online Reservation'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* 2. TABLE FLOOR PLAN CARD OVERLAY MODAL */}
      {/* ============================================================ */}
      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="max-w-7xl bg-zinc-950 border-[#BC9B6A]/30 text-zinc-100 rounded-none p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold tracking-wide text-zinc-100 flex items-center justify-between">
              <span>Interactive Restaurant Floor Plan</span>
              
              {/* Legends display */}
              <div className="hidden sm:flex gap-3 text-[9px] font-bold text-zinc-400 tracking-widest uppercase">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Seated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                  <span>Reserved</span>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 font-sans text-left mt-1">
              Click any free table (green) to select it for your order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4 flex flex-col items-stretch">
            
            {/* Table Dropdown Fallback list */}
            <div className="w-full">
              <Select value={selectedTableId} onValueChange={(id) => {
                setSelectedTableId(id);
                toast({
                  title: 'Table Selected',
                  description: `You have selected Table ${tables.find(t => t.id === id)?.name || id}.`
                });
              }}>
                <SelectTrigger className="h-10 px-4 bg-zinc-900 border-zinc-800 rounded-none text-zinc-200 text-xs font-semibold focus:ring-[#BC9B6A]/40 focus:ring-offset-0">
                  <SelectValue placeholder="Select table from list..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  {tables.map((table) => (
                    <SelectItem 
                      key={table.id} 
                      value={table.id}
                      className="text-xs font-medium focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                    >
                      {table.name} ({table.capacity} seats) — {table.status === 'FREE' ? '🟢 Free' : table.status === 'RESERVED' ? '🔵 Reserved' : 'Occupied'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zoom Controls Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 border border-[#BC9B6A]/10 p-3 rounded-none">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Floor Plan Sizing
              </span>
              <div className="flex items-center gap-1.5 bg-zinc-955 border border-[#BC9B6A]/20 p-1">
                <span className="text-[10px] font-bold text-[#BC9B6A] px-2">
                  Zoom: {Math.round(zoom * 100)}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
                  className="size-7 border border-[#BC9B6A]/10 text-zinc-400 hover:text-[#BC9B6A] hover:bg-zinc-900"
                >
                  <Minus className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setZoom(1)}
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider border border-[#BC9B6A]/10 text-zinc-400 hover:text-[#BC9B6A] hover:bg-zinc-900"
                >
                  100%
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAutoFit}
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider border border-[#BC9B6A]/10 text-zinc-400 hover:text-[#BC9B6A] hover:bg-zinc-900"
                >
                  Fit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
                  className="size-7 border border-[#BC9B6A]/10 text-zinc-400 hover:text-[#BC9B6A] hover:bg-zinc-900"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Floor plan canvas wrapper - dynamic scale */}
            <div 
              ref={canvasWrapperRef}
              className="w-full overflow-auto max-h-[60vh] border border-[#BC9B6A]/10 rounded-none bg-zinc-950 p-1 shadow-inner scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              <div 
                style={{
                  width: `${1200 * zoom}px`,
                  height: `${800 * zoom}px`,
                  transition: 'width 0.2s ease-out, height 0.2s ease-out'
                }}
                className="relative shrink-0 overflow-hidden"
              >
                <div 
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: '1200px',
                    height: '800px',
                    transition: 'transform 0.2s ease-out'
                  }}
                  className="absolute top-0 left-0 bg-[radial-gradient(#1c2e24_1px,transparent_1px)] bg-[size:16px_16px] overflow-hidden"
                >
                
                {/* Section Grid Dividers */}
                <div className="absolute top-[400px] left-0 w-full border-t border-dashed border-zinc-900/40 pointer-events-none z-0" />
                <div className="absolute left-[600px] top-0 h-full border-l border-dashed border-zinc-900/40 pointer-events-none z-0" />

                {/* Section labels */}
                <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                  {t.floorPlan.mainDining}
                </div>
                <div className="absolute top-4 left-[620px] text-[10px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                  {t.floorPlan.bar}
                </div>
                <div className="absolute top-[420px] left-4 text-[10px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                  {t.floorPlan.patio}
                </div>
                <div className="absolute top-[420px] left-[620px] text-[10px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                  {t.floorPlan.vip}
                </div>

                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500 text-xs">
                    <Loader2 className="size-6 animate-spin text-[#BC9B6A]" />
                    <span>Loading floor map...</span>
                  </div>
                ) : tables.length > 0 ? (
                  tables.map((table) => {
                    const isFree = table.status === 'FREE';
                    const isSelected = selectedTableId === table.id;
                    const isRound = table.shape === 'ROUND';

                    const coords = getTableCoords(table);
                    const left = `${coords.x}px`;
                    const top = `${coords.y}px`;
                    const width = `${coords.w}px`;
                    const height = `${coords.h}px`;

                    return (
                      <button
                        key={table.id}
                        onClick={() => {
                          setSelectedTableId(table.id);
                          toast({
                            title: 'Table Selected',
                            description: `Selected ${table.name}. Tap order button to proceed.`
                          });
                        }}
                        style={{ left, top, width, height }}
                        className={cn(
                          "absolute text-xs font-bold border flex flex-col items-center justify-center transition-all p-2 select-none focus:outline-none z-10",
                          isRound ? "rounded-full" : "rounded-none",
                          isSelected 
                            ? "bg-[#005d2f]/30 border-[#BC9B6A] text-[#BC9B6A] shadow-[0_0_15px_rgba(188,155,106,0.5)] scale-[1.03] z-20" 
                            : isFree
                              ? "bg-emerald-950/10 border-emerald-500/40 text-emerald-400 hover:border-[#BC9B6A] hover:bg-emerald-950/20"
                              : table.status === 'RESERVED'
                                ? "bg-sky-955/10 border-sky-500/40 text-sky-400 hover:bg-sky-955/20"
                                : "bg-amber-955/10 border-amber-500/40 text-amber-400 hover:bg-amber-955/20"
                        )}
                      >
                        <span className="truncate max-w-full leading-none">{table.name}</span>
                        <span className="text-[9px] opacity-75 font-normal mt-1">({table.capacity}p)</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-650 text-xs font-semibold">
                    No tables found.
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-900">
              <Button
                onClick={() => {
                  setIsPlanOpen(false);
                  handleBrowseMenu();
                }}
                className="w-full sm:flex-1 h-12 bg-[#005d2f] text-[#F1F6E7] border border-[#BC9B6A] hover:bg-[#005d2f]/90 transition-all font-serif font-bold text-xs uppercase tracking-widest rounded-none shadow-md"
              >
                <span>Browse Menu & Order</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>

              {isInstallable && !isInstalled && (
                <Button
                  variant="outline"
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full sm:w-auto h-12 rounded-none border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-[10px] font-bold uppercase tracking-widest px-6"
                >
                  {installing ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Download className="size-3.5 mr-1.5" />}
                  Install App
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer & Subtle Staff Portal Link */}
      <footer className="relative z-10 py-10 text-center border-t border-[#BC9B6A]/10 flex flex-col items-center gap-3 bg-zinc-950/20">
        <p className="text-[9px] text-zinc-650 font-bold tracking-widest uppercase select-none font-sans">
          &copy; {new Date().getFullYear()} {restaurantName}. Powered by Antigravity OS
        </p>
        
        {/* Subtle, low-contrast Staff Portal link */}
        <button 
          onClick={() => router.push('/management')}
          className="text-[8px] text-zinc-700 hover:text-[#BC9B6A] transition-colors font-bold tracking-widest uppercase"
        >
          Staff Portal Access
        </button>
      </footer>
    </div>
  );
}
