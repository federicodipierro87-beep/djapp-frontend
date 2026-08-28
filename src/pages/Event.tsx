import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Music, Plus, ArrowLeft, Heart, MapPin, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueApi, eventsApi } from '../services/api';
import PublicQueue from '../components/PublicQueue';
import SongRequestForm from '../components/SongRequestForm';
import { useSocket } from '../hooks/useSocket';

const Event: React.FC = () => {
  const { eventCode } = useParams<{ eventCode: string }>();
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  // Try to fetch event info from new events system
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

  // Socket.io real-time updates
  useSocket({
    eventCode: eventCode || '',
    onRequestAccepted: () => {
      toast.success('La tua richiesta è stata accettata!');
    },
    onRequestRejected: () => {
      toast.error('La tua richiesta è stata rifiutata');
    },
    onNowPlayingChanged: (song) => {
      toast(`Ora in riproduzione: ${song.songTitle}`, { icon: '🎵' });
    },
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!eventCode) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-green-400 mb-4">Codice Evento Non Valido</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  // Show error only if both event info and queue fail
  if (queueError && eventError) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl font-bold text-green-400 mb-4">Evento Non Trovato</h1>
          <p className="text-green-200/70 mb-6">Il codice evento "{eventCode}" non esiste o è terminato.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300"
          >
            Prova un Altro Codice
          </button>
        </div>
      </div>
    );
  }

  const isLoading = eventLoading || queueLoading;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neon Green Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-500/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-green-400/30 animate-pulse shadow-lg shadow-green-400/50"></div>
        <div className="absolute top-60 right-32 w-20 h-20 rounded-full bg-green-300/40 animate-bounce shadow-md shadow-green-300/50"></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-green-500/35 animate-pulse shadow-sm shadow-green-500/50"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-green-900/30 backdrop-blur-lg border-b border-green-400/30 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="mr-2 sm:mr-4 p-1 sm:p-2 rounded-lg hover:bg-green-400/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </button>
                <div>
                  {eventInfo ? (
                    <>
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 flex items-center" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.5)'}}>
                        <Music className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-400" />
                        {eventInfo.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-green-200/80">
                        {eventInfo.dj && (
                          <span className="font-medium text-green-300">{eventInfo.dj.name}</span>
                        )}
                        {eventInfo.city && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {eventInfo.city}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDateTime(eventInfo.dateTime)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 flex items-center" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.5)'}}>
                        <Music className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-400" />
                        <span className="hidden sm:inline">Evento: </span>{eventCode}
                      </h1>
                      <p className="text-sm sm:text-base text-green-200/70">Richiedi canzoni e guarda la coda live</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-2 px-4 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 flex items-center justify-center text-sm sm:text-base shadow-lg shadow-green-400/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Richiedi Canzone</span>
                  <span className="sm:hidden">Richiedi</span>
                </button>
                <button
                  onClick={() => setShowDonationForm(true)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base shadow-lg shadow-red-600/30"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Fai una donazione</span>
                  <span className="sm:hidden">Donazione</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-green-400 animate-spin" style={{filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'}} />
            </div>
          ) : (
            <>
              {/* Request Form Modal */}
              {showRequestForm && (
                <SongRequestForm
                  eventCode={eventCode}
                  onClose={() => setShowRequestForm(false)}
                  onSuccess={() => {
                    setShowRequestForm(false);
                  }}
                />
              )}

              {/* Donation Form Modal */}
              {showDonationForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-green-900/40 backdrop-blur-lg rounded-2xl border border-green-400/30 shadow-2xl shadow-green-400/20 p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-green-400 flex items-center">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2" />
                        <span className="hidden sm:inline">Fai una donazione</span>
                        <span className="sm:hidden">Donazione</span>
                      </h2>
                      <button
                        onClick={() => setShowDonationForm(false)}
                        className="text-green-400/60 hover:text-green-400 p-1 transition-colors"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="text-center py-4 sm:py-8">
                      <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" style={{filter: 'drop-shadow(0 0 10px rgba(248, 113, 113, 0.5))'}} />
                      <h3 className="text-base sm:text-lg font-semibold text-green-400 mb-2">
                        Supporta il DJ!
                      </h3>
                      <p className="text-sm sm:text-base text-green-200/70 mb-4 sm:mb-6">
                        Se ti piace la musica, fai una donazione libera per supportare il DJ.
                      </p>
                      <div className="bg-yellow-900/30 border border-yellow-400/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                        <p className="text-yellow-400 text-xs sm:text-sm">
                          <strong>Funzionalita in arrivo!</strong><br />
                          Il sistema di donazioni sara disponibile a breve. Per ora puoi supportare il DJ richiedendo una canzone.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowDonationForm(false);
                          setShowRequestForm(true);
                        }}
                        className="bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 w-full flex items-center justify-center text-sm sm:text-base shadow-lg shadow-green-400/30"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Richiedi Canzone Invece
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-green-900/20 backdrop-blur-lg border border-green-400/30 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl shadow-green-400/10">
                <h2 className="text-base sm:text-lg font-semibold text-green-400 mb-2 sm:mb-3" style={{textShadow: '0 0 10px rgba(34, 197, 94, 0.3)'}}>Come funziona</h2>
                <ol className="text-green-200/80 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-green-400 font-bold mr-2">1.</span>
                    Clicca "Richiedi Canzone" per inviare una canzone con una donazione
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 font-bold mr-2">2.</span>
                    Il DJ esaminera la tua richiesta e la accettera o rifiutera
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 font-bold mr-2">3.</span>
                    Se accettata, la tua canzone entra in coda e verrai addebitato
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 font-bold mr-2">4.</span>
                    Guarda la coda live qui sotto per vedere quando suona la tua canzone!
                  </li>
                </ol>
              </div>

              {/* Queue */}
              <div className="bg-green-900/20 backdrop-blur-lg border border-green-400/30 rounded-2xl p-4 sm:p-6 shadow-xl shadow-green-400/10">
                <h2 className="text-lg font-semibold text-green-400 mb-4" style={{textShadow: '0 0 10px rgba(34, 197, 94, 0.3)'}}>
                  Coda Live
                </h2>
                <PublicQueue queue={queue || []} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Event;
