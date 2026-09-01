import axios from 'axios';
import type {
  DJ,
  Request,
  QueueItem,
  PublicQueueItem,
  EventStats,
  EventSummary,
  CreateRequestData,
  CreateRequestResponse,
  AuthResponse,
  SubscriptionStatusResponse,
  CheckoutSessionResponse,
  PortalSessionResponse,
  SubscriptionPlan,
  Event,
  PublicEventInfo,
  CreateEventData,
  UpdateEventData,
  EventStatus,
  ConnectStatus,
  SatispayStatus
} from '../types';
import { logout } from './session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  // Without a timeout a stalled connection never settles, so the UI keeps
  // showing a spinner with no way for the user to tell it is stuck.
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dj_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/dj/login';
    }

    if (error.response?.status === 429) {
      console.warn('Rate limit raggiunto, React Query ritenterà automaticamente.');
    }

    if (error.code === 'ECONNABORTED') {
      console.warn('Richiesta scaduta:', error.config?.url);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; name: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  me: async (): Promise<DJ> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // The answer is the same whether or not the address is registered, so there
  // is nothing here to tell the two apart with.
  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; password: string }): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

// Requests API
export const requestsApi = {
  // The request is created first and the server hands back what is needed to
  // pay for it. Nothing reaches the DJ until confirm() succeeds.
  create: async (data: CreateRequestData): Promise<CreateRequestResponse> => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  confirm: async (requestId: string): Promise<{ requestId: string; status: string }> => {
    const response = await api.post(`/requests/${requestId}/confirm`);
    return response.data;
  },

  getByEvent: async (eventCode: string): Promise<Request[]> => {
    const response = await api.get(`/requests/${eventCode}`);
    return response.data;
  },

  // The panel only ever renders pending requests, and asking for them by name
  // means the page size cannot be filled up by months of old ones.
  getDJRequests: async (params?: { status?: string; limit?: number }): Promise<Request[]> => {
    const response = await api.get('/requests/dj/all', { params });
    return response.data;
  },

  accept: async (id: string): Promise<void> => {
    await api.patch(`/requests/dj/${id}/accept`);
  },

  reject: async (id: string): Promise<void> => {
    await api.patch(`/requests/dj/${id}/reject`);
  },
};

// Queue API
export const queueApi = {
  getPublic: async (eventCode: string): Promise<PublicQueueItem[]> => {
    const response = await api.get(`/queue/${eventCode}`);
    return response.data;
  },

  getDJ: async (): Promise<{ queue: QueueItem[]; totalEarnings: number }> => {
    const response = await api.get('/queue/dj/all');
    return response.data;
  },

  reorder: async (queueItemIds: string[]): Promise<void> => {
    await api.patch('/queue/dj/reorder', { queueItemIds });
  },

  setNowPlaying: async (id: string): Promise<void> => {
    await api.patch(`/queue/dj/${id}/now-playing`);
  },

  markAsPlayed: async (id: string): Promise<void> => {
    await api.patch(`/queue/dj/${id}/played`);
  },

  skipSong: async (id: string): Promise<void> => {
    await api.patch(`/queue/dj/${id}/skip`);
  },
};

// DJ Settings API
export const djApi = {
  getSettings: async (): Promise<DJ> => {
    const response = await api.get('/dj/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<DJ>): Promise<{ message: string; dj: DJ }> => {
    const response = await api.patch('/dj/settings', data);
    return response.data;
  },

  generateNewEventCode: async (): Promise<{ message: string; eventCode: string; eventUrl: string }> => {
    const response = await api.post('/dj/event/new');
    return response.data;
  },
  endCurrentEvent: async (): Promise<{ message: string; summary: any }> => {
    const response = await api.post('/dj/event/end');
    return response.data;
  },
  getEventSummaries: async (): Promise<EventSummary[]> => {
    const response = await api.get('/dj/event/summaries');
    return response.data;
  },
  deleteEventSummary: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/dj/event/summaries/${id}`);
    return response.data;
  },

  getStats: async (): Promise<EventStats> => {
    const response = await api.get('/dj/stats');
    return response.data;
  },

  // Changing the password invalidates every token issued before it, this
  // session's included, so the server hands back a replacement to store.
  changePassword: async (
    data: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string; token: string }> => {
    const response = await api.post('/dj/change-password', data);
    return response.data;
  },

  generateQRCode: async (): Promise<{ qrCode: string; eventCode: string; eventUrl: string }> => {
    const response = await api.get('/dj/qr-code');
    return response.data;
  },

  getConnectStatus: async (): Promise<ConnectStatus> => {
    const response = await api.get('/dj/connect/status');
    return response.data;
  },

  // Returns a single-use Stripe-hosted onboarding link. Starts the process or
  // resumes it; the DJ is sent off to Stripe and comes back to the panel.
  startConnectOnboarding: async (): Promise<{ url: string; expiresAt: number }> => {
    const response = await api.post('/dj/connect/onboard');
    return response.data;
  },

  getSatispayStatus: async (): Promise<SatispayStatus> => {
    const response = await api.get('/dj/satispay/status');
    return response.data;
  },

  // The activation code is single use. The server generates the key pair and
  // keeps the private half, so nothing secret travels back here.
  connectSatispay: async (activationCode: string): Promise<{ connected: true; keyId: string }> => {
    const response = await api.post('/dj/satispay/connect', { activationCode });
    return response.data;
  },

  disconnectSatispay: async (): Promise<{ connected: false }> => {
    const response = await api.delete('/dj/satispay/connect');
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getPendingDJs: async (): Promise<any[]> => {
    const response = await api.get('/admin/djs/pending');
    return response.data;
  },

  getAllDJs: async (): Promise<any[]> => {
    const response = await api.get('/admin/djs');
    return response.data;
  },

  approveDJ: async (djId: string): Promise<{ message: string; dj: any }> => {
    const response = await api.patch(`/admin/djs/${djId}/approve`);
    return response.data;
  },

  rejectDJ: async (djId: string): Promise<{ message: string; dj: any }> => {
    const response = await api.patch(`/admin/djs/${djId}/reject`);
    return response.data;
  },

  deleteDJ: async (djId: string): Promise<{ message: string; deletedDJ: any }> => {
    const response = await api.delete(`/admin/djs/${djId}`);
    return response.data;
  },
};

// Events API
export const eventsApi = {
  create: async (data: CreateEventData): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
  },

  getMyEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events/my');
    return response.data;
  },

  getNearby: async (lat: number, lng: number, radius = 10, status: EventStatus = 'ACTIVE'): Promise<Event[]> => {
    const response = await api.get('/events/nearby', {
      params: { lat, lng, radius, status }
    });
    return response.data;
  },

  getByCode: async (eventCode: string): Promise<Event> => {
    const response = await api.get(`/events/code/${eventCode}`);
    return response.data;
  },

  // Resolves both the new event codes and the legacy per-DJ ones, so the
  // request form can read the real minimum donation instead of guessing.
  getPublicInfo: async (eventCode: string): Promise<PublicEventInfo> => {
    const response = await api.get(`/events/public/${eventCode}`);
    return response.data;
  },

  update: async (id: string, data: UpdateEventData): Promise<Event> => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  activate: async (id: string): Promise<Event> => {
    const response = await api.patch(`/events/${id}/activate`);
    return response.data;
  },

  end: async (id: string): Promise<Event> => {
    const response = await api.patch(`/events/${id}/end`);
    return response.data;
  },

  cancel: async (id: string): Promise<Event> => {
    const response = await api.patch(`/events/${id}/cancel`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

// Spotify API
export const spotifyApi = {
  search: async (query: string, limit = 10, offset = 0): Promise<{ tracks: any[]; total: number }> => {
    const response = await api.get('/spotify/search', {
      params: { q: query, limit, offset }
    });
    return response.data;
  },

  getTrack: async (trackId: string): Promise<any> => {
    const response = await api.get(`/spotify/track/${trackId}`);
    return response.data;
  },
};

// Subscription API
export const subscriptionApi = {
  getStatus: async (): Promise<SubscriptionStatusResponse> => {
    const response = await api.get('/subscriptions/status');
    return response.data;
  },

  createCheckoutSession: async (
    plan: SubscriptionPlan,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResponse> => {
    const response = await api.post('/subscriptions/checkout', {
      plan,
      successUrl,
      cancelUrl
    });
    return response.data;
  },

  createPortalSession: async (returnUrl: string): Promise<PortalSessionResponse> => {
    const response = await api.post('/subscriptions/portal', { returnUrl });
    return response.data;
  },

  cancel: async (): Promise<{ message: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: string }> => {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },

  reactivate: async (): Promise<{ message: string; cancelAtPeriodEnd: boolean }> => {
    const response = await api.post('/subscriptions/reactivate');
    return response.data;
  },
};

export default api;