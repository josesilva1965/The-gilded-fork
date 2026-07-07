'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrandingProvider } from '@/components/branding-provider';
import { useAuthStore } from '@/stores/auth-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_IS_LOCAL_KIOSK !== 'true') {
        const registerSW = () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
              console.log('PWA Service Worker registered successfully:', reg.scope);
            })
            .catch((err) => {
              console.error('PWA Service Worker registration failed:', err);
            });
        };

        if (document.readyState === 'complete') {
          registerSW();
        } else {
          window.addEventListener('load', registerSW);
          return () => window.removeEventListener('load', registerSW);
        }
      } else {
        // Unregister service worker in dev or local kiosk mode to avoid caching stale assets
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log('Unregistered active service worker for local kiosk');
                window.location.reload();
              }
            });
          }
        });
      }
    }

    // Intercept fetch to automatically append user headers if logged in
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        let url = '';
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.href;
        } else if (input && typeof input === 'object' && 'url' in input) {
          url = (input as any).url;
        }

        if (url.startsWith('/api/') || url.includes(window.location.origin + '/api/')) {
          try {
            const state = useAuthStore.getState();
            if (state && state.user) {
              const headers = new Headers(init?.headers);
              if (!headers.has('x-user-id') && state.user.id) {
                headers.set('x-user-id', state.user.id);
              }
              if (!headers.has('x-user-pin') && state.user.pin) {
                headers.set('x-user-pin', state.user.pin);
              }
              return originalFetch(input, {
                ...init,
                headers,
              });
            }
          } catch (e) {
            console.error('Error in fetch interceptor:', e);
          }
        }
        return originalFetch(input, init);
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <BrandingProvider>
          {children}
        </BrandingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
