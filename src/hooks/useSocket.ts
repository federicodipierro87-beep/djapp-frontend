import { useEffect, useCallback } from 'react';
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
  const {
    eventCode,
    onNewRequest,
    onRequestAccepted,
    onRequestRejected,
    onQueueUpdated,
    onNowPlayingChanged,
  } = options;

  const queryClient = useQueryClient();

  // Invalidate queries to trigger refetch
  const invalidateRequests = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['requests'] });
    queryClient.invalidateQueries({ queryKey: ['djRequests'] });
  }, [queryClient]);

  const invalidateQueue = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['queue'] });
    queryClient.invalidateQueries({ queryKey: ['djQueue'] });
  }, [queryClient]);

  useEffect(() => {
    if (!eventCode) return;

    const socket = connectSocket();

    // Join the event room
    joinEventRoom(eventCode);

    // Handle new request
    const handleNewRequest = (request: unknown) => {
      invalidateRequests();
      onNewRequest?.(request);
    };

    // Handle request accepted
    const handleRequestAccepted = (request: unknown) => {
      invalidateRequests();
      invalidateQueue();
      onRequestAccepted?.(request);
    };

    // Handle request rejected
    const handleRequestRejected = (data: { requestId: string }) => {
      invalidateRequests();
      onRequestRejected?.(data);
    };

    // Handle queue updated
    const handleQueueUpdated = () => {
      invalidateQueue();
      onQueueUpdated?.();
    };

    // Handle now playing changed
    const handleNowPlayingChanged = (song: { songTitle: string; artistName: string }) => {
      invalidateQueue();
      onNowPlayingChanged?.(song);
    };

    // Subscribe to events
    socket.on(SOCKET_EVENTS.NEW_REQUEST, handleNewRequest);
    socket.on(SOCKET_EVENTS.REQUEST_ACCEPTED, handleRequestAccepted);
    socket.on(SOCKET_EVENTS.REQUEST_REJECTED, handleRequestRejected);
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);
    socket.on(SOCKET_EVENTS.NOW_PLAYING_CHANGED, handleNowPlayingChanged);

    // Cleanup on unmount
    return () => {
      socket.off(SOCKET_EVENTS.NEW_REQUEST, handleNewRequest);
      socket.off(SOCKET_EVENTS.REQUEST_ACCEPTED, handleRequestAccepted);
      socket.off(SOCKET_EVENTS.REQUEST_REJECTED, handleRequestRejected);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);
      socket.off(SOCKET_EVENTS.NOW_PLAYING_CHANGED, handleNowPlayingChanged);
      leaveEventRoom(eventCode);
    };
  }, [
    eventCode,
    onNewRequest,
    onRequestAccepted,
    onRequestRejected,
    onQueueUpdated,
    onNowPlayingChanged,
    invalidateRequests,
    invalidateQueue,
  ]);

  return {
    socket: getSocket(),
    invalidateRequests,
    invalidateQueue,
  };
}
