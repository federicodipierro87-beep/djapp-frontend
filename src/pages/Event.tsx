import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Music, Plus, ArrowLeft } from 'lucide-react';
import { queueApi } from '../services/api';
import PublicQueue from '../components/PublicQueue';
import SongRequestForm from '../components/SongRequestForm';
import { PublicQueueItem } from '../types';

const Event: React.FC = () => {
  const { eventCode } = useParams<{ eventCode: string }>();
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);

  const { data: queue, isLoading, error } = useQuery({
    queryKey: ['public-queue', eventCode],
    queryFn: () => queueApi.getPublic(eventCode!),
    enabled: !!eventCode,
    refetchInterval: 5000,
  });

  if (!eventCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Event Code</h1>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event code "{eventCode}" doesn't exist or has ended.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Try Another Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Music className="w-6 h-6 mr-2 text-primary-600" />
                  Event: {eventCode}
                </h1>
                <p className="text-gray-600">Request songs and see the live queue</p>
              </div>
            </div>

            <button
              onClick={() => setShowRequestForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Song
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Request Form Modal */}
            {showRequestForm && (
              <SongRequestForm
                eventCode={eventCode}
                onClose={() => setShowRequestForm(false)}
                onSuccess={() => {
                  setShowRequestForm(false);
                }}
              />
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">How it works</h2>
              <ol className="text-blue-800 space-y-1">
                <li>1. Click "Request Song" to submit a song with a donation</li>
                <li>2. The DJ will review your request and accept or decline it</li>
                <li>3. If accepted, your song enters the queue and you'll be charged</li>
                <li>4. Watch the live queue below to see when your song plays!</li>
              </ol>
            </div>

            {/* Queue */}
            <PublicQueue queue={queue || []} />
          </>
        )}
      </div>
    </div>
  );
};

export default Event;