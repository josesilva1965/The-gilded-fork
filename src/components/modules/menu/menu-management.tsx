'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Save, Image as ImageIcon, Search, UploadCloud } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLocaleConfig, useT } from '@/stores/locale-store';
import { useRef } from 'react';

interface MenuItemExtra {
  id?: string;
  name: string;
  price: number;
  cost: number;
  active: boolean;
}

interface MenuItemData {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  type: string;
  station: string;
  prepTime: number;
  isAvailable: boolean;
  isPopular: boolean;
  imageUrl: string | null;
  extras: MenuItemExtra[];
}

interface MenuCategoryData {
  id: string;
  name: string;
  items: MenuItemData[];
}

export function MenuManagement() {
  const queryClient = useQueryClient();
  const addNotification = useAppStore((s) => s.addNotification);
  const { currencySymbol } = useLocaleConfig();
  const t = useT();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Menu
  const { data: categories = [], isLoading } = useQuery<MenuCategoryData[]>({
    queryKey: ['menu', 'management'],
    queryFn: () => fetch('/api/menu').then((r) => r.json()),
  });

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })).filter(category => category.items.length > 0);
  }, [categories, searchQuery]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedItem: Partial<MenuItemData>) => {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (!res.ok) throw new Error('Failed to update item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      addNotification(t.menuManagement.toastUpdated, 'success');
      setIsDialogOpen(false);
    },
    onError: () => {
      addNotification(t.menuManagement.toastFailed, 'error');
    },
  });

  const handleEditClick = (item: MenuItemData) => {
    setEditingItem(JSON.parse(JSON.stringify(item))); // Deep copy
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (editingItem) {
        setEditingItem({ ...editingItem, imageUrl: data.url });
      }
      addNotification(t.menuManagement.toastUploaded, 'success');
    } catch (err) {
      addNotification(t.menuManagement.toastUploadFailed, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (editingItem) {
      updateMutation.mutate(editingItem);
    }
  };

  const handleAddExtra = () => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        extras: [...editingItem.extras, { name: 'New Extra', price: 0, cost: 0, active: true }],
      });
    }
  };

  const handleRemoveExtra = (index: number) => {
    if (editingItem) {
      const newExtras = [...editingItem.extras];
      newExtras.splice(index, 1);
      setEditingItem({ ...editingItem, extras: newExtras });
    }
  };

  const handleUpdateExtra = (index: number, field: keyof MenuItemExtra, value: any) => {
    if (editingItem) {
      const newExtras = [...editingItem.extras];
      newExtras[index] = { ...newExtras[index], [field]: value };
      setEditingItem({ ...editingItem, extras: newExtras });
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{t.menuManagement.title}</h1>
          <p className="text-sm text-zinc-400">{t.menuManagement.editDesc}</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.menuManagement.searchPlaceholder}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-emerald-600"
          />
        </div>
      </div>

      <Card className="flex-1 min-h-0 bg-zinc-900/50 border-zinc-800 flex flex-col">
        <CardContent className="flex-1 min-h-0 p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="size-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {filteredCategories.map(category => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <h2 className="text-lg font-semibold text-zinc-100">{category.name}</h2>
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                      {category.items.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.items.map(item => (
                      <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-emerald-500/50 transition-colors">
                        <div className="h-32 bg-zinc-950 relative">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-zinc-700">
                              <ImageIcon className="size-8" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Badge className="bg-zinc-900/80 text-emerald-400 border-emerald-900/50 backdrop-blur-md">
                              {currencySymbol}{item.price.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-semibold text-zinc-100 truncate">{item.name}</h3>
                          <p className="text-xs text-zinc-500 truncate mb-3">{item.description || ''}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {item.extras?.length || 0} {t.menuManagement.optionalExtras}
                            </span>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-7 text-[11px] px-2.5 bg-zinc-800 hover:bg-emerald-600 hover:text-white transition-colors"
                              onClick={() => handleEditClick(item)}
                            >
                              <Pencil className="size-3 mr-1.5" />
                              {t.common.edit}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Search className="size-8 mb-4 text-zinc-700" />
                  <p>{t.menuManagement.noItemsFound} &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-800 shrink-0">
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Pencil className="size-4 text-emerald-400" />
              {t.menuManagement.editItem.replace('{name}', editingItem?.name || '')}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {t.menuManagement.editItemDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
            {editingItem && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.menuManagement.itemName}</label>
                    <Input 
                      value={editingItem.name} 
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.menuManagement.basePrice} ({currencySymbol})</label>
                    <Input 
                      type="number"
                      value={editingItem.price} 
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.common.description}</label>
                  <Input 
                    value={editingItem.description || ''} 
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.menuManagement.image}</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={editingItem.imageUrl || ''} 
                      onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      placeholder={t.menuManagement.imagePlaceholder}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 h-10 flex-1"
                    />
                    <Button 
                      variant="outline" 
                      className="h-10 shrink-0 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-950/30"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="size-4 animate-spin mr-2" /> : <UploadCloud className="size-4 mr-2" />}
                      {isUploading ? t.menuManagement.uploading : t.menuManagement.upload}
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  {editingItem.imageUrl && (
                    <div className="mt-2 h-32 w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                      <img src={editingItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.menuManagement.optionalExtras}</label>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2.5 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/20" onClick={handleAddExtra}>
                      <Plus className="size-3 mr-1" />
                      {t.menuManagement.addExtra}
                    </Button>
                  </div>
                  
                  {editingItem.extras && editingItem.extras.length > 0 ? (
                    <div className="space-y-2">
                      {editingItem.extras.map((extra, index) => (
                        <div key={index} className="flex gap-2 items-center bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                          <Input 
                            value={extra.name}
                            onChange={(e) => handleUpdateExtra(index, 'name', e.target.value)}
                            placeholder={t.menuManagement.extraPlaceholder}
                            className="bg-zinc-950 border-zinc-800 text-zinc-200 h-9 text-sm"
                          />
                          <div className="relative w-28 shrink-0">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">{currencySymbol}</span>
                            <Input 
                              type="number"
                              step="0.01"
                              value={extra.price}
                              onChange={(e) => handleUpdateExtra(index, 'price', parseFloat(e.target.value) || 0)}
                              className="pl-6 bg-zinc-950 border-zinc-800 text-zinc-200 h-9 text-sm"
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 shrink-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleRemoveExtra(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
                      <p className="text-xs text-zinc-500">{t.menuManagement.noExtras}</p>
                      <Button variant="link" className="text-emerald-400 text-xs h-auto py-1 mt-1" onClick={handleAddExtra}>
                        {t.menuManagement.createOne}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="p-4 border-t border-zinc-800 shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
              {t.common.cancel}
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {updateMutation.isPending ? t.menuManagement.saving : t.menuManagement.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
