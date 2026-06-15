'use client';

import { useState, useEffect, useMemo } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useBranding } from '@/stores/branding-store';
import { useT, useLocale } from '@/stores/locale-store';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TABLE_STATUS_COLORS } from '@/lib/constants';
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

// 30-minute reservation time slots
const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
];

function getTableCoords(table: TableInfo) {
  let width = table.width;
  let height = table.height;

  // Grid coordinates mapping (translation from 0-10 index to pixel space)
  if (table.x <= 10 && table.y <= 10) {
    width = table.shape === 'RECTANGLE' ? 140 : 110;
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

  // Keep it bounded
  posX = Math.round(Math.min(posX, zone.x + zone.w - width - 20));
  posY = Math.round(Math.min(posY, zone.y + zone.h - height - 20));

  return { x: posX, y: posY, w: width, h: height };
}

export default function LandingPage() {
  const router = useRouter();
  const t = useT();
  const activeLocale = useLocale();
  const { toast } = useToast();
  
  const { logoText, logoIconType, logoEmoji, logoUrl, restaurantName, brandColor } = useBranding();
  const { isInstallable, isInstalled, install } = usePwaInstall();

  // State management
  const [activeTab, setActiveTab] = useState<'plan' | 'reserve'>('plan');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);

  // 3D Parallax Rotation State
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

  // Calculate table availability based on chosen Date & Time
  const tableAvailability = useMemo(() => {
    if (!resDate || !resTime) return {};

    const selectedDateTime = new Date(`${resDate}T${resTime}:00`);
    const selectionTimeMs = selectedDateTime.getTime();
    const twoHoursMs = 120 * 60 * 1000;

    const availabilityMap: Record<string, { available: boolean; reason?: string }> = {};

    // Default all active tables as available
    tables.forEach(table => {
      availabilityMap[table.id] = { available: true };
    });

    // Check reservations for overlaps
    reservations.forEach(res => {
      if (!res.tableId || res.status === 'CANCELLED') return;

      const resDateOnly = res.reservationDate.split('T')[0];
      if (resDateOnly !== resDate) return;

      const resTimeStr = res.reservationTime;
      const resDateTime = new Date(`${resDateOnly}T${resTimeStr}:00`);
      const resTimeMs = resDateTime.getTime();

      // If existing reservation is within a 2-hour window, the table is blocked
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

  // Handle 3D Parallax Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Tilt limit to 12 degrees
    const rX = -(mouseY / height) * 12;
    const rY = (mouseX / width) * 12;
    setRotate({ x: rX, y: rY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleBrowseMenu = () => {
    const table = tables.find(t => t.id === selectedTableId);
    if (!table) return;
    router.push(`/table/${table.number}`);
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
      // Find an available table if 'any' is selected
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

      // Convert date to ISO string
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
        title: 'Success!',
        description: 'Your reservation has been booked and confirmed.',
      });

      // Reset form
      setResName('');
      setResPhone('');
      setResEmail('');
      setResNotes('');
      setResTableId('any');
      
      // Reload reservations
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
        <span className="text-6xl sm:text-7xl filter drop-shadow-[0_10px_15px_var(--color-emerald-500)] animate-bounce-slow">
          {logoEmoji}
        </span>
      );
    }
    if (logoIconType === 'url' && logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt={restaurantName} 
          className="h-20 w-auto object-contain filter drop-shadow-[0_10px_15px_var(--color-emerald-500)]" 
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/20 border-2 border-primary text-primary font-black text-3xl tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] select-none">
        {logoText || 'GF'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative flex flex-col justify-between overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic 3D ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,_var(--color-emerald-500)_0%,_transparent_60%)] opacity-[0.08] pointer-events-none z-0" />
      <div className="absolute top-[35%] left-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900/60">
        <div className="flex items-center gap-3">
          {logoIconType === 'url' && logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-xl font-black text-primary tracking-wider">{logoText || 'GF'}</span>
          )}
          <span className="font-extrabold text-sm tracking-tight text-zinc-300">
            {restaurantName}
          </span>
        </div>
        <LanguageSwitcher variant="flag-only" />
      </header>

      {/* Hero & Interactive Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center justify-center">
        
        {/* Left Side: 3D Animated Hero & Address */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          
          {/* Glowing Prominent Logo */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl group-hover:bg-primary/35 transition-all rounded-full" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="relative z-10 p-2"
            >
              {renderLogo()}
            </motion.div>
          </div>

          {/* Heading Description */}
          <div className="space-y-4 max-w-lg">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-100 leading-tight"
            >
              Welcome to <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {restaurantName}
              </span>
            </motion.h1>
            <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
              {t.landing.tagline}
            </p>
          </div>

          {/* Interactive Dynamic Location Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 backdrop-blur-md shadow-lg flex flex-col gap-4 text-left"
          >
            <div className="flex gap-3">
              <div className="p-2 h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <MapPin className="size-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Our Address</h3>
                <p className="text-xs font-semibold text-zinc-200 mt-1">{getAddress(activeLocale)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/80 pt-4 text-[10px] text-zinc-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span>+351 210 987 654</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-primary shrink-0" />
                <span>info@gildedfork.com</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive Tabs UI with 3D Tilt Card */}
        <div className="lg:col-span-7 w-full max-w-2xl">
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full bg-zinc-900/40 border border-zinc-800 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden"
          >
            {/* Header Tabs */}
            <div className="grid grid-cols-2 border-b border-zinc-850 p-2 bg-zinc-950/20">
              <button
                onClick={() => setActiveTab('plan')}
                className={cn(
                  "py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  activeTab === 'plan' 
                    ? "bg-zinc-800 text-zinc-100 shadow-inner" 
                    : "text-zinc-500 hover:text-zinc-350"
                )}
              >
                <Map className="size-4" />
                <span>Interactive Table Plan</span>
              </button>
              <button
                onClick={() => setActiveTab('reserve')}
                className={cn(
                  "py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  activeTab === 'reserve' 
                    ? "bg-zinc-800 text-zinc-100 shadow-inner" 
                    : "text-zinc-500 hover:text-zinc-355"
                )}
              >
                <Calendar className="size-4" />
                <span>Book Table Online</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-8 min-h-[440px] flex flex-col justify-between">
              
              {/* Plan Tab */}
              {activeTab === 'plan' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h2 className="text-base font-bold text-zinc-100">Visual Restaurant Layout</h2>
                        <p className="text-[10px] text-zinc-550 mt-0.5">Click any free table (green) to select it.</p>
                      </div>
                      
                      {/* Map Status Legends */}
                      <div className="flex gap-3 text-[9px] font-bold text-zinc-400">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>Free</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          <span>Seated</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                          <span>Reserved</span>
                        </div>
                      </div>
                    </div>

                    {/* Floor Plan Viewport */}
                    <div className="relative w-full aspect-[3/2] rounded-2xl bg-zinc-950 border border-zinc-850 overflow-hidden shadow-inner bg-[radial-gradient(zinc-900_1px,transparent_1px)] bg-[size:16px_16px]">
                      {/* Section Grid Dividers */}
                      <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-zinc-900/60 pointer-events-none z-0" />
                      <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-zinc-900/60 pointer-events-none z-0" />
                      
                      {/* Section Labels */}
                      <div className="absolute top-3.5 left-4 text-[9px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                        {t.floorPlan.mainDining}
                      </div>
                      <div className="absolute top-3.5 right-4 text-[9px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                        {t.floorPlan.bar}
                      </div>
                      <div className="absolute bottom-3.5 left-4 text-[9px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                        {t.floorPlan.patio}
                      </div>
                      <div className="absolute bottom-3.5 right-4 text-[9px] font-black uppercase text-zinc-700 tracking-widest pointer-events-none select-none z-0">
                        {t.floorPlan.vip}
                      </div>

                      {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500 text-xs">
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <span>Loading floor map...</span>
                        </div>
                      ) : tables.length > 0 ? (
                        tables.map((table) => {
                          const isFree = table.status === 'FREE';
                          const isSelected = selectedTableId === table.id;
                          
                          // Style based on table shape
                          const isRound = table.shape === 'ROUND';

                          // Absolute position percent calculations translating grid coordinates if needed
                          const coords = getTableCoords(table);
                          const left = `${(coords.x / 1200) * 100}%`;
                          const top = `${(coords.y / 800) * 100}%`;
                          const width = `${(coords.w / 1200) * 100}%`;
                          const height = `${(coords.h / 800) * 100}%`;

                          return (
                            <button
                              key={table.id}
                              onClick={() => setSelectedTableId(table.id)}
                              style={{ left, top, width, height }}
                              className={cn(
                                "absolute text-[9px] font-black border flex flex-col items-center justify-center transition-all p-1 select-none focus:outline-none z-10",
                                isRound ? "rounded-full" : "rounded-lg",
                                isSelected 
                                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_var(--color-emerald-500)] scale-[1.03] z-20" 
                                  : isFree
                                    ? "bg-emerald-950/10 border-emerald-500/40 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-950/20"
                                    : table.status === 'RESERVED'
                                      ? "bg-sky-955/10 border-sky-500/40 text-sky-400 hover:border-sky-450 hover:bg-sky-955/20"
                                      : "bg-amber-955/10 border-amber-500/40 text-amber-400 hover:border-amber-450 hover:bg-amber-955/20"
                              )}
                            >
                              <span className="truncate max-w-full leading-none">{table.name}</span>
                              <span className="text-[8px] opacity-75 font-normal mt-0.5">({table.capacity}p)</span>
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

                  <div className="space-y-4 pt-4 border-t border-zinc-850">
                    <Button
                      disabled={!selectedTableId}
                      onClick={handleBrowseMenu}
                      className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/15 group disabled:opacity-40 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:border-zinc-850 disabled:shadow-none disabled:pointer-events-none"
                    >
                      <span>{t.landing.viewMenuBtn}</span>
                      <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>

                    {/* Guest App PWA Installer */}
                    {isInstallable && !isInstalled && (
                      <Button
                        variant="outline"
                        onClick={handleInstall}
                        disabled={installing}
                        className="w-full h-9 rounded-xl border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-[10px] font-bold"
                      >
                        {installing ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Download className="size-3.5 mr-1.5" />}
                        {t.landing.installGuestBtn}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Reserve Tab */}
              {activeTab === 'reserve' && (
                <form onSubmit={handleCreateReservation} className="space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-bold text-zinc-100">Book Your Table</h2>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Dynamic table check confirms booking instantly.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t.reservations.guestName}</label>
                        <Input
                          type="text"
                          required
                          placeholder="Marco Rossi"
                          value={resName}
                          onChange={e => setResName(e.target.value)}
                          className="bg-zinc-950/40 border-zinc-800 h-9 rounded-lg text-xs placeholder:text-zinc-600 focus-visible:ring-primary/45"
                        />
                      </div>
                      
                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t.reservations.phone}</label>
                        <Input
                          type="tel"
                          placeholder="+351 912 345 678"
                          value={resPhone}
                          onChange={e => setResPhone(e.target.value)}
                          className="bg-zinc-950/40 border-zinc-800 h-9 rounded-lg text-xs placeholder:text-zinc-600 focus-visible:ring-primary/45"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Date */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t.reservations.date}</label>
                        <Input
                          type="date"
                          required
                          value={resDate}
                          onChange={e => setResDate(e.target.value)}
                          className="bg-zinc-950/40 border-zinc-800 h-9 rounded-lg text-xs focus-visible:ring-primary/45"
                        />
                      </div>

                      {/* Time Slot */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t.reservations.time}</label>
                        <Select value={resTime} onValueChange={setResTime}>
                          <SelectTrigger className="bg-zinc-950/40 border-zinc-800 h-9 rounded-lg text-xs text-zinc-200">
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
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t.reservations.partySize}</label>
                        <Select value={resGuests} onValueChange={setResGuests}>
                          <SelectTrigger className="bg-zinc-950/40 border-zinc-800 h-9 rounded-lg text-xs text-zinc-200">
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

                    <div className="grid grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email (Optional)</label>
                        <Input
                          type="email"
                          placeholder="client@gildedfork.com"
                          value={resEmail}
                          onChange={e => setResEmail(e.target.value)}
                          className="bg-zinc-950/40 border-zinc-800 h-9 rounded-lg text-xs placeholder:text-zinc-600 focus-visible:ring-primary/45"
                        />
                      </div>

                      {/* Preferred Available Table Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Table (Optional)</label>
                        <Select value={resTableId} onValueChange={setResTableId}>
                          <SelectTrigger className="bg-zinc-950/40 border-zinc-800 h-9 rounded-lg text-xs text-zinc-200">
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
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t.reservations.notes}</label>
                      <Textarea
                        placeholder="Allergies, high chair, window table, birthday..."
                        value={resNotes}
                        onChange={e => setResNotes(e.target.value)}
                        className="bg-zinc-950/40 border-zinc-800 rounded-lg text-xs placeholder:text-zinc-650 h-16 min-h-16 max-h-16 focus-visible:ring-primary/45"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-850">
                    <Button
                      type="submit"
                      disabled={submittingRes}
                      className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/15"
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
                  </div>
                </form>
              )}

            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer & Subtle Staff Portal Link */}
      <footer className="relative z-10 py-8 text-center border-t border-zinc-900/40 flex flex-col items-center gap-3">
        <p className="text-[10px] text-zinc-650 font-semibold tracking-wide uppercase select-none">
          &copy; {new Date().getFullYear()} {restaurantName}. Powered by Antigravity OS
        </p>
        
        {/* Subtle, low-contrast Staff Portal link */}
        <button 
          onClick={() => router.push('/management')}
          className="text-[9px] text-zinc-700 hover:text-zinc-400 transition-colors font-bold tracking-wider uppercase"
        >
          Staff Portal Access
        </button>
      </footer>
    </div>
  );
}
