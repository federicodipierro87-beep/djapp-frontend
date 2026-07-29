import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  Navigation,
  RefreshCw,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { eventsApi } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import EventMap from '../components/EventMap';
import EventCard from '../components/EventCard';
import type { Event, EventStatus } from '../types';

const radiusOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 500, label: 'Tutta Italia' },
];

const DiscoverEvents: React.FC = () => {
  const navigate = useNavigate();
  const [radius, setRadius] = useState(10);
  const [statusFilter, setStatusFilter] = useState<EventStatus>('ACTIVE');
  const [searchCity, setSearchCity] = useState('');
  const [customLocation, setCustomLocation] = useState<{ lat: number; lng: number } | null>(null);

  const geolocation = useGeolocation();

  const currentLocation = customLocation || (
    geolocation.latitude && geolocation.longitude
      ? { lat: geolocation.latitude, lng: geolocation.longitude }
      : null
  );

  const {
    data: events,
    isLoading: eventsLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['nearby-events', currentLocation?.lat, currentLocation?.lng, radius, statusFilter],
    queryFn: () =>
      currentLocation
        ? eventsApi.getNearby(currentLocation.lat, currentLocation.lng, radius, statusFilter)
        : Promise.resolve([]),
    enabled: !!currentLocation,
    staleTime: 60000,
  });

  const handleEventSelect = (event: Event) => {
    navigate(`/event/${event.eventCode}`);
  };

  const handleSearchCity = async () => {
    if (!searchCity.trim()) return;

    try {
      const encodedCity = encodeURIComponent(searchCity);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedCity}&format=json&limit=1`,
        { headers: { 'User-Agent': 'DJ-Request-App/1.0' } }
      );
      const results = await response.json();

      if (results.length > 0) {
        setCustomLocation({
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleUseMyLocation = () => {
    setCustomLocation(null);
    setSearchCity('');
    geolocation.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Home
            </button>
            <h1 className="text-xl font-bold text-gray-900">Scopri Eventi</h1>
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Aggiorna"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCity()}
                  placeholder="Cerca citta..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                onClick={handleSearchCity}
                className="btn-primary px-4"
              >
                Cerca
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUseMyLocation}
                className="btn-secondary flex items-center"
                disabled={geolocation.loading}
              >
                <Navigation className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Usa posizione</span>
              </button>

              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500"
              >
                {radiusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EventStatus)}
                className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="ACTIVE">Attivi</option>
                <option value="SCHEDULED">Programmati</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {geolocation.loading && !customLocation ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-600">Ottenendo la tua posizione...</p>
          </div>
        ) : geolocation.error && !customLocation ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
            <h3 className="font-medium text-yellow-800 mb-2">{geolocation.error}</h3>
            <p className="text-yellow-700 mb-4">
              Puoi cercare manualmente una citta per vedere gli eventi nelle vicinanze.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => geolocation.refresh()}
                className="btn-secondary"
              >
                Riprova
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '500px' }}>
                <EventMap
                  events={events || []}
                  userLocation={currentLocation}
                  onEventSelect={handleEventSelect}
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
                />
              </div>
            </div>

            {/* Event List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Eventi nelle vicinanze
                  {events && events.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({events.length} trovati)
                    </span>
                  )}
                </h2>

                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Nessun evento trovato in questa zona.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Prova ad aumentare il raggio di ricerca.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverEvents;
