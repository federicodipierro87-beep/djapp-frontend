import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../services/api';
import Surface from './ui/Surface';
import Label from './ui/Label';
import StatusDot from './ui/StatusDot';
import type { BadgeTone } from './ui/Badge';
import type { Subscription } from '../types';

interface SubscriptionStatusProps {
  compact?: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ compact = false }) => {
  const { data: status, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionApi.getStatus,
    refetchInterval: 60000, // Refresh every minute
  });

  const portalMutation = useMutation({
    mutationFn: () => subscriptionApi.createPortalSession(window.location.href),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast.error('Errore nell\'aprire il portale di gestione');
    },
  });

  if (isLoading) {
    return <div className="h-5 w-24 rounded bg-ink-800 animate-pulse" />;
  }

  if (!status?.subscription) {
    return null;
  }

  const subscription = status.subscription;

  // Un abbonamento in regola non deve gridare: resta grigio. Il colore compare
  // solo quando c'è qualcosa da fare.
  const getStatusConfig = (): { tone: BadgeTone; label: string; description: string } => {
    switch (subscription.status) {
      case 'TRIALING':
        return {
          tone: 'neutral',
          label: 'Prova',
          description: getTrialDaysLeft(subscription)
        };
      case 'ACTIVE':
        return {
          tone: 'ok',
          label: 'Attivo',
          description: subscription.plan === 'ANNUAL' ? 'Piano annuale' : 'Piano mensile'
        };
      case 'PAST_DUE':
        return {
          tone: 'warn',
          label: 'Pagamento in sospeso',
          description: 'Aggiorna il metodo di pagamento'
        };
      default:
        return {
          tone: 'live',
          label: 'Non attivo',
          description: 'Rinnova l\'abbonamento'
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => portalMutation.mutate()}
        disabled={portalMutation.isPending}
        title="Gestisci abbonamento"
        className="inline-flex items-center gap-2 px-2.5 py-1.5 -mx-1 rounded-md
                   hover:bg-white/[0.06] transition-colors disabled:opacity-50"
      >
        <StatusDot tone={config.tone} />
        <Label tone={config.tone === 'ok' || config.tone === 'neutral' ? 'dim' : 'live'}>
          {config.label}
          {subscription.cancelAtPeriodEnd && ' · in scadenza'}
        </Label>
      </button>
    );
  }

  return (
    <Surface>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot tone={config.tone} />
            <Label as="div" tone={config.tone === 'ok' || config.tone === 'neutral' ? 'dim' : 'live'}>
              Abbonamento
            </Label>
          </div>
          <p className="mt-2 font-medium text-bone">{config.label}</p>
          <p className="mt-1 text-[13px] text-bone-dim">{config.description}</p>
        </div>

        <button
          type="button"
          onClick={() => portalMutation.mutate()}
          disabled={portalMutation.isPending}
          className="inline-flex items-center gap-1.5 text-[13px] text-bone-dim hover:text-bone
                     transition-colors shrink-0 disabled:opacity-50"
        >
          {portalMutation.isPending ? 'Apertura…' : 'Gestisci'}
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <p className="mt-4 pt-4 border-t border-white/[0.08] text-[13px] text-warn">
          L'abbonamento terminerà il {formatDate(subscription.currentPeriodEnd)}.
        </p>
      )}

      {subscription.status === 'TRIALING' && subscription.trialEnd && (
        <p className="mt-4 pt-4 border-t border-white/[0.08] text-[13px] text-bone-dim">
          La prova termina il {formatDate(subscription.trialEnd)}.
        </p>
      )}
    </Surface>
  );
};

function getTrialDaysLeft(subscription: Subscription): string {
  if (!subscription.trialEnd) return '';

  const now = new Date();
  const trialEnd = new Date(subscription.trialEnd);
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return 'Scade oggi';
  if (daysLeft === 1) return '1 giorno rimanente';
  return `${daysLeft} giorni rimanenti`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default SubscriptionStatus;
