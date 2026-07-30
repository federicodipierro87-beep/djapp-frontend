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
      return <PlayCircle className="w-5 h-5 text-green-400" />;
    }

    switch (status) {
      case 'WAITING':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'PLAYED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'SKIPPED':
        return <SkipForward className="w-5 h-5 text-green-200/50" />;
      default:
        return <Clock className="w-5 h-5 text-green-200/50" />;
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
      <div className="text-center py-12">
        <Music className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-400 mb-2">Nessuna canzone in coda</h3>
        <p className="text-green-200/60">Sii il primo a richiedere una canzone!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Queue */}
      {waitingQueue.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center">
            <Music className="w-5 h-5 mr-2" />
            Coda Attuale ({waitingQueue.length})
          </h3>

          <div className="space-y-3">
            {waitingQueue.map((item, index) => (
              <div
                key={item.id}
                className={`bg-black/40 border rounded-xl p-4 transition-all duration-300 ${
                  item.isNowPlaying
                    ? 'border-green-400 shadow-lg shadow-green-400/20'
                    : 'border-green-400/30 hover:border-green-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        item.isNowPlaying
                          ? 'bg-green-500 text-black'
                          : 'bg-green-900/50 text-green-400 border border-green-400/50'
                      }`}>
                        {item.isNowPlaying ? (
                          <PlayCircle className="w-6 h-6" />
                        ) : (
                          item.position
                        )}
                      </div>
                      {item.isNowPlaying && (
                        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75"></div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-green-400">{item.songTitle}</h3>
                      <p className="text-green-200/70">di {item.artistName}</p>
                      <p className="text-sm text-green-200/50">Richiesta da {item.requesterName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status, item.isNowPlaying)}
                    <span className={`text-sm font-medium ${item.isNowPlaying ? 'text-green-400' : 'text-green-200/70'}`}>
                      {getStatusText(item.status, item.isNowPlaying)}
                    </span>
                  </div>
                </div>

                {item.isNowPlaying && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                    <div className="flex items-center">
                      <div className="animate-pulse w-3 h-3 bg-green-400 rounded-full mr-2 shadow-lg shadow-green-400/50"></div>
                      <span className="text-green-400 font-medium">Questa canzone è in riproduzione!</span>
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
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Riprodotte di Recente ({playedSongs.length})
          </h3>

          <div className="space-y-3">
            {playedSongs.slice(-5).reverse().map((item) => (
              <div key={item.id} className="bg-black/20 border border-green-400/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-green-900/30 border border-green-400/30 flex items-center justify-center">
                      {getStatusIcon(item.status, false)}
                    </div>

                    <div>
                      <h3 className="font-medium text-green-300/80">{item.songTitle}</h3>
                      <p className="text-sm text-green-200/50">di {item.artistName}</p>
                      <p className="text-xs text-green-200/40">Richiesta da {item.requesterName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-green-200/50">
                      {getStatusText(item.status, false)}
                    </span>
                    {item.playedAt && (
                      <p className="text-xs text-green-200/40">
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
