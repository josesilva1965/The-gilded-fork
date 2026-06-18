import { io } from 'socket.io-client';

interface IngredientStockInfo {
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export function notifyStockChange(ingredient: IngredientStockInfo) {
  try {
    const socket = io('http://localhost:3003', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      // 1. Notify about general inventory change
      socket.emit('inventory:change');

      // 2. Notify about low stock alert if stock is <= minStock
      if (ingredient.currentStock <= ingredient.minStock) {
        socket.emit('inventory:low-stock', {
          name: ingredient.name,
          currentStock: ingredient.currentStock,
          unit: ingredient.unit,
        });
      }

      // Close the connection after a small delay to ensure packets are sent
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    });

    socket.on('connect_error', (error) => {
      console.warn('[SocketServer] Connection error (is socket service running?):', error.message);
    });
  } catch (error) {
    console.error('[SocketServer] Failed to notify stock change via socket:', error);
  }
}

export function notifyBrandingChange() {
  try {
    const socket = io('http://localhost:3003', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      socket.emit('branding:updated');
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    });

    socket.on('connect_error', (error) => {
      console.warn('[SocketServer] Connection error (is socket service running?):', error.message);
    });
  } catch (error) {
    console.error('[SocketServer] Failed to notify branding change via socket:', error);
  }
}

export function notifyOrderUpdate() {
  try {
    const socket = io('http://localhost:3003', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      socket.emit('order:updated');
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    });

    socket.on('connect_error', (error) => {
      console.warn('[SocketServer] Connection error:', error.message);
    });
  } catch (error) {
    console.error('[SocketServer] Failed to notify order update:', error);
  }
}

export function notifyTableStatusUpdate(tableId: string, status: string, updatedBy: string) {
  try {
    const socket = io('http://localhost:3003', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      socket.emit('table:status-updated', { tableId, status, updatedBy });
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    });

    socket.on('connect_error', (error) => {
      console.warn('[SocketServer] Connection error:', error.message);
    });
  } catch (error) {
    console.error('[SocketServer] Failed to notify table status update:', error);
  }
}

export function notifyStaffCall(message: string, role?: string) {
  try {
    const socket = io('http://localhost:3003', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      socket.emit('notification', { message, type: 'info', role });
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    });

    socket.on('connect_error', (error) => {
      console.warn('[SocketServer] Connection error:', error.message);
    });
  } catch (error) {
    console.error('[SocketServer] Failed to notify staff call:', error);
  }
}

