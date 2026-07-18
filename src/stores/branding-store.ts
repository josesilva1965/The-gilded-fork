import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export type BrandColor = 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'zinc';
export type ThemeMode = 'dark' | 'light';

interface BrandingState {
  themeMode: ThemeMode;
  brandColor: BrandColor;
  logoText: string;
  logoIconType: 'text' | 'emoji' | 'url';
  logoEmoji: string;
  logoUrl: string;
  restaurantName: string;
  
  setThemeMode: (mode: ThemeMode) => void;
  setBrandColor: (color: BrandColor) => void;
  setBranding: (updates: Partial<Omit<BrandingState, 'setThemeMode' | 'setBrandColor' | 'setBranding' | 'resetBranding'>>) => void;
  resetBranding: () => void;
}

const syncWithServer = (state: {
  themeMode: ThemeMode;
  brandColor: BrandColor;
  logoText: string;
  logoIconType: 'text' | 'emoji' | 'url';
  logoEmoji: string;
  logoUrl: string;
  restaurantName: string;
}) => {
  if (typeof window === 'undefined') return;
  fetch('/api/admin/branding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  }).catch((err) => console.error('Failed to sync branding with server:', err));
};

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      brandColor: 'emerald',
      logoText: 'GF',
      logoIconType: 'text',
      logoEmoji: '🍴',
      logoUrl: '',
      restaurantName: 'The Gilded Fork',
      
      setThemeMode: (themeMode) => {
        set({ themeMode });
        const state = useBrandingStore.getState();
        syncWithServer({
          themeMode,
          brandColor: state.brandColor,
          logoText: state.logoText,
          logoIconType: state.logoIconType,
          logoEmoji: state.logoEmoji,
          logoUrl: state.logoUrl,
          restaurantName: state.restaurantName,
        });
      },
      setBrandColor: (brandColor) => {
        set({ brandColor });
        const state = useBrandingStore.getState();
        syncWithServer({
          themeMode: state.themeMode,
          brandColor,
          logoText: state.logoText,
          logoIconType: state.logoIconType,
          logoEmoji: state.logoEmoji,
          logoUrl: state.logoUrl,
          restaurantName: state.restaurantName,
        });
      },
      setBranding: (updates) => {
        set((state) => {
          const newState = { ...state, ...updates };
          setTimeout(() => {
            const current = useBrandingStore.getState();
            syncWithServer({
              themeMode: current.themeMode,
              brandColor: current.brandColor,
              logoText: current.logoText,
              logoIconType: current.logoIconType,
              logoEmoji: current.logoEmoji,
              logoUrl: current.logoUrl,
              restaurantName: current.restaurantName,
            });
          }, 0);
          return newState;
        });
      },
      resetBranding: () => {
        const defaults = {
          themeMode: 'dark' as ThemeMode,
          brandColor: 'emerald' as BrandColor,
          logoText: 'GF',
          logoIconType: 'text' as const,
          logoEmoji: '🍴',
          logoUrl: '',
          restaurantName: 'The Gilded Fork',
        };
        set(defaults);
        syncWithServer(defaults);
      },
    }),
    {
      name: 'gilded-fork-branding',
    }
  )
);

export function useBranding() {
  const branding = useBrandingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

    const fetchBranding = () => {
      fetch('/api/admin/branding')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            useBrandingStore.setState({
              themeMode: data.themeMode,
              brandColor: data.brandColor,
              logoText: data.logoText,
              logoIconType: data.logoIconType,
              logoEmoji: data.logoEmoji,
              logoUrl: data.logoUrl,
              restaurantName: data.restaurantName,
            });
          }
        })
        .catch((err) => console.error('Failed to load global branding settings:', err));
    };

    fetchBranding();

    // Setup websocket listener to update branding in real-time on other devices
    try {
      const socket = getSocket();
      if (socket) {
        if (!socket.connected) {
          socket.connect();
        }
        socket.on('branding:updated', fetchBranding);
        return () => {
          socket.off('branding:updated', fetchBranding);
        };
      }
    } catch (e) {
      console.warn('Socket connection not available for branding synchronization:', e);
    }
  }, []);

  if (!mounted) {
    return {
      themeMode: 'dark' as const,
      brandColor: 'emerald' as const,
      logoText: 'GF',
      logoIconType: 'text' as const,
      logoEmoji: '🍴',
      logoUrl: '',
      restaurantName: 'The Gilded Fork',
      setThemeMode: () => {},
      setBrandColor: () => {},
      setBranding: () => {},
      resetBranding: () => {},
      mounted: false,
    };
  }

  return { ...branding, mounted: true };
}
