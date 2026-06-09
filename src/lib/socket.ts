'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let socketUrl: string | null = null;

function getSocketUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3003';
  // Connect directly to the socket server port — works on localhost and LAN (iPad, etc.)
  // without needing Caddy's XTransformPort proxy.
  return `http://${window.location.hostname}:3003`;
}

export function getSocket(): Socket {
  const url = getSocketUrl();
  // Recreate if URL changed (e.g. after hot reload from old proxy URL)
  if (!socket || socketUrl !== url) {
    if (socket) {
      socket.disconnect();
      socket.removeAllListeners();
    }
    socketUrl = url;
    socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(role: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join-role', role);
    if (role === 'KITCHEN') s.emit('join-station', 'KITCHEN');
    if (role === 'BAR') s.emit('join-station', 'BAR');
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
