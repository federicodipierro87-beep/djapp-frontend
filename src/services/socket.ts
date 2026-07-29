import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

// Socket.io event constants (matching backend)
export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Room events
  JOIN_EVENT: 'join-event',
  LEAVE_EVENT: 'leave-event',

  // Request events
  NEW_REQUEST: 'new-request',
  REQUEST_ACCEPTED: 'request-accepted',
  REQUEST_REJECTED: 'request-rejected',

  // Queue events
  QUEUE_UPDATED: 'queue-updated',
  NOW_PLAYING_CHANGED: 'now-playing-changed',
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const socketInstance = getSocket();
  if (!socketInstance.connected) {
    socketInstance.connect();
  }
  return socketInstance;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinEventRoom(eventCode: string): void {
  const socketInstance = connectSocket();
  socketInstance.emit(SOCKET_EVENTS.JOIN_EVENT, eventCode);
}

export function leaveEventRoom(eventCode: string): void {
  if (socket?.connected) {
    socket.emit(SOCKET_EVENTS.LEAVE_EVENT, eventCode);
  }
}
