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
  ArrowRight,
  Map,
  Plus,
  Minus,
  Coffee,
  Menu as MenuIcon,
  X,
  Globe,
  Award,
  Heart,
  CheckCircle2,
  Star,
  MessageSquarePlus,
  UserCircle2,
  ShoppingBag,
  Search
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
import { TRANSLATIONS as CC_TRANSLATIONS, TESTIMONIES_LOCALIZED as CC_TESTIMONIES } from '@/lib/i18n/cafe-creme-translations';

// Seating Plan Table Structures
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

interface DBReservation {
  id: string;
  tableId: string | null;
  guestName: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: string;
}

// Menu structures returned from Gilded Fork Database
interface DBExtra {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

interface DBMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  isAvailable: boolean;
  isPopular: boolean;
  imageUrl: string | null;
  allergies: string | null;
  extras: DBExtra[];
}

interface DBMenuCategory {
  id: string;
  name: string;
  icon: string | null;
  items: DBMenuItem[];
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

  // Scrollspy & Nav header sticky state
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Seating Zoom state
  const [zoom, setZoom] = useState(0.85);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // Core Data States
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [reservations, setReservations] = useState<DBReservation[]>([]);
  const [dbMenuCategories, setDbMenuCategories] = useState<DBMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Reviews list state
  const [reviews, setReviews] = useState<any[]>([]);

