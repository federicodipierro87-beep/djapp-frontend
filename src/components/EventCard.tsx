import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Label from './ui/Label';
import StatusDot from './ui/StatusDot';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
}

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

// Le distanze restano in mono con la virgola: è un numero, e in Italia si legge
// «1,4 km», non «1.4 km».
const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const isLive = event.status === 'ACTIVE';

  return (
    <button
      type="button"
      onClick={() => navigate(`/event/${event.eventCode}`)}
      className="group w-full text-left bg-ink-900 border border-white/[0.08] rounded-lg p-4
                 hover:border-white/20 hover:bg-ink-800 transition-colors"
    >
      <div className="flex items-center gap-2">
        <StatusDot tone={isLive ? 'live' : 'warn'} pulse={isLive} />
        <Label tone={isLive ? 'live' : 'dim'}>{isLive ? 'In corso ora' : 'Programmato'}</Label>
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-bone leading-snug truncate">
            {event.name}
          </h3>
          {event.dj?.name && (
            <p className="mt-0.5 text-[13px] text-bone-dim truncate">{event.dj.name}</p>
          )}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-bone-faint group-hover:text-bone transition-colors" />
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 text-[13px]">
        <span className="text-bone-dim truncate">{event.city}</span>
        <span className="num text-[11px] text-bone-faint shrink-0">
          {formatDateTime(event.dateTime)}
          {event.distance !== undefined && ` · ${formatDistance(event.distance)}`}
        </span>
      </div>
    </button>
  );
};

export default EventCard;
