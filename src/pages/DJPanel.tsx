import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, QrCode, RefreshCw, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, requestsApi, queueApi, djApi, subscriptionApi } from '../services/api';
import { logout } from '../services/session';
import RequestList from '../components/RequestList';
import DJSettings from '../components/DJSettings';
import DJProfile from '../components/DJProfile';
import QRCodeModal from '../components/QRCodeModal';
import SubscriptionStatus from '../components/SubscriptionStatus';
import EventList from '../components/EventList';
import { useSocket } from '../hooks/useSocket';
import RealtimeStatus from '../components/RealtimeStatus';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import { formatMoney } from '../components/ui/format';

// Drag and drop is only needed once the DJ opens the queue tab, and it brings
// the whole of dnd-kit with it.
const DJQueue = lazy(() => import('../components/DJQueue'));

type Tab = 'requests' | 'queue' | 'events' | 'settings' | 'profile';

const TABS: { id: Tab; label: string; short: string }[] = [
  { id: 'requests', label: 'Richieste', short: 'Richieste' },
  { id: 'queue', label: 'Coda', short: 'Coda' },
  { id: 'events', label: 'Eventi', short: 'Eventi' },
  { id: 'profile', label: 'Profilo', short: 'Profilo' },
  { id: 'settings', label: 'Impostazioni', short: 'Impost.' },
];

/** Una cifra sola per riquadro: in cabina si legge di sfuggita. */
const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: 'default' | 'live' }> = ({
  label,
  value,
  tone = 'default',
}) => (
  <div className="px-3 py-2.5 sm:px-4 sm:py-3">
    <Label as="div" tone={tone === 'live' ? 'live' : 'dim'}>
      {label}
    </Label>
    <p
      className={`num mt-1.5 text-xl sm:text-2xl font-semibold leading-none ${
        tone === 'live' ? 'text-live' : 'text-bone'
      }`}
    >
      {value}
    </p>
  </div>
);

const DJPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('requests');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<{ qrCode: string; eventCode: string; eventUrl: string } | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('dj_token');
    if (!token) {
      navigate('/dj/login');
    }
  }, [navigate]);

  const { data: djData, isLoading: djLoading } = useQuery({
    queryKey: ['dj-me'],
    queryFn: authApi.me,
    retry: false,
  });

  const { data: subscriptionStatus, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionApi.getStatus,
    retry: false,
  });

  // Redirect to subscription page if subscription is required
  useEffect(() => {
    if (!subscriptionLoading && subscriptionStatus?.requiresSubscription) {
      navigate('/dj/subscription');
    }
  }, [subscriptionStatus, subscriptionLoading, navigate]);

  // Declared before the queries below because their polling interval depends on
  // whether live updates are currently arriving.
  const { isConnected: realtimeConnected } = useSocket({
    eventCode: djData?.eventCode || '',
    onNewRequest: () => {
      toast('Nuova richiesta ricevuta');
    },
  });

  // Socket.io is what delivers a new request within the second; polling is only
  // the safety net for when it is not connected, so it tightens up exactly then.
  // Three queries at 15s is 180 requests per 15 minutes, well inside the limit.
  const fallbackPollMs = realtimeConnected ? 60000 : 15000;

  const { data: requests, refetch: refetchRequests } = useQuery({
    queryKey: ['dj-requests'],
    queryFn: () => requestsApi.getDJRequests({ status: 'PENDING' }),
    refetchInterval: fallbackPollMs,
  });

  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['dj-queue'],
    queryFn: queueApi.getDJ,
    refetchInterval: fallbackPollMs,
  });

  const { data: stats } = useQuery({
    queryKey: ['dj-stats'],
    queryFn: djApi.getStats,
    refetchInterval: fallbackPollMs,
  });

  const newEventMutation = useMutation({
    mutationFn: djApi.generateNewEventCode,
    onSuccess: () => {
      toast.success('Nuovo evento iniziato!');
      queryClient.invalidateQueries({ queryKey: ['dj-me'] });
      queryClient.invalidateQueries({ queryKey: ['dj-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dj-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dj-stats'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nel creare nuovo evento';
      toast.error(message);
    },
  });

  const qrMutation = useMutation({
    mutationFn: djApi.generateQRCode,
    onSuccess: (data) => {
      setQrData(data);
      setShowQRModal(true);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nel generare QR Code';
      toast.error(message);
    },
  });

  const handleNewEvent = () => {
    if (window.confirm('Attenzione: l\'evento corrente verrà terminato automaticamente e verrà salvato un riassunto negli insights. Vuoi procedere con la creazione del nuovo evento?')) {
      newEventMutation.mutate();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Disconnesso con successo');
  };

  const handleCopyEventCode = () => {
    if (djData?.eventCode) {
      navigator.clipboard.writeText(djData.eventCode);
      toast.success('Codice evento copiato!');
    }
  };

  const handleCopyEventUrl = () => {
    if (djData?.eventCode) {
      const url = `${window.location.origin}/event/${djData.eventCode}`;
      navigator.clipboard.writeText(url);
      toast.success('URL evento copiato!');
    }
  };

  const handleShowQRCode = () => {
    qrMutation.mutate();
  };

  const pendingRequests = requests?.filter(r => r.status === 'PENDING') || [];

  // The badge counts songs still to play. It used to count the whole array,
  // which also holds the songs already played, so it only ever grew.
  const waitingSongs =
    queueData?.queue.filter(item => item.status === 'WAITING' || item.status === 'NOW_PLAYING') || [];

  const tabCounts: Partial<Record<Tab, number>> = {
    requests: pendingRequests.length,
    queue: waitingSongs.length,
  };

  if (djLoading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <Label>Caricamento</Label>
      </div>
    );
  }

  if (!djData) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Label as="div" tone="live">
            Accesso negato
          </Label>
          <h1 className="mt-3 font-display text-2xl font-bold">Serve un accesso valido</h1>
          <Button className="mt-6" onClick={() => navigate('/dj/login')}>
            Vai al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Barra identità + azioni sull'evento */}
      <header className="border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Logo size="sm" />
            <span className="text-[13px] text-bone-dim truncate">{djData.name}</span>

            <div className="ml-auto flex items-center gap-2">
              <SubscriptionStatus compact />
              <RealtimeStatus connected={realtimeConnected} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            {/* Il codice evento è ciò che il DJ detta al microfono: sta grande. */}
            <div>
              <Label as="div">Codice evento</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="num text-2xl sm:text-3xl font-semibold tracking-[0.15em] leading-none">
                  {djData.eventCode}
                </span>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={handleCopyEventCode}
                  aria-label="Copia il codice evento"
                  title="Copia codice"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowQRCode}
                disabled={qrMutation.isPending}
              >
                <QrCode className="h-4 w-4" />
                QR
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopyEventUrl}>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copia link</span>
                <span className="sm:hidden">Link</span>
              </Button>
              <Button size="sm" onClick={handleNewEvent} disabled={newEventMutation.isPending}>
                <RefreshCw className="h-4 w-4" />
                {newEventMutation.isPending ? 'Avvio…' : 'Nuovo evento'}
              </Button>
              <Button variant="quiet" size="sm" onClick={handleLogout} aria-label="Esci">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Numeri della serata: densi, senza riquadri colorati. */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-white/[0.08] -mx-3 sm:-mx-4">
            <Stat
              label="In attesa"
              value={pendingRequests.length}
              tone={pendingRequests.length > 0 ? 'live' : 'default'}
            />
            <Stat label="In coda" value={waitingSongs.length} />
            <Stat label="Accettate" value={stats?.acceptedRequests || 0} />
            <Stat label="Richieste" value={stats?.totalRequests || 0} />
            <Stat label="Incasso" value={formatMoney(queueData?.totalEarnings || 0, true)} />
          </div>
        </div>
      </div>

      {/* Tab */}
      <nav className="border-b border-white/[0.08] sticky top-0 z-20 bg-ink-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
            {TABS.map((tab) => {
              const count = tabCounts[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-3.5 px-3 text-sm font-medium whitespace-nowrap transition-colors
                    border-b-2 -mb-px ${
                      isActive
                        ? 'border-bone text-bone'
                        : 'border-transparent text-bone-dim hover:text-bone'
                    }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={`num ml-2 text-[11px] px-1.5 py-0.5 rounded-sm ${
                        tab.id === 'requests' ? 'bg-live text-bone' : 'bg-ink-700 text-bone-dim'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenuto */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'requests' && (
          <RequestList
            requests={pendingRequests}
            onUpdate={() => {
              refetchRequests();
              refetchQueue();
            }}
          />
        )}

        {activeTab === 'queue' && queueData && (
          <Suspense fallback={<Label as="div">Caricamento coda</Label>}>
            <DJQueue
              queue={queueData.queue}
              totalEarnings={queueData.totalEarnings}
              onUpdate={refetchQueue}
            />
          </Suspense>
        )}

        {activeTab === 'events' && <EventList />}

        {activeTab === 'profile' && <DJProfile dj={djData} />}

        {activeTab === 'settings' && (
          <DJSettings
            dj={djData}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['dj-me'] });
            }}
          />
        )}
      </main>

      {/* QR Code Modal */}
      {qrData && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrCode={qrData.qrCode}
          eventCode={qrData.eventCode}
          eventUrl={qrData.eventUrl}
        />
      )}
    </div>
  );
};

export default DJPanel;
