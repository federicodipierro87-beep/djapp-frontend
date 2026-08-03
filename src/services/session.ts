import { QueryClient } from '@tanstack/react-query';
import { disconnectSocket } from './socket';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetching when the DJ comes back to the tab replaces the blanket timer
      // that used to run on every query.
      refetchOnWindowFocus: true,
      retry: 2,
      staleTime: 60000,
      // No global polling interval: Socket.io pushes the updates that matter and
      // the few queries that still need a fallback set their own interval. The
      // previous 30s default had six queries on the DJ panel firing 135 requests
      // per 15 minutes, which on its own exceeded the server's rate limit.
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function logout(): void {
  localStorage.removeItem('dj_token');
  // The socket authenticates during the handshake, so an open connection would
  // keep the previous DJ inside their private room until it is torn down.
  disconnectSocket();
  queryClient.clear();
}
