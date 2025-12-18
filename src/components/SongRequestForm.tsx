import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, CreditCard, Smartphone, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestsApi, djApi } from '../services/api';
import PaymentForm from './PaymentForm';
import DonationSlider from './DonationSlider';
import type { CreateRequestData, PaymentMethod } from '../types';

interface SongRequestFormProps {
  eventCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SongRequestForm: React.FC<SongRequestFormProps> = ({ 
  eventCode, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    songTitle: '',
    artistName: '',
    requesterName: '',
    requesterEmail: '',
  });
  const [donationAmount, setDonationAmount] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Get DJ settings to know minimum donation
  const { data: djData } = useQuery({
    queryKey: ['dj-by-event', eventCode],
    queryFn: async () => {
      // We need to get DJ data by event code, but our API doesn't have this endpoint
      // For now, we'll use a default minimum of 5
      return { minDonation: 5 };
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: (data: CreateRequestData) => requestsApi.create(data),
    onSuccess: (response) => {
      toast.success('Richiesta inviata! In attesa dell\'approvazione del DJ...');
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nell\'invio della richiesta';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.songTitle.trim() || !formData.artistName.trim() || !formData.requesterName.trim()) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    if (donationAmount < (djData?.minDonation || 5)) {
      toast.error(`Donazione minima è €${djData?.minDonation || 5}`);
      return;
    }

    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Payment completed successfully, now create the request
    const requestData: CreateRequestData = {
      eventCode,
      songTitle: formData.songTitle,
      artistName: formData.artistName,
      requesterName: formData.requesterName,
      requesterEmail: formData.requesterEmail || undefined,
      donationAmount,
      paymentMethod,
      paymentIntentId // Add the confirmed PaymentIntent ID
    };

    createRequestMutation.mutate(requestData);
    setShowPaymentForm(false);
  };

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const isPayPalEnabled = paypalClientId && paypalClientId !== 'your-paypal-client-id' && paypalClientId !== 'test';

  const paymentMethods = [
    { id: 'CARD' as PaymentMethod, name: 'Carta di Credito/Debito', icon: CreditCard },
    ...(isPayPalEnabled ? [{ id: 'PAYPAL' as PaymentMethod, name: 'PayPal', icon: DollarSign }] : []),
    { id: 'SATISPAY' as PaymentMethod, name: 'Satispay', icon: Smartphone },
    { id: 'APPLE_PAY' as PaymentMethod, name: 'Apple Pay', icon: Smartphone },
    { id: 'GOOGLE_PAY' as PaymentMethod, name: 'Google Pay', icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Richiedi una Canzone</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {showPaymentForm ? (
          <PaymentForm
            amount={donationAmount}
            paymentMethod={paymentMethod}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentForm(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Song Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Titolo Canzone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.songTitle}
                  onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                  className="form-input"
                  placeholder="Inserisci titolo canzone"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">
                  Nome Artista <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  className="form-input"
                  placeholder="Inserisci nome artista"
                  required
                />
              </div>
            </div>

            {/* Requester Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Il Tuo Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  className="form-input"
                  placeholder="Inserisci il tuo nome"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Email (Opzionale)</label>
                <input
                  type="email"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  className="form-input"
                  placeholder="tua@email.com"
                />
              </div>
            </div>

            {/* Donation Amount */}
            <div>
              <DonationSlider
                amount={donationAmount}
                onChange={setDonationAmount}
                min={djData?.minDonation || 5}
                max={100}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="form-label">Metodo di Pagamento</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Importante:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Sarai addebitato solo se il DJ accetta la tua richiesta</li>
                <li>• Le richieste scadono dopo 1 ora se non esaminate</li>
                <li>• La tua carta sarà autorizzata ma non addebitata fino all'accettazione</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className="btn-primary flex-1"
              >
                {createRequestMutation.isPending ? 'Invio...' : 'Continua al Pagamento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SongRequestForm;