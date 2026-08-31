import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Event } from '../types';
import Label from './ui/Label';

// Un evento in corso è rosso "on air", gli altri sono osso: il colore qui
// distingue uno stato, non decora.
const createCustomIcon = (status: string) => {
  const live = status === 'ACTIVE';
  const fill = live ? '#FF3B1F' : '#F5F4F0';

  return L.divIcon({
    className: 'event-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${fill};
        border: 3px solid #08080A;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.25);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
};

const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;

interface EventMarkerProps {
  event: Event;
  onSelect: (event: Event) => void;
}

const EventMarker: React.FC<EventMarkerProps> = ({ event, onSelect }) => {
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Marker position={[event.latitude, event.longitude]} icon={createCustomIcon(event.status)}>
      <Popup>
        <div className="min-w-[200px]">
          {event.status === 'ACTIVE' && (
            <Label as="div" tone="live" className="mb-2">
              In corso ora
            </Label>
          )}
          <h3 className="font-display text-[15px] font-bold text-bone leading-tight">
            {event.name}
          </h3>
          {event.dj?.name && <p className="mt-1 text-[13px] text-bone-dim">{event.dj.name}</p>}

          <div className="mt-2.5 space-y-1 text-[13px] text-bone-dim">
            <div>{event.city}</div>
            <div className="num">{formatDateTime(event.dateTime)}</div>
            {event.distance !== undefined && (
              <div className="num text-bone">{formatDistance(event.distance)}</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelect(event)}
            className="btn-primary w-full mt-3 py-2 text-[13px]"
          >
            Vai all'evento
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default EventMarker;
