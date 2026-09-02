import React, { Suspense, lazy, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, CreditCard, Smartphone, Wallet, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestsApi, eventsApi } from '../services/api';
import DonationSlider from './DonationSlider';
import SpotifySearch from './SpotifySearch';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Label from './ui/Label';
import Field from './ui/Field';
import AlbumArt from './ui/AlbumArt';
import { formatMoney } from './ui/format';
import type { CreateRequestData, PaymentMethod } from '../types';

// Fetched when the guest reaches the payment step, not when the page loads.
const StripePayment = lazy(() => import('./StripePayment'));

// How to label each method if the server offers it. Which ones it offers depends
// on what the platform has switched on and, for Satispay, on whether this DJ has
// connected an account - so that decision is not repeated here.
const METHOD_DETAILS: Record<PaymentMethod, { name: string; icon: LucideIcon }> = {
  CARD: { name: 'Carta', icon: CreditCard },
  APPLE_PAY: { name: 'Apple Pay', icon: Smartphone },
  GOOGLE_PAY: { name: 'Google Pay', icon: Smartphone },
  PAYPAL: { name: 'PayPal', icon: Wallet },
  SATISPAY: { name: 'Satispay', icon: Smartphone }
};

interface SongRequestFormProps {
  eventCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SongRequestForm: React.FC<SongRequestFormProps> = ({
  eventCode,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    songTitle: '',
    artistName: '',
    requesterName: '',
    requesterEmail: '',
    spotifyTrackId: '',
    albumCover: '',
  });
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [chosenMethod, setChosenMethod] = useState<PaymentMethod | null>(null);
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);
  // Set once the server has created the request and told us how to pay for it.
  const [pendingPayment, setPendingPayment] = useState<
    { requestId: string; method: PaymentMethod; clientSecret: string } | null
  >(null);

  // The minimum donation and the payment methods are both the server's to
  // decide; guessing either produces a form that fails at the last step.
  const { data: eventInfo, isLoading: eventInfoLoading } = useQuery({
    queryKey: ['public-event-info', eventCode],
    queryFn: () => eventsApi.getPublicInfo(eventCode),
  });

  const minDonation = eventInfo?.minDonation;
  const effectiveAmount = donationAmount ?? minDonation ?? 0;

  // The DJ set this night's minimum to zero and the guest left it there. There
  // is nothing to authorise, so there is no payment step and nothing to confirm
  // afterwards: the request reaches the DJ the moment it is sent.
  const isFree = minDonation !== undefined && effectiveAmount === 0;

  const availableMethods = eventInfo?.paymentMethods ?? [];
  // The server lists them in its own order, so the first is the default until
  // the guest picks otherwise.
  const paymentMethod = chosenMethod ?? availableMethods[0];

  // Step one: the request is created up front, invisible to the DJ, and the
  // server hands back the authorisation that belongs to it.
  const createRequestMutation = useMutation({
    mutationFn: (data: CreateRequestData) => requestsApi.create(data),
    onSuccess: (response, variables) => {
      // No instructions means there was nothing to pay: the server has already
      // put the request in front of the DJ.
      if (!response.payment || !variables.paymentMethod) {
        toast.success('Richiesta inviata. In attesa che il DJ la accetti');
        onSuccess();
        return;
      }

      // PayPal and Satispay take over the browser instead of embedding a form.
      // The guest comes back to /payment/return, which is where the request gets
      // confirmed, so there is nothing more to do here.
      const externalUrl = response.payment.approvalUrl ?? response.payment.redirectUrl;
      if (externalUrl) {
        window.location.href = externalUrl;
        return;
      }

      if (!response.payment.clientSecret) {
        toast.error('Metodo di pagamento non disponibile');
        return;
      }

      setPendingPayment({
        requestId: response.requestId,
        method: variables.paymentMethod,
        clientSecret: response.payment.clientSecret
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nell\'invio della richiesta';
      toast.error(message);
    },
  });

  // Step three: the server checks the authorisation with Stripe and only then
  // puts the request in front of the DJ.
  const confirmRequestMutation = useMutation({
    mutationFn: (requestId: string) => requestsApi.confirm(requestId),
    onSuccess: () => {
      toast.success('Richiesta inviata. In attesa che il DJ la accetti');
      setPendingPayment(null);
      onSuccess();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error ||
        'Pagamento autorizzato ma la richiesta non è stata confermata';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.songTitle.trim() || !formData.artistName.trim() || !formData.requesterName.trim()) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    // A payment method is only needed when there is something to charge.
    if (minDonation === undefined || (!isFree && !paymentMethod)) {
      toast.error('Impossibile leggere le impostazioni dell\'evento, riprova');
      return;
    }

    if (effectiveAmount < minDonation) {
      toast.error(`La mancia minima è ${formatMoney(minDonation, true)}`);
      return;
    }

    createRequestMutation.mutate({
      eventCode,
      songTitle: formData.songTitle,
      artistName: formData.artistName,
      spotifyTrackId: formData.spotifyTrackId || undefined,
      albumCover: formData.albumCover || undefined,
      requesterName: formData.requesterName,
      requesterEmail: formData.requesterEmail || undefined,
      donationAmount: effectiveAmount,
      paymentMethod: isFree ? undefined : paymentMethod
    });
  };

  const handleSpotifySelect = (track: { songTitle: string; artistName: string; spotifyTrackId?: string; albumCover?: string }) => {
    setFormData({
      ...formData,
      songTitle: track.songTitle,
      artistName: track.artistName,
      spotifyTrackId: track.spotifyTrackId || '',
      albumCover: track.albumCover || '',
    });
    setShowSpotifySearch(false);
  };

  if (showSpotifySearch) {
    return (
      <SpotifySearch
        onSelect={handleSpotifySelect}
        onClose={() => setShowSpotifySearch(false)}
      />
    );
  }

  if (pendingPayment) {
    return (
      <Modal
        title="Pagamento"
        eyebrow={`Autorizzazione ${formatMoney(effectiveAmount, true)}`}
        size="md"
        onClose={() => setPendingPayment(null)}
      >
        <Suspense
          fallback={<p className="py-8 text-center text-sm text-bone-dim">Caricamento pagamento…</p>}
        >
          <StripePayment
            amount={effectiveAmount}
            paymentMethod={pendingPayment.method}
            clientSecret={pendingPayment.clientSecret}
            onSuccess={() => confirmRequestMutation.mutate(pendingPayment.requestId)}
            // Abandoning here leaves an unpaid request behind; the server
            // discards it, and its authorisation, on the next sweep.
            onCancel={() => setPendingPayment(null)}
          />
        </Suspense>
      </Modal>
    );
  }

  return (
    <Modal
      title="Richiedi una canzone"
      eyebrow={eventCode}
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button
            type="submit"
            form="song-request-form"
            className="flex-[2]"
            disabled={
              createRequestMutation.isPending ||
              minDonation === undefined ||
              (!isFree && !paymentMethod)
            }
          >
            {createRequestMutation.isPending
              ? 'Invio…'
              : isFree
                ? 'Invia richiesta'
                : `Continua · ${formatMoney(effectiveAmount, true)}`}
          </Button>
        </div>
      }
    >
      <form id="song-request-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Il brano */}
        <section>
          <Label as="div" className="mb-3">
            Il pezzo
          </Label>

          {formData.spotifyTrackId ? (
            <div className="flex items-center gap-4">
              <AlbumArt
                src={formData.albumCover || undefined}
                alt=""
                className="h-16 w-16 sm:h-20 sm:w-20"
              />
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-bone truncate">
                  {formData.songTitle}
                </p>
                <p className="text-sm text-bone-dim truncate">{formData.artistName}</p>
              </div>
              <button
                type="button"
                aria-label="Rimuovi la canzone scelta"
                onClick={() =>
                  setFormData({
                    ...formData,
                    songTitle: '',
                    artistName: '',
                    spotifyTrackId: '',
                    albumCover: '',
                  })
                }
                className="p-2 rounded-md text-bone-dim hover:text-bone hover:bg-white/[0.06] transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Button block variant="ghost" onClick={() => setShowSpotifySearch(true)}>
                <Search className="h-4 w-4" />
                Cerca su Spotify
              </Button>

              <p className="label-mono my-4 text-center">oppure a mano</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Titolo *"
                  value={formData.songTitle}
                  onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                  placeholder="Titolo della canzone"
                  maxLength={200}
                  required
                />
                <Field
                  label="Artista *"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  placeholder="Nome dell'artista"
                  maxLength={200}
                  required
                />
              </div>
            </>
          )}
        </section>

        <hr className="rule" />

        {/* Chi la chiede */}
        <section>
          <Label as="div" className="mb-3">
            Chi la chiede
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Il tuo nome *"
              value={formData.requesterName}
              onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
              placeholder="Come ti chiami"
              maxLength={60}
              required
            />
            <Field
              label="Email (facoltativa)"
              type="email"
              value={formData.requesterEmail}
              onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
              placeholder="tua@email.com"
              maxLength={254}
              hint="Per la ricevuta"
            />
          </div>
        </section>

        <hr className="rule" />

        {/* Mancia */}
        <section>
          {minDonation === undefined ? (
            <p className="py-4 text-sm text-bone-dim">
              {eventInfoLoading
                ? 'Caricamento importo minimo…'
                : 'Importo minimo non disponibile, riprova più tardi'}
            </p>
          ) : (
            <DonationSlider
              amount={effectiveAmount}
              onChange={setDonationAmount}
              min={minDonation}
              max={100}
            />
          )}
        </section>

        {/* Pagamento: a mancia zero non c'è niente da pagare, quindi la
            sezione sparisce invece di chiedere una carta per zero euro. */}
        {!isFree && (
          <>
            <hr className="rule" />

            <section>
              <Label as="div" className="mb-3">
                Come paghi
              </Label>

              {availableMethods.length === 0 && !eventInfoLoading ? (
                <p className="text-sm text-bone-dim">
                  Nessun metodo di pagamento disponibile per questo evento.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableMethods.map((method) => {
                    const { name, icon: Icon } = METHOD_DETAILS[method];
                    const selected = paymentMethod === method;

                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setChosenMethod(method)}
                        aria-pressed={selected}
                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-md border transition-colors min-h-[68px] ${
                          selected
                            ? 'border-bone bg-white/[0.06] text-bone'
                            : 'border-white/[0.12] text-bone-dim hover:border-white/30 hover:text-bone'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[13px] font-medium">{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Le condizioni: la cosa che più spesso genera dubbi, quindi in chiaro. */}
        <div className="border-l-2 border-white/15 pl-4 py-1">
          <Label as="div">{isFree ? 'Come funziona' : 'Come funziona il pagamento'}</Label>
          {isFree ? (
            <ul className="mt-2 space-y-1.5 text-[13px] text-bone-dim text-pretty">
              <li>Nessun pagamento: la richiesta è gratuita.</li>
              <li>Il DJ la vede subito e decide se accettarla.</li>
              <li>Se preferisci farti notare, alza la mancia qui sopra.</li>
            </ul>
          ) : (
            <ul className="mt-2 space-y-1.5 text-[13px] text-bone-dim text-pretty">
              <li>L'importo viene autorizzato ora, ma addebitato solo se il DJ accetta.</li>
              <li>Se rifiuta, non paghi nulla.</li>
              <li>
                Se non risponde, l'autorizzazione decade entro 12 ore — subito, se la serata
                finisce prima.
              </li>
            </ul>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default SongRequestForm;
