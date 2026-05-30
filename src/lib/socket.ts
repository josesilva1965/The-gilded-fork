'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/?XTransformPort=3003', {
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
