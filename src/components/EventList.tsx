import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Play, Square, Trash2, Pencil, Copy, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../services/api';
import Surface from './ui/Surface';
import Button from './ui/Button';
import Label from './ui/Label';
import StatusDot from './ui/StatusDot';
import EmptyState from './ui/EmptyState';
import { formatMoney } from './ui/format';
import type { BadgeTone } from './ui/Badge';
import type { Event, EventStatus } from '../types';
import EventFormModal from './EventFormModal';

const STATUS: Record<EventStatus, { tone: BadgeTone; label: string }> = {
  SCHEDULED: { tone: 'warn', label: 'Programmato' },
  ACTIVE: { tone: 'live', label: 'In corso' },
  ENDED: { tone: 'muted', label: 'Terminato' },
  CANCELLED: { tone: 'muted', label: 'Annullato' },
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

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label as="div">Il tuo calendario</Label>
          <h3 className="mt-2 font-display text-xl font-bold tracking-tight">Eventi</h3>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuovo evento
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[132px] rounded-lg bg-ink-900 animate-pulse" />
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="border border-white/[0.08] rounded-lg">
            <EmptyState
              title="Nessun evento in calendario"
              description="Crea il primo evento: da lì nascono il codice e il QR che dai al pubblico."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Crea evento
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const status = STATUS[event.status];
              // Prisma serialises Decimal as a string and this endpoint does not
              // convert it. Undefined means the event never set one and still
              // runs on the DJ's profile minimum, which is not shown here.
              const minDonation =
                event.minDonation === null || event.minDonation === undefined
                  ? undefined
                  : Number(event.minDonation);
              return (
                <Surface key={event.id}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusDot tone={status.tone} pulse={event.status === 'ACTIVE'} />
                        <Label as="div" tone={event.status === 'ACTIVE' ? 'live' : 'dim'}>
                          {status.label}
                        </Label>
                      </div>

                      <h4 className="mt-2 font-display text-lg font-semibold leading-snug truncate">
                        {event.name}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-bone-dim">
                        <span className="truncate">{event.address}</span>
                        <span className="text-bone-faint">·</span>
                        <span className="num">{formatDateTime(event.dateTime)}</span>
                        {event._count && (
                          <>
                            <span className="text-bone-faint">·</span>
                            <span className="num">{event._count.requests} richieste</span>
                          </>
                        )}
                      </div>

                      {/* Il codice è ciò che il DJ detta al pubblico: mono, e le due
                          copie stanno lì accanto. */}
                      <div className="mt-3 flex items-center gap-1">
                        <span className="num text-sm font-semibold tracking-[0.15em] mr-1">
                          {event.eventCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyEventCode(event.eventCode)}
                          title="Copia il codice"
                          aria-label="Copia il codice"
                          className="p-2 rounded-md text-bone-faint hover:text-bone hover:bg-white/[0.06] transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyEventUrl(event.eventCode)}
                          title="Copia il link"
                          aria-label="Copia il link"
                          className="p-2 rounded-md text-bone-faint hover:text-bone hover:bg-white/[0.06] transition-colors"
                        >
                          <Link2 className="h-4 w-4" />
                        </button>

                        {/* Il minimo sta accanto al codice perché è l'altra
                            metà di ciò che il pubblico incontra. */}
                        {minDonation !== undefined && (
                          <span className="num ml-2 text-[11px] text-bone-faint">
                            {minDonation === 0 ? 'gratis' : `min ${formatMoney(minDonation, true)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {event.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(event)}
                          disabled={activateMutation.isPending}
                        >
                          <Play className="h-4 w-4" />
                          Attiva
                        </Button>
                      )}

                      {event.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEnd(event)}
                          disabled={endMutation.isPending}
                        >
                          <Square className="h-4 w-4" />
                          Termina
                        </Button>
                      )}

                      {event.status === 'SCHEDULED' && (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                          <Pencil className="h-4 w-4" />
                          Modifica
                        </Button>
                      )}

                      {(event.status === 'SCHEDULED' || event.status === 'CANCELLED') && (
                        <button
                          type="button"
                          onClick={() => handleDelete(event)}
                          disabled={deleteMutation.isPending}
                          title="Elimina evento"
                          aria-label="Elimina evento"
                          className="p-2 rounded-md text-bone-faint hover:text-live hover:bg-white/[0.06] transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </Surface>
              );
            })}
          </div>
        )}
      </div>

      <EventFormModal
        isOpen={modalOpen}
        event={eventBeingEdited}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default EventList;
