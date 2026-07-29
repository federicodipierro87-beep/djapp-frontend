import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MapPin, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../services/api';
import type { CreateEventData } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateEventData>({
    name: '',
    description: '',
    address: '',
    dateTime: '',
  });

  const createMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: (event) => {
      toast.success(`Evento "${event.name}" creato!`);
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      setFormData({ name: '', description: '', address: '', dateTime: '' });
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nella creazione evento';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.dateTime) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 transform transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Crea Nuovo Evento</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Evento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="es. Serata Latina @ Club Paradise"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrivi brevemente l'evento..."
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Indirizzo *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="es. Via Roma 123, Milano"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                L'indirizzo verra convertito automaticamente in coordinate per la mappa
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data e Ora *
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Data e Ora Fine (opzionale)
              </label>
              <input
                type="datetime-local"
                value={formData.endDateTime || ''}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary flex-1"
              >
                {createMutation.isPending ? 'Creazione...' : 'Crea Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
