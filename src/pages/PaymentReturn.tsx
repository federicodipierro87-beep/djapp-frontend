import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { requestsApi } from '../services/api';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Surface from '../components/ui/Surface';

interface PaymentReturnProps {
  // The guest pressed cancel at the provider instead of paying. Nothing to
  // confirm: the draft request is discarded by the server on its own.
  cancelled?: boolean;
}

type Outcome = {
  tone: 'ok' | 'warn' | 'live' | 'dim';
  eyebrow: string;
  title: string;
  detail: string;
};

// Il colore è l'unico segnale di stato: niente icone dentro un cerchio, che è
// il tell più riconoscibile delle schermate di conferma generiche.
const rules: Record<Outcome['tone'], string> = {
  ok: 'border-ok',
  warn: 'border-warn',
  live: 'border-live',
  dim: 'border-white/20',
};

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

  const outcome = (): Outcome => {
    if (cancelled) {
      return {
        tone: 'warn',
        eyebrow: 'Annullato',
        title: 'Non se n’è fatto niente',
        detail: 'Non ti è stato addebitato nulla. Puoi riprovare quando vuoi.'
      };
    }

    if (!requestId) {
      return {
        tone: 'live',
        eyebrow: 'Link non valido',
        title: 'Manca il riferimento alla richiesta',
        detail: 'Torna indietro e riprova dalla pagina dell’evento.'
      };
    }

    if (isLoading) {
      return {
        tone: 'dim',
        eyebrow: 'Verifica in corso',
        title: 'Stiamo controllando il pagamento',
        detail: 'Un momento: lo confermiamo con il provider.'
      };
    }

    if (error || !data) {
      return {
        tone: 'live',
        eyebrow: 'Non confermato',
        title: 'Non abbiamo ricevuto conferma',
        detail:
          'Se il pagamento è andato a buon fine la richiesta arriverà comunque al DJ. Nessun addebito viene fatto finché la canzone non viene suonata.'
      };
    }

    return {
      tone: 'ok',
      eyebrow: 'Inviata',
      title: 'Il DJ la vede ora',
      detail: 'Sarai addebitato solo se la canzone viene suonata.'
    };
  };

  const { tone, eyebrow, title, detail } = outcome();

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <div className="px-4 sm:px-6 py-5">
        <Link to="/" className="inline-flex" aria-label="Home">
          <Logo size="md" />
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <Surface padding="lg" className="w-full max-w-md">
          <div className={`border-l-2 pl-4 py-1 ${rules[tone]}`} role="status">
            <Label as="div" tone={tone === 'live' ? 'live' : 'dim'}>
              {eyebrow}
            </Label>
            <h1 className="mt-2.5 font-display text-2xl font-bold leading-tight text-balance">
              {title}
            </h1>
            <p className="mt-2.5 text-sm text-bone-dim text-pretty">{detail}</p>
          </div>

          <div className="mt-8">
            <Button block onClick={() => navigate('/')}>
              Torna alla home
            </Button>
          </div>
        </Surface>
      </main>
    </div>
  );
};

export default PaymentReturn;
