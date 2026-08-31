import React from 'react';
import { PublicQueueItem } from '../types';
import AlbumArt from './ui/AlbumArt';
import Label from './ui/Label';
import EmptyState from './ui/EmptyState';

interface PublicQueueProps {
  queue: PublicQueueItem[];
}

const PAST_LABELS: Record<string, string> = {
  PLAYED: 'Riprodotta',
  SKIPPED: 'Saltata',
};

const PublicQueue: React.FC<PublicQueueProps> = ({ queue }) => {
  const upcoming = queue.filter((item) => ['WAITING', 'NOW_PLAYING'].includes(item.status));
  const past = queue.filter((item) => ['PLAYED', 'SKIPPED'].includes(item.status));

  if (queue.length === 0) {
    return (
      <EmptyState
        eyebrow="In coda"
        title="Ancora nessuna canzone"
        description="La coda è vuota. Manda tu la prima richiesta della serata."
      />
    );
  }

  return (
    <div className="space-y-12">
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <Label as="div">In coda</Label>
            <span className="num text-[11px] text-bone-faint">{upcoming.length}</span>
          </div>

          <ol className="border-t border-white/[0.08]">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 py-4 border-b border-white/[0.08]"
              >
                {/* Posizione in mono: l'unica colonna che deve restare allineata. */}
                <div className="w-7 shrink-0 text-center">
                  {item.isNowPlaying ? (
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className="now-playing-ring -inset-2" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-live" />
                    </span>
                  ) : (
                    <span className="num text-sm text-bone-faint">
                      {String(item.position).padStart(2, '0')}
                    </span>
                  )}
                </div>

                <AlbumArt
                  src={item.albumCover}
                  alt={`${item.songTitle} — ${item.artistName}`}
                  className="h-16 w-16 sm:h-20 sm:w-20"
                />

                <div className="min-w-0 flex-1">
                  {item.isNowPlaying && (
                    <Label as="div" tone="live" className="mb-1.5">
                      Ora in riproduzione
                    </Label>
                  )}
                  <p
                    className={`font-display font-semibold leading-snug truncate ${
                      item.isNowPlaying ? 'text-bone text-base sm:text-lg' : 'text-bone text-[15px]'
                    }`}
                  >
                    {item.songTitle}
                  </p>
                  <p className="text-sm text-bone-dim truncate">{item.artistName}</p>
                  <p className="mt-1 text-[13px] text-bone-faint truncate">
                    Richiesta da {item.requesterName}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <Label as="div">Appena suonate</Label>
            <span className="num text-[11px] text-bone-faint">{past.length}</span>
          </div>

          <ul className="border-t border-white/[0.08]">
            {past
              .slice(-5)
              .reverse()
              .map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 py-3 border-b border-white/[0.08]"
                >
                  <AlbumArt
                    src={item.albumCover}
                    alt=""
                    className="h-11 w-11 opacity-50"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-bone-dim truncate">{item.songTitle}</p>
                    <p className="text-[13px] text-bone-faint truncate">{item.artistName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Label as="div" className="text-bone-faint">
                      {PAST_LABELS[item.status] ?? item.status}
                    </Label>
                    {item.playedAt && (
                      <p className="num mt-1 text-[11px] text-bone-faint">
                        {new Date(item.playedAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default PublicQueue;
