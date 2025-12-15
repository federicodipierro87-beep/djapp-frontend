import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Clock, CheckCircle, X, Music, Euro, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestsApi } from '../services/api';
import { Request } from '../types';

interface RequestListProps {
  requests: Request[];
  onUpdate: () => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onUpdate }) => {
  const acceptMutation = useMutation({
    mutationFn: requestsApi.accept,
    onSuccess: () => {
      toast.success('Request accepted and added to queue!');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to accept request';
      toast.error(message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: requestsApi.reject,
    onSuccess: () => {
      toast.success('Request rejected');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to reject request';
      toast.error(message);
    },
  });

  const formatTimeRemaining = (timeRemaining: number) => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    if (timeRemaining <= 0) return 'EXPIRED';
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'CARD':
        return 'Credit Card';
      case 'APPLE_PAY':
        return 'Apple Pay';
      case 'GOOGLE_PAY':
        return 'Google Pay';
      case 'PAYPAL':
        return 'PayPal';
      case 'SATISPAY':
        return 'Satispay';
      default:
        return method;
    }
  };

  if (requests.length === 0) {
    return (
      <div className="card text-center py-12">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
        <p className="text-gray-600">New song requests will appear here for you to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Pending Requests ({requests.length})
        </h2>
        <p className="text-sm text-gray-600">
          Review and accept/reject song requests from your audience
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const timeRemaining = request.timeRemaining;
          const isExpiring = timeRemaining > 0 && timeRemaining < 300000; // Less than 5 minutes
          const isExpired = timeRemaining <= 0;

          return (
            <div 
              key={request.id} 
              className={`card transition-all duration-300 ${
                isExpired ? 'opacity-50 bg-gray-50' : ''
              } ${
                isExpiring ? 'border-orange-300 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Song Info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.songTitle}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Euro className="w-4 h-4 text-green-600" />
                          <span className="text-xl font-bold text-green-700">
                            €{request.donationAmount}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-1">by {request.artistName}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {request.requesterName}
                        </div>
                        {request.requesterEmail && (
                          <div className="flex items-center">
                            <span>•</span>
                            <span className="ml-1">{request.requesterEmail}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <span>•</span>
                          <span className="ml-1">{getPaymentMethodDisplay(request.paymentMethod)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className={`flex items-center ${isExpiring ? 'text-orange-600' : isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                      <Clock className="w-4 h-4 mr-2" />
                      <span className={`font-medium ${isExpiring || isExpired ? 'font-bold' : ''}`}>
                        {isExpired ? 'EXPIRED' : `${formatTimeRemaining(timeRemaining)} remaining`}
                      </span>
                    </div>

                    {!isExpired && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => rejectMutation.mutate(request.id)}
                          disabled={rejectMutation.isPending}
                          className="btn-danger flex items-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                        
                        <button
                          onClick={() => acceptMutation.mutate(request.id)}
                          disabled={acceptMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept & Add to Queue
                        </button>
                      </div>
                    )}
                  </div>

                  {isExpiring && !isExpired && (
                    <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm font-medium">
                        ⚠️ This request expires soon! Make a decision quickly.
                      </p>
                    </div>
                  )}

                  {isExpired && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">
                        ❌ This request has expired and the payment was automatically cancelled.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestList;