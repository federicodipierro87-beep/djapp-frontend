import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Event } from '../types';
import EventMarker from './EventMarker';

// Ogni marker è un divIcon nel linguaggio del design system, quindi le icone
// PNG di default di Leaflet non servono più: niente CDN esterno da caricare.
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #F5F4F0;
      border: 3px solid #08080A;
      box-shadow: 0 0 0 1px rgba(245,244,240,0.5);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
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
      className="h-full w-full rounded-lg bg-ink-900"
      style={{ minHeight: '400px' }}
    >
      {/* Tile scure CARTO: gratuite e senza chiave. Le tile OSM chiare
          dentro un'interfaccia nera stonavano. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      {center && <MapCenter center={center} />}

      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
        >
          <Popup>
            <span className="label-mono">La tua posizione</span>
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
