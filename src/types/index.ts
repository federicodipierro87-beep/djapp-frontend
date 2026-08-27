export interface DJ {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  eventCode: string;
  minDonation: number;
  stripeAccountId?: string;
  paypalEmail?: string;
  satispayId?: string;
  createdAt: string;
  updatedAt?: string;
}

// Where the DJ stands with Stripe Connect. `required` mirrors the server's
// feature flag: until it is on, onboarding is something they can do rather
// than something guests are blocked by.
export interface ConnectStatus {
  required: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
}

export interface Request {
  id: string;
  songTitle: string;
  artistName: string;
  spotifyTrackId?: string;
  albumCover?: string;
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
  spotifyTrackId?: string;
  albumCover?: string;
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
  albumCover?: string;
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
  spotifyTrackId?: string;
  albumCover?: string;
  requesterName: string;
  requesterEmail?: string;
  donationAmount: number;
  paymentMethod: PaymentMethod;
}

// How the guest is told to pay for the request the server has just created.
// Which field is set depends on the provider.
export interface PaymentInstructions {
  provider: 'STRIPE' | 'PAYPAL' | 'SATISPAY';
  clientSecret: string | null;
  approvalUrl: string | null;
  redirectUrl: string | null;
}

// The request exists but is invisible to the DJ until the payment is confirmed.
export interface CreateRequestResponse {
  requestId: string;
  status: 'AWAITING_PAYMENT';
  payment: PaymentInstructions;
  expiresAt: string;
  createdAt: string;
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

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';

export type SubscriptionPlan = 'MONTHLY' | 'ANNUAL';

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionStatusResponse {
  hasSubscription: boolean;
  subscription: Subscription | null;
  requiresSubscription: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface AuthResponseWithSubscription extends AuthResponse {
  subscription?: SubscriptionStatusResponse;
}

export type EventStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface Event {
  id: string;
  djId: string;
  name: string;
  eventCode: string;
  description?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  endDateTime?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  dj?: {
    id: string;
    name: string;
    minDonation?: number;
  };
  _count?: {
    requests: number;
    queueItems: number;
  };
  distance?: number;
}

// What an unauthenticated guest is allowed to know about an event code.
export interface PublicEventInfo {
  eventCode: string;
  eventName: string | null;
  djName: string;
  minDonation: number;
  isAcceptingRequests: boolean;
}

export interface CreateEventData {
  name: string;
  description?: string;
  address: string;
  dateTime: string;
  endDateTime?: string | null;
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  address?: string;
  dateTime?: string;
  /** null clears the stored end date; omitting it leaves the current one. */
  endDateTime?: string | null;
}