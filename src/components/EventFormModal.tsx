import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventsApi } from '../services/api';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Field from './ui/Field';
import { formatMoney } from './ui/format';
import { MIN_DONATION } from '../config/payments';
import type { CreateEventData, DJ, Event } from '../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set the modal edits that event instead of creating a new one. */
  event?: Event | null;
}

/** The tip a night asks for at most, matching the top of the guests' slider. */
const MAX_MIN_DONATION = 100;

const emptyForm: CreateEventData = {
  name: '',
  description: '',
  address: '',
  dateTime: '',
  endDateTime: '',
  minDonation: MIN_DONATION,
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

/**
 * Prisma serialises Decimal as a string, and neither GET /events/my nor
 * authApi.me converts it. Left alone, a "5" would land in a numeric input and
 * every later comparison would be between strings.
 */
const toAmount = (value: number | string | null | undefined): number | undefined =>
  value === null || value === undefined || value === '' ? undefined : Number(value);

/**
 * An event with no minimum of its own is one created before the field existed:
 * it still runs on the DJ's profile minimum, so that is what the form shows.
 */
const buildForm = (event: Event | null | undefined, djMinDonation: number): CreateEventData =>
  event
    ? {
        name: event.name,
        description: event.description ?? '',
        address: event.address,
        dateTime: toInputValue(event.dateTime),
        endDateTime: toInputValue(event.endDateTime),
        // Floored, because an event created during the free-requests window
        // still stores a zero the server would no longer accept back.
        minDonation: Math.max(MIN_DONATION, toAmount(event.minDonation) ?? djMinDonation),
      }
    : { ...emptyForm, minDonation: djMinDonation };

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, event }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateEventData>(emptyForm);
  const isEdit = Boolean(event);

  // The DJ panel already has this loaded; reading the cache avoids a second
  // request every time the modal opens.
  const djMinDonation = Math.max(
    MIN_DONATION,
    toAmount(queryClient.getQueryData<DJ>(['dj-me'])?.minDonation) ?? MIN_DONATION
  );

  const eventRef = useRef(event);
  eventRef.current = event;

  const defaultsRef = useRef(djMinDonation);
  defaultsRef.current = djMinDonation;

  useEffect(() => {
    if (isOpen) setFormData(buildForm(eventRef.current, defaultsRef.current));
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
    <Modal
      eyebrow={isEdit ? 'Modifica' : 'Nuova serata'}
      title={isEdit ? 'Modifica evento' : 'Crea evento'}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button
            type="submit"
            form="event-form"
            disabled={saveMutation.isPending}
            className="flex-1"
          >
            {saveMutation.isPending
              ? 'Salvataggio…'
              : isEdit
                ? 'Salva'
                : 'Crea evento'}
          </Button>
        </div>
      }
    >
      <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Nome dell'evento"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="es. Serata Latina @ Club Paradise"
          maxLength={120}
          required
        />

        <div>
          <label htmlFor="event-description" className="field-label">
            Descrizione
          </label>
          <textarea
            id="event-description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Che musica, che serata, chi suona."
            className="field resize-none"
            rows={3}
            maxLength={1000}
          />
        </div>

        <Field
          label="Indirizzo"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="es. Via Roma 123, Milano"
          hint="Diventa un punto sulla mappa: scrivilo come lo cercheresti."
          maxLength={250}
          required
        />

        {/* Le date restano in mono: si confrontano a colpo d'occhio con la lista. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Inizio"
            type="datetime-local"
            mono
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            required
          />

          <Field
            label="Fine (facoltativa)"
            type="datetime-local"
            mono
            value={formData.endDateTime || ''}
            onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
          />
        </div>

        <Field
          label="Mancia minima"
          type="number"
          mono
          min={MIN_DONATION}
          max={MAX_MIN_DONATION}
          step={0.5}
          value={formData.minDonation ?? MIN_DONATION}
          onChange={(e) =>
            setFormData({
              ...formData,
              minDonation: Math.min(
                MAX_MIN_DONATION,
                Math.max(MIN_DONATION, Number(e.target.value) || MIN_DONATION)
              ),
            })
          }
          hint={`Da quanto parte lo slider del pubblico. Non può scendere sotto ${formatMoney(
            MIN_DONATION,
            true
          )}: i circuiti di pagamento rifiutano gli importi più bassi.`}
        />
      </form>
    </Modal>
  );
};

export default EventFormModal;
