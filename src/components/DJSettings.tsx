import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Copy, StopCircle, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { djApi } from '../services/api';
import Surface from './ui/Surface';
import Button from './ui/Button';
import Field from './ui/Field';
import Label from './ui/Label';
import StatusDot from './ui/StatusDot';
import EmptyState from './ui/EmptyState';
import { formatMoney } from './ui/format';
import { MIN_DONATION } from '../config/payments';
import type { DJ, EventSummary } from '../types';

interface DJSettingsProps {
  dj: DJ;
  onUpdate: () => void;
}

/** Titolo di sezione: micro-label mono sopra, riga sotto. Niente icone decorative. */
const Section: React.FC<{ eyebrow: string; title: string; children: React.ReactNode }> = ({
  eyebrow,
  title,
  children,
}) => (
  <section>
    <Label as="div">{eyebrow}</Label>
    <h3 className="mt-2 font-display text-xl font-bold tracking-tight">{title}</h3>
    <div className="mt-5">{children}</div>
  </section>
);

/** Pannello di stato: il colore sta solo nella riga a sinistra. */
const StatePanel: React.FC<{
  tone: 'ok' | 'warn' | 'muted';
  children: React.ReactNode;
}> = ({ tone, children }) => {
  const rules = { ok: 'border-l-ok', warn: 'border-l-warn', muted: 'border-l-white/20' };
  return (
    <Surface tone="inset" className={`border-l-2 ${rules[tone]}`}>
      {children}
    </Surface>
  );
};

// Where the DJ's account id used to be a text field they filled in themselves.
// It is now read-only here and written only by Stripe's own onboarding, because
// it decides where their guests' money is sent.
const StripeConnectPanel: React.FC = () => {
  const { data: status, isLoading } = useQuery({
    queryKey: ['connectStatus'],
    queryFn: djApi.getConnectStatus,
  });

  const onboardMutation = useMutation({
    mutationFn: djApi.startConnectOnboarding,
    onSuccess: ({ url }) => {
      // Onboarding is hosted by Stripe: identity documents and bank details
      // never pass through this app.
      window.location.href = url;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Impossibile aprire la configurazione Stripe');
    },
  });

  if (isLoading || !status) {
    return <div className="h-28 rounded-lg bg-ink-800 animate-pulse" />;
  }

  const complete = status.onboardingComplete;
  // An account can exist and still not be able to charge: Stripe holds it until
  // it has verified who the DJ is.
  const started = Boolean(status.accountId) && !complete;

  return (
    <StatePanel tone={complete ? 'ok' : 'warn'}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot tone={complete ? 'ok' : 'warn'} />
            <Label as="div" tone={complete ? 'dim' : 'live'}>
              Stripe
            </Label>
          </div>

          <p className="mt-2 font-medium text-bone">
            {complete ? 'Incassi attivi' : started ? 'Verifica da completare' : 'Incassi da configurare'}
          </p>

          <p className="mt-1 text-[13px] text-bone-dim text-pretty">
            {complete
              ? 'Le donazioni dei tuoi ospiti arrivano direttamente sul tuo conto Stripe.'
              : started
              ? 'Stripe non ha ancora finito di verificare il tuo account: riprendi dove avevi lasciato.'
              : 'Collega un conto Stripe per ricevere le donazioni direttamente.'}
          </p>

          {complete && !status.payoutsEnabled && (
            <p className="mt-2 text-[13px] text-bone-dim text-pretty">
              I bonifici verso il tuo conto bancario non sono ancora attivi: Stripe trattiene
              gli incassi finché non completi gli ultimi dati richiesti.
            </p>
          )}

          {/* Only worth alarming them about once it actually blocks guests. */}
          {status.required && !complete && (
            <p className="mt-2 text-[13px] font-medium text-warn text-pretty">
              Finché non completi questo passaggio i tuoi ospiti non possono pagare le richieste.
            </p>
          )}

          {status.accountId && (
            <p className="num mt-3 text-[11px] text-bone-faint break-all">{status.accountId}</p>
          )}
        </div>

        {/* Nothing left to ask Stripe for once charges and payouts are both on,
            so the link is offered only while something is still missing. */}
        {!(complete && status.payoutsEnabled) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onboardMutation.mutate()}
            disabled={onboardMutation.isPending}
          >
            <ExternalLink className="h-4 w-4" />
            {onboardMutation.isPending ? 'Apertura…' : status.accountId ? 'Riprendi' : 'Configura'}
          </Button>
        )}
      </div>
    </StatePanel>
  );
};

