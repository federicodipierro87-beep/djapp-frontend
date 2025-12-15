import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  PlayCircle, 
  CheckCircle, 
  SkipForward, 
  Euro,
  Music,
  User,
  Mail,
  Clock
} from 'lucide-react';
import { QueueItem as QueueItemType } from '../types';

interface QueueItemProps {
  item: QueueItemType;
  position: number;
  onSetNowPlaying: () => void;
  onMarkAsPlayed: () => void;
  onSkip: () => void;
  isProcessing: boolean;
  isCompleted?: boolean;
}

const QueueItem: React.FC<QueueItemProps> = ({
  item,
  position,
  onSetNowPlaying,
  onMarkAsPlayed,
  onSkip,
  isProcessing,
  isCompleted = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isCompleted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusDisplay = () => {
    switch (item.status) {
      case 'NOW_PLAYING':
        return {
          icon: <PlayCircle className="w-5 h-5 text-green-500" />,
          text: 'Now Playing',
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-300'
        };
      case 'WAITING':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          text: 'Waiting',
          color: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-300'
        };
      case 'PLAYED':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Played',
          color: 'text-green-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
      case 'SKIPPED':
        return {
          icon: <SkipForward className="w-5 h-5 text-gray-500" />,
          text: 'Skipped',
          color: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
      default:
        return {
          icon: <Music className="w-5 h-5 text-gray-500" />,
          text: item.status,
          color: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card transition-all duration-300 ${
        isDragging ? 'shadow-lg scale-105 rotate-2' : ''
      } ${status.bg} ${status.border} ${
        item.isNowPlaying ? 'ring-2 ring-green-300' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Drag Handle */}
        {!isCompleted && (
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Position/Status Indicator */}
        <div className="flex-shrink-0">
          {item.isNowPlaying ? (
            <div className="relative w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-white" />
              <div className="now-playing-ring"></div>
            </div>
          ) : isCompleted ? (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {status.icon}
            </div>
          ) : (
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {position}
            </div>
          )}
        </div>

        {/* Song Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg truncate">
                {item.songTitle}
              </h3>
              <p className="text-gray-600 truncate">by {item.artistName}</p>
            </div>

            {/* Donation Amount */}
            {item.donationAmount && (
              <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                <Euro className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-bold text-green-700">€{item.donationAmount}</span>
              </div>
            )}
          </div>

          {/* Requester Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{item.requesterName}</span>
            </div>
            {item.requesterEmail && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                <span className="truncate">{item.requesterEmail}</span>
              </div>
            )}
            {item.paymentMethod && (
              <div className="flex items-center">
                <span>•</span>
                <span className="ml-1">{item.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${status.color}`}>
              {status.icon}
              <span className="ml-2 font-medium">{status.text}</span>
              {item.playedAt && (
                <span className="ml-2 text-xs text-gray-500">
                  at {new Date(item.playedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            {!isCompleted && (
              <div className="flex space-x-2">
                {!item.isNowPlaying && item.status === 'WAITING' && (
                  <button
                    onClick={onSetNowPlaying}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors duration-200 flex items-center"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Now Playing
                  </button>
                )}

                {item.status === 'NOW_PLAYING' && (
                  <button
                    onClick={onMarkAsPlayed}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors duration-200 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Played
                  </button>
                )}

                <button
                  onClick={onSkip}
                  disabled={isProcessing}
                  className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-1 px-3 rounded transition-colors duration-200 flex items-center"
                >
                  <SkipForward className="w-4 h-4 mr-1" />
                  Skip
                </button>
              </div>
            )}
          </div>

          {/* Now Playing Indicator */}
          {item.isNowPlaying && (
            <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-800 font-medium">This song is currently playing!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueItem;