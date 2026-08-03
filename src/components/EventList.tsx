import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MapPin,
  Calendar,
  Clock,
  Play,
  Square,
  Trash2,
  Edit,
  Copy,
  Users,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../services/api';
import type { Event, EventStatus } from '../types';
import EventFormModal from './EventFormModal';

const statusColors: Record<EventStatus, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Programmato' },
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Attivo' },
  ENDED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminato' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annullato' },
};

const EventList: React.FC = () => {
  // One modal serves both jobs: null means "create", an event means "edit".
  const [modalOpen, setModalOpen] = useState(false);
  const [eventBeingEdited, setEventBeingEdited] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const openCreate = () => {
    setEventBeingEdited(null);
    setModalOpen(true);
  };

  const openEdit = (event: Event) => {
    setEventBeingEdited(event);
    setModalOpen(true);
  };

  const { data: events, isLoading } = useQuery({
    queryKey: ['my-events'],
    queryFn: eventsApi.getMyEvents,
  });

  const activateMutation = useMutation({
    mutationFn: eventsApi.activate,
    onSuccess: () => {
      toast.success('Evento attivato!');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Errore nell\'attivazione');
    },
  });

  const endMutation = useMutation({
    mutationFn: eventsApi.end,
    onSuccess: () => {
      toast.success('Evento terminato');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Errore nella terminazione');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      toast.success('Evento eliminato');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Errore nell\'eliminazione');
    },
  });

  const handleCopyEventCode = (eventCode: string) => {
    navigator.clipboard.writeText(eventCode);
    toast.success('Codice evento copiato!');
  };

  const handleCopyEventUrl = (eventCode: string) => {
    const url = `${window.location.origin}/event/${eventCode}`;
    navigator.clipboard.writeText(url);
    toast.success('URL evento copiato!');
  };

  const handleActivate = (event: Event) => {
    if (window.confirm(`Vuoi attivare l'evento "${event.name}"? Gli utenti potranno iniziare a inviare richieste.`)) {
      activateMutation.mutate(event.id);
    }
  };

  const handleEnd = (event: Event) => {
    if (window.confirm(`Vuoi terminare l'evento "${event.name}"?`)) {
      endMutation.mutate(event.id);
    }
  };

  const handleDelete = (event: Event) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'evento "${event.name}"? Questa azione non puo essere annullata.`)) {
      deleteMutation.mutate(event.id);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">I Miei Eventi</h2>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crea Evento
        </button>
      </div>

      {!events || events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun evento</h3>
          <p className="text-gray-600 mb-4">Crea il tuo primo evento per iniziare a ricevere richieste</p>
          <button
            onClick={openCreate}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Crea Primo Evento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const status = statusColors[event.status];
            return (
              <div
                key={event.id}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {event.address}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDateTime(event.dateTime)}
                      </div>
                      {event._count && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {event._count.requests} richieste
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-500">Codice:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {event.eventCode}
                      </code>
                      <button
                        onClick={() => handleCopyEventCode(event.eventCode)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Copia codice"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleCopyEventUrl(event.eventCode)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Copia URL"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {event.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleActivate(event)}
                        disabled={activateMutation.isPending}
                        className="btn-primary flex items-center text-sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Attiva
                      </button>
                    )}

                    {event.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleEnd(event)}
                        disabled={endMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Termina
                      </button>
                    )}

                    {event.status === 'SCHEDULED' && (
                      <button
                        onClick={() => openEdit(event)}
                        className="btn-secondary flex items-center text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifica
                      </button>
                    )}

                    {(event.status === 'SCHEDULED' || event.status === 'CANCELLED') && (
                      <button
                        onClick={() => handleDelete(event)}
                        disabled={deleteMutation.isPending}
                        className="btn-secondary flex items-center text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Elimina
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EventFormModal
        isOpen={modalOpen}
        event={eventBeingEdited}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default EventList;