// Satispay has no marketplace: the money can only reach the DJ if the payment
// was created against their own business account. So this connects that account
// rather than onboarding into ours the way Stripe Connect does. The DJ hands
// over a single-use activation code; the key pair is made on the server and the
// private half never comes back here.
const SatispayPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activationCode, setActivationCode] = useState('');

  const { data: status, isLoading } = useQuery({
    queryKey: ['satispayStatus'],
    queryFn: djApi.getSatispayStatus,
  });

  const connectMutation = useMutation({
    mutationFn: djApi.connectSatispay,
    onSuccess: () => {
      toast.success('Satispay collegato');
      setActivationCode('');
      queryClient.invalidateQueries({ queryKey: ['satispayStatus'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Impossibile collegare Satispay');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: djApi.disconnectSatispay,
    onSuccess: () => {
      toast.success('Satispay scollegato');
      queryClient.invalidateQueries({ queryKey: ['satispayStatus'] });
    },
    onError: (error: any) => {
      // Refused while payments are still on hold: disconnecting would leave the
      // guests' money locked with nobody able to release it.
      toast.error(error.response?.data?.error || 'Impossibile scollegare Satispay');
    },
  });

  if (isLoading || !status) {
    return <div className="h-28 rounded-lg bg-ink-800 animate-pulse" />;
  }

  const handleDisconnect = () => {
    if (window.confirm('Scollegare Satispay? I tuoi ospiti non potranno più pagare con Satispay.')) {
      disconnectMutation.mutate();
    }
  };

  return (
    <StatePanel tone={status.connected ? 'ok' : 'muted'}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot tone={status.connected ? 'ok' : 'muted'} />
            <Label as="div">Satispay {status.connected ? '' : '· opzionale'}</Label>
          </div>

          <p className="mt-2 font-medium text-bone">
            {status.connected ? 'Collegato' : 'Non collegato'}
          </p>

          <p className="mt-1 text-[13px] text-bone-dim text-pretty">
            {status.connected
              ? 'I tuoi ospiti possono pagare con Satispay e l\'importo arriva sul tuo conto business.'
              : 'Collega il tuo conto Satispay Business per offrire Satispay ai tuoi ospiti.'}
          </p>

          {status.connected && (
            <p className="num mt-3 text-[11px] text-bone-faint break-all">{status.keyId}</p>
          )}

          <p className="num mt-1 text-[11px] text-bone-faint">{status.environment}</p>
        </div>

        {status.connected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ? 'Scollegamento…' : 'Scollega'}
          </Button>
        )}
      </div>

      {!status.connected && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <Field
              id="satispay-activation-code"
              label="Codice di attivazione"
              type="text"
              mono
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="Dal tuo Satispay Business Dashboard"
              hint="Si trova in Impostazioni → Negozi online del dashboard Satispay Business. Vale una volta sola."
            />
          </div>
          <Button
            onClick={() => connectMutation.mutate(activationCode.trim())}
            disabled={connectMutation.isPending || activationCode.trim().length < 6}
            className="sm:mt-[26px]"
          >
            {connectMutation.isPending ? 'Collegamento…' : 'Collega'}
          </Button>
        </div>
      )}
    </StatePanel>
  );
};

