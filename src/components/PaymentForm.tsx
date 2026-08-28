import React, { useState } from 'react';
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import { Smartphone, AlertCircle } from 'lucide-react';
import type { PaymentMethod } from '../types';

interface PaymentFormProps {
  amount: number;
  paymentMethod: PaymentMethod;
  // Issued by the server for the request this payment belongs to. The form no
  // longer creates its own intent: an authorisation that is not tied to a
  // request is money nobody can collect.
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  paymentMethod,
  clientSecret,
  onSuccess,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const authorize = async (billingName?: string) => {
    if (!stripe || !elements) {
      setPaymentError('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          ...(billingName ? { billing_details: { name: billingName } } : {})
        }
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'requires_capture') {
        // Authorised. The server verifies this with Stripe before the DJ sees
        // anything, so there is nothing to pass along here.
        onSuccess();
      } else {
        setPaymentError('Il pagamento non è stato autorizzato');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentInterface = () => {
    switch (paymentMethod) {
      case 'CARD':
        return (
          <div className="space-y-4">
            <div className="p-4 border border-gray-300 rounded-lg" role="group" aria-label="Informazioni pagamento carta">
              <label htmlFor="card-element" className="sr-only">
                Inserisci i dati della tua carta di credito o debito
              </label>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#374151',
                      '::placeholder': {
                        color: '#9CA3AF',
                      },
                    },
                  },
                  hidePostalCode: false,
                }}
              />
            </div>

            <button
              onClick={() => authorize()}
              disabled={isProcessing || !stripe}
              className="btn-primary w-full"
              aria-describedby="payment-info"
              aria-label={`Autorizza pagamento di ${amount} euro con carta di credito`}
            >
              {isProcessing ? 'Elaborazione...' : `Autorizza €${amount}`}
            </button>
          </div>
        );

      case 'APPLE_PAY':
      case 'GOOGLE_PAY':
        return (
          <div className="space-y-4">
            <button
              onClick={() => authorize('Customer')}
              disabled={isProcessing || !stripe}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Smartphone className="w-5 h-5" />
              <span>
                {isProcessing ? 'Processing...' : `Pay with ${paymentMethod === 'APPLE_PAY' ? 'Apple Pay' : 'Google Pay'}`}
              </span>
            </button>
          </div>
        );

      // PayPal and Satispay never reach this form: both send the guest away to
      // their own page and bring them back to /payment/return.
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Payment</h3>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-primary-800">
            <span className="font-bold text-2xl">€{amount}</span>
          </p>
          <p className="text-primary-600 text-sm">Authorization only - charged when DJ accepts</p>
        </div>
      </div>

      {paymentError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Payment Error</p>
            <p className="text-red-700 text-sm">{paymentError}</p>
          </div>
        </div>
      )}

      {renderPaymentInterface()}

      <div id="payment-info" className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Informazioni Importanti:</h4>
        <ul className="text-gray-700 text-sm space-y-1">
          <li>• Il tuo pagamento sarà processato solo se il DJ accetta la richiesta</li>
          <li>• Questa è un'autorizzazione - nessun addebito fino all'accettazione</li>
          <li>• Le richieste scadono dopo 3 ore</li>
          <li>• Riceverai una conferma una volta che il DJ decide</li>
        </ul>
      </div>

      <div className="flex space-x-3 mt-6">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
