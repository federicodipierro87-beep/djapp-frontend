import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { subscriptionApi } from '../services/api';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const { data: subscriptionStatus, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionApi.getStatus,
    refetchInterval: 2000, // Poll every 2 seconds until subscription is active
    retry: 3,
  });

  useEffect(() => {
    if (subscriptionStatus?.hasSubscription) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/dj/panel');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [subscriptionStatus?.hasSubscription, navigate]);

  const getStatusText = () => {
    if (isLoading) {
      return 'Verifica del pagamento in corso…';
    }
    if (subscriptionStatus?.hasSubscription) {
      return 'Pagamento completato con successo!';
    }
    return 'Elaborazione del pagamento…';
  };

  const getPlanText = () => {
    if (!subscriptionStatus?.subscription) return '';
    const plan = subscriptionStatus.subscription.plan;
    return plan === 'MONTHLY' ? 'mensile' : 'annuale';
  };

  const getTrialEndDate = () => {
    if (!subscriptionStatus?.subscription?.trialEnd) return '';
    const date = new Date(subscriptionStatus.subscription.trialEnd);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const done = Boolean(subscriptionStatus?.hasSubscription);

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <div className="px-4 sm:px-6 py-5">
        <Logo size="md" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Lo stato è tutto nella riga colorata a sinistra: verde quando è fatta,
              grigia mentre Stripe ci pensa. */}
          <div className={`pl-5 border-l-2 ${done ? 'border-ok' : 'border-white/20'}`}>
            <Label as="div">{done ? 'Abbonamento attivo' : 'In corso'}</Label>

            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.05]">
              {done ? 'Bentornato in console.' : getStatusText()}
            </h1>

            <p className="mt-4 text-sm text-bone-dim text-pretty">
              {done ? (
                <>Il tuo piano {getPlanText()} è attivo.</>
              ) : (
                <>Stiamo confermando il pagamento con Stripe. Non ricaricare la pagina.</>
              )}
            </p>

            {done && subscriptionStatus?.subscription?.status === 'TRIALING' && (
              <p className="mt-4 pt-4 border-t border-white/[0.08] text-[13px] text-bone-dim text-pretty">
                La prova termina il <span className="num">{getTrialEndDate()}</span>: fino a
                quel giorno non ti viene addebitato nulla.
              </p>
            )}
          </div>

          {done && (
            <div className="mt-8">
              <Button block onClick={() => navigate('/dj/panel')}>
                Vai al pannello
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="num mt-3 text-[13px] text-bone-faint text-center">
                Ti portiamo lì fra {countdown}s
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionSuccess;
