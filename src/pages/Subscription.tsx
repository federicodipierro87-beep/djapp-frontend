import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../services/api';
import { logout } from '../services/session';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import type { SubscriptionPlan } from '../types';

const PLANS = [
  {
    id: 'MONTHLY' as SubscriptionPlan,
    name: 'Mensile',
    price: '4,99 €',
    period: 'al mese',
    note: null as string | null,
    features: [
      'Pannello DJ completo',
      'Richieste in tempo reale',
      'Coda senza limiti',
      'Statistiche di ogni serata',
      'QR code per gli eventi',
    ],
  },
  {
    id: 'ANNUAL' as SubscriptionPlan,
    name: 'Annuale',
    price: '49 €',
    period: "all'anno",
    note: '4,08 € al mese · due mesi in regalo',
    features: [
      'Tutto quello del mensile',
      'Risparmi il 18%',
      'Accesso anticipato alle novità',
    ],
  },
];

const FAQ = [
  {
    q: 'Cosa succede dopo i sette giorni?',
    a: 'Parte il rinnovo del piano che hai scelto. Puoi annullare in qualsiasi momento prima della fine della prova, senza che ti venga addebitato nulla.',
  },
  {
    q: 'Posso cambiare piano?',
    a: 'Sì, dal portale di gestione dell\'abbonamento, in qualsiasi momento, in entrambe le direzioni.',
  },
  {
    q: 'Come si annulla?',
    a: 'Dalle impostazioni del tuo account. L\'accesso resta attivo fino alla fine del periodo già pagato.',
  },
];

const Subscription: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('ANNUAL');
  const navigate = useNavigate();

  const { data: subscriptionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionApi.getStatus,
    retry: false,
  });

  const checkoutMutation = useMutation({
    mutationFn: () => {
      const baseUrl = window.location.origin;
      return subscriptionApi.createCheckoutSession(
        selectedPlan,
        `${baseUrl}/dj/subscription/success`,
        `${baseUrl}/dj/subscription`
      );
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore durante il checkout';
      toast.error(message);
    },
  });

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    navigate('/dj/login');
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="h-8 w-32 rounded bg-ink-900 animate-pulse" />
      </div>
    );
  }

  // If already subscribed, redirect to panel
  if (subscriptionStatus?.hasSubscription) {
    navigate('/dj/panel');
    return null;
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <Logo size="md" />
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-[13px] text-bone-dim hover:text-bone transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Esci
        </button>
      </div>

      <main className="px-4 sm:px-6 pb-20 max-w-3xl mx-auto">
        <header className="pt-8 sm:pt-12">
          <Label as="div">Sette giorni di prova</Label>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Scegli il piano.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-bone-dim max-w-lg text-pretty">
            Nessun addebito fino alla fine della prova. Puoi annullare prima e non paghi niente.
          </p>
        </header>

        {/* Due opzioni sole: il confronto è fra due prezzi, non fra due vetrine. */}
        <div role="radiogroup" aria-label="Piano di abbonamento" className="mt-10 grid sm:grid-cols-2 gap-3">
          {PLANS.map((plan) => {
            const selected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSelectedPlan(plan.id)}
                className={`text-left rounded-lg p-5 border transition-colors ${
                  selected
                    ? 'bg-ink-900 border-white/40'
                    : 'bg-ink-900 border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <Label as="div" tone={selected ? 'live' : 'dim'}>
                    {plan.name}
                  </Label>
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selected ? 'border-bone bg-bone' : 'border-white/25'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-ink-950" strokeWidth={3} />}
                  </span>
                </div>

                <p className="num mt-4 text-3xl font-semibold leading-none">{plan.price}</p>
                <p className="mt-1.5 text-[13px] text-bone-dim">{plan.period}</p>
                {plan.note && <p className="mt-1 text-[13px] text-bone-faint">{plan.note}</p>}

                <ul className="mt-5 pt-4 border-t border-white/[0.08] space-y-1.5 text-[13px] text-bone-dim">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <Button block onClick={handleCheckout} disabled={checkoutMutation.isPending}>
            {checkoutMutation.isPending ? 'Reindirizzamento…' : 'Inizia la prova gratuita'}
          </Button>
          <p className="mt-3 text-[13px] text-bone-faint text-center text-pretty">
            Paghi con Stripe. Nessun addebito prima del settimo giorno.
          </p>
        </div>

        <section className="mt-16 pt-8 border-t border-white/[0.08]">
          <Label as="div">Domande</Label>
          <dl className="mt-5 divide-y divide-white/[0.08]">
            {FAQ.map((item) => (
              <div key={item.q} className="py-4">
                <dt className="font-medium text-bone">{item.q}</dt>
                <dd className="mt-1.5 text-[13px] text-bone-dim text-pretty">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
};

export default Subscription;
