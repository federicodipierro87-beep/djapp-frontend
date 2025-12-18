import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, 
  LogOut, 
  Settings, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle, 
  Euro,
  QrCode,
  RefreshCw,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, requestsApi, queueApi, djApi } from '../services/api';
import DJQueue from '../components/DJQueue';
import RequestList from '../components/RequestList';
import EarningsCounter from '../components/EarningsCounter';
import DJSettings from '../components/DJSettings';

const DJPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'queue' | 'settings'>('requests');
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

  const { data: requests, refetch: refetchRequests } = useQuery({
    queryKey: ['dj-requests'],
    queryFn: requestsApi.getDJRequests,
    refetchInterval: 30000, // Ridotto da 5s a 30s
  });

  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['dj-queue'],
    queryFn: queueApi.getDJ,
    refetchInterval: 30000, // Ridotto da 5s a 30s
  });

  const { data: stats } = useQuery({
    queryKey: ['dj-stats'],
    queryFn: djApi.getStats,
    refetchInterval: 60000, // Ridotto da 10s a 60s
  });

  const newEventMutation = useMutation({
    mutationFn: djApi.generateNewEventCode,
    onSuccess: (data) => {
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

  const handleNewEvent = () => {
    if (window.confirm('Attenzione: l\'evento corrente verrà terminato automaticamente e verrà salvato un riassunto negli insights. Vuoi procedere con la creazione del nuovo evento?')) {
      newEventMutation.mutate();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dj_token');
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

  const pendingRequests = requests?.filter(r => r.status === 'PENDING') || [];

  if (djLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!djData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
          <button
            onClick={() => navigate('/dj/login')}
            className="btn-primary"
          >
            Vai al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mr-2 sm:mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard DJ</h1>
                <p className="text-sm sm:text-base text-gray-600">Bentornato, {djData.name}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Event Code Display */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-2 sm:p-3">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  <div>
                    <p className="text-xs text-primary-600 font-medium">Codice Evento</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-base sm:text-lg text-primary-800">{djData.eventCode}</span>
                      <button
                        onClick={handleCopyEventCode}
                        className="p-1 hover:bg-primary-100 rounded transition-colors"
                        title="Copia codice evento"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={handleCopyEventUrl}
                  className="btn-secondary flex items-center justify-center text-sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Copia URL Evento</span>
                  <span className="sm:hidden">URL</span>
                </button>

                <button
                  onClick={handleNewEvent}
                  disabled={newEventMutation.isPending}
                  className="btn-primary flex items-center justify-center text-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{newEventMutation.isPending ? 'Avvio...' : 'Nuovo Evento'}</span>
                  <span className="sm:hidden">Nuovo</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center justify-center text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Esci</span>
                  <span className="sm:hidden">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-xs sm:text-sm text-blue-600">In Attesa</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-800">{pendingRequests.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-xs sm:text-sm text-green-600">Accettate</p>
                  <p className="text-lg sm:text-xl font-bold text-green-800">{stats?.acceptedRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 sm:col-span-1 col-span-2">
              <div className="flex items-center">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-xs sm:text-sm text-purple-600">In Coda</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-800">{queueData?.queue.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-xs sm:text-sm text-yellow-600">Richieste Totali</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-800">{stats?.totalRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-xs sm:text-sm text-emerald-600">Guadagni</p>
                  <p className="text-lg sm:text-xl font-bold text-emerald-800">€{queueData?.totalEarnings || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="hidden sm:inline">Richieste in Attesa</span>
              <span className="sm:hidden">Richieste</span>
              {pendingRequests.length > 0 && (
                <span className="ml-1 sm:ml-2 bg-red-100 text-red-800 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'queue'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="hidden sm:inline">Coda Canzoni</span>
              <span className="sm:hidden">Coda</span>
              {queueData && queueData.queue.length > 0 && (
                <span className="ml-1 sm:ml-2 bg-primary-100 text-primary-800 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {queueData.queue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Impostazioni
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
          <DJQueue 
            queue={queueData.queue} 
            totalEarnings={queueData.totalEarnings}
            onUpdate={refetchQueue}
          />
        )}
        
        {activeTab === 'settings' && (
          <DJSettings 
            dj={djData} 
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['dj-me'] });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DJPanel;