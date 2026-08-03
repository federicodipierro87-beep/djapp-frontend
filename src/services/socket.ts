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

// Socket.io retries transport failures on its own, but a handshake the server
// middleware rejects is treated as fatal: it sets socket.active to false and
// never tries again. An expired token would therefore kill the DJ panel's live
// updates for as long as the tab stays open, with nothing on screen to say so.
const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000, 60000];
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryAttempt = 0;
let wantConnection = false;

type ConnectionListener = (connected: boolean) => void;
const connectionListeners = new Set<ConnectionListener>();

function notifyConnectionChange(connected: boolean): void {
  connectionListeners.forEach((listener) => listener(connected));
}

/** Notifies on every connect and disconnect. Returns an unsubscribe function. */
export function onConnectionChange(listener: ConnectionListener): () => void {
  connectionListeners.add(listener);
  return () => {
    connectionListeners.delete(listener);
  };
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

function cancelRetry(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  retryAttempt = 0;
}

function scheduleRetry(): void {
  if (!wantConnection || retryTimer) return;

  const delay = RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)];
  retryAttempt++;

  retryTimer = setTimeout(() => {
    retryTimer = null;
    if (!wantConnection) return;
    // The auth callback re-reads storage, so this attempt uses whatever token is
    // there now rather than the one that was just rejected.
    socket?.connect();
  }, delay);
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      // Read as a callback so a reconnection picks up the current token instead
      // of the one that existed when the socket was first created. Guests have
      // no token and connect anonymously to the public event room.
      auth: (cb) => cb({ token: localStorage.getItem('dj_token') ?? undefined }),
    });

    socket.on('connect', () => {
      cancelRetry();
      notifyConnectionChange(true);
    });

    socket.on('disconnect', () => notifyConnectionChange(false));

    socket.on('connect_error', () => {
      notifyConnectionChange(false);
      // socket.active stays true for the failures socket.io handles itself, so
      // only the rejected handshakes end up being retried here.
      if (!socket?.active) scheduleRetry();
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  wantConnection = true;
  const socketInstance = getSocket();
  if (!socketInstance.connected) {
    socketInstance.connect();
  }
  return socketInstance;
}

export function disconnectSocket(): void {
  wantConnection = false;
  cancelRetry();
  // Called unconditionally: a socket stuck mid-handshake is not `connected` yet
  // would otherwise keep trying on behalf of the DJ who just logged out.
  socket?.disconnect();
  notifyConnectionChange(false);
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
