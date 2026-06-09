'use client';

import { useState, useRef, useEffect } from 'react';
import { useT } from '@/stores/locale-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Database, Trash2, Download, AlertTriangle, Loader2, Upload, Globe, RefreshCw, CircleDollarSign, Lock, Eye, EyeOff, Palette, Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { useBranding, BrandColor, ThemeMode } from '@/stores/branding-store';
import { useLocaleConfig, useCustomTaxRate, useSetCustomTaxRate } from '@/stores/locale-store';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Separator } from '@/components/ui/separator';

export function Settings() {
  const t = useT();
  const addNotification = useAppStore(s => s.addNotification);
  
  const [isBackuping, setIsBackuping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const localeConfig = useLocaleConfig();
  const customTaxRate = useCustomTaxRate();
  const setCustomTaxRate = useSetCustomTaxRate();
  const [taxInput, setTaxInput] = useState(
    customTaxRate !== null ? (customTaxRate * 100).toString() : ''
  );

  const [multipliers, setMultipliers] = useState<{
    ADMIN: number;
    MANAGER: number;
    KITCHEN: number;
    BAR: number;
    FOH: number;
  }>({
    ADMIN: 0,
    MANAGER: 1.5,
    KITCHEN: 1.0,
    BAR: 1.2,
    FOH: 1.0,
  });
  const [isLoadingMultipliers, setIsLoadingMultipliers] = useState(false);
  const [isSavingMultipliers, setIsSavingMultipliers] = useState(false);

  // Branding Customization state
  const branding = useBranding();
  const [localRestaurantName, setLocalRestaurantName] = useState(branding.restaurantName);
  const [localLogoText, setLocalLogoText] = useState(branding.logoText);
  const [localLogoEmoji, setLocalLogoEmoji] = useState(branding.logoEmoji);
  const [localLogoUrl, setLocalLogoUrl] = useState(branding.logoUrl);
  const [localLogoIconType, setLocalLogoIconType] = useState(branding.logoIconType);

  useEffect(() => {
    if (branding.mounted) {
      setLocalRestaurantName(branding.restaurantName);
      setLocalLogoText(branding.logoText);
      setLocalLogoEmoji(branding.logoEmoji);
      setLocalLogoUrl(branding.logoUrl);
      setLocalLogoIconType(branding.logoIconType);
    }
  }, [
    branding.mounted,
    branding.restaurantName,
    branding.logoText,
    branding.logoEmoji,
    branding.logoUrl,
    branding.logoIconType
  ]);

  const handleSaveBranding = () => {
    branding.setBranding({
      restaurantName: localRestaurantName,
      logoText: localLogoText,
      logoEmoji: localLogoEmoji,
      logoUrl: localLogoUrl,
      logoIconType: localLogoIconType,
    });
    addNotification('Branding preferences updated successfully', 'success');
  };

  const handleResetBranding = () => {
    branding.resetBranding();
    setLocalRestaurantName('The Gilded Fork');
    setLocalLogoText('GF');
    setLocalLogoEmoji('🍴');
    setLocalLogoUrl('');
    setLocalLogoIconType('text');
    addNotification('Branding preferences reset to defaults', 'success');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addNotification('File is too large. Please select an image under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Compress/resize to max 128x128 for logo icon to prevent localStorage issues
        const canvas = document.createElement('canvas');
        const maxDim = 128;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setLocalLogoUrl(compressedBase64);
          addNotification('Logo image uploaded and optimized successfully', 'success');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Staff PIN Management state
  interface StaffUser {
    id: string;
    name: string;
    email: string;
    role: string;
    pin: string;
  }
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [editingPins, setEditingPins] = useState<Record<string, string>>({});
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());
  const [updatingPinId, setUpdatingPinId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStaff() {
      setIsLoadingStaff(true);
      try {
        const res = await fetch('/api/staff');
        if (res.ok) {
          const data = await res.json();
          setStaff(data);
          const pins: Record<string, string> = {};
          data.forEach((member: StaffUser) => {
            pins[member.id] = member.pin;
          });
          setEditingPins(pins);
        }
      } catch (err) {
        console.error('Failed to load staff list:', err);
      } finally {
        setIsLoadingStaff(false);
      }
    }
    loadStaff();
  }, []);

  const handleUpdatePin = async (userId: string) => {
    const newPin = editingPins[userId];
    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      addNotification('PIN must be exactly 4 digits', 'error');
      return;
    }
    
    setUpdatingPinId(userId);
    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, pin: newPin }),
      });
      
      if (res.ok) {
        setStaff(prev => prev.map(member => 
          member.id === userId ? { ...member, pin: newPin } : member
        ));
        addNotification('PIN updated successfully', 'success');
      } else {
        throw new Error('Failed to update PIN');
      }
    } catch (err) {
      console.error(err);
      addNotification('Error updating staff PIN', 'error');
    } finally {
      setUpdatingPinId(null);
    }
  };

  const togglePinVisibility = (userId: string) => {
    setVisiblePins(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  useEffect(() => {
    async function loadMultipliers() {
      setIsLoadingMultipliers(true);
      try {
        const res = await fetch('/api/admin/role-multipliers');
        if (res.ok) {
          const data = await res.json();
          setMultipliers(data);
        }
      } catch (err) {
        console.error('Failed to load role multipliers:', err);
      } finally {
        setIsLoadingMultipliers(false);
      }
    }
    loadMultipliers();
  }, []);

  const handleSaveMultipliers = async () => {
    setIsSavingMultipliers(true);
    try {
      const res = await fetch('/api/admin/role-multipliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(multipliers),
      });
      if (res.ok) {
        addNotification('Role multipliers updated successfully', 'success');
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error(err);
      addNotification('Failed to update role multipliers', 'error');
    } finally {
      setIsSavingMultipliers(false);
    }
  };

  const handleSaveTax = () => {
    const val = parseFloat(taxInput);
    if (!isNaN(val) && val >= 0) {
      setCustomTaxRate(val / 100);
      addNotification(t.common.success, 'success');
    }
  };

  const handleResetTax = () => {
    setCustomTaxRate(null);
    setTaxInput('');
    addNotification(t.common.success, 'success');
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/restore-database', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Restore failed');

      addNotification(t.settings.restoreSuccess, 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error(error);
      addNotification(t.settings.restoreFailed, 'error');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBackup = async () => {
    setIsBackuping(true);
    try {
      const res = await fetch('/api/admin/backup-database');
      if (!res.ok) throw new Error('Backup failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Extract filename from headers if possible, or fallback
      const contentDisposition = res.headers.get('content-disposition');
      let filename = `backup-${new Date().toISOString().split('T')[0]}.db`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      addNotification(t.settings.backupSuccess, 'success');
    } catch (error) {
      console.error(error);
      addNotification(t.settings.backupFailed, 'error');
    } finally {
      setIsBackuping(false);
    }
  };

  const handleClearDatabase = async () => {
    if (confirmText !== 'CLEAR') return;
    
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/clear-database', { method: 'DELETE' });
      if (!res.ok) throw new Error('Clear failed');
      
      addNotification(t.settings.clearSuccess, 'success');
      setClearDialogOpen(false);
      setConfirmText('');
      
      // Optionally reload or invalidate queries if using React Query
      window.location.reload();
    } catch (error) {
      console.error(error);
      addNotification(t.settings.clearFailed, 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-300 p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-zinc-800 rounded-xl">
          <SettingsIcon className="size-6 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{t.settings.title}</h1>
          <p className="text-sm text-zinc-400">System configuration and data management.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Localization & Tax Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="size-5 text-emerald-400" />
              {t.settings.localization}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {t.settings.localizationDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-2">{t.settings.language}</label>
              <LanguageSwitcher variant="full" />
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <label className="text-sm font-medium text-zinc-300 block mb-2 mt-4">{t.settings.customTaxRate}</label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  placeholder={Math.round(localeConfig.taxRate * 100).toString()}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-[120px]"
                />
                <span className="text-zinc-400">%</span>
                <Button 
                  variant="secondary"
                  onClick={handleSaveTax}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                >
                  {t.common.save}
                </Button>
                {customTaxRate !== null && (
                  <Button 
                    variant="ghost" 
                    onClick={handleResetTax}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    <RefreshCw className="size-3.5 mr-2" />
                    {t.settings.resetToDefault}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding & Visual Themes Section */}
        <Card className="bg-zinc-900 border-zinc-800 animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="size-5 text-emerald-400" />
              {t.settings.brandingTitle}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {t.settings.brandingDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Mode */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-300 block">{t.settings.systemTheme}</label>
              <div className="flex gap-2">
                <Button
                  variant={branding.themeMode === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => branding.setThemeMode('dark')}
                  className={cn(
                    'flex-1 gap-2 text-xs font-semibold h-10',
                    branding.themeMode === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <Moon className="size-4" />
                  {t.settings.darkTheme}
                </Button>
                <Button
                  variant={branding.themeMode === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => branding.setThemeMode('light')}
                  className={cn(
                    'flex-1 gap-2 text-xs font-semibold h-10',
                    branding.themeMode === 'light' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <Sun className="size-4" />
                  {t.settings.lightTheme}
                </Button>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Brand Color Presets */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-300 block">{t.settings.primaryColorAccent}</label>
              <div className="flex flex-wrap gap-2.5">
                {(['emerald', 'amber', 'rose', 'blue', 'purple', 'zinc'] as BrandColor[]).map((color) => {
                  const isActive = branding.brandColor === color;
                  const dotColor = 
                    color === 'emerald' ? 'bg-emerald-500' :
                    color === 'amber' ? 'bg-amber-500' :
                    color === 'rose' ? 'bg-rose-500' :
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'purple' ? 'bg-purple-500' : 'bg-zinc-400';
                  
                  return (
                    <button
                      key={color}
                      onClick={() => branding.setBrandColor(color)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs capitalize font-semibold transition-all active:scale-[0.97] cursor-pointer',
                        isActive 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-inner' 
                          : 'border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      )}
                    >
                      <span className={cn('size-2.5 rounded-full shrink-0', dotColor)} />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Logo Settings */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-zinc-300 block">{t.settings.restaurantIdentity}</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Restaurant Name */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">{t.settings.restaurantName}</label>
                  <Input
                    value={localRestaurantName}
                    onChange={(e) => setLocalRestaurantName(e.target.value)}
                    placeholder="The Gilded Fork"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-10 focus-visible:ring-emerald-500/30"
                  />
                </div>

                {/* Logo Icon Type */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">{t.settings.logoDisplayType}</label>
                  <select
                    value={localLogoIconType}
                    onChange={(e) => setLocalLogoIconType(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-150 rounded-lg p-2.5 text-xs h-10 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="text">Text Initials (e.g. GF)</option>
                    <option value="emoji">Emoji Symbol (e.g. 🍴)</option>
                    <option value="url">Custom Image (URL / Upload)</option>
                  </select>
                </div>
              </div>

              {/* Logo detail fields based on select type */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-955/35">
                {localLogoIconType === 'text' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium">{t.settings.logoInitials}</label>
                    <Input
                      maxLength={4}
                      value={localLogoText}
                      onChange={(e) => setLocalLogoText(e.target.value)}
                      placeholder="GF"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs font-bold tracking-wider"
                    />
                  </div>
                )}

                {localLogoIconType === 'emoji' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium">{t.settings.logoEmoji}</label>
                    <Input
                      value={localLogoEmoji}
                      onChange={(e) => setLocalLogoEmoji(e.target.value)}
                      placeholder="🍴"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs text-center"
                    />
                  </div>
                )}

                {localLogoIconType === 'url' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-medium">{t.settings.logoUrlLabel}</label>
                      <Input
                        value={localLogoUrl}
                        onChange={(e) => setLocalLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs focus-visible:ring-emerald-500/30"
                      />
                    </div>
                    
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-zinc-800"></div>
                      <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{t.settings.logoUploadOrUrl}</span>
                      <div className="flex-grow border-t border-zinc-800"></div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Upload Button */}
                      <label className="w-full sm:flex-1 flex flex-col items-center justify-center h-24 border border-dashed border-zinc-750 hover:border-emerald-500/50 bg-zinc-900/40 rounded-xl cursor-pointer hover:bg-zinc-900/70 transition-all group">
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <Upload className="size-5 text-zinc-500 group-hover:text-emerald-400 transition-colors mb-1.5" />
                          <p className="text-[11px] text-zinc-400 group-hover:text-zinc-200 font-medium">
                            {t.settings.logoSelectFile}
                          </p>
                          <p className="text-[9px] text-zinc-500 mt-0.5">PNG, JPG, SVG, GIF (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Image Preview */}
                      {localLogoUrl && (
                        <div className="flex flex-col items-center gap-1.5 p-2 bg-zinc-900/60 rounded-xl border border-zinc-800 shrink-0 min-w-[100px]">
                          <div className="size-14 rounded-lg bg-zinc-850 border border-zinc-750 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            <img
                              src={localLogoUrl}
                              alt="Logo preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setLocalLogoUrl('')}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors"
                          >
                            {t.settings.logoClearImage}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <Button
                onClick={handleSaveBranding}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-4 rounded-xl text-xs flex items-center gap-1.5"
              >
                {t.settings.saveBranding}
              </Button>
              <Button
                variant="ghost"
                onClick={handleResetBranding}
                className="text-zinc-450 hover:text-zinc-300 h-10 text-xs"
              >
                {t.settings.resetBranding}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role Multipliers Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CircleDollarSign className="size-5 text-emerald-400" />
              {t.settings.roleMultipliersTitle}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {t.settings.roleMultipliersDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingMultipliers ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">{t.roles.manager}</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={multipliers.MANAGER}
                      onChange={(e) => setMultipliers({ ...multipliers, MANAGER: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-center font-semibold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">{t.roles.bar}</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={multipliers.BAR}
                      onChange={(e) => setMultipliers({ ...multipliers, BAR: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-center font-semibold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">{t.roles.kitchen}</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={multipliers.KITCHEN}
                      onChange={(e) => setMultipliers({ ...multipliers, KITCHEN: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-center font-semibold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">{t.roles.foh}</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={multipliers.FOH}
                      onChange={(e) => setMultipliers({ ...multipliers, FOH: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-center font-semibold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">{t.roles.admin}</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={multipliers.ADMIN}
                      onChange={(e) => setMultipliers({ ...multipliers, ADMIN: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-center font-semibold h-10"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-start">
                  <Button
                    onClick={handleSaveMultipliers}
                    disabled={isSavingMultipliers}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
                  >
                    {isSavingMultipliers ? <Loader2 className="size-4 animate-spin" /> : <CircleDollarSign className="size-4" />}
                    {t.common.save}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff PIN Management Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="size-5 text-emerald-400" />
              {t.settings.staffPinConfig}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {t.settings.staffPinDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStaff ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-6 animate-spin text-emerald-500" />
              </div>
            ) : staff.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">{t.common.noResults}</p>
            ) : (
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/20">
                <div className="divide-y divide-zinc-800">
                  {staff.map((member) => (
                    <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-350">
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{member.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-zinc-500 font-mono">{member.email}</span>
                            <span className={cn(
                              'text-[9px] px-1.5 py-0.5 rounded-md border font-semibold tracking-wide uppercase',
                              member.role === 'ADMIN' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              member.role === 'MANAGER' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              member.role === 'KITCHEN' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                              member.role === 'BAR' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                              'bg-sky-500/10 border-sky-500/20 text-sky-400'
                            )}>
                              {member.role === 'ADMIN' ? t.roles.admin :
                               member.role === 'MANAGER' ? t.roles.manager :
                               member.role === 'KITCHEN' ? t.roles.kitchen :
                               member.role === 'BAR' ? t.roles.bar :
                               t.roles.foh}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Input
                            type={visiblePins.has(member.id) ? 'text' : 'password'}
                            maxLength={4}
                            placeholder="PIN"
                            value={editingPins[member.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setEditingPins(prev => ({ ...prev, [member.id]: val }));
                            }}
                            className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono tracking-widest text-center h-9 w-24 pr-8 text-xs focus-visible:ring-emerald-500/30"
                          />
                          <button
                            type="button"
                            onClick={() => togglePinVisibility(member.id)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                          >
                            {visiblePins.has(member.id) ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleUpdatePin(member.id)}
                          disabled={updatingPinId === member.id || (editingPins[member.id] || '').length !== 4}
                          className="bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-200 border border-zinc-700 h-9 font-semibold text-xs transition-colors active:scale-[0.98]"
                        >
                          {updatingPinId === member.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            t.settings.setPin
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="size-5 text-sky-400" />
              {t.settings.dataManagement}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {t.settings.backupDatabaseDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button 
              onClick={handleBackup} 
              disabled={isBackuping || isRestoring}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 flex-1"
            >
              {isBackuping ? <Loader2 className="size-4 animate-spin mr-2" /> : <Download className="size-4 mr-2" />}
              {t.settings.backupDatabase}
            </Button>
            
            <Button 
              onClick={handleRestoreClick} 
              disabled={isBackuping || isRestoring}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 flex-1"
            >
              {isRestoring ? <Loader2 className="size-4 animate-spin mr-2" /> : <Upload className="size-4 mr-2" />}
              {t.settings.restoreDatabase}
            </Button>
            <input 
              type="file" 
              accept=".db" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </CardContent>
        </Card>

        {/* Danger Zone Section */}
        <Card className="bg-zinc-950 border-red-900/30 shadow-sm shadow-red-900/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-500">
              <AlertTriangle className="size-5" />
              {t.settings.dangerZone}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {t.settings.clearDatabaseDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setClearDialogOpen(true)}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="size-4 mr-2" />
              {t.settings.clearDatabase}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={(open) => {
        setClearDialogOpen(open);
        if (!open) setConfirmText('');
      }}>
        <DialogContent className="bg-zinc-950 border border-red-900/30 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              {t.settings.confirmClearTitle}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 pt-2">
              {t.settings.confirmClearDesc}
              <br/><br/>
              Type <strong>CLEAR</strong> below to confirm this destructive action.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type CLEAR to confirm"
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setClearDialogOpen(false)} className="text-zinc-400 hover:text-zinc-100">
              {t.common.cancel}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearDatabase} 
              disabled={confirmText !== 'CLEAR' || isClearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClearing ? <Loader2 className="size-4 animate-spin mr-2" /> : <Trash2 className="size-4 mr-2" />}
              {t.settings.clearDatabase}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