const DJSettings: React.FC<DJSettingsProps> = ({ dj, onUpdate }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: dj.name,
    minDonation: dj.minDonation,
    paypalEmail: dj.paypalEmail || '',
  });

  const updateMutation = useMutation({
    mutationFn: djApi.updateSettings,
    onSuccess: () => {
      toast.success('Impostazioni salvate');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile salvare le impostazioni';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.minDonation < MIN_DONATION || formData.minDonation > 1000) {
      toast.error(
        `La donazione minima deve essere fra ${formatMoney(MIN_DONATION, true)} e ${formatMoney(1000, true)}`
      );
      return;
    }

    updateMutation.mutate({
      name: formData.name,
      minDonation: formData.minDonation,
      paypalEmail: formData.paypalEmail || undefined,
    });
  };

  const eventUrl = `${window.location.origin}/event/${dj.eventCode}`;

  const handleCopyEventUrl = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success('Link dell\'evento copiato');
  };

  const handleCopyEventCode = () => {
    navigator.clipboard.writeText(dj.eventCode);
    toast.success('Codice evento copiato');
  };

  const endEventMutation = useMutation({
    mutationFn: djApi.endCurrentEvent,
    onSuccess: () => {
      toast.success('Evento terminato! Riassunto salvato negli insights.');
      onUpdate();
      // Invalida la cache degli insights per aggiornare la lista
      queryClient.invalidateQueries({ queryKey: ['eventSummaries', dj.id] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile terminare l\'evento';
      toast.error(message);
    },
  });

  const { data: eventSummaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['eventSummaries', dj.id],
    queryFn: djApi.getEventSummaries,
  });

  const deleteEventSummaryMutation = useMutation({
    mutationFn: djApi.deleteEventSummary,
    onSuccess: () => {
      toast.success('Insight evento cancellato!');
      // Invalida la cache e forza il refetch
      queryClient.invalidateQueries({ queryKey: ['eventSummaries', dj.id] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile cancellare l\'insight';
      toast.error(message);
    },
  });

  const handleEndEvent = () => {
    if (window.confirm('Sei sicuro di voler terminare l\'evento corrente? Questo salverà un riassunto negli insights e svuoterà la coda, ma non creerà un nuovo evento.')) {
      endEventMutation.mutate();
    }
  };

  const handleDeleteEventSummary = (id: string, eventCode: string) => {
    if (window.confirm(`Sei sicuro di voler cancellare l'insight dell'evento ${eventCode}? Questa azione non può essere annullata.`)) {
      deleteEventSummaryMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-10">
      <Section eyebrow="Serata in corso" title="Evento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <span className="field-label">Codice evento</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dj.eventCode}
                readOnly
                aria-label="Codice evento"
                className="field font-mono tabular-nums text-lg font-semibold tracking-[0.15em]"
              />
              <Button variant="ghost" onClick={handleCopyEventCode} aria-label="Copia il codice">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <span className="field-label">Link dell'evento</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={eventUrl}
                readOnly
                aria-label="Link dell'evento"
                className="field text-[13px]"
              />
              <Button variant="ghost" onClick={handleCopyEventUrl} aria-label="Copia il link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chiudere la serata è irreversibile: sta in fondo, staccato, con il rosso
            riservato a questa singola azione. */}
        <Surface tone="inset" className="mt-6 border-l-2 border-l-live">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-bone">Termina la serata</p>
              <p className="mt-1 text-[13px] text-bone-dim text-pretty">
                Salva il riassunto negli insights, svuota la coda, chiude le richieste
                ancora aperte e azzera le statistiche. Il codice evento resta lo stesso.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndEvent}
              disabled={endEventMutation.isPending}
            >
              <StopCircle className="h-4 w-4" />
              {endEventMutation.isPending ? 'Chiusura…' : 'Termina'}
            </Button>
          </div>
        </Surface>
      </Section>

      <hr className="rule" />

      <Section eyebrow="Profilo pubblico" title="Impostazioni">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Nome DJ"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Field label="Email" type="email" value={dj.email} readOnly />

            <Field
              label="Donazione minima (€)"
              type="number"
              min={MIN_DONATION}
              max="1000"
              step="0.5"
              mono
              value={formData.minDonation}
              onChange={(e) => setFormData({ ...formData, minDonation: Number(e.target.value) })}
              hint={`Sotto questa cifra la richiesta non parte. Il minimo assoluto è ${formatMoney(
                MIN_DONATION,
                true
              )}: i circuiti di pagamento rifiutano gli importi più bassi.`}
              required
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending} className="mt-6">
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Salvataggio…' : 'Salva'}
          </Button>
        </form>
      </Section>

      <hr className="rule" />

      <Section eyebrow="Dove arrivano i soldi" title="Incassi">
        <div className="space-y-4">
          <StripeConnectPanel />

          <SatispayPanel />

          <Field
            label="Email PayPal (facoltativa)"
            type="email"
            value={formData.paypalEmail}
            onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
            placeholder="tua@paypal.email"
            hint="Si salva insieme alle impostazioni qui sopra."
          />
        </div>

        <ul className="mt-6 pt-5 border-t border-white/[0.08] space-y-2 text-[13px] text-bone-dim">
          <li>La donazione viene trattenuta e addebitata solo quando suoni la canzone.</li>
          <li>Con Stripe o Satispay collegati l'importo arriva sul tuo conto, non sul nostro.</li>
          <li>I metodi che non hai collegato non vengono proposti ai tuoi ospiti.</li>
        </ul>
      </Section>

      <hr className="rule" />

      <Section eyebrow="Serate passate" title="Insights">
        {summariesLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 rounded-lg bg-ink-900 animate-pulse" />
            ))}
          </div>
        ) : eventSummaries && eventSummaries.length > 0 ? (
          <div className="space-y-3">
            {eventSummaries.slice(0, 5).map((summary: EventSummary) => {
              const days = Math.ceil(
                (new Date(summary.endedAt).getTime() - new Date(summary.startedAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const rate =
                summary.totalRequests > 0
                  ? Math.round((summary.acceptedRequests / summary.totalRequests) * 100)
                  : 0;

              return (
                <Surface key={summary.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Label as="div">{summary.eventCode}</Label>
                      <p className="num mt-1.5 text-[13px] text-bone-dim">
                        {new Date(summary.startedAt).toLocaleDateString('it-IT')} —{' '}
                        {new Date(summary.endedAt).toLocaleDateString('it-IT')}
                        <span className="text-bone-faint"> · {days}g</span>
                      </p>
                    </div>

                    <div className="flex items-start gap-2 shrink-0">
                      <span className="num text-xl font-semibold leading-none pt-0.5">
                        {formatMoney(Number(summary.totalEarnings), true)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEventSummary(summary.id, summary.eventCode)}
                        disabled={deleteEventSummaryMutation.isPending}
                        title="Cancella insight evento"
                        aria-label="Cancella insight evento"
                        className="-mt-1.5 -mr-1.5 p-2 rounded-md text-bone-faint hover:text-live hover:bg-white/[0.06] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Griglia densa: in cabina si guarda di sfuggita, i numeri in mono
                      restano allineati fra una serata e l'altra. */}
                  <dl className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-3">
                    {[
                      { k: 'Richieste', v: summary.totalRequests },
                      { k: 'Accettate', v: summary.acceptedRequests },
                      { k: 'Suonate', v: summary.playedSongs },
                      { k: 'Saltate', v: summary.skippedSongs },
                      { k: 'Rifiutate', v: summary.rejectedRequests },
                      { k: 'Scadute', v: summary.expiredRequests },
                    ].map((cell) => (
                      <div key={cell.k}>
                        <dt className="label-mono text-bone-faint">{cell.k}</dt>
                        <dd className="num mt-1 text-base font-semibold">{cell.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-baseline justify-between gap-4">
                    <Label as="div">Tasso di accettazione</Label>
                    <span className="num text-sm font-semibold">{rate}%</span>
                  </div>
                </Surface>
              );
            })}

            {eventSummaries.length > 5 && (
              <p className="pt-2 text-[13px] text-bone-faint text-center">
                Ultime 5 serate su {eventSummaries.length}.
              </p>
            )}
          </div>
        ) : (
          <div className="border border-white/[0.08] rounded-lg">
            <EmptyState
              title="Nessuna serata conclusa"
              description="Quando termini un evento il riassunto compare qui."
            />
          </div>
        )}
      </Section>

      <hr className="rule" />

      <Section eyebrow="Account" title="Il tuo profilo">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <dt className="label-mono text-bone-faint">Registrato il</dt>
            <dd className="num mt-1.5 text-sm">
              {dj.createdAt ? new Date(dj.createdAt).toLocaleDateString('it-IT') : '—'}
            </dd>
          </div>

          <div>
            <dt className="label-mono text-bone-faint">Evento corrente</dt>
            <dd className="num mt-1.5 text-sm">{dj.eventCode}</dd>
          </div>

          {dj.updatedAt && (
            <div>
              <dt className="label-mono text-bone-faint">Ultima modifica</dt>
              <dd className="num mt-1.5 text-sm">
                {new Date(dj.updatedAt).toLocaleDateString('it-IT')}
              </dd>
            </div>
          )}
        </dl>
      </Section>
    </div>
  );
};

export default DJSettings;
