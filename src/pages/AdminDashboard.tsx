import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingDJs = [], isLoading: loadingPending } = useQuery({
    queryKey: ['admin', 'djs', 'pending'],
    queryFn: adminApi.getPendingDJs,
  });

  const { data: allDJs = [], isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'djs', 'all'],
    queryFn: adminApi.getAllDJs,
    enabled: activeTab === 'all',
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveDJ,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'djs'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nell\'approvazione';
      toast.error(message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: adminApi.rejectDJ,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'djs'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nel respingere';
      toast.error(message);
    },
  });

  const handleApprove = (djId: string) => {
    if (window.confirm('Sei sicuro di voler approvare questo DJ?')) {
      approveMutation.mutate(djId);
    }
  };

  const handleReject = (djId: string) => {
    if (window.confirm('Sei sicuro di voler respingere questo DJ?')) {
      rejectMutation.mutate(djId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dj_token');
    navigate('/');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            In attesa
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approvato
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Respinto
          </span>
        );
      default:
        return null;
    }
  };

  const isLoading = loadingPending || loadingAll;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neon Green Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-500/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-green-900/20 backdrop-blur-lg border-b border-green-400/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center text-green-300 hover:text-green-400 transition-colors"
                  style={{textShadow: '0 0 10px rgba(134, 239, 172, 0.3)'}}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Home
                </button>
                <h1 className="text-2xl font-bold text-white" style={{textShadow: '0 0 30px rgba(34, 197, 94, 0.5)'}}>
                  Admin Dashboard
                </h1>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-green-400/30">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'pending'
                      ? 'border-green-400 text-green-400'
                      : 'border-transparent text-green-200 hover:text-green-300 hover:border-green-300'
                  }`}
                >
                  Richieste Pendenti ({pendingDJs.length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'all'
                      ? 'border-green-400 text-green-400'
                      : 'border-transparent text-green-200 hover:text-green-300 hover:border-green-300'
                  }`}
                >
                  Tutti i DJ
                </button>
              </nav>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            </div>
          )}

          {/* Pending DJs Tab */}
          {activeTab === 'pending' && !isLoading && (
            <div>
              {pendingDJs.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-green-300/50" />
                  <h3 className="mt-2 text-lg font-medium text-green-200">Nessuna richiesta pendente</h3>
                  <p className="mt-1 text-green-300/70">Non ci sono DJ in attesa di approvazione al momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDJs.map((dj) => (
                    <div
                      key={dj.id}
                      className="bg-green-900/20 backdrop-blur-lg rounded-lg p-6 border border-green-400/30 shadow-lg shadow-green-400/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-white">{dj.name}</h3>
                            {getStatusBadge(dj.status)}
                          </div>
                          <p className="text-green-200 mt-1">{dj.email}</p>
                          <p className="text-green-300/70 text-sm mt-1">
                            Registrato il {formatDate(dj.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleApprove(dj.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-2 inline" />
                            Approva
                          </button>
                          <button
                            onClick={() => handleReject(dj.id)}
                            disabled={rejectMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 mr-2 inline" />
                            Respingi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All DJs Tab */}
          {activeTab === 'all' && !isLoading && (
            <div>
              {allDJs.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-green-300/50" />
                  <h3 className="mt-2 text-lg font-medium text-green-200">Nessun DJ registrato</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {allDJs.map((dj) => (
                    <div
                      key={dj.id}
                      className="bg-green-900/20 backdrop-blur-lg rounded-lg p-6 border border-green-400/30 shadow-lg shadow-green-400/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-white">{dj.name}</h3>
                            {getStatusBadge(dj.status)}
                          </div>
                          <p className="text-green-200 mt-1">{dj.email}</p>
                          {dj.eventCode && (
                            <p className="text-green-300/70 text-sm mt-1">
                              Codice evento: <span className="font-mono text-green-400">{dj.eventCode}</span>
                            </p>
                          )}
                          <p className="text-green-300/70 text-sm mt-1">
                            Registrato il {formatDate(dj.createdAt)}
                          </p>
                        </div>
                        {dj.status === 'PENDING' && (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleApprove(dj.id)}
                              disabled={approveMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-2 inline" />
                              Approva
                            </button>
                            <button
                              onClick={() => handleReject(dj.id)}
                              disabled={rejectMutation.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4 mr-2 inline" />
                              Respingi
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;