import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueApi, eventsApi } from '../services/api';
import PublicQueue from '../components/PublicQueue';
import SongRequestForm from '../components/SongRequestForm';
import AppHeader from '../components/AppHeader';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Code from '../components/ui/Code';
import Surface from '../components/ui/Surface';
import Modal from '../components/ui/Modal';
import { useSocket } from '../hooks/useSocket';

const Event: React.FC = () => {
  const { eventCode } = useParams<{ eventCode: string }>();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const { data: eventInfo, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event-info', eventCode],
    queryFn: () => eventsApi.getByCode(eventCode!),
    enabled: !!eventCode,
    retry: false,
  });

  const { data: queue, isLoading: queueLoading, error: queueError } = useQuery({
    queryKey: ['public-queue', eventCode],
    queryFn: () => queueApi.getPublic(eventCode!),
    enabled: !!eventCode,
    refetchInterval: 60000,
  });

  useSocket({
    eventCode: eventCode || '',
    onRequestAccepted: () => {
      toast.success('La tua richiesta è stata accettata');
    },
    onRequestRejected: () => {
      toast.error('La tua richiesta è stata rifiutata');
    },
    onNowPlayingChanged: (song) => {
      toast(`Ora in riproduzione: ${song.songTitle}`);
    },
  });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (!eventCode || (queueError && eventError)) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col">
        <AppHeader back="/" width="md" />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="max-w-sm text-center">
            <Label as="div" tone="live">
              Evento non trovato
            </Label>
            <h1 className="mt-4 font-display text-2xl font-bold">
              {eventCode ? (
                <>
                  Nessun evento con il codice <Code emphasis>{eventCode}</Code>
                </>
              ) : (
                'Codice evento mancante'
              )}
            </h1>
            <p className="mt-3 text-sm text-bone-dim text-pretty">
              Potrebbe essere scritto male, oppure la serata è già finita. Controlla il codice
              esposto in console.
            </p>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => window.location.assign('/')}>Prova un altro codice</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = eventLoading || queueLoading;

  const meta = eventInfo
    ? [eventInfo.dj?.name, eventInfo.city, formatDateTime(eventInfo.dateTime)]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <div className="min-h-screen bg-ink-950">
      <AppHeader
        back="/"
        width="md"
        eyebrow={<Code>{eventCode}</Code>}
        title={eventInfo?.name ?? 'Coda live'}
        meta={meta}
        actions={
          <>
            <Button
              size="sm"
              variant="quiet"
              onClick={() => setShowDonationForm(true)}
              aria-label="Fai una donazione"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Donazione</span>
            </Button>
            <Button size="sm" onClick={() => setShowRequestForm(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Richiedi</span>
            </Button>
          </>
        }
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-12">
        {isLoading ? (
          <QueueSkeleton />
        ) : (
          <>
            <Surface padding="md" className="mb-10">
              <Label as="div">Come funziona</Label>
              <ol className="mt-3 space-y-1.5 text-sm text-bone-dim">
                <li className="flex gap-3">
                  <span className="num text-bone-faint shrink-0">01</span>
                  Cerchi il pezzo e lo mandi al DJ, con una mancia se vuoi.
                </li>
                <li className="flex gap-3">
                  <span className="num text-bone-faint shrink-0">02</span>
                  Il DJ accetta o rifiuta. L'addebito avviene solo se accetta.
                </li>
                <li className="flex gap-3">
                  <span className="num text-bone-faint shrink-0">03</span>
                  La canzone entra in coda e la segui qui sotto in tempo reale.
                </li>
              </ol>
            </Surface>

            <PublicQueue queue={queue || []} />
          </>
        )}
      </main>

      {/* Su mobile l'azione principale resta sempre raggiungibile col pollice. */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-ink-950/95 backdrop-blur-sm border-t border-white/[0.08] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button block onClick={() => setShowRequestForm(true)}>
          <Plus className="h-4 w-4" />
          Richiedi una canzone
        </Button>
      </div>

      {showRequestForm && (
        <SongRequestForm
          eventCode={eventCode}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => setShowRequestForm(false)}
        />
      )}

      {/* Le donazioni libere non sono ancora attive lato server: il modale
          esiste solo per dirlo e reindirizzare alla richiesta. */}
      {showDonationForm && (
        <Modal
          title="Fai una donazione"
          eyebrow="Supporta il DJ"
          size="sm"
          onClose={() => setShowDonationForm(false)}
          footer={
            <Button
              block
              onClick={() => {
                setShowDonationForm(false);
                setShowRequestForm(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Richiedi una canzone
            </Button>
          }
        >
          <p className="text-sm text-bone-dim text-pretty">
            Se ti sta piacendo la serata puoi lasciare qualcosa al DJ.
          </p>
          <div className="mt-4 border-l-2 border-warn/60 pl-3 py-1">
            <Label as="div" className="text-warn">
              In arrivo
            </Label>
            <p className="mt-1.5 text-sm text-bone-dim text-pretty">
              La donazione libera non è ancora attiva. Per ora il modo di sostenerlo è
              richiedere una canzone con una mancia.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

const QueueSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4 py-4 border-b border-white/[0.08]">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-sm bg-ink-800 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded-sm bg-ink-800 animate-pulse" />
          <div className="h-3 w-1/3 rounded-sm bg-ink-800 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export default Event;
