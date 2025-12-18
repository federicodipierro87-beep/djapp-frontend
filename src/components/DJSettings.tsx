import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Settings, Euro, CreditCard, Mail, Save, Copy, QrCode, AlertTriangle, RotateCcw, StopCircle, BarChart3, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { djApi } from '../services/api';
import type { DJ, EventSummary } from '../types';

interface DJSettingsProps {
  dj: DJ;
  onUpdate: () => void;
}

const DJSettings: React.FC<DJSettingsProps> = ({ dj, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: dj.name,
    minDonation: dj.minDonation,
    stripeAccountId: dj.stripeAccountId || '',
    paypalEmail: dj.paypalEmail || '',
    satispayId: dj.satispayId || '',
  });

  const updateMutation = useMutation({
    mutationFn: djApi.updateSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update settings';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.minDonation < 0.01 || formData.minDonation > 1000) {
      toast.error('Minimum donation must be between €0.01 and €1000');
      return;
    }

    updateMutation.mutate({
      name: formData.name,
      minDonation: formData.minDonation,
      stripeAccountId: formData.stripeAccountId || undefined,
      paypalEmail: formData.paypalEmail || undefined,
      satispayId: formData.satispayId || undefined,
    });
  };

  const handleCopyEventUrl = () => {
    const url = `${window.location.origin}/event/${dj.eventCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Event URL copied to clipboard!');
  };

  const handleCopyEventCode = () => {
    navigator.clipboard.writeText(dj.eventCode);
    toast.success('Event code copied to clipboard!');
  };

  const newEventMutation = useMutation({
    mutationFn: djApi.generateNewEventCode,
    onSuccess: () => {
      toast.success('Nuovo evento creato! Il precedente è stato cancellato.');
      onUpdate();
      refetchSummaries();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to create new event';
      toast.error(message);
    },
  });

  const endEventMutation = useMutation({
    mutationFn: djApi.endCurrentEvent,
    onSuccess: (data) => {
      toast.success('Evento terminato! Riassunto salvato negli insights.');
      onUpdate();
      refetchSummaries();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to end event';
      toast.error(message);
    },
  });

  const handleNewEvent = () => {
    if (window.confirm('Sei sicuro di voler creare un nuovo evento? Questo cancellerà l\'evento attuale, svuoterà la coda e scadrà tutte le richieste pending.')) {
      newEventMutation.mutate();
    }
  };

  const { data: eventSummaries, isLoading: summariesLoading, refetch: refetchSummaries } = useQuery({
    queryKey: ['eventSummaries', dj.id],
    queryFn: djApi.getEventSummaries,
  });

  const handleEndEvent = () => {
    if (window.confirm('Sei sicuro di voler terminare l\'evento corrente? Questo salverà un riassunto negli insights e svuoterà la coda, ma non creerà un nuovo evento.')) {
      endEventMutation.mutate();
    }
  };

  return (
    <div className="space-y-8">
      {/* Event Information */}
      <div className="card">
        <div className="flex items-center mb-4">
          <QrCode className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Event Code</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={dj.eventCode}
                readOnly
                className="form-input font-mono text-lg font-bold bg-gray-50"
              />
              <button
                onClick={handleCopyEventCode}
                className="btn-secondary flex items-center"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Event URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/event/${dj.eventCode}`}
                readOnly
                className="form-input bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyEventUrl}
                className="btn-secondary flex items-center"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Event Management */}
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Gestione Evento</h4>
              <p className="text-orange-700 text-sm">Termina l'evento corrente o creane uno nuovo</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEndEvent}
                disabled={endEventMutation.isPending}
                className="btn-secondary flex items-center bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
              >
                {endEventMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Terminando...
                  </>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    Termina Evento
                  </>
                )}
              </button>
              <button
                onClick={handleNewEvent}
                disabled={newEventMutation.isPending}
                className="btn-secondary flex items-center bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
              >
                {newEventMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Nuovo Evento
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-800 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <strong>"Termina Evento":</strong>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside ml-2">
                      <li>Salva riassunto negli insights</li>
                      <li>Svuota coda e chiude richieste</li>
                      <li>Non crea un nuovo evento</li>
                    </ul>
                  </div>
                  <div>
                    <strong>"Nuovo Evento":</strong>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside ml-2">
                      <li>Salva riassunto dell'evento corrente</li>
                      <li>Svuota coda e chiude richieste</li>
                      <li>Genera nuovo codice evento</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Settings */}
      <form onSubmit={handleSubmit} className="card">
        <div className="flex items-center mb-6">
          <Settings className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">DJ Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={dj.email}
              readOnly
              className="form-input bg-gray-50"
            />
          </div>

          <div>
            <label className="form-label">Minimum Donation (€)</label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="0.01"
                max="1000"
                step="0.01"
                value={formData.minDonation}
                onChange={(e) => setFormData({ ...formData, minDonation: Number(e.target.value) })}
                className="form-input pl-10"
                required
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Customers must donate at least this amount to request songs
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Payment Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <CreditCard className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="form-label">Stripe Account ID (Optional)</label>
            <input
              type="text"
              value={formData.stripeAccountId}
              onChange={(e) => setFormData({ ...formData, stripeAccountId: e.target.value })}
              className="form-input"
              placeholder="acct_1234567890"
            />
            <p className="text-sm text-gray-600 mt-1">
              Connect your Stripe account to receive payments directly
            </p>
          </div>

          <div>
            <label className="form-label">PayPal Email (Optional)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.paypalEmail}
                onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                className="form-input pl-10"
                placeholder="your@paypal.email"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Satispay ID (Optional)</label>
            <input
              type="text"
              value={formData.satispayId}
              onChange={(e) => setFormData({ ...formData, satispayId: e.target.value })}
              className="form-input"
              placeholder="Your Satispay business ID"
            />
            <p className="text-sm text-gray-600 mt-1">
              Satispay Business API integration (Italy only)
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Payment Integration Notes:</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Payment accounts are optional but recommended for automatic payouts</li>
            <li>• Without payment integration, you'll need to handle payments manually</li>
            <li>• Contact support for help setting up payment integrations</li>
          </ul>
        </div>
      </div>

      {/* Event Insights */}
      <div className="card">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Insights Eventi</h3>
        </div>

        {summariesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : eventSummaries && eventSummaries.length > 0 ? (
          <div className="space-y-4">
            {eventSummaries.slice(0, 5).map((summary: EventSummary) => (
              <div key={summary.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {summary.eventCode}
                    </span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(summary.startedAt).toLocaleDateString('it-IT')} - {new Date(summary.endedAt).toLocaleDateString('it-IT')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Durata evento: {Math.ceil((new Date(summary.endedAt).getTime() - new Date(summary.startedAt).getTime()) / (1000 * 60 * 60 * 24))} giorni
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="font-semibold">€{Number(summary.totalEarnings).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Richieste</p>
                    <p className="font-semibold text-lg">{summary.totalRequests}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Accettate</p>
                    <p className="font-semibold text-lg text-green-600">{summary.acceptedRequests}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Suonate</p>
                    <p className="font-semibold text-lg text-blue-600">{summary.playedSongs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Skippate</p>
                    <p className="font-semibold text-lg text-orange-600">{summary.skippedSongs}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                    <div>Rifiutate: <span className="font-medium">{summary.rejectedRequests}</span></div>
                    <div>Scadute: <span className="font-medium">{summary.expiredRequests}</span></div>
                    <div>
                      Tasso accettazione: <span className="font-medium">
                        {summary.totalRequests > 0 ? Math.round((summary.acceptedRequests / summary.totalRequests) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {eventSummaries.length > 5 && (
              <p className="text-center text-gray-500 text-sm mt-4">
                Mostrando gli ultimi 5 eventi. Totale eventi: {eventSummaries.length}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nessun evento completato ancora</p>
            <p className="text-gray-400 text-sm">Termina o crea un nuovo evento per vedere gli insights</p>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-gray-600">Account created</label>
            <p className="font-medium text-gray-900">
              {dj.createdAt ? new Date(dj.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-gray-600">Evento corrente</label>
            <p className="font-medium text-green-600">
              {dj.eventCode} (Attivo)
            </p>
          </div>

          {dj.updatedAt && (
            <div>
              <label className="block text-gray-600">Last updated</label>
              <p className="font-medium text-gray-900">
                {new Date(dj.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DJSettings;