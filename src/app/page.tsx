'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Tablet, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Info, 
  Globe, 
  Download,
  Loader2,
  Utensils
} from 'lucide-react';
import { useBranding } from '@/stores/branding-store';
import { useT } from '@/stores/locale-store';
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
import { cn } from '@/lib/utils';

interface TableInfo {
  id: string;
  number: number;
  name: string;
  active: boolean;
  capacity: number;
}

export default function LandingPage() {
  const router = useRouter();
  const t = useT();
  const { logoText, logoIconType, logoEmoji, logoUrl, restaurantName, brandColor } = useBranding();
  const { isInstallable, isInstalled, install } = usePwaInstall();
  
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isIOS, setIsIOS] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(ios);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/tables')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tables');
        return res.json();
      })
      .then((data) => {
        if (active && Array.isArray(data)) {
          setTables(data.filter((t: any) => t.active));
        }
      })
      .catch((err) => {
        console.error('Error fetching tables on landing page:', err);
      })
      .finally(() => {
        if (active) setLoadingTables(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleBrowseMenu = () => {
    if (!selectedTable) return;
    router.push(`/table/${selectedTable}`);
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } catch (err) {
      console.error('PWA installation triggered error:', err);
    } finally {
      setInstalling(false);
    }
  };

  const renderLogo = () => {
    if (logoIconType === 'emoji') {
      return <span className="text-3xl sm:text-4xl filter drop-shadow">{logoEmoji}</span>;
    }
    if (logoIconType === 'url' && logoUrl) {
      return <img src={logoUrl} alt={restaurantName} className="h-10 w-auto object-contain" />;
    }
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold text-lg tracking-wider">
        {logoText || 'GF'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative flex flex-col justify-between overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Decorative Brand Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--color-emerald-950,oklch(0.13_0.06_155))_0%,_transparent_65%)] opacity-30 pointer-events-none z-0" />
      
      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900/60 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          {renderLogo()}
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            {restaurantName}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher variant="flag-only" />
        </div>
      </header>

      {/* Main Hero & Portals */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center gap-12 lg:gap-16">
        
        {/* Welcome Text */}
        <div className="text-center max-w-2xl space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shadow-inner"
          >
            <Sparkles className="size-3 text-primary" />
            <span>{t.landing.welcome} {restaurantName}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100 leading-tight"
          >
            Savor the Moment, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Interactive Dining</span> Simplified
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-lg mx-auto"
          >
            {t.landing.tagline}
          </motion.p>
        </div>

        {/* Portal Options (Asymmetrical Glass Cards Grid) */}
        <div className="grid md:grid-cols-12 gap-6 w-full items-stretch mt-4">
          
          {/* Guest Portal Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-7 flex"
          >
            <Card className="w-full bg-zinc-900/40 border-zinc-800 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden rounded-3xl relative group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Smartphone className="size-56 text-primary" />
              </div>

              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                    <Smartphone className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">{t.landing.guestSectionTitle}</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs mt-0.5">{t.landing.guestSectionDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-4 space-y-6 flex-1 flex flex-col justify-between">
                {/* Table select & Route */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t.landing.selectTableLabel}</label>
                    
                    {loadingTables ? (
                      <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-500 text-xs font-medium">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span>Loading active tables...</span>
                      </div>
                    ) : tables.length > 0 ? (
                      <Select value={selectedTable} onValueChange={setSelectedTable}>
                        <SelectTrigger className="h-11 px-4 bg-zinc-950/40 border-zinc-800 rounded-xl text-zinc-200 text-xs font-semibold hover:border-zinc-700/80 focus:ring-primary/40 focus:ring-offset-0">
                          <SelectValue placeholder={t.landing.selectTablePlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                          {tables.map((table) => (
                            <SelectItem 
                              key={table.id} 
                              value={table.number.toString()}
                              className="text-xs font-medium focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                            >
                              {table.name} ({table.capacity} seats)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 text-zinc-500 text-xs text-center">
                        No active tables found. Please contact administration.
                      </div>
                    )}
                  </div>

                  <Button 
                    disabled={!selectedTable}
                    onClick={handleBrowseMenu}
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:pointer-events-none group"
                  >
                    <span>{t.landing.viewMenuBtn}</span>
                    <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>

                {/* PWA Section */}
                <div className="pt-6 border-t border-zinc-900/80 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400">
                      <Download className="size-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-300">{t.landing.installGuestBtn}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{t.landing.installGuestDesc}</p>
                    </div>
                  </div>

                  {isInstalled ? (
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-450 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl">
                      <Check className="size-3.5" />
                      <span>{t.landing.pwaInstructionsInstalled}</span>
                    </div>
                  ) : isInstallable ? (
                    <Button 
                      variant="outline" 
                      onClick={handleInstall}
                      disabled={installing}
                      className="w-full h-9 rounded-xl border-zinc-850 hover:bg-zinc-800/80 text-zinc-300 text-xs font-bold transition-all shadow-xs"
                    >
                      {installing ? (
                        <>
                          <Loader2 className="size-3.5 mr-2 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="size-3.5 mr-2" />
                          {t.landing.installGuestBtn}
                        </>
                      )}
                    </Button>
                  ) : isIOS ? (
                    <div className="flex items-start gap-2.5 text-[10px] text-zinc-400 bg-zinc-950/40 border border-zinc-850 p-3 rounded-xl leading-relaxed">
                      <Info className="size-4 shrink-0 text-primary mt-0.5" />
                      <span>{t.landing.pwaInstructionsIOS}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 text-[10px] text-zinc-500 bg-zinc-950/20 border border-zinc-850/60 p-3 rounded-xl leading-relaxed">
                      <Info className="size-4 shrink-0 text-zinc-650 mt-0.5" />
                      <span>To install, use a Chromium-based browser (Chrome, Edge) or iOS Safari and add this app to your Home Screen.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Staff Portal Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-5 flex"
          >
            <Card className="w-full bg-zinc-900/30 border-zinc-850 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden rounded-3xl relative group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none">
                <Tablet className="size-56 text-primary" />
              </div>

              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                    <Tablet className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">{t.landing.staffSectionTitle}</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs mt-0.5">{t.landing.staffSectionDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-4 space-y-6 flex-1 flex flex-col justify-between">
                {/* Route Button */}
                <div className="space-y-4">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/management')}
                    className="w-full h-11 border-zinc-800 hover:bg-zinc-800/80 text-zinc-200 text-xs font-bold rounded-xl transition-all shadow-xs group"
                  >
                    <span>{t.landing.goToManagementBtn}</span>
                    <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>

                {/* PWA Section */}
                <div className="pt-6 border-t border-zinc-900/80 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400">
                      <Tablet className="size-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-300">{t.landing.installStaffBtn}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{t.landing.installStaffDesc}</p>
                    </div>
                  </div>

                  {isInstalled ? (
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-450 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl">
                      <Check className="size-3.5" />
                      <span>{t.landing.pwaInstructionsInstalled}</span>
                    </div>
                  ) : isInstallable ? (
                    <Button 
                      variant="outline" 
                      onClick={handleInstall}
                      disabled={installing}
                      className="w-full h-9 rounded-xl border-zinc-850 hover:bg-zinc-800/80 text-zinc-300 text-xs font-bold transition-all shadow-xs"
                    >
                      {installing ? (
                        <>
                          <Loader2 className="size-3.5 mr-2 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="size-3.5 mr-2" />
                          {t.landing.installStaffBtn}
                        </>
                      )}
                    </Button>
                  ) : isIOS ? (
                    <div className="flex items-start gap-2.5 text-[10px] text-zinc-400 bg-zinc-950/40 border border-zinc-850 p-3 rounded-xl leading-relaxed">
                      <Info className="size-4 shrink-0 text-primary mt-0.5" />
                      <span>{t.landing.pwaInstructionsIOS}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 text-[10px] text-zinc-500 bg-zinc-950/20 border border-zinc-850/60 p-3 rounded-xl leading-relaxed">
                      <Info className="size-4 shrink-0 text-zinc-650 mt-0.5" />
                      <span>To install, use Safari or Chrome on your pad or tablet to pin this app to your home screen.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t border-zinc-900/40">
        <p className="text-[10px] text-zinc-600 font-medium tracking-wide uppercase">
          &copy; {new Date().getFullYear()} {restaurantName}. Powered by Antigravity OS
        </p>
      </footer>
    </div>
  );
}
