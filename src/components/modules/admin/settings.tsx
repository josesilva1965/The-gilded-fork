'use client';

import { useState, useRef } from 'react';
import { useT } from '@/stores/locale-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Database, Trash2, Download, AlertTriangle, Loader2, Upload, Globe, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocaleConfig, useCustomTaxRate, useSetCustomTaxRate } from '@/stores/locale-store';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

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
