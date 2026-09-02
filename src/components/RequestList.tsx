import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestsApi } from '../services/api';
import Button from './ui/Button';
import Label from './ui/Label';
import EmptyState from './ui/EmptyState';
import { formatMoney } from './ui/format';
import { Request } from '../types';

interface RequestListProps {
  requests: Request[];
  onUpdate: () => void;
}

// Sotto i cinque minuti il countdown diventa rosso: è l'unica cosa rossa della
// schermata, quindi si vede senza cercarla.
const EXPIRING_MS = 300000;

const PAYMENT_LABELS: Record<string, string> = {
  CARD: 'Carta',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  PAYPAL: 'PayPal',
  SATISPAY: 'Satispay',
};

const formatTimeRemaining = (timeRemaining: number) => {
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  if (timeRemaining <= 0) return 'Scaduta';
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const RequestList: React.FC<RequestListProps> = ({ requests, onUpdate }) => {
  const acceptMutation = useMutation({
    mutationFn: requestsApi.accept,
    onSuccess: () => {
      toast.success('Richiesta accettata e aggiunta alla coda');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile accettare la richiesta';
      toast.error(message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: requestsApi.reject,
    onSuccess: () => {
      toast.success('Richiesta rifiutata');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile rifiutare la richiesta';
      toast.error(message);
    },
  });

  if (requests.length === 0) {
    return (
      <div className="border border-white/[0.08] rounded-lg">
        <EmptyState
          eyebrow="In attesa"
          title="Nessuna richiesta da decidere"
          description="Le nuove richieste compaiono qui appena arrivano."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <Label as="div">Da decidere</Label>
        <span className="num text-[11px] text-bone-faint">{requests.length}</span>
      </div>

      <ul className="mt-4 space-y-3">
        {requests.map((request) => {
          const timeRemaining = request.timeRemaining;
          const isExpiring = timeRemaining > 0 && timeRemaining < EXPIRING_MS;
          const isExpired = timeRemaining <= 0;

          return (
            <li
              key={request.id}
              className={`bg-ink-900 border rounded-lg p-4 sm:p-5 transition-colors ${
                isExpired
                  ? 'border-white/[0.06] opacity-50'
                  : isExpiring
                    ? 'border-live/50'
                    : 'border-white/[0.08]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold leading-snug truncate">
                    {request.songTitle}
                  </h3>
                  <p className="mt-0.5 text-sm text-bone-dim truncate">{request.artistName}</p>
                </div>

                {/* La cifra è la ragione per cui il DJ sta guardando questa riga. */}
                <span className="num text-2xl font-semibold leading-none shrink-0">
                  {formatMoney(request.donationAmount, true)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-bone-dim">
                <span className="truncate">{request.requesterName}</span>
                {request.requesterEmail && (
                  <>
                    <span className="text-bone-faint">·</span>
                    <span className="truncate">{request.requesterEmail}</span>
                  </>
                )}
                <span className="text-bone-faint">·</span>
                {/* Nessuna richiesta nasce più senza metodo: restano solo quelle
                    della finestra in cui le gratuite erano attive. */}
                <span>
                  {request.paymentMethod
                    ? PAYMENT_LABELS[request.paymentMethod] ?? request.paymentMethod
                    : 'Gratis'}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <div>
                  <Label as="div" tone={isExpiring || isExpired ? 'live' : 'dim'}>
                    {isExpired ? 'Scaduta' : 'Scade tra'}
                  </Label>
                  {!isExpired && (
                    <p
                      className={`num mt-1.5 text-base font-semibold leading-none ${
                        isExpiring ? 'text-live' : 'text-bone'
                      }`}
                    >
                      {formatTimeRemaining(timeRemaining)}
                    </p>
                  )}
                </div>

                {/* Accetta e rifiuta stanno lontani: si preme al volo, al buio. */}
                {!isExpired && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                      Rifiuta
                    </Button>

                    <Button
                      onClick={() => acceptMutation.mutate(request.id)}
                      disabled={acceptMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                      Accetta
                    </Button>
                  </div>
                )}
              </div>

              {isExpired && (
                <p className="mt-3 text-[13px] text-bone-faint">
                  L'autorizzazione è decaduta: nessun addebito è stato fatto.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RequestList;
