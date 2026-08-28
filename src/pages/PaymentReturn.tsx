import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Loader2, Music, XCircle } from 'lucide-react';
import { requestsApi } from '../services/api';

interface PaymentReturnProps {
  // The guest pressed cancel at the provider instead of paying. Nothing to
  // confirm: the draft request is discarded by the server on its own.
  cancelled?: boolean;
}

// Where a guest lands after paying somewhere that is not this site. PayPal and
// Satispay take over the whole browser, so the confirm step cannot happen in the
// request form the way it does for a card.
const PaymentReturn: React.FC<PaymentReturnProps> = ({ cancelled = false }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestId = params.get('requestId');

  // A query rather than a mutation: React Query will not fire it twice, and a
  // guest who reloads this page gets the same answer instead of a second
  // attempt. Confirming is idempotent on the server anyway.
  const { data, isLoading, error } = useQuery({
    queryKey: ['confirm-request', requestId],
    queryFn: () => requestsApi.confirm(requestId!),
    enabled: Boolean(requestId) && !cancelled,
    // The webhook may still be in flight when the browser gets back first.
    retry: 2,
    refetchOnWindowFocus: false
  });

  const message = (): { icon: React.ReactNode; title: string; detail: string } => {
    if (cancelled) {
      return {
        icon: <XCircle className="w-12 h-12 text-yellow-400" />,
        title: 'Pagamento annullato',
        detail: 'Non ti è stato addebitato nulla. Puoi riprovare quando vuoi.'
      };
    }

    if (!requestId) {
      return {
        icon: <XCircle className="w-12 h-12 text-red-400" />,
        title: 'Link non valido',
        detail: 'Manca il riferimento alla richiesta. Torna indietro e riprova.'
      };
    }

    if (isLoading) {
      return {
        icon: <Loader2 className="w-12 h-12 text-green-400 animate-spin" />,
        title: 'Verifica del pagamento...',
        detail: 'Stiamo controllando il pagamento con il provider.'
      };
    }

    if (error || !data) {
      return {
        icon: <XCircle className="w-12 h-12 text-red-400" />,
        title: 'Pagamento non confermato',
        detail:
          'Se il pagamento è andato a buon fine la richiesta arriverà comunque al DJ. Nessun addebito viene fatto finché la canzone non viene suonata.'
      };
    }

    return {
      icon: <CheckCircle className="w-12 h-12 text-green-400" />,
      title: 'Richiesta inviata!',
      detail:
        'Il DJ la vede ora. Sarai addebitato solo se la canzone viene suonata.'
    };
  };

  const { icon, title, detail } = message();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex items-center mb-8">
          <Music className="w-8 h-8 text-green-400 mr-2" />
          <span className="text-white text-xl font-bold">DJ Request App</span>
        </div>

        <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 max-w-md w-full text-center shadow-2xl shadow-green-400/20">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-green-100 mb-6">{detail}</p>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 shadow-lg shadow-green-400/30"
          >
            Torna alla home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
