import React, { Suspense, lazy, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, CreditCard, Smartphone, Wallet, Music, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestsApi, eventsApi } from '../services/api';
import DonationSlider from './DonationSlider';
import SpotifySearch from './SpotifySearch';
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

  const availableMethods = eventInfo?.paymentMethods ?? [];
  // The server lists them in its own order, so the first is the default until
  // the guest picks otherwise.
  const paymentMethod = chosenMethod ?? availableMethods[0];

  // Step one: the request is created up front, invisible to the DJ, and the
  // server hands back the authorisation that belongs to it.
  const createRequestMutation = useMutation({
    mutationFn: (data: CreateRequestData) => requestsApi.create(data),
    onSuccess: (response, variables) => {
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
      toast.success('Richiesta inviata! In attesa dell\'approvazione del DJ...');
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

    if (minDonation === undefined || !paymentMethod) {
      toast.error('Impossibile leggere le impostazioni dell\'evento, riprova');
      return;
    }

    if (effectiveAmount < minDonation) {
      toast.error(`Donazione minima è €${minDonation}`);
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
      paymentMethod
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-green-900/40 backdrop-blur-lg rounded-2xl border border-green-400/30 shadow-2xl shadow-green-400/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-400/30">
          <h2 className="text-2xl font-bold text-green-400" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.5)'}}>
            Richiedi una Canzone
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-400/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-green-400" />
          </button>
        </div>

        {pendingPayment ? (
          <Suspense
            fallback={<p className="p-6 text-center text-green-200/70">Caricamento pagamento...</p>}
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
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Spotify Search Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowSpotifySearch(true)}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span>Cerca su Spotify</span>
                <Search className="w-5 h-5" />
              </button>
              <p className="text-center text-green-200/60 text-sm mt-2">
                oppure inserisci manualmente
              </p>
            </div>

            {/* Selected Song Preview */}
            {formData.spotifyTrackId && (
              <div className="flex items-center gap-4 p-4 bg-black/40 border border-green-400/30 rounded-xl">
                {formData.albumCover ? (
                  <img
                    src={formData.albumCover}
                    alt="Album cover"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-green-900/50 flex items-center justify-center">
                    <Music className="w-8 h-8 text-green-400/50" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-green-400">{formData.songTitle}</h3>
                  <p className="text-green-200/70">{formData.artistName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, songTitle: '', artistName: '', spotifyTrackId: '', albumCover: '' })}
                  className="p-2 hover:bg-green-400/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-green-400" />
                </button>
              </div>
            )}

            {/* Manual Song Details */}
            {!formData.spotifyTrackId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-300 mb-2">
                    Titolo Canzone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.songTitle}
                    onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                    className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-xl text-green-400 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder="Inserisci titolo canzone"
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-300 mb-2">
                    Nome Artista <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-xl text-green-400 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder="Inserisci nome artista"
                    maxLength={200}
                    required
                  />
                </div>
              </div>
            )}

            {/* Requester Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  Il Tuo Nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-xl text-green-400 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder="Inserisci il tuo nome"
                  maxLength={60}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Email (Opzionale)</label>
                <input
                  type="email"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-xl text-green-400 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder="tua@email.com"
                  maxLength={254}
                />
              </div>
            </div>

            {/* Donation Amount */}
            <div className="bg-black/40 border border-green-400/30 rounded-xl p-4">
              {minDonation === undefined ? (
                <p className="text-green-200/60 text-sm text-center py-4">
                  {eventInfoLoading
                    ? 'Caricamento importo minimo...'
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
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-green-300 mb-3">Metodo di Pagamento</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableMethods.map((method) => {
                  const { name, icon: Icon } = METHOD_DETAILS[method];
                  const selected = paymentMethod === method;

                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setChosenMethod(method)}
                      className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${
                        selected
                          ? 'border-green-400 bg-green-400/10'
                          : 'border-green-400/30 hover:border-green-400/60 bg-black/40'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${selected ? 'text-green-400' : 'text-green-200/60'}`} />
                      <span className={`text-sm font-medium ${selected ? 'text-green-400' : 'text-green-200/60'}`}>
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {availableMethods.length === 0 && !eventInfoLoading && (
                <p className="text-green-200/60 text-sm">
                  Nessun metodo di pagamento disponibile per questo evento.
                </p>
              )}
            </div>

            {/* Important Note */}
            <div className="bg-yellow-900/30 border border-yellow-400/30 rounded-xl p-4">
              <h4 className="font-medium text-yellow-400 mb-2">Importante:</h4>
              <ul className="text-yellow-200/80 text-sm space-y-1">
                <li>• Sarai addebitato solo se il DJ accetta la tua richiesta</li>
                <li>• Le richieste scadono dopo 3 ore se non esaminate</li>
                <li>• Il tuo pagamento sara autorizzato ma non addebitato fino all'accettazione</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-black/40 border-2 border-green-400/50 text-green-400 font-bold py-3 px-6 rounded-xl hover:bg-green-400/10 transition-all duration-300"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={createRequestMutation.isPending || minDonation === undefined || !paymentMethod}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-xl hover:from-green-400 hover:to-green-300 transition-all duration-300 shadow-lg shadow-green-400/30 disabled:opacity-50"
              >
                {createRequestMutation.isPending ? 'Invio...' : 'Continua al Pagamento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SongRequestForm;
