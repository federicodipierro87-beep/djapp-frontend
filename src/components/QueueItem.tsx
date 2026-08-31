import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Play, Check, SkipForward } from 'lucide-react';
import AlbumArt from './ui/AlbumArt';
import Button from './ui/Button';
import Label from './ui/Label';
import { formatMoney } from './ui/format';
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

const STATUS_LABELS: Record<string, string> = {
  NOW_PLAYING: 'Ora in riproduzione',
  WAITING: 'In attesa',
  PLAYED: 'Suonata',
  SKIPPED: 'Saltata',
};

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

  const isNowPlaying = Boolean(item.isNowPlaying);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-ink-900 border rounded-lg p-3 sm:p-4 ${
        isDragging ? 'border-white/30 shadow-lg opacity-90' : 'border-white/[0.08]'
      } ${isNowPlaying ? 'border-l-2 border-l-live' : ''} ${isCompleted ? 'opacity-55' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Maniglia: l'unico punto trascinabile, così lo scroll resta usabile. */}
        {!isCompleted && (
          <div
            {...attributes}
            {...listeners}
            aria-label="Trascina per riordinare"
            className="cursor-grab active:cursor-grabbing p-2 -ml-1 rounded-md
                       text-bone-faint hover:text-bone hover:bg-white/[0.06] transition-colors touch-none"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        {/* Posizione: in mono, larghezza fissa, così la colonna non balla. */}
        <div className="w-6 shrink-0 pt-1 text-center">
          {isNowPlaying ? (
            <span className="relative inline-flex h-2.5 w-2.5 mt-1.5">
              <span className="now-playing-ring -inset-2" aria-hidden="true" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-live" />
            </span>
          ) : (
            <span className="num text-sm text-bone-faint">
              {isCompleted ? '—' : String(position).padStart(2, '0')}
            </span>
          )}
        </div>

        <AlbumArt src={item.albumCover} alt="" className="h-12 w-12 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium text-bone leading-snug truncate">{item.songTitle}</h3>
              <p className="mt-0.5 text-[13px] text-bone-dim truncate">{item.artistName}</p>
            </div>
            {item.donationAmount && (
              <span className="num text-base font-semibold shrink-0">
                {formatMoney(item.donationAmount, true)}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-bone-dim">
            <span className="truncate">{item.requesterName}</span>
            {item.requesterEmail && (
              <>
                <span className="text-bone-faint">·</span>
                <span className="truncate">{item.requesterEmail}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label tone={isNowPlaying ? 'live' : 'dim'}>
                {STATUS_LABELS[item.status] ?? item.status}
              </Label>
              {item.playedAt && (
                <span className="num text-[11px] text-bone-faint">
                  {new Date(item.playedAt).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {!isCompleted && (
              <div className="flex items-center gap-2">
                {!isNowPlaying && item.status === 'WAITING' && (
                  <Button size="sm" onClick={onSetNowPlaying} disabled={isProcessing}>
                    <Play className="h-4 w-4" />
                    Parte ora
                  </Button>
                )}

                {item.status === 'NOW_PLAYING' && (
                  <Button size="sm" onClick={onMarkAsPlayed} disabled={isProcessing}>
                    <Check className="h-4 w-4" />
                    Suonata
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={onSkip} disabled={isProcessing}>
                  <SkipForward className="h-4 w-4" />
                  Salta
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueItem;
