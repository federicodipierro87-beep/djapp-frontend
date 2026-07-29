import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Music, Loader2, ArrowRight } from 'lucide-react';
import { subscriptionApi } from '../services/api';

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
      return 'Verifica del pagamento in corso...';
    }
    if (subscriptionStatus?.hasSubscription) {
      return 'Pagamento completato con successo!';
    }
    return 'Elaborazione del pagamento...';
  };

  const getPlanText = () => {
    if (!subscriptionStatus?.subscription) return '';
    const plan = subscriptionStatus.subscription.plan;
    return plan === 'MONTHLY' ? 'Piano Mensile' : 'Piano Annuale';
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

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <Music className="w-8 h-8 text-green-400 mr-2" />
          <span className="text-white text-xl font-bold">DJ Request App</span>
        </div>

        {/* Success Card */}
        <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 max-w-md w-full text-center shadow-2xl shadow-green-400/20">
          {subscriptionStatus?.hasSubscription ? (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2" style={{ textShadow: '0 0 30px rgba(34, 197, 94, 0.5)' }}>
                Benvenuto!
              </h1>

              <p className="text-green-100 mb-6">
                Il tuo abbonamento <span className="font-semibold text-green-400">{getPlanText()}</span> è attivo.
              </p>

              {subscriptionStatus.subscription?.status === 'TRIALING' && (
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
                  <p className="text-green-200 text-sm">
                    Il tuo periodo di prova termina il <span className="font-semibold">{getTrialEndDate()}</span>.
                    Non ti verrà addebitato nulla fino a quella data.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/dj/panel')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/30 flex items-center justify-center"
                >
                  Vai al Pannello DJ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <p className="text-green-300/70 text-sm">
                  Reindirizzamento automatico in {countdown} secondi...
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">
                {getStatusText()}
              </h1>

              <p className="text-green-100 mb-6">
                Attendi mentre confermiamo il tuo abbonamento...
              </p>

              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