  // Testimonials rating inputs
  const [revAuthor, setRevAuthor] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revRole, setRevRole] = useState('Visitor');
  const [revSuccess, setRevSuccess] = useState(false);

  // Menu Section State
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCustomizerItem, setActiveCustomizerItem] = useState<DBMenuItem | null>(null);

  // Live order custom tickets state
  const [customTickets, setCustomTickets] = useState<any[]>([]);
  const [customMilk, setCustomMilk] = useState('Standard');
  const [customSweet, setCustomSweet] = useState('Medium');
  const [customAddons, setCustomAddons] = useState<string[]>([]);
  const [customQty, setCustomQty] = useState(1);

  // Booking Form State
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
  const [submittingRes, setSubmittingRes] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any | null>(null);

  // Bridge locale strings from Gilded Fork store into Café Crème i18n
  const ccLang = useMemo(() => {
    if (activeLocale.startsWith('pt')) return 'pt';
    if (activeLocale.startsWith('es')) return 'es';
    if (activeLocale.startsWith('fr')) return 'fr';
    return 'en';
  }, [activeLocale]);

  const ccT = useMemo(() => {
    return CC_TRANSLATIONS[ccLang];
  }, [ccLang]);

  // Load reviews initial testimonies
  useEffect(() => {
    setReviews(CC_TESTIMONIES[ccLang] || CC_TESTIMONIES.en);
  }, [ccLang]);

  // Setup scroll event listeners
  useEffect(() => {
    const handleScroll = () => {
      // Header solid background
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Scroll Spy section highlight
      const sections = ['hero', 'about', 'menu', 'reservation', 'feedback'];
      const scrollPosition = window.scrollY + 220;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
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

  // Detect iOS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(ios);
    }
  }, []);

  // Fetch tables, reservations, and menu categories
  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/tables').then(res => res.json()),
      fetch('/api/reservations').then(res => res.json()),
      fetch('/api/menu').then(res => res.json())
    ])
      .then(([tablesData, reservationsData, menuCategoriesData]) => {
        if (Array.isArray(tablesData)) {
          setTables(tablesData.filter((tbl: any) => tbl.active));
        }
        if (Array.isArray(reservationsData)) {
          setReservations(reservationsData);
        }
        if (Array.isArray(menuCategoriesData)) {
          setDbMenuCategories(menuCategoriesData);
        }
      })
      .catch(err => {
        console.error('Error loading Gilded Fork dataset:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-fit interactive inline map
  const handleAutoFitMap = () => {
    if (canvasWrapperRef.current) {
      const parentWidth = canvasWrapperRef.current.clientWidth;
      const computedScale = Math.min(1.0, parentWidth / 1210);
      setZoom(Math.max(0.4, computedScale));
    }
  };

  useEffect(() => {
    handleAutoFitMap();
    window.addEventListener('resize', handleAutoFitMap);
    return () => window.removeEventListener('resize', handleAutoFitMap);
  }, [tables]);

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

  const activeTableName = useMemo(() => {
    const selected = tables.find(t => t.id === selectedTableId);
    return selected ? selected.name : null;
  }, [tables, selectedTableId]);

  // Submit Reservation POST
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId) {
      toast({
        title: 'Table Required',
        description: ccT.resAlertErrorTable,
        variant: 'destructive'
      });
      return;
    }
    if (!resName.trim() || !resPhone.trim() || !resEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: ccT.resAlertErrorContact,
        variant: 'destructive'
      });
      return;
    }

    setSubmittingRes(true);

    try {
      const dateIso = new Date(`${resDate}T12:00:00.000Z`).toISOString();

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: resName,
          guestPhone: resPhone,
          guestEmail: resEmail,
          partySize: Number(resGuests),
          reservationDate: dateIso,
          reservationTime: resTime,
          tableId: selectedTableId,
          notes: resNotes || null,
          status: 'CONFIRMED'
        })
      });

      if (!res.ok) throw new Error('Failed to save reservation');
      
      const newReservationRecord = await res.json();
      
      toast({
        title: 'Booking Confirmed!',
        description: 'Your table has been reserved successfully.',
      });

      // Display reservation ticket pass receipt
      setBookingConfirmation({
        id: newReservationRecord.id || `GF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: resName,
        email: resEmail,
        phone: resPhone,
        date: resDate,
        time: resTime,
        partySize: Number(resGuests),
        tableName: activeTableName,
        notes: resNotes
      });

      // Reset form fields
      setResName('');
      setResPhone('');
      setResEmail('');
      setResNotes('');
      setSelectedTableId('');
      
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

  // Review Form Submit (client-side append)
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revAuthor || !revComment) {
      toast({
        title: 'Form Error',
        description: 'Please write your name and review comment.',
        variant: 'destructive'
      });
      return;
    }

    const newRev = {
      id: `t-${Date.now()}`,
      author: revAuthor,
      rating: revRating,
      comment: revComment,
      date: new Date().toLocaleDateString(activeLocale, { day: 'numeric', month: 'long', year: 'numeric' }),
      role: revRole
    };

    setReviews([newRev, ...reviews]);
    setRevAuthor('');
    setRevComment('');
    setRevRating(5);
    setRevRole('Visitor');
    setRevSuccess(true);

    setTimeout(() => {
      setRevSuccess(false);
    }, 4000);
  };

  // Menu Customizer configuration
  const handleOpenCustomizer = (item: DBMenuItem) => {
    setActiveCustomizerItem(item);
    setCustomMilk(item.type === 'DRINK' ? 'Standard' : 'None');
    setCustomSweet('Medium');
    setCustomAddons([]);
    setCustomQty(1);
  };

  const handleAddonToggle = (addonName: string) => {
    if (customAddons.includes(addonName)) {
      setCustomAddons(customAddons.filter(a => a !== addonName));
    } else {
      setCustomAddons([...customAddons, addonName]);
    }
  };

  const currentCustomPrice = useMemo(() => {
    if (!activeCustomizerItem) return 0;
    let base = activeCustomizerItem.price;
    // Standard milk adds no charge, specialty milks add 0.60
    if (customMilk !== 'Standard' && customMilk !== 'None') base += 0.60;
    
    // Add premium price offsets from Gilded Fork database extra addons selected
    customAddons.forEach(addonName => {
      const matchedExtra = activeCustomizerItem.extras.find(ext => ext.name === addonName);
      if (matchedExtra) {
        base += matchedExtra.price;
      }
    });

    return base * customQty;
  }, [activeCustomizerItem, customMilk, customAddons, customQty]);

  const handleCreateOrderTicket = () => {
    if (!activeCustomizerItem) return;
    const newTicket = {
      id: Math.random().toString(36).substr(2, 9),
      item: activeCustomizerItem,
      milk: customMilk,
      sweetness: customSweet,
      addons: [...customAddons],
      quantity: customQty,
      totalPrice: currentCustomPrice,
    };
    setCustomTickets([newTicket, ...customTickets]);
    setActiveCustomizerItem(null);
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

  // Compile full menu items listing with filters applied
  const filteredMenuItems = useMemo(() => {
    let list: DBMenuItem[] = [];
    dbMenuCategories.forEach(cat => {
      if (selectedCategory === 'all' || cat.id === selectedCategory) {
        list = [...list, ...cat.items];
      }
    });

    return list.filter(item => {
      const searchMatch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));
      const tagMatch = !selectedTag || (selectedTag === 'Popular' && item.isPopular);
      return searchMatch && tagMatch;
    });
  }, [dbMenuCategories, selectedCategory, menuSearch, selectedTag]);

  return (
    <div className="min-h-screen bg-zinc-955 text-zinc-100 font-sans relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Dynamic Brand Gradient Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,_var(--primary)_0%,_transparent_75%)] opacity-[0.25] pointer-events-none z-0" />
      <div className="absolute top-[15%] left-[5%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[450px] h-[450px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Notification Promo Bar */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 text-emerald-400 text-[9px] sm:text-xs font-mono uppercase tracking-[0.2em] py-3 text-center relative z-50 px-4 border-b border-emerald-500/10">
        <span>{ccT.awardBadge}</span>
      </div>

      {/* Sticky Premium Navigation Header */}
      <header
        className={`fixed top-12 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-zinc-950/95 backdrop-blur-md shadow-lg border-b border-emerald-500/10 py-3'
            : 'bg-gradient-to-b from-zinc-950/80 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => handleSmoothScroll('hero')}
            className="flex items-center space-x-2 group focus:outline-none text-left"
          >
            {logoIconType === 'url' && logoUrl ? (
              <img src={logoUrl} alt="logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="bg-emerald-500 text-zinc-950 p-2 rounded-full transition-transform duration-300 group-hover:rotate-12">
                <Coffee className="h-4 w-4" />
              </div>
            )}
            <div>
              <span className="font-serif text-lg font-extrabold tracking-wide text-zinc-100 bg-gradient-to-r from-zinc-100 to-emerald-400 bg-clip-text text-transparent">
                {restaurantName}
              </span>
              <p className="text-[8px] uppercase tracking-[0.2em] text-emerald-400 font-mono">{ccT.logoSubtitle || 'Fine Dining'}</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => handleSmoothScroll('hero')}
              className={`font-sans text-xs tracking-widest uppercase transition-colors duration-200 hover:text-emerald-300 ${
                activeSection === 'hero' ? 'text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navHero}
            </button>
            <button
              onClick={() => handleSmoothScroll('about')}
              className={`font-sans text-xs tracking-widest uppercase transition-colors duration-200 hover:text-emerald-300 ${
                activeSection === 'about' ? 'text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navHistory}
            </button>
            <button
              onClick={() => handleSmoothScroll('menu')}
              className={`font-sans text-xs tracking-widest uppercase transition-colors duration-200 hover:text-emerald-300 ${
                activeSection === 'menu' ? 'text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navMenu}
            </button>
            <button
              onClick={() => handleSmoothScroll('reservation')}
              className={`font-sans text-xs tracking-widest uppercase transition-colors duration-200 hover:text-emerald-300 ${
                activeSection === 'reservation' ? 'text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navReservations}
            </button>
            <button
              onClick={() => handleSmoothScroll('feedback')}
              className={`font-sans text-xs tracking-widest uppercase transition-colors duration-200 hover:text-emerald-300 ${
                activeSection === 'feedback' ? 'text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navFeedback}
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher variant="flag-only" />

            <button
              onClick={handleBrowseMenu}
              className="px-5 py-2.5 bg-transparent border border-emerald-500/35 hover:bg-emerald-500/10 text-emerald-400 rounded-full font-sans text-xs uppercase font-extrabold tracking-wider transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="size-3.5" />
              <span>{ccT.orderOnline || 'Order Online'}</span>
            </button>

            <button
              onClick={() => handleSmoothScroll('reservation')}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-zinc-950 rounded-full font-sans text-xs uppercase font-extrabold tracking-wider transition-all duration-300 shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
              style={{ color: 'var(--primary-foreground)' }}
            >
              {ccT.reserveTableBtn}
            </button>
          </div>

          {/* Mobile Menu Icon Switcher */}
          <div className="flex items-center space-x-3 md:hidden">
            <LanguageSwitcher variant="flag-only" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-zinc-200 hover:bg-zinc-900 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-screen bg-zinc-950 border-b border-emerald-500/10' : 'max-h-0'
          }`}
        >
          <div className="px-4 pt-2 pb-6 space-y-1 mt-2">
            <button
              onClick={() => handleSmoothScroll('hero')}
              className={`block w-full text-left px-4 py-3 rounded-md text-sm font-sans tracking-wider uppercase ${
                activeSection === 'hero' ? 'bg-zinc-900 text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navHero}
            </button>
            <button
              onClick={() => handleSmoothScroll('about')}
              className={`block w-full text-left px-4 py-3 rounded-md text-sm font-sans tracking-wider uppercase ${
                activeSection === 'about' ? 'bg-zinc-900 text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navHistory}
            </button>
            <button
              onClick={() => handleSmoothScroll('menu')}
              className={`block w-full text-left px-4 py-3 rounded-md text-sm font-sans tracking-wider uppercase ${
                activeSection === 'menu' ? 'bg-zinc-900 text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navMenu}
            </button>
            <button
              onClick={() => handleSmoothScroll('reservation')}
              className={`block w-full text-left px-4 py-3 rounded-md text-sm font-sans tracking-wider uppercase ${
                activeSection === 'reservation' ? 'bg-zinc-900 text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navReservations}
            </button>
            <button
              onClick={() => handleSmoothScroll('feedback')}
              className={`block w-full text-left px-4 py-3 rounded-md text-sm font-sans tracking-wider uppercase ${
                activeSection === 'feedback' ? 'bg-zinc-900 text-emerald-400 font-bold' : 'text-zinc-200'
              }`}
            >
              {ccT.navFeedback}
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleBrowseMenu();
              }}
              className="block w-full text-left px-4 py-3 rounded-md text-sm font-sans tracking-wider uppercase text-emerald-400 font-bold flex items-center gap-2"
            >
              <ShoppingBag className="size-4" />
              <span>{ccT.orderOnline || 'Order Online'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Luxury Sections Page Stack */}
      <main className="flex-grow">
        
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1800&auto=format&fit=crop"
              alt="Cozy interior environment"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.35] contrast-[1.05]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-transparent to-zinc-950/30" />
          </div>

          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-32 pb-16 text-center lg:text-left flex flex-col justify-center min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-8 space-y-6">
                {/* Active Opening Hours Status Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-zinc-900/40 backdrop-blur-md rounded-full border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{ccT.openBadge}</span>
                </div>

                {/* Elegant Display Title */}
                <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-zinc-50 leading-[1.1] tracking-tight">
                  {restaurantName} <br />
                  <span className="italic text-zinc-300 bg-gradient-to-r from-zinc-100 to-emerald-400 bg-clip-text text-transparent">
                    {t.landing.tagline}
                  </span>
                </h1>

                {/* Description */}
                <p className="font-sans text-zinc-300 text-sm sm:text-lg max-w-xl leading-relaxed mx-auto lg:mx-0">
                  {ccT.heroDesc}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <button
                    onClick={handleBrowseMenu}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-zinc-950 font-extrabold uppercase tracking-wider text-xs rounded-full transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center space-x-2 group active:scale-95 cursor-pointer"
                    style={{ color: 'var(--primary-foreground)' }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{ccT.orderOnline || 'Order Online'}</span>
                  </button>

                  <button
                    onClick={() => handleSmoothScroll('menu')}
                    className="w-full sm:w-auto px-8 py-4 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 border border-zinc-800 hover:border-zinc-750 font-semibold uppercase tracking-wider text-xs rounded-full transition-all duration-300 flex items-center justify-center space-x-2 group active:scale-95 cursor-pointer"
                  >
                    <span>{ccT.heroCtaMenu}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => handleSmoothScroll('reservation')}
                    className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-zinc-900/50 text-zinc-350 border border-zinc-800 hover:border-zinc-700 font-semibold uppercase tracking-wider text-xs rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer"
                  >
                    {ccT.heroCtaReserve}
                  </button>
                </div>

                {/* Quick Trust Statistics */}
                <div className="grid grid-cols-3 gap-4 pt-10 border-t border-zinc-900 max-w-md mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <span className="block font-serif text-2xl font-bold text-zinc-100">4.9/5</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">{ccT.heroStatGoogle}</span>
                  </div>
                  <div className="text-center lg:text-left">
                    <span className="block font-serif text-2xl font-bold text-zinc-100">100%</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">{ccT.heroStatHomemade}</span>
                  </div>
                  <div className="text-center lg:text-left">
                    <span className="block font-serif text-2xl font-bold text-zinc-100">Bespoke</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">{ccT.heroStatAtmosphere}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Chef's Special Card */}
              <div className="lg:col-span-4 hidden lg:block">
                <div className="relative group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/70 p-4 backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/35">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=900&auto=format&fit=crop"
                      alt="Signature Dry-Aged Tomahawk Steak"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/20">
                      <p className="text-[9px] uppercase tracking-widest font-mono text-emerald-400 font-bold">{ccT.seasonalSelection}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-left">
                    <h3 className="font-serif text-base font-bold text-zinc-100">{ccT.seasonalItemTitle}</h3>
                    <p className="text-xs font-sans text-zinc-400 mt-1">{ccT.seasonalItemDesc}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-emerald-400 text-xs font-bold">89.00€</span>
                      <button 
                        onClick={() => handleSmoothScroll('menu')}
                        className="text-[10px] uppercase tracking-wider font-mono text-zinc-300 hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {ccT.viewMenuLink}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* ABOUT / HISTOIRE SECTION */}
        {/* ============================================================ */}
        <section id="about" className="py-24 bg-zinc-900 text-zinc-100 relative overflow-hidden">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="about-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#about-grid)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Image Cluster */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 transition-transform duration-500 hover:scale-[1.02] aspect-square relative group">
                    <img
                      src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop"
                      alt="Barista crafting drink"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 transition-transform duration-500 hover:scale-[1.02] aspect-[3/4] relative group">
                    <img
                      src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"
                      alt="Fresh gourmet baked artisan selection"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-8">
                  <div className="overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 transition-transform duration-500 hover:scale-[1.02] aspect-[3/4] relative group">
                    <img
                      src="https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?q=80&w=600&auto=format&fit=crop"
                      alt="Cosy dining setup"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 transition-transform duration-500 hover:scale-[1.02] aspect-square relative group">
                    <img
                      src="https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop"
                      alt="Brunch selection"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Story and values */}
              <div className="lg:col-span-6 space-y-8 text-left">
                <div className="space-y-4">
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest block">{ccT.aboutLabel}</span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">
                    {ccT.aboutTitle}
                  </h2>
                  <div className="w-20 h-1 bg-emerald-500 rounded-full" />
                </div>

                <p className="font-sans text-zinc-300 text-base leading-relaxed">
                  {ccT.aboutText1}
                </p>
                
                <p className="font-sans text-zinc-300 text-base leading-relaxed">
                  {ccT.aboutText2}
                </p>

                {/* Values Stack */}
                <div className="space-y-6 pt-4 border-t border-zinc-850">
                  <div className="flex gap-4 items-start">
                    <div className="bg-zinc-850 p-2.5 rounded-xl border border-zinc-800 shrink-0 text-emerald-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-zinc-100 leading-snug">{ccT.aboutValTitle1}</h4>
                      <p className="font-sans text-xs text-zinc-400 mt-1">{ccT.aboutValDesc1}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-zinc-850 p-2.5 rounded-xl border border-zinc-800 shrink-0 text-emerald-400">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-zinc-100 leading-snug">{ccT.aboutValTitle2}</h4>
                      <p className="font-sans text-xs text-zinc-400 mt-1">{ccT.aboutValDesc2}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-zinc-850 p-2.5 rounded-xl border border-zinc-800 shrink-0 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-zinc-100 leading-snug">{ccT.aboutValTitle3}</h4>
                      <p className="font-sans text-xs text-zinc-400 mt-1">{ccT.aboutValDesc3}</p>
                    </div>
                  </div>
                </div>

                {/* Founder Quote */}
                <div className="pt-4 flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-emerald-500">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
                      alt="Clarisse Mercier"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="font-serif italic text-sm text-zinc-100 font-bold">"{ccT.authorQuote}"</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 mt-0.5">{ccT.authorTitle}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* MENU SECTION */}
        {/* ============================================================ */}
        <section id="menu" className="py-24 bg-zinc-950 text-zinc-100 relative">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Heading */}
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest block">{ccT.menuLabel}</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">
                {ccT.menuTitle}
              </h2>
              <p className="font-sans text-zinc-300 text-sm sm:text-base leading-relaxed">
                {ccT.menuDesc}
              </p>
              <div className="w-20 h-1 bg-emerald-500 rounded-full mx-auto" />
            </div>

            {/* Live customizer tickets lists - if any are created */}
            {customTickets.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 bg-zinc-900 border border-emerald-500/20 p-6 rounded-none text-left"
              >
                <div className="flex items-center space-x-2 mb-4 text-emerald-400">
                  <ShoppingBag className="w-5 h-5" />
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider">{ccT.orderTicketsTitle}</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-6">{ccT.orderTicketsDesc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customTickets.map(tkt => (
                    <div key={tkt.id} className="border border-zinc-800 bg-zinc-950 p-5 relative rounded-none flex flex-col justify-between">
                      <button 
                        onClick={() => setCustomTickets(customTickets.filter(x => x.id !== tkt.id))}
                        className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <div className="border-b border-dashed border-zinc-800 pb-2">
                          <h4 className="font-serif text-sm font-bold text-zinc-100">{tkt.item.name}</h4>
                          <span className="text-[10px] font-mono text-emerald-400">Qty: {tkt.quantity}</span>
                        </div>
                        
                        <div className="space-y-1 text-xs text-zinc-400 font-sans">
                          {tkt.item.type === 'DRINK' && (
                            <>
                              <p><span className="font-mono text-[10px] text-zinc-500 uppercase">{ccT.orderTicketsOptionMilk || 'Milk:'}</span> {tkt.milk}</p>
                              <p><span className="font-mono text-[10px] text-zinc-500 uppercase">{ccT.orderTicketsOptionSweet || 'Sugar:'}</span> {tkt.sweetness}</p>
                            </>
                          )}
                          {tkt.addons.length > 0 && (
                            <p>
                              <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-0.5">{ccT.orderTicketsOptionAddons || 'Addons:'}</span>
                              <span className="flex flex-wrap gap-1 mt-1">
                                {tkt.addons.map((add: string) => (
                                  <Badge key={add} variant="outline" className="text-[8px] bg-zinc-900 border-zinc-800 text-zinc-300">{add}</Badge>
                                ))}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-dashed border-zinc-800 pt-3 mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-zinc-500">{ccT.orderTicketsTotal}</p>
                          <p className="font-mono text-sm font-extrabold text-emerald-400">{(tkt.totalPrice).toFixed(2)}€</p>
                        </div>
                        <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-[9px]">{ccT.orderTicketsReadySoon || 'Ready in 5m'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Menu Filters Toolbar */}
            <div className="space-y-6 mb-12">
              
              {/* Category selector */}
              <div className="flex flex-wrap justify-center gap-2 border-b border-zinc-900 pb-6">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "px-4 py-2 text-xs uppercase tracking-widest font-mono font-bold transition-all border rounded-full cursor-pointer",
                    selectedCategory === 'all'
                      ? "bg-emerald-500 text-zinc-950 border-emerald-500 font-black shadow-md shadow-emerald-500/10"
                      : "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750"
                  )}
                >
                  {ccT.dietAll}
                </button>
                {dbMenuCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 text-xs uppercase tracking-widest font-mono font-bold transition-all border rounded-full cursor-pointer",
                      selectedCategory === cat.id
                        ? "bg-emerald-500 text-zinc-950 border-emerald-500 font-black shadow-md shadow-emerald-500/10"
                        : "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Search and Tags filtration */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder={ccT.searchPlaceholder || "Search..."}
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full pl-10 pr-8 bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 focus-visible:ring-0 rounded-full h-10 text-xs"
                  />
                  {menuSearch && (
                    <button 
                      onClick={() => setMenuSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-[10px] font-mono"
                    >
                      {ccT.searchClear || 'Clear'}
                    </button>
                  )}
                </div>

                {/* Popularity selection tags */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-mono text-zinc-500 tracking-wider uppercase text-[10px]">{ccT.dietLabel || 'Filter:'}</span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={cn(
                      "px-3 py-1 font-mono text-[10px] tracking-wider uppercase rounded-full cursor-pointer",
                      !selectedTag ? "bg-zinc-900 border border-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedTag('Popular')}
                    className={cn(
                      "px-3 py-1 font-mono text-[10px] tracking-wider uppercase rounded-full cursor-pointer",
                      selectedTag === 'Popular' ? "bg-zinc-900 border border-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    ⭐ Popular
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500 text-xs">
                <Loader2 className="size-6 animate-spin text-emerald-500" />
                <span>Loading Menu Categories...</span>
              </div>
            ) : filteredMenuItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMenuItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="group border border-zinc-900 hover:border-emerald-500/20 bg-zinc-900/30 p-4 transition-all duration-300 flex flex-col justify-between text-left shadow-lg"
                  >
                    <div className="space-y-4">
                      {/* Image panel */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden border border-zinc-800 bg-zinc-955">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-650 bg-zinc-900/40">
                            <Utensils className="w-10 h-10 mb-1" />
                            <span className="text-[10px] uppercase font-mono">Gilded Fork Selection</span>
                          </div>
                        )}
                        
                        {item.isPopular && (
                          <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-zinc-950 font-black font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded shadow">
                            Popular
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-serif text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors leading-snug">{item.name}</h3>
                          <span className="font-mono text-emerald-400 font-extrabold text-sm shrink-0">{(item.price).toFixed(2)}€</span>
                        </div>
                        {item.description && (
                          <p className="font-sans text-zinc-400 text-xs leading-relaxed line-clamp-3">{item.description}</p>
                        )}
                        {item.allergies && (
                          <p className="text-[9px] font-mono text-rose-400 uppercase tracking-widest">{item.allergies}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 mt-4 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{item.type}</span>
                      <button
                        onClick={() => handleOpenCustomizer(item)}
                        className="h-8 px-4 bg-zinc-955 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-955 border border-emerald-500/20 hover:border-emerald-500 transition-all font-mono font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{ccT.addTicketBtn || 'Order'}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-zinc-900 p-6">
                <p className="text-sm text-zinc-500 font-bold">{ccT.emptyStateTitle || 'No menu items found'}</p>
                <p className="text-xs text-zinc-650 mt-1">{ccT.emptyStateDesc || 'Reset filters or try searching something else.'}</p>
                <button 
                  onClick={() => {
                    setMenuSearch('');
                    setSelectedCategory('all');
                    setSelectedTag(null);
                  }}
                  className="mt-4 text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold border-b border-dashed border-emerald-400 pb-0.5 cursor-pointer"
                >
                  {ccT.emptyStateReset || 'Reset filters'}
                </button>
              </div>
            )}

          </div>
        </section>

        {/* ============================================================ */}
        {/* RESERVATION & INLINE SEATING FLOOR PLAN SECTION */}
        {/* ============================================================ */}
        <section id="reservation" className="py-24 bg-zinc-900 border-t border-b border-zinc-900/60 relative">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest block">{ccT.resLabel}</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">
                {ccT.resTitle}
              </h2>
              <p className="font-sans text-zinc-300 text-sm sm:text-base leading-relaxed">
                {ccT.resDesc}
              </p>
              <div className="w-20 h-1 bg-emerald-500 rounded-full mx-auto" />
            </div>

            {bookingConfirmation ? (
              // Booking Confirmation receipt ticket
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto border border-emerald-500/30 bg-zinc-950 p-8 text-left space-y-6 relative shadow-2xl"
              >
                <div className="absolute top-4 right-4 bg-emerald-500 text-zinc-950 font-black font-mono text-[8px] uppercase tracking-widest px-2.5 py-1 flex items-center gap-1 shadow">
                  <Check className="w-3.5 h-3.5" />
                  <span>{ccT.resTicketConfirmed}</span>
                </div>

                <div className="border-b border-zinc-900 pb-4">
                  <h3 className="font-serif text-xl font-bold text-zinc-50">{restaurantName} Pass</h3>
                  <p className="text-[10px] text-zinc-500 mt-1 font-sans">{ccT.resTicketEmailNotice}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs text-sans">
                  <div>
                    <span className="block font-mono text-[10px] text-zinc-500 uppercase">{ccT.resTicketGuest || 'Guest'}</span>
                    <span className="font-semibold text-zinc-200">{bookingConfirmation.name}</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-zinc-500 uppercase">{ccT.resTicketPhone || 'Phone'}</span>
                    <span className="font-semibold text-zinc-200">{bookingConfirmation.phone}</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-zinc-500 uppercase">{ccT.resTicketDateTime || 'Date / Time'}</span>
                    <span className="font-semibold text-zinc-200">{bookingConfirmation.date} • {bookingConfirmation.time}</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-zinc-500 uppercase">{ccT.resTicketSize || 'Party Size'}</span>
                    <span className="font-semibold text-zinc-200">{bookingConfirmation.partySize} {bookingConfirmation.partySize === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-mono text-[10px] text-zinc-500 uppercase">{ccT.resTicketTableSelected || 'Selected Table'}</span>
                    <span className="font-mono text-emerald-400 font-bold uppercase">{bookingConfirmation.tableName || 'Auto-Assigned'}</span>
                  </div>
                  {bookingConfirmation.notes && (
                    <div className="col-span-2">
                      <span className="block font-mono text-[10px] text-zinc-500 uppercase">{t.reservations.notes}</span>
                      <span className="text-zinc-400 italic font-medium leading-relaxed">"{bookingConfirmation.notes}"</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-dashed border-zinc-900 flex justify-between gap-4">
                  <button 
                    onClick={() => setBookingConfirmation(null)}
                    className="w-full py-3 border border-zinc-800 hover:border-zinc-650 hover:bg-zinc-900/30 text-zinc-300 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
                  >
                    {ccT.resTicketAnotherBtn || 'Book another'}
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm('Cancel reservation?')) {
                        try {
                          await fetch(`/api/reservations/${bookingConfirmation.id}`, { method: 'DELETE' });
                          toast({ title: 'Canceled', description: 'Your booking has been cancelled.' });
                          setBookingConfirmation(null);
                          loadData();
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    className="w-full py-3 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
                  >
                    {ccT.resTicketCancelBtn || 'Cancel Booking'}
                  </button>
                </div>
              </motion.div>
            ) : (
              // Booking layout steps
              <form onSubmit={handleCreateReservation} className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                
                {/* Steps left inputs */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Step 1 */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
                    <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-zinc-900 pb-2 text-zinc-200">
                      {ccT.resFormHeader1 || '1. Settings'}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        {ccT.resFormLabelDate || 'Date'}
                      </label>
                      <Input
                        type="date"
                        required
                        value={resDate}
                        onChange={e => setResDate(e.target.value)}
                        className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-emerald-500 focus-visible:ring-0 rounded-none px-0 h-10 text-xs text-zinc-300"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        {ccT.resFormLabelTime || 'Time'}
                      </label>
                      <Select value={resTime} onValueChange={setResTime}>
                        <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-emerald-500 focus:ring-0 rounded-none px-0 h-10 text-xs text-zinc-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-850 text-zinc-300 text-xs">
                          {TIME_SLOTS.map(slot => (
                            <SelectItem key={slot} value={slot} className="cursor-pointer">
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        {ccT.resFormLabelGuests || 'Guests'}
                      </label>
                      <Select value={resGuests} onValueChange={setResGuests}>
                        <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-emerald-500 focus:ring-0 rounded-none px-0 h-10 text-xs text-zinc-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-850 text-zinc-300 text-xs">
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                            <SelectItem key={n} value={n.toString()} className="cursor-pointer">
                              {n} {n === 1 ? t.landing.guestOption : t.landing.guestsOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Step 3: Contacts */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
                    <h3 className="font-serif text-sm font-bold uppercase tracking-wider border-b border-zinc-900 pb-2 text-zinc-200">
                      {ccT.resTicketGuest || '3. Contact Details'}
                    </h3>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        {t.reservations.guestName}
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="Alexandre"
                        value={resName}
                        onChange={e => setResName(e.target.value)}
                        className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-emerald-500 focus-visible:ring-0 rounded-none px-0 h-10 text-xs placeholder:text-zinc-700"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        {t.reservations.phone}
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="+351 912 345 678"
                        value={resPhone}
                        onChange={e => setResPhone(e.target.value)}
                        className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-emerald-500 focus-visible:ring-0 rounded-none px-0 h-10 text-xs placeholder:text-zinc-700"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        {t.landing.emailOptionalLabel}
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="client@gildedfork.com"
                        value={resEmail}
                        onChange={e => setResEmail(e.target.value)}
                        className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-emerald-500 focus-visible:ring-0 rounded-none px-0 h-10 text-xs placeholder:text-zinc-700"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                        {t.reservations.notes}
                      </label>
                      <Textarea
                        placeholder={t.reservations.specialRequestsPlaceholder}
                        value={resNotes}
                        onChange={e => setResNotes(e.target.value)}
                        className="bg-transparent border border-zinc-800 focus:border-emerald-500 rounded-none px-3 py-2 text-xs placeholder:text-zinc-750 h-14 min-h-14 max-h-14"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingRes}
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-500 text-zinc-950 font-black hover:from-emerald-500 hover:to-teal-400 font-serif font-extrabold text-xs uppercase tracking-widest rounded-none mt-2 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                      style={{ color: 'var(--primary-foreground)' }}
                    >
                      {submittingRes ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          <span>{t.landing.bookingLoading}</span>
                        </>
                      ) : (
                        t.landing.bookOnlineResBtn
                      )}
                    </Button>
                  </div>

                </div>

                {/* Seating plan inline container */}
                <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 p-6 flex flex-col items-stretch space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                    <div>
                      <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-zinc-200">
                        {ccT.resFormHeader2 || '2. Seating Plan'}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">{ccT.resFormMapDesc || 'Select your preferred table.'}</p>
                    </div>

                    {/* Floor Plan sizing and zoom bar */}
                    <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 font-mono text-[10px]">
                      <span className="text-[10px] font-bold text-emerald-400 px-2 select-none">
                        {t.landing.zoomLabel}: {Math.round(zoom * 100)}%
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
                        className="size-7 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-955 cursor-pointer"
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setZoom(0.85)}
                        className="h-7 px-2 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-955 cursor-pointer"
                      >
                        Default
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleAutoFitMap}
                        className="h-7 px-2 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-955 cursor-pointer"
                      >
                        {t.landing.fitBtn}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
                        className="size-7 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-955 cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Scrollable grid seating plan canvas */}
                  <div 
                    ref={canvasWrapperRef}
                    className="w-full overflow-auto max-h-[550px] border border-zinc-900 rounded-none bg-zinc-950 p-1 shadow-inner scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
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
                            <Loader2 className="size-6 animate-spin text-emerald-500" />
                            <span>{t.floorPlan.loadingFloorPlan}</span>
                          </div>
                        ) : tables.length > 0 ? (
                          tables.map((table) => {
                            const avail = tableAvailability[table.id];
                            const isFree = avail ? avail.available : true;
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
                                type="button"
                                disabled={!isFree}
                                onClick={() => {
                                  setSelectedTableId(table.id);
                                  toast({
                                    title: t.landing.toastTableSelectedTitle,
                                    description: `Preferred ${table.name} has been selected.`
                                  });
                                }}
                                style={{ left, top, width, height }}
                                className={cn(
                                  "absolute text-xs font-bold border flex flex-col items-center justify-center transition-all p-2 select-none focus:outline-none z-10",
                                  isRound ? "rounded-full" : "rounded-none",
                                  isSelected 
                                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.03] z-20" 
                                    : !isFree
                                      ? "bg-rose-950/15 border-rose-900/35 text-rose-500 cursor-not-allowed opacity-55"
                                      : table.status === 'RESERVED'
                                        ? "bg-sky-955/10 border-sky-500/40 text-sky-400 hover:bg-sky-955/20 cursor-pointer"
                                        : "bg-emerald-950/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-955/20 cursor-pointer"
                                )}
                              >
                                <span className="truncate max-w-full leading-none">{table.name}</span>
                                <span className="text-[9px] opacity-75 font-normal mt-1">({table.capacity}p)</span>
                                {!isFree && (
                                  <span className="text-[7px] text-rose-400 uppercase tracking-widest font-mono mt-0.5">Occupied</span>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-zinc-650 text-xs font-semibold">
                            {t.landing.noTablesFound}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Legends indicators */}
                  <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-400 tracking-widest uppercase border-t border-zinc-900 pt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>{t.landing.legendFree}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <span>{ccT.legendSeated || 'Occupied / Busy'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                      <span>{t.landing.legendReserved}</span>
                    </div>
                  </div>

                </div>

              </form>
            )}

          </div>
        </section>

        {/* ============================================================ */}
        {/* FEEDBACK / TESTIMONIES SECTION */}
        {/* ============================================================ */}
        <section id="feedback" className="py-24 bg-zinc-950 text-zinc-100 relative overflow-hidden">
          {/* Decorative Blur Ambient Backgrounds */}
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest block">{ccT.fbLabel}</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">
                {ccT.fbTitle}
              </h2>
              <p className="font-sans text-zinc-300 text-sm sm:text-base leading-relaxed">
                {ccT.fbDesc}
              </p>
              <div className="w-20 h-1 bg-emerald-500 rounded-full mx-auto" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Testimonies List */}
              <div className="lg:col-span-7 space-y-6 text-left overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-zinc-955 border border-zinc-900 text-emerald-400 rounded-xl">
                          <UserCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-bold text-zinc-100">{rev.author}</h4>
                          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">{rev.role} • {rev.date}</p>
                        </div>
                      </div>

                      {/* Stars Rating */}
                      <div className="flex items-center space-x-0.5" aria-label={`Rating: ${rev.rating}/5`}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="font-sans text-sm text-zinc-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Column: Write a Review Form */}
              <div className="lg:col-span-5 text-left">
                <div className="bg-zinc-900/60 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6">
                  
                  <div className="flex items-center space-x-3 border-b border-zinc-900 pb-4">
                    <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
                      <MessageSquarePlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-zinc-100">{ccT.fbFormTitle}</h3>
                      <p className="text-xs text-zinc-500">{ccT.fbFormDesc}</p>
                    </div>
                  </div>

                  {revSuccess && (
                    <div className="p-4 bg-emerald-955 border border-emerald-900 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{ccT.fbFormSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {/* Author Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">{ccT.fbFormAuthorLabel}</label>
                      <Input
                        type="text"
                        required
                        placeholder="Ex: Clara"
                        value={revAuthor}
                        onChange={(e) => setRevAuthor(e.target.value)}
                        className="w-full bg-zinc-950 border-zinc-900 rounded-xl text-xs placeholder-zinc-750 focus:border-emerald-500 focus-visible:ring-0 focus:outline-none"
                      />
                    </div>

                    {/* Stars Rating selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">{ccT.fbFormRatingLabel}</label>
                      <div className="flex items-center space-x-1.5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const ratingValue = i + 1;
                          return (
                            <button
                              key={ratingValue}
                              type="button"
                              onClick={() => setRevRating(ratingValue)}
                              className="p-1 focus:outline-none transition-transform duration-100 hover:scale-125 cursor-pointer"
                            >
                              <Star
                                className={`w-6 h-6 cursor-pointer ${
                                  ratingValue <= revRating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-zinc-800'
                                }`}
                              />
                            </button>
                          );
                        })}
                        <span className="font-mono text-xs text-zinc-500 ml-2">({revRating}/5)</span>
                      </div>
                    </div>

                    {/* Client Role Option */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">{ccT.fbFormRoleLabel}</label>
                      <Select value={revRole} onValueChange={setRevRole}>
                        <SelectTrigger className="w-full bg-zinc-950 border-zinc-900 rounded-xl text-xs focus:ring-0 focus:outline-none text-zinc-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-850 text-zinc-300 text-xs">
                          <SelectItem value="Regular Visitor" className="cursor-pointer">Regular Visitor</SelectItem>
                          <SelectItem value="Gourmet Critic" className="cursor-pointer">Gourmet Critic</SelectItem>
                          <SelectItem value="Local Guide" className="cursor-pointer">Local Guide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Review Comments */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">{ccT.fbFormCommentLabel}</label>
                      <Textarea
                        required
                        placeholder={ccT.fbPlaceholderComment || "Tell us what you liked..."}
                        rows={4}
                        value={revComment}
                        onChange={(e) => setRevComment(e.target.value)}
                        className="w-full bg-zinc-950 border-zinc-900 rounded-xl text-xs placeholder-zinc-750 focus:border-emerald-500 focus-visible:ring-0"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-zinc-950 font-extrabold uppercase tracking-wider text-xs rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 text-center mt-2 cursor-pointer"
                      style={{ color: 'var(--primary-foreground)' }}
                    >
                      {ccT.fbFormSubmitBtn || 'Submit Review'}
                    </button>
                  </form>

                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ============================================================ */}
      {/* MENU ITEM CUSTOMIZATION MODAL */}
      {/* ============================================================ */}
      <Dialog open={activeCustomizerItem !== null} onOpenChange={(open) => !open && setActiveCustomizerItem(null)}>
        {activeCustomizerItem && (
          <DialogContent className="max-w-md bg-zinc-900 border-emerald-500/30 text-zinc-100 rounded-none p-6 text-left">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-bold text-zinc-100">
                {activeCustomizerItem.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 mt-1">
                Customize your selection below and generate an estimated order pass.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              
              {/* Beverage specific configurations */}
              {activeCustomizerItem.type === 'DRINK' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      {ccT.modalOptionMilkTitle || 'Milk Type (+0.60€ for specialty)'}
                    </label>
                    <Select value={customMilk} onValueChange={setCustomMilk}>
                      <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 text-xs rounded-none h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs">
                        <SelectItem value="Standard" className="cursor-pointer">Standard Milk</SelectItem>
                        <SelectItem value="Oat Milk" className="cursor-pointer">Oat Milk (+0.60€)</SelectItem>
                        <SelectItem value="Almond Milk" className="cursor-pointer">Almond Milk (+0.60€)</SelectItem>
                        <SelectItem value="Soy Milk" className="cursor-pointer">Soy Milk (+0.60€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      {ccT.modalOptionSweetTitle || 'Sweetness Level'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Unsweetened', 'Medium', 'Extra'].map(sweet => (
                        <button
                          key={sweet}
                          type="button"
                          onClick={() => setCustomSweet(sweet)}
                          className={cn(
                            "py-2 text-[10px] font-mono uppercase tracking-wider border transition-all cursor-pointer text-center",
                            customSweet === sweet
                              ? "bg-emerald-500 text-zinc-950 border-emerald-500 font-bold"
                              : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          )}
                        >
                          {sweet}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Extras list retrieved dynamically from Gilded Fork Database */}
              {activeCustomizerItem.extras.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    {ccT.modalOptionAddonsTitle || 'Addons / Toppings'}
                  </label>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {activeCustomizerItem.extras.map(extra => (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => handleAddonToggle(extra.name)}
                        className={cn(
                          "w-full px-3 py-2 text-xs border flex items-center justify-between transition-all cursor-pointer rounded-none",
                          customAddons.includes(extra.name)
                            ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                            : "border-zinc-800 bg-zinc-955 text-zinc-400 hover:border-zinc-750"
                        )}
                      >
                        <span>{extra.name}</span>
                        <span className="font-mono text-[10px]">+{(extra.price).toFixed(2)}€</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity controls */}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  {ccT.modalQtyTitle || 'Quantity'}
                </span>
                <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-800 p-1">
                  <button
                    type="button"
                    onClick={() => setCustomQty(prev => Math.max(1, prev - 1))}
                    className="p-1 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs text-zinc-200 px-2 select-none">{customQty}</span>
                  <button
                    type="button"
                    onClick={() => setCustomQty(prev => prev + 1)}
                    className="p-1 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Add Ticket Trigger */}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-4">
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-zinc-500">{ccT.modalTotalTitle || 'Estimated Total'}</p>
                  <p className="font-mono text-base font-extrabold text-emerald-400">{(currentCustomPrice).toFixed(2)}€</p>
                </div>
                
                <button
                  onClick={handleCreateOrderTicket}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-zinc-950 font-extrabold uppercase tracking-wider text-[10px] shadow transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ color: 'var(--primary-foreground)' }}
                >
                  {ccT.modalSubmitBtn || 'Create Order Ticket'}
                </button>
              </div>

            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="relative z-10 border-t border-emerald-500/10 bg-zinc-950/80 pt-16 pb-8 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left mb-12">
          
          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-zinc-100 uppercase tracking-widest border-b border-zinc-900 pb-2">
              Contact & Info
            </h4>
            <div className="space-y-3 font-sans text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>{getAddress(activeLocale)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+351 210 987 654</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@gildedfork.com</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-zinc-100 uppercase tracking-widest border-b border-zinc-900 pb-2">
              Opening Hours
            </h4>
            <div className="space-y-2 font-mono text-xs text-zinc-400">
              <p><span className="text-emerald-400">Mon - Fri:</span> 07:30 AM - 22:00 PM</p>
              <p><span className="text-emerald-400">Sat - Sun:</span> 08:30 AM - 23:00 PM</p>
              <p className="text-[10px] text-zinc-500 italic mt-2">Kitchen closes 45 mins before closing</p>
            </div>
          </div>

          {/* Guest PWA Install card */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-zinc-100 uppercase tracking-widest border-b border-zinc-900 pb-2">
              Gilded Fork App
            </h4>
            <div className="bg-zinc-900/40 border border-zinc-900 p-4 relative rounded-none flex flex-col justify-between">
              {isInstalled ? (
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                  <Check className="size-4" />
                  <span>{t.landing.pwaInstructionsInstalled}</span>
                </div>
              ) : isInstallable ? (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">{t.landing.installGuestDesc}</p>
                  <Button
                    onClick={handleInstall}
                    disabled={installing}
                    className="h-9 w-full bg-zinc-950 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-955 border border-emerald-500/20 hover:border-emerald-500 font-mono font-bold text-[10px] uppercase tracking-widest transition-all rounded-none shadow-sm cursor-pointer"
                  >
                    {installing ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Smartphone className="size-3.5 mr-1.5" />}
                    {t.landing.installGuestBtn}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">{t.landing.installGuestDesc}</p>
                  <Button
                    onClick={() => {
                      toast({
                        title: t.landing.pwaInstructionsTitle,
                        description: t.landing.pwaInstructionsIOS,
                      });
                    }}
                    className="h-9 w-full bg-zinc-955 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-955 border border-emerald-500/20 hover:border-emerald-500 font-mono font-bold text-[10px] uppercase tracking-widest transition-all rounded-none shadow-sm cursor-pointer"
                  >
                    <Smartphone className="size-3.5 mr-1.5" />
                    {t.landing.installGuestBtn}
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom copyright info & staff access portal */}
        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-zinc-650 font-bold tracking-widest uppercase select-none font-sans">
            &copy; {new Date().getFullYear()} {restaurantName}. Powered by Antigravity OS
          </p>
          
          <button 
            onClick={() => router.push('/management')}
            className="text-[8px] text-zinc-700 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase cursor-pointer"
          >
            {t.landing.staffPortalAccessBtn}
          </button>
        </div>
      </footer>

    </div>
  );
}
