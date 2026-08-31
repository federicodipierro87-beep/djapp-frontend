import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { useMutation } from '@tanstack/react-query';
import { GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueApi } from '../services/api';
import QueueItem from './QueueItem';
import Label from './ui/Label';
import EmptyState from './ui/EmptyState';
import { formatMoney } from './ui/format';
import { QueueItem as QueueItemType } from '../types';

interface DJQueueProps {
  queue: QueueItemType[];
  totalEarnings: number;
  onUpdate: () => void;
}

const DJQueue: React.FC<DJQueueProps> = ({ queue, totalEarnings, onUpdate }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: (queueItemIds: string[]) => queueApi.reorder(queueItemIds),
    onSuccess: () => {
      toast.success('Coda riordinata');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile riordinare la coda';
      toast.error(message);
    },
  });

  const setNowPlayingMutation = useMutation({
    mutationFn: queueApi.setNowPlaying,
    onSuccess: () => {
      toast.success('In riproduzione');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile avviare il brano';
      toast.error(message);
    },
  });

  const markAsPlayedMutation = useMutation({
    mutationFn: queueApi.markAsPlayed,
    onSuccess: () => {
      toast.success('Segnata come suonata');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile segnare il brano';
      toast.error(message);
    },
  });

  const skipSongMutation = useMutation({
    mutationFn: queueApi.skipSong,
    onSuccess: () => {
      toast.success('Brano saltato');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile saltare il brano';
      toast.error(message);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = queue.findIndex((item) => item.id === active.id);
    const newIndex = queue.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newQueue = arrayMove(queue, oldIndex, newIndex);
      const queueItemIds = newQueue.map(item => item.id);
      reorderMutation.mutate(queueItemIds);
    }
  };

  const waitingQueue = queue.filter(item => ['WAITING', 'NOW_PLAYING'].includes(item.status));
  const completedSongs = queue.filter(item => ['PLAYED', 'SKIPPED'].includes(item.status));

  // L'incasso è già in cima al pannello: qui basta una riga, non un riquadro.
  const earnings = (
    <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-white/[0.08]">
      <Label as="div">Incasso della serata</Label>
      <span className="num text-2xl font-semibold leading-none">
        {formatMoney(totalEarnings, true)}
      </span>
    </div>
  );

  if (queue.length === 0) {
    return (
      <div>
        {earnings}
        <EmptyState
          title="La coda è vuota"
          description="Le richieste che accetti finiscono qui, pronte da riordinare."
        />
      </div>
    );
  }

  return (
    <div>
      {earnings}

      {waitingQueue.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-baseline gap-3">
              <Label as="div">In coda</Label>
              <span className="num text-[11px] text-bone-faint">{waitingQueue.length}</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-bone-faint">
              <GripVertical className="h-4 w-4" />
              Trascina per riordinare
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={waitingQueue.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {waitingQueue.map((item, index) => (
                  <QueueItem
                    key={item.id}
                    item={item}
                    position={index + 1}
                    onSetNowPlaying={() => setNowPlayingMutation.mutate(item.id)}
                    onMarkAsPlayed={() => markAsPlayedMutation.mutate(item.id)}
                    onSkip={() => skipSongMutation.mutate(item.id)}
                    isProcessing={
                      setNowPlayingMutation.isPending ||
                      markAsPlayedMutation.isPending ||
                      skipSongMutation.isPending ||
                      reorderMutation.isPending
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

      {completedSongs.length > 0 && (
        <section className="mt-8 pt-6 border-t border-white/[0.08]">
          <div className="flex items-baseline gap-3 mb-4">
            <Label as="div">Già passate</Label>
            <span className="num text-[11px] text-bone-faint">{completedSongs.length}</span>
          </div>

          <div className="space-y-2">
            {completedSongs.slice(-10).reverse().map((item) => (
              <QueueItem
                key={item.id}
                item={item}
                position={0}
                onSetNowPlaying={() => {}}
                onMarkAsPlayed={() => {}}
                onSkip={() => {}}
                isProcessing={false}
                isCompleted
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DJQueue;
