import React from 'react';
import { Music, Clock, PlayCircle, CheckCircle, SkipForward } from 'lucide-react';
import { PublicQueueItem } from '../types';

interface PublicQueueProps {
  queue: PublicQueueItem[];
}

const PublicQueue: React.FC<PublicQueueProps> = ({ queue }) => {
  const waitingQueue = queue.filter(item => ['WAITING', 'NOW_PLAYING'].includes(item.status));
  const playedSongs = queue.filter(item => ['PLAYED', 'SKIPPED'].includes(item.status));

  const getStatusIcon = (status: string, isNowPlaying: boolean) => {
    if (isNowPlaying) {
      return <PlayCircle className="w-5 h-5 text-green-500" />;
    }
    
    switch (status) {
      case 'WAITING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'PLAYED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SKIPPED':
        return <SkipForward className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string, isNowPlaying: boolean) => {
    if (isNowPlaying) return 'In Riproduzione';
    
    switch (status) {
      case 'WAITING':
        return 'In Coda';
      case 'PLAYED':
        return 'Riprodotta';
      case 'SKIPPED':
        return 'Saltata';
      default:
        return status;
    }
  };

  if (queue.length === 0) {
    return (
      <div className="card text-center py-12">
        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna canzone in coda</h3>
        <p className="text-gray-600">Sii il primo a richiedere una canzone!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Queue */}
      {waitingQueue.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Music className="w-5 h-5 mr-2 text-primary-600" />
            Coda Attuale ({waitingQueue.length})
          </h2>
          
          <div className="space-y-3">
            {waitingQueue.map((item, index) => (
              <div 
                key={item.id} 
                className={`card ${item.isNowPlaying ? 'border-green-300 bg-green-50' : ''} transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${item.isNowPlaying ? 'bg-green-500' : 'bg-primary-500'}`}>
                        {item.isNowPlaying ? (
                          <PlayCircle className="w-6 h-6" />
                        ) : (
                          item.position
                        )}
                      </div>
                      {item.isNowPlaying && (
                        <div className="now-playing-ring"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.songTitle}</h3>
                      <p className="text-gray-600">di {item.artistName}</p>
                      <p className="text-sm text-gray-500">Richiesta da {item.requesterName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status, item.isNowPlaying)}
                    <span className={`text-sm font-medium ${item.isNowPlaying ? 'text-green-700' : 'text-gray-700'}`}>
                      {getStatusText(item.status, item.isNowPlaying)}
                    </span>
                  </div>
                </div>
                
                {item.isNowPlaying && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-800 font-medium">Questa canzone è in riproduzione!</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Played */}
      {playedSongs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Riprodotte di Recente ({playedSongs.length})
          </h2>
          
          <div className="space-y-3">
            {playedSongs.slice(-5).reverse().map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                      {getStatusIcon(item.status, false)}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700">{item.songTitle}</h3>
                      <p className="text-sm text-gray-500">di {item.artistName}</p>
                      <p className="text-xs text-gray-400">Richiesta da {item.requesterName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {getStatusText(item.status, false)}
                    </span>
                    {item.playedAt && (
                      <p className="text-xs text-gray-400">
                        {new Date(item.playedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicQueue;