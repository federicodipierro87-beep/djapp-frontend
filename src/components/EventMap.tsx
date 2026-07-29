import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Event } from '../types';
import EventMarker from './EventMarker';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapCenterProps {
  center: [number, number];
}

const MapCenter: React.FC<MapCenterProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface EventMapProps {
  events: Event[];
  userLocation: { lat: number; lng: number } | null;
  onEventSelect: (event: Event) => void;
  center?: [number, number];
  zoom?: number;
}

const EventMap: React.FC<EventMapProps> = ({
  events,
  userLocation,
  onEventSelect,
  center,
  zoom = 13,
}) => {
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [41.9028, 12.4964]; // Rome as default

  const mapCenter = center || defaultCenter;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && <MapCenter center={center} />}

      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
        >
          <Popup>
            <div className="text-center">
              <span className="font-medium text-gray-900">La tua posizione</span>
            </div>
          </Popup>
        </Marker>
      )}

      {events.map((event) => (
        <EventMarker
          key={event.id}
          event={event}
          onSelect={onEventSelect}
        />
      ))}
    </MapContainer>
  );
};

export default EventMap;
