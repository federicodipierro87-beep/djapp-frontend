import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Music, Check, Crown, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../services/api';
import { logout } from '../services/session';
import type { SubscriptionPlan } from '../types';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  // If already subscribed, redirect to panel
  if (subscriptionStatus?.hasSubscription) {
    navigate('/dj/panel');
    return null;
  }

  const plans = [
    {
      id: 'MONTHLY' as SubscriptionPlan,
      name: 'Mensile',
      price: '4.99',
      period: '/mese',
      features: [
        'Accesso completo al pannello DJ',
        'Gestione richieste in tempo reale',
        'Coda canzoni illimitata',
        'Statistiche dettagliate',
        'QR Code eventi',
        'Supporto prioritario'
      ],
      popular: false
    },
    {
      id: 'ANNUAL' as SubscriptionPlan,
      name: 'Annuale',
      price: '49',
      period: '/anno',
      monthlyEquivalent: '4.08',
      discount: '18%',
      features: [
        'Tutto del piano Mensile',
        'Risparmia il 18%',
        '2 mesi gratis',
        'Accesso anticipato nuove funzionalità',
        'Badge DJ Pro'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="flex items-center text-green-300 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Esci
            </button>
            <div className="flex items-center">
              <Music className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-white font-semibold">DJ Request App</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-green-300 text-sm font-medium">7 giorni di prova gratuita</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ textShadow: '0 0 30px rgba(34, 197, 94, 0.5)' }}>
            Scegli il tuo piano
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Inizia con 7 giorni di prova gratuita. Nessun addebito fino alla fine del periodo di prova.
          </p>
        </div>

        {/* Plans */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-green-900/20 backdrop-blur-lg rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'border-green-400 shadow-lg shadow-green-400/30 scale-[1.02]'
                  : 'border-green-400/30 hover:border-green-400/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 text-black text-xs font-bold px-4 py-1 rounded-full flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    PIU' POPOLARE
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-green-400">€{plan.price}</span>
                  <span className="text-green-200 ml-1">{plan.period}</span>
                </div>
                {plan.monthlyEquivalent && (
                  <p className="text-green-300 text-sm mt-1">
                    (€{plan.monthlyEquivalent}/mese)
                  </p>
                )}
                {plan.discount && (
                  <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded mt-2">
                    RISPARMI {plan.discount}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-green-100 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div
                className={`w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center transition-colors ${
                  selectedPlan === plan.id
                    ? 'border-green-400 bg-green-400'
                    : 'border-green-400/50'
                }`}
              >
                {selectedPlan === plan.id && (
                  <Check className="w-4 h-4 text-black" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={handleCheckout}
            disabled={checkoutMutation.isPending}
            className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-4 px-8 rounded-xl hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/30 hover:shadow-green-400/50 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
          >
            {checkoutMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Reindirizzamento...
              </>
            ) : (
              <>
                Inizia la prova gratuita
              </>
            )}
          </button>
          <p className="text-green-300/70 text-sm mt-4">
            Annulla in qualsiasi momento durante il periodo di prova.
            <br />
            Non ti verrà addebitato nulla fino al termine dei 7 giorni.
          </p>
        </div>

        {/* FAQ / Trust Signals */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <h3 className="text-white font-semibold mb-4">Domande frequenti</h3>
          <div className="space-y-4 text-left">
            <div className="bg-green-900/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-1">Cosa succede dopo i 7 giorni?</h4>
              <p className="text-green-200/70 text-sm">
                Dopo il periodo di prova, verrai addebitato automaticamente per il piano scelto.
                Puoi annullare in qualsiasi momento prima della fine della prova.
              </p>
            </div>
            <div className="bg-green-900/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-1">Posso cambiare piano in seguito?</h4>
              <p className="text-green-200/70 text-sm">
                Si, puoi passare dal piano mensile a quello annuale (o viceversa) in qualsiasi momento
                dal portale di gestione abbonamento.
              </p>
            </div>
            <div className="bg-green-900/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-1">Come posso annullare?</h4>
              <p className="text-green-200/70 text-sm">
                Puoi annullare l'abbonamento in qualsiasi momento dalle impostazioni del tuo account.
                L'accesso rimarrà attivo fino alla fine del periodo pagato.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
