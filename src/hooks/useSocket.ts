import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getSocket,
  connectSocket,
  joinEventRoom,
  leaveEventRoom,
  SOCKET_EVENTS,
} from '../services/socket';

interface UseSocketOptions {
  eventCode: string;
  onNewRequest?: (request: unknown) => void;
  onRequestAccepted?: (request: unknown) => void;
  onRequestRejected?: (data: { requestId: string }) => void;
  onQueueUpdated?: () => void;
  onNowPlayingChanged?: (song: { songTitle: string; artistName: string }) => void;
}

export function useSocket(options: UseSocketOptions) {
  const { eventCode } = options;
  const queryClient = useQueryClient();

  // Callers pass inline arrow functions, so keeping them in the effect's
  // dependency list would tear down and rebuild every listener on each render.
  const handlers = useRef(options);
  handlers.current = options;

  const invalidateRequests = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dj-requests'] });
  }, [queryClient]);

  const invalidateQueue = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dj-queue'] });
    queryClient.invalidateQueries({ queryKey: ['dj-stats'] });
    queryClient.invalidateQueries({ queryKey: ['public-queue'] });
  }, [queryClient]);

  useEffect(() => {
    if (!eventCode) return;

    const socket = connectSocket();
    joinEventRoom(eventCode);

    // Rooms live on the server and are tied to a socket id, so a reconnection
    // starts outside of them. Rejoining and refetching closes the gap of events
    // that were emitted while the connection was down.
    const handleConnect = () => {
      joinEventRoom(eventCode);
      invalidateRequests();
      invalidateQueue();
    };

    const handleNewRequest = (request: unknown) => {
      invalidateRequests();
      handlers.current.onNewRequest?.(request);
    };

    const handleRequestAccepted = (request: unknown) => {
      invalidateRequests();
      invalidateQueue();
      handlers.current.onRequestAccepted?.(request);
    };

    const handleRequestRejected = (data: { requestId: string }) => {
      invalidateRequests();
      handlers.current.onRequestRejected?.(data);
    };

    const handleQueueUpdated = () => {
      invalidateQueue();
      handlers.current.onQueueUpdated?.();
    };

    const handleNowPlayingChanged = (song: { songTitle: string; artistName: string }) => {
      invalidateQueue();
      handlers.current.onNowPlayingChanged?.(song);
    };

    socket.on('connect', handleConnect);
    socket.on(SOCKET_EVENTS.NEW_REQUEST, handleNewRequest);
    socket.on(SOCKET_EVENTS.REQUEST_ACCEPTED, handleRequestAccepted);
    socket.on(SOCKET_EVENTS.REQUEST_REJECTED, handleRequestRejected);
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);
    socket.on(SOCKET_EVENTS.NOW_PLAYING_CHANGED, handleNowPlayingChanged);

    return () => {
      socket.off('connect', handleConnect);
      socket.off(SOCKET_EVENTS.NEW_REQUEST, handleNewRequest);
      socket.off(SOCKET_EVENTS.REQUEST_ACCEPTED, handleRequestAccepted);
      socket.off(SOCKET_EVENTS.REQUEST_REJECTED, handleRequestRejected);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);
      socket.off(SOCKET_EVENTS.NOW_PLAYING_CHANGED, handleNowPlayingChanged);
      leaveEventRoom(eventCode);
    };
  }, [eventCode, invalidateRequests, invalidateQueue]);

  return {
    socket: getSocket(),
    invalidateRequests,
    invalidateQueue,
  };
}
