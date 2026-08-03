import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MapPin, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../services/api';
import type { CreateEventData, Event } from '../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set the modal edits that event instead of creating a new one. */
  event?: Event | null;
}

const emptyForm: CreateEventData = {
  name: '',
  description: '',
  address: '',
  dateTime: '',
  endDateTime: '',
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A datetime-local field carries no zone, so both directions have to name one.
 * The browser's zone is the only one that means anything to the DJ typing, and
 * these two functions have to stay exact inverses: reading a value back under a
 * different rule than it was written with would shift the event on every save.
 */
const toInputValue = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

/**
 * The server has no way to know the DJ's zone, so it must not be handed a bare
 * wall clock to interpret: it would resolve it against its own zone, which is
 * UTC in production.
 */
const toInstant = (inputValue: string): string => new Date(inputValue).toISOString();

const buildForm = (event?: Event | null): CreateEventData =>
  event
    ? {
        name: event.name,
        description: event.description ?? '',
        address: event.address,
        dateTime: toInputValue(event.dateTime),
        endDateTime: toInputValue(event.endDateTime),
      }
    : { ...emptyForm };

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, event }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateEventData>(emptyForm);
  const isEdit = Boolean(event);

  const eventRef = useRef(event);
  eventRef.current = event;

  useEffect(() => {
    if (isOpen) setFormData(buildForm(eventRef.current));
    // Keyed on the id rather than the event object: refetching my-events hands
    // back a new object every time, which would wipe whatever is being typed.
  }, [isOpen, event?.id]);

  const saveMutation = useMutation({
    mutationFn: (data: CreateEventData) =>
      event ? eventsApi.update(event.id, data) : eventsApi.create(data),
    onSuccess: (saved) => {
      toast.success(`Evento "${saved.name}" ${isEdit ? 'aggiornato' : 'creato'}!`);
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      onClose();
    },
    onError: (error: any) => {
      const fallback = isEdit ? 'Errore nella modifica evento' : 'Errore nella creazione evento';
      toast.error(error.response?.data?.error || fallback);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.dateTime) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    saveMutation.mutate({
      ...formData,
      dateTime: toInstant(formData.dateTime),
      // Emptying the field is a decision, so it has to be sent as one. Dropping
      // it from the payload would look exactly like not having touched it.
      endDateTime: formData.endDateTime ? toInstant(formData.endDateTime) : null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 transform transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Modifica Evento' : 'Crea Nuovo Evento'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Evento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="es. Serata Latina @ Club Paradise"
                className="input-field"
                maxLength={120}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrivi brevemente l'evento..."
                className="input-field resize-none"
                rows={3}
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Indirizzo *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="es. Via Roma 123, Milano"
                className="input-field"
                maxLength={250}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                L'indirizzo verra convertito automaticamente in coordinate per la mappa
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data e Ora *
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Data e Ora Fine (opzionale)
              </label>
              <input
                type="datetime-local"
                value={formData.endDateTime || ''}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn-primary flex-1"
              >
                {saveMutation.isPending
                  ? isEdit
                    ? 'Salvataggio...'
                    : 'Creazione...'
                  : isEdit
                    ? 'Salva Modifiche'
                    : 'Crea Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;
