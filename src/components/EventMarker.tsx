import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Calendar } from 'lucide-react';
import type { Event } from '../types';

const createCustomIcon = (status: string) => {
  const color = status === 'ACTIVE' ? '#22c55e' : '#eab308';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <circle cx="5.5" cy="17.5" r="2.5"/>
          <circle cx="17.5" cy="15.5" r="2.5"/>
          <path d="M8 17V5l12-2v12"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface EventMarkerProps {
  event: Event;
  onSelect: (event: Event) => void;
}

const EventMarker: React.FC<EventMarkerProps> = ({ event, onSelect }) => {
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
    <Marker
      position={[event.latitude, event.longitude]}
      icon={createCustomIcon(event.status)}
    >
      <Popup>
        <div className="min-w-[200px]">
          <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">{event.dj?.name}</span>
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {event.city}
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDateTime(event.dateTime)}
            </div>
            {event.distance !== undefined && (
              <div className="text-primary-600 font-medium">
                {event.distance < 1
                  ? `${Math.round(event.distance * 1000)} m`
                  : `${event.distance.toFixed(1)} km`}
              </div>
            )}
          </div>
          <button
            onClick={() => onSelect(event)}
            className="mt-3 w-full bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Vai all'evento
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default EventMarker;
