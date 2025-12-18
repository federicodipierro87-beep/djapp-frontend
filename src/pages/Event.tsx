import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Music, Plus, ArrowLeft, Heart } from 'lucide-react';
import { queueApi } from '../services/api';
import PublicQueue from '../components/PublicQueue';
import SongRequestForm from '../components/SongRequestForm';
import { PublicQueueItem } from '../types';

const Event: React.FC = () => {
  const { eventCode } = useParams<{ eventCode: string }>();
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const { data: queue, isLoading, error } = useQuery({
    queryKey: ['public-queue', eventCode],
    queryFn: () => queueApi.getPublic(eventCode!),
    enabled: !!eventCode,
    refetchInterval: 30000, // Ridotto da 5s a 30s per evitare rate limiting
  });

  if (!eventCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Codice Evento Non Valido</h1>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento Non Trovato</h1>
          <p className="text-gray-600 mb-6">Il codice evento "{eventCode}" non esiste o è terminato.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Prova un Altro Codice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-2 sm:mr-4 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                  <Music className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary-600" />
                  <span className="hidden sm:inline">Evento: </span>{eventCode}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">Richiedi canzoni e guarda la coda live</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowRequestForm(true)}
                className="btn-primary flex items-center justify-center text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Richiedi Canzone</span>
                <span className="sm:hidden">Richiedi</span>
              </button>
              <button
                onClick={() => setShowDonationForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2" />
                      <span className="hidden sm:inline">Fai una donazione</span>
                      <span className="sm:hidden">Donazione</span>
                    </h2>
                    <button
                      onClick={() => setShowDonationForm(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-center py-4 sm:py-8">
                    <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      Supporta il DJ!
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Se ti piace la musica, fai una donazione libera per supportare il DJ.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <p className="text-yellow-800 text-xs sm:text-sm">
                        <strong>Funzionalità in arrivo!</strong><br />
                        Il sistema di donazioni sarà disponibile a breve. Per ora puoi supportare il DJ richiedendo una canzone.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDonationForm(false);
                        setShowRequestForm(true);
                      }}
                      className="btn-primary w-full flex items-center justify-center text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Richiedi Canzone Invece
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">Come funziona</h2>
              <ol className="text-blue-800 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>1. Clicca "Richiedi Canzone" per inviare una canzone con una donazione</li>
                <li>2. Il DJ esaminerà la tua richiesta e la accetterà o rifiuterà</li>
                <li>3. Se accettata, la tua canzone entra in coda e verrai addebitato</li>
                <li>4. Guarda la coda live qui sotto per vedere quando suona la tua canzone!</li>
              </ol>
            </div>

            {/* Queue */}
            <PublicQueue queue={queue || []} />
          </>
        )}
      </div>
    </div>
  );
};

export default Event;