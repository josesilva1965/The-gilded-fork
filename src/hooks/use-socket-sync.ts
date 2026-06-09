'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function useSocketSync() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      return;
    }

    // Connect to the socket server and join the role/station rooms
    const socket = connectSocket(user.role);

    // Debounce invalidations by query key to prevent request storms under rapid updates
    const debounceTimeoutMap = new Map<string, NodeJS.Timeout>();
    const debouncedInvalidate = (queryKey: string[]) => {
      const keyStr = JSON.stringify(queryKey);
      const existingTimeout = debounceTimeoutMap.get(keyStr);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      const timeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey });
        debounceTimeoutMap.delete(keyStr);
      }, 300); // 300ms window to coalesce multiple rapid updates
      debounceTimeoutMap.set(keyStr, timeout);
    };

    // 1. Table status updates
    socket.on('table:status-updated', (data: { tableId: string; status: string; updatedBy: string }) => {
      debouncedInvalidate(['tables']);
      
      // Notify user about remote updates
      if (data.updatedBy !== user.name) {
        addNotification(`Table status updated by ${data.updatedBy}`, 'info');
      }
    });

    // 2. Order updates
    socket.on('order:updated', () => {
      debouncedInvalidate(['active-orders']);
      debouncedInvalidate(['tables']);
    });

    // 3. Station alerts for Kitchen/Bar
    socket.on('kitchen:new-ticket', () => {
      debouncedInvalidate(['active-orders']);
      debouncedInvalidate(['tables']);
    });

    socket.on('bar:new-ticket', () => {
      debouncedInvalidate(['active-orders']);
      debouncedInvalidate(['tables']);
    });

    // 4. Order item status updates
    socket.on('order:item-updated', () => {
      debouncedInvalidate(['active-orders']);
    });
    
    socket.on('kitchen:item-updated', () => {
      debouncedInvalidate(['active-orders']);
    });

    socket.on('bar:item-updated', () => {
      debouncedInvalidate(['active-orders']);
    });

    // 5. Reservation updates
    socket.on('reservation:updated', () => {
      debouncedInvalidate(['reservations']);
      debouncedInvalidate(['tables']);
    });

    // 6. Low stock alerts (visible for ADMIN and MANAGER)
    socket.on('inventory:low-stock-alert', (data: { name: string; currentStock: number; unit: string }) => {
      debouncedInvalidate(['inventory']);
      addNotification(`Low stock alert: ${data.name} is down to ${data.currentStock} ${data.unit}`, 'info');
    });

    socket.on('inventory:updated', () => {
      debouncedInvalidate(['inventory']);
    });

    // 7. Staff clock updates
    socket.on('staff:clock-update', () => {
      debouncedInvalidate(['staff']);
    });

    // 8. Generic notifications
    socket.on('notification', (data: { message: string; type: string }) => {
      addNotification(data.message, data.type || 'info');
    });

    return () => {
      // Clean up all pending invalidation timeouts
      debounceTimeoutMap.forEach(clearTimeout);
      debounceTimeoutMap.clear();

      socket.off('table:status-updated');
      socket.off('order:updated');
      socket.off('kitchen:new-ticket');
      socket.off('bar:new-ticket');
      socket.off('order:item-updated');
      socket.off('kitchen:item-updated');
      socket.off('bar:item-updated');
      socket.off('reservation:updated');
      socket.off('inventory:low-stock-alert');
      socket.off('inventory:updated');
      socket.off('staff:clock-update');
      socket.off('notification');
    };
  }, [isAuthenticated, user, queryClient, addNotification]);
}
