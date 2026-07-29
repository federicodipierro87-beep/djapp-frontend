import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Music, ArrowRight } from 'lucide-react';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`/event/${event.eventCode}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                event.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-xs text-gray-500">
              {event.status === 'ACTIVE' ? 'Attivo ora' : 'Programmato'}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>

          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Music className="w-4 h-4 mr-1 text-primary-500" />
            <span>{event.dj?.name}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{event.city}</span>
            {event.distance !== undefined && (
              <span className="ml-2 text-primary-600 font-medium">
                {event.distance < 1
                  ? `${Math.round(event.distance * 1000)} m`
                  : `${event.distance.toFixed(1)} km`}
              </span>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDateTime(event.dateTime)}</span>
          </div>
        </div>

        <div className="flex items-center text-primary-600">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
