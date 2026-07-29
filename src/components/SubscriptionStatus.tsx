import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, AlertTriangle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../services/api';
import type { Subscription } from '../types';

interface SubscriptionStatusProps {
  compact?: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ compact = false }) => {
  const queryClient = useQueryClient();

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
    return (
      <div className="flex items-center text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!status?.subscription) {
    return null;
  }

  const subscription = status.subscription;

  const getStatusConfig = () => {
    switch (subscription.status) {
      case 'TRIALING':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Prova gratuita',
          description: getTrialDaysLeft(subscription)
        };
      case 'ACTIVE':
        return {
          icon: Crown,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Attivo',
          description: subscription.plan === 'ANNUAL' ? 'Piano Annuale' : 'Piano Mensile'
        };
      case 'PAST_DUE':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Pagamento in sospeso',
          description: 'Aggiorna il metodo di pagamento'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Non attivo',
          description: 'Rinnova l\'abbonamento'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (compact) {
    return (
      <button
        onClick={() => portalMutation.mutate()}
        disabled={portalMutation.isPending}
        className={`flex items-center ${config.bgColor} ${config.borderColor} border rounded-lg px-3 py-1.5 hover:opacity-80 transition-opacity`}
        title="Gestisci abbonamento"
      >
        <Icon className={`w-4 h-4 ${config.color} mr-1.5`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
        {subscription.cancelAtPeriodEnd && (
          <span className="ml-1.5 text-xs text-orange-600">(cancella)</span>
        )}
      </button>
    );
  }

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 ${config.color} mr-2`} />
          <div>
            <p className={`font-medium ${config.color}`}>{config.label}</p>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        <button
          onClick={() => portalMutation.mutate()}
          disabled={portalMutation.isPending}
          className={`flex items-center text-sm ${config.color} hover:opacity-80 transition-opacity`}
        >
          {portalMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Gestisci
              <ExternalLink className="w-3 h-3 ml-1" />
            </>
          )}
        </button>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          L'abbonamento terminerà il {formatDate(subscription.currentPeriodEnd)}
        </div>
      )}

      {subscription.status === 'TRIALING' && subscription.trialEnd && (
        <div className="mt-3 text-sm text-gray-600">
          La prova termina il {formatDate(subscription.trialEnd)}
        </div>
      )}
    </div>
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
