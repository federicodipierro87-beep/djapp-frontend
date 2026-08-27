import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import type { PaymentMethod } from '../types';

// Stripe used to be wrapped around the whole application, so every visitor
// downloaded the SDK and Stripe.js itself just to look at a queue. Everything
// Stripe lives in this module instead, and the module is only imported when a
// guest actually reaches the payment step.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface StripePaymentProps {
  amount: number;
  paymentMethod: PaymentMethod;
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripePayment: React.FC<StripePaymentProps> = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);

export default StripePayment;
