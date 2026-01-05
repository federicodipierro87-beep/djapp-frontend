import axios from 'axios';
import type { 
  DJ, 
  Request, 
  QueueItem, 
  PublicQueueItem, 
  EventStats, 
  EventSummary,
  CreateRequestData, 
  AuthResponse,
  PaymentIntent
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
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
      localStorage.removeItem('dj_token');
      window.location.href = '/dj/login';
    }
    
    // Gestione Rate Limiting con retry automatico
    if (error.response?.status === 429) {
      console.warn('Rate limit raggiunto, riprovo tra 30 secondi...');
      // React Query gestirà automaticamente il retry con i tempi che abbiamo impostato
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
};

// Requests API
export const requestsApi = {
  create: async (data: CreateRequestData): Promise<Request> => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  getByEvent: async (eventCode: string): Promise<Request[]> => {
    const response = await api.get(`/requests/${eventCode}`);
    return response.data;
  },

  getDJRequests: async (): Promise<Request[]> => {
    const response = await api.get('/requests/dj/all');
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

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post('/dj/change-password', data);
    return response.data;
  },

  generateQRCode: async (): Promise<{ qrCode: string; eventCode: string; eventUrl: string }> => {
    const response = await api.get('/dj/qr-code');
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  createStripeIntent: async (amount: number, currency = 'eur'): Promise<PaymentIntent> => {
    const response = await api.post('/payments/stripe/create-intent', { amount, currency });
    return response.data;
  },

  createPayPalOrder: async (amount: number, currency = 'EUR'): Promise<PaymentIntent> => {
    const response = await api.post('/payments/paypal/create-order', { amount, currency });
    return response.data;
  },

  createSatispayPayment: async (amount: number, currency = 'EUR', description = 'DJ Song Request'): Promise<PaymentIntent> => {
    const response = await api.post('/payments/satispay/create', { amount, currency, description });
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

export default api;