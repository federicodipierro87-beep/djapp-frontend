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
    refetchInterval: 5000,
  });

  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['dj-queue'],
    queryFn: queueApi.getDJ,
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ['dj-stats'],
    queryFn: djApi.getStats,
    refetchInterval: 10000,
  });

  const newEventMutation = useMutation({
    mutationFn: djApi.generateNewEventCode,
    onSuccess: (data) => {
      toast.success('New event started!');
      queryClient.invalidateQueries({ queryKey: ['dj-me'] });
      queryClient.invalidateQueries({ queryKey: ['dj-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dj-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dj-stats'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to start new event';
      toast.error(message);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('dj_token');
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleCopyEventCode = () => {
    if (djData?.eventCode) {
      navigator.clipboard.writeText(djData.eventCode);
      toast.success('Event code copied to clipboard!');
    }
  };

  const handleCopyEventUrl = () => {
    if (djData?.eventCode) {
      const url = `${window.location.origin}/event/${djData.eventCode}`;
      navigator.clipboard.writeText(url);
      toast.success('Event URL copied to clipboard!');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <button
            onClick={() => navigate('/dj/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Music className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DJ Dashboard</h1>
                <p className="text-gray-600">Welcome back, {djData.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Event Code Display */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-xs text-primary-600 font-medium">Event Code</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-primary-800">{djData.eventCode}</span>
                      <button
                        onClick={handleCopyEventCode}
                        className="p-1 hover:bg-primary-100 rounded transition-colors"
                        title="Copy event code"
                      >
                        <Copy className="w-4 h-4 text-primary-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleCopyEventUrl}
                className="btn-secondary flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Event URL
              </button>

              <button
                onClick={() => newEventMutation.mutate()}
                disabled={newEventMutation.isPending}
                className="btn-primary flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {newEventMutation.isPending ? 'Starting...' : 'New Event'}
              </button>

              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600">Pending</p>
                  <p className="text-xl font-bold text-blue-800">{pendingRequests.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600">Accepted</p>
                  <p className="text-xl font-bold text-green-800">{stats?.acceptedRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Music className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600">In Queue</p>
                  <p className="text-xl font-bold text-purple-800">{queueData?.queue.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-yellow-600">Total Requests</p>
                  <p className="text-xl font-bold text-yellow-800">{stats?.totalRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center">
                <Euro className="w-5 h-5 text-emerald-600 mr-2" />
                <div>
                  <p className="text-sm text-emerald-600">Earnings</p>
                  <p className="text-xl font-bold text-emerald-800">€{queueData?.totalEarnings || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'queue'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Song Queue
              {queueData && queueData.queue.length > 0 && (
                <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-full">
                  {queueData.queue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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