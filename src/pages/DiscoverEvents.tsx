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
  Filter,
  Calendar,
  Music
} from 'lucide-react';
import { eventsApi } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import EventMap from '../components/EventMap';
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neon Green Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-500/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-green-400/30 animate-pulse shadow-lg shadow-green-400/50"></div>
        <div className="absolute top-60 right-32 w-20 h-20 rounded-full bg-green-300/40 animate-bounce shadow-md shadow-green-300/50"></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-green-500/35 animate-pulse shadow-sm shadow-green-500/50"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-green-900/30 backdrop-blur-lg border-b border-green-400/30 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-green-300 hover:text-green-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Home
              </button>
              <h1 className="text-xl font-bold text-green-400" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.5)'}}>
                Scopri Eventi
              </h1>
              <button
                onClick={() => refetch()}
                className="p-2 hover:bg-green-400/10 rounded-full transition-colors"
                title="Aggiorna"
              >
                <RefreshCw className="w-5 h-5 text-green-400" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400/60" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCity()}
                    placeholder="Cerca citta..."
                    className="w-full pl-10 pr-4 py-2 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                </div>
                <button
                  onClick={handleSearchCity}
                  className="bg-gradient-to-r from-green-500 to-green-400 text-black font-bold px-4 py-2 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 shadow-lg shadow-green-400/30"
                >
                  Cerca
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUseMyLocation}
                  className="flex items-center bg-black/40 border-2 border-green-400/50 text-green-400 font-medium px-3 py-2 rounded-lg hover:bg-green-400/10 hover:border-green-400 transition-all duration-300"
                  disabled={geolocation.loading}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Usa posizione</span>
                </button>

                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="bg-black/60 border-2 border-green-400/50 rounded-lg px-3 py-2 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  {radiusOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black text-green-400">
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus)}
                  className="bg-black/60 border-2 border-green-400/50 rounded-lg px-3 py-2 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="ACTIVE" className="bg-black text-green-400">Attivi</option>
                  <option value="SCHEDULED" className="bg-black text-green-400">Programmati</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {geolocation.loading && !customLocation ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin mb-4" style={{filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'}} />
              <p className="text-green-200">Ottenendo la tua posizione...</p>
            </div>
          ) : geolocation.error && !customLocation ? (
            <div className="bg-yellow-900/30 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-6 text-center max-w-lg mx-auto">
              <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-4" style={{filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.5))'}} />
              <h3 className="font-medium text-yellow-400 mb-2">{geolocation.error}</h3>
              <p className="text-yellow-200/80 mb-4">
                Puoi cercare manualmente una citta per vedere gli eventi nelle vicinanze.
              </p>
              <button
                onClick={() => geolocation.refresh()}
                className="bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 font-medium px-4 py-2 rounded-lg hover:bg-yellow-400/30 transition-colors"
              >
                Riprova
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl border border-green-400/30 overflow-hidden shadow-2xl shadow-green-400/10" style={{ height: '500px' }}>
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
                <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl border border-green-400/30 p-4 shadow-2xl shadow-green-400/10">
                  <h2 className="font-semibold text-green-400 mb-4 text-lg" style={{textShadow: '0 0 10px rgba(34, 197, 94, 0.3)'}}>
                    Eventi nelle vicinanze
                    {events && events.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-green-300/70">
                        ({events.length} trovati)
                      </span>
                    )}
                  </h2>

                  {eventsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                    </div>
                  ) : events && events.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleEventSelect(event)}
                          className="bg-black/40 border border-green-400/30 rounded-xl p-4 cursor-pointer hover:border-green-400/60 hover:bg-green-400/5 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    event.status === 'ACTIVE' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
                                  }`}
                                />
                                <span className="text-xs text-green-300/70">
                                  {event.status === 'ACTIVE' ? 'Attivo ora' : 'Programmato'}
                                </span>
                              </div>

                              <h3 className="font-semibold text-green-400 mb-1">{event.name}</h3>

                              <div className="flex items-center text-sm text-green-200/80 mb-1">
                                <Music className="w-4 h-4 mr-1 text-green-400" />
                                <span>{event.dj?.name}</span>
                              </div>

                              <div className="flex items-center text-sm text-green-200/60">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{event.city}</span>
                                {event.distance !== undefined && (
                                  <span className="ml-2 text-green-400 font-medium">
                                    {event.distance < 1
                                      ? `${Math.round(event.distance * 1000)} m`
                                      : `${event.distance.toFixed(1)} km`}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center text-sm text-green-200/60 mt-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDateTime(event.dateTime)}</span>
                              </div>
                            </div>

                            <div className="flex items-center text-green-400">
                              <ArrowLeft className="w-5 h-5 rotate-180" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                      <p className="text-green-200/70">
                        Nessun evento trovato in questa zona.
                      </p>
                      <p className="text-sm text-green-200/50 mt-1">
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
    </div>
  );
};

export default DiscoverEvents;
