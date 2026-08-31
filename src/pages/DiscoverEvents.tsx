import React, { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Navigation, RefreshCw } from 'lucide-react';
import { eventsApi } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import AppHeader from '../components/AppHeader';
import EventCard from '../components/EventCard';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Surface from '../components/ui/Surface';
import EmptyState from '../components/ui/EmptyState';
import type { Event, EventStatus } from '../types';

// Leaflet and its stylesheet are the single largest thing the app ships, and
// this is the only page that draws a map.
const EventMap = lazy(() => import('../components/EventMap'));

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
    error: eventsError,
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

  const waitingForLocation = geolocation.loading && !customLocation;
  const locationDenied = Boolean(geolocation.error) && !customLocation;

  return (
    <div className="min-h-screen bg-ink-950">
      <AppHeader
        back="/"
        title="Eventi vicino a te"
        eyebrow="In zona"
        width="xl"
        actions={
          <Button
            variant="quiet"
            size="sm"
            onClick={() => refetch()}
            aria-label="Aggiorna la lista"
            title="Aggiorna"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Filtri: una riga sola su desktop, impilata sotto i 640px. */}
      <div className="border-b border-white/[0.08] bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bone-faint pointer-events-none" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCity()}
                  placeholder="Cerca una città"
                  aria-label="Cerca una città"
                  className="field pl-9"
                />
              </div>
              <Button size="sm" onClick={handleSearchCity}>
                Cerca
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseMyLocation}
                disabled={geolocation.loading}
              >
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">Posizione</span>
              </Button>

              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                aria-label="Raggio di ricerca"
                className="field num w-auto py-2 min-h-[36px] text-[13px]"
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
                aria-label="Stato degli eventi"
                className="field w-auto py-2 min-h-[36px] text-[13px]"
              >
                <option value="ACTIVE">Attivi</option>
                <option value="SCHEDULED">Programmati</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {waitingForLocation ? (
          <EmptyState
            eyebrow="Posizione"
            title="Stiamo cercando dove sei"
            description="Concedi l'accesso alla posizione, oppure cerca una città qui sopra."
          />
        ) : locationDenied ? (
          <EmptyState
            eyebrow="Posizione non disponibile"
            title={geolocation.error ?? 'Non riusciamo a localizzarti'}
            description="Cerca una città qui sopra per vedere cosa succede in zona."
            action={
              <Button variant="ghost" size="sm" onClick={() => geolocation.refresh()}>
                Riprova
              </Button>
            }
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Mappa */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Surface
                padding="none"
                className="overflow-hidden h-[320px] sm:h-[420px] lg:h-[560px]"
              >
                <Suspense
                  fallback={
                    <div className="h-full flex items-center justify-center bg-ink-900">
                      <Label>Caricamento mappa</Label>
                    </div>
                  }
                >
                  <EventMap
                    events={events || []}
                    userLocation={currentLocation}
                    onEventSelect={handleEventSelect}
                    center={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
                  />
                </Suspense>
              </Surface>
            </div>

            {/* Lista */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="flex items-baseline justify-between mb-3">
                <Label as="div">In coda stasera</Label>
                {events && events.length > 0 && (
                  <span className="num text-[11px] text-bone-faint">
                    {events.length} {events.length === 1 ? 'evento' : 'eventi'}
                  </span>
                )}
              </div>

              {eventsLoading ? (
                <div className="space-y-3" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-[124px] rounded-lg bg-ink-900 animate-pulse" />
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                <ul className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto scrollbar-thin lg:pr-1">
                  {events.map((event) => (
                    <li key={event.id}>
                      <EventCard event={event} />
                    </li>
                  ))}
                </ul>
              ) : eventsError ? (
                // Without this a failed request looks exactly like an empty
                // area, and the user widens the radius over and over.
                <Surface padding="none">
                  <EmptyState
                    eyebrow="Errore"
                    title="Non siamo riusciti a caricare gli eventi"
                    description="La zona potrebbe non essere vuota: è la richiesta che non ha risposto."
                    action={
                      <Button variant="ghost" size="sm" onClick={() => refetch()}>
                        Riprova
                      </Button>
                    }
                  />
                </Surface>
              ) : (
                <Surface padding="none">
                  <EmptyState
                    title="Niente in questa zona"
                    description="Allarga il raggio, o prova a cercare un'altra città."
                  />
                </Surface>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscoverEvents;
