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
import { Music, Euro, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueApi } from '../services/api';
import QueueItem from './QueueItem';
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
      toast.success('Queue reordered');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to reorder queue';
      toast.error(message);
    },
  });

  const setNowPlayingMutation = useMutation({
    mutationFn: queueApi.setNowPlaying,
    onSuccess: () => {
      toast.success('Song set as now playing');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to set now playing';
      toast.error(message);
    },
  });

  const markAsPlayedMutation = useMutation({
    mutationFn: queueApi.markAsPlayed,
    onSuccess: () => {
      toast.success('Song marked as played');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to mark as played';
      toast.error(message);
    },
  });

  const skipSongMutation = useMutation({
    mutationFn: queueApi.skipSong,
    onSuccess: () => {
      toast.success('Song skipped');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to skip song';
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

  if (queue.length === 0) {
    return (
      <div className="space-y-6">
        {/* Earnings Display */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <Euro className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-800">€{totalEarnings}</h3>
            <p className="text-green-600">Total earnings for this event</p>
          </div>
        </div>

        <div className="card text-center py-12">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Queue is empty</h3>
          <p className="text-gray-600">Accepted song requests will appear here for you to manage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <Euro className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-green-800">€{totalEarnings}</h3>
          <p className="text-green-600">Total earnings for this event</p>
        </div>
      </div>

      {/* Current Queue */}
      {waitingQueue.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Music className="w-5 h-5 mr-2 text-primary-600" />
              Song Queue ({waitingQueue.length})
            </h2>
            <div className="flex items-center text-sm text-gray-600">
              <GripVertical className="w-4 h-4 mr-2" />
              Drag to reorder
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={waitingQueue.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
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
        </div>
      )}

      {/* Completed Songs */}
      {completedSongs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Music className="w-5 h-5 mr-2 text-gray-600" />
            Recently Played ({completedSongs.length})
          </h2>
          
          <div className="space-y-3">
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
        </div>
      )}
    </div>
  );
};

export default DJQueue;