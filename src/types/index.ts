export interface DJ {
  id: string;
  email: string;
  name: string;
  eventCode: string;
  minDonation: number;
  stripeAccountId?: string;
  paypalEmail?: string;
  satispayId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Request {
  id: string;
  songTitle: string;
  artistName: string;
  requesterName: string;
  requesterEmail?: string;
  donationAmount: number;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  status: RequestStatus;
  timeRemaining: number;
  expiresAt: string;
  createdAt: string;
}

export interface QueueItem {
  id: string;
  position: number;
  songTitle: string;
  artistName: string;
  requesterName: string;
  requesterEmail?: string;
  donationAmount?: number;
  paymentMethod?: PaymentMethod;
  status: QueueStatus;
  addedAt: string;
  playedAt?: string;
  isNowPlaying: boolean;
}

export interface PublicQueueItem {
  id: string;
  position: number;
  songTitle: string;
  artistName: string;
  requesterName: string;
  status: QueueStatus;
  addedAt: string;
  playedAt?: string;
  isNowPlaying: boolean;
}

export interface EventStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  queueLength: number;
  totalEarnings: number;
}

export interface EventSummary {
  id: string;
  djId: string;
  eventCode: string;
  totalRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  expiredRequests: number;
  closedRequests: number;
  playedSongs: number;
  skippedSongs: number;
  totalEarnings: number | string; // Can be Decimal from backend
  startedAt: string;
  endedAt: string;
  createdAt: string;
}

export interface CreateRequestData {
  eventCode: string;
  songTitle: string;
  artistName: string;
  requesterName: string;
  requesterEmail?: string;
  donationAmount: number;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
}

export interface PaymentIntent {
  clientSecret?: string;
  paymentIntentId?: string;
  orderId?: string;
  approvalUrl?: string;
  paymentId?: string;
  redirectUrl?: string;
}

export type PaymentMethod = 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'PAYPAL' | 'SATISPAY';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CLOSED';

export type QueueStatus = 'WAITING' | 'NOW_PLAYING' | 'PLAYED' | 'SKIPPED';

export interface AuthResponse {
  message: string;
  token: string;
  dj: DJ;
  isAdmin?: boolean;
}

export interface ApiError {
  error: string;
  details?: any;
}