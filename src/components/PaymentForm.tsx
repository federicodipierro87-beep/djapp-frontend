import React, { useState } from 'react';
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Smartphone, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { paymentApi } from '../services/api';
import type { PaymentMethod } from '../types';

interface PaymentFormProps {
  amount: number;
  paymentMethod: PaymentMethod;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  paymentMethod, 
  onSuccess, 
  onCancel 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const stripe = useStripe();
  const elements = useElements();

  const stripeIntentMutation = useMutation({
    mutationFn: (amount: number) => paymentApi.createStripeIntent(amount),
  });

  const paypalOrderMutation = useMutation({
    mutationFn: (amount: number) => paymentApi.createPayPalOrder(amount),
  });

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      setPaymentError('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { clientSecret } = await stripeIntentMutation.mutateAsync(amount);
      
      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'requires_capture') {
        // Payment authorized successfully
        onSuccess(paymentIntent.id);
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplePayment = async () => {
    if (!stripe) {
      setPaymentError('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { clientSecret } = await stripeIntentMutation.mutateAsync(amount);
      
      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      const cardElement = elements?.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer'
          }
        }
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'requires_capture') {
        onSuccess(paymentIntent.id);
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
            <div className="p-4 border border-gray-300 rounded-lg">
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
                }}
              />
            </div>
            
            <button
              onClick={handleStripePayment}
              disabled={isProcessing || !stripe}
              className="btn-primary w-full"
            >
              {isProcessing ? 'Processing...' : `Authorize €${amount}`}
            </button>
          </div>
        );

      case 'APPLE_PAY':
      case 'GOOGLE_PAY':
        return (
          <div className="space-y-4">
            <button
              onClick={handleApplePayment}
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

      case 'PAYPAL':
        return (
          <div className="space-y-4">
            <PayPalButtons
              disabled={isProcessing}
              style={{ 
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "pay"
              }}
              createOrder={async () => {
                try {
                  const { orderId } = await paypalOrderMutation.mutateAsync(amount);
                  if (!orderId) {
                    throw new Error('Failed to create PayPal order');
                  }
                  return orderId;
                } catch (error) {
                  console.error('PayPal order creation failed:', error);
                  throw error;
                }
              }}
              onApprove={async (data) => {
                // PayPal payment approved (authorized)
                onSuccess(data.orderID);
              }}
              onError={(error) => {
                console.error('PayPal error:', error);
                setPaymentError('PayPal payment failed');
              }}
              onCancel={() => {
                setPaymentError('PayPal payment cancelled');
              }}
            />
          </div>
        );

      case 'SATISPAY':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Satispay integration coming soon</p>
            <button onClick={onCancel} className="btn-secondary">
              Choose another payment method
            </button>
          </div>
        );

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

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Important Information:</h4>
        <ul className="text-gray-700 text-sm space-y-1">
          <li>• Your payment will only be processed if the DJ accepts your request</li>
          <li>• This is an authorization - no charge until acceptance</li>
          <li>• Requests expire after 1 hour</li>
          <li>• You'll receive a confirmation once the DJ decides</li>
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