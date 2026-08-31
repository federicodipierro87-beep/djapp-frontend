import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import type { PaymentMethod } from '../types';

// Stripe used to be wrapped around the whole application, so every visitor
// downloaded the SDK and Stripe.js itself just to look at a queue. Everything
// Stripe lives in this module instead, and the module is only imported when a
// guest actually reaches the payment step.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Gli Elements di Stripe vivono in un iframe e non ereditano il nostro CSS:
// senza questo, il campo carta resta bianco dentro un modale nero.
// Il font del design system non è dichiarato qui apposta: caricarlo
// nell'iframe richiederebbe un `cssSrc` pubblico, cioè tornare a Google Fonts.
const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#F5F4F0',
    colorBackground: '#16161A',
    colorText: '#F5F4F0',
    colorTextSecondary: '#9C9A94',
    colorTextPlaceholder: '#6A6862',
    colorDanger: '#FF3B1F',
    borderRadius: '4px',
    spacingUnit: '4px',
    fontSizeBase: '16px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid rgba(255,255,255,0.30)',
      boxShadow: 'none',
    },
    '.Label': {
      color: '#9C9A94',
    },
  },
};

interface StripePaymentProps {
  amount: number;
  paymentMethod: PaymentMethod;
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripePayment: React.FC<StripePaymentProps> = (props) => (
  <Elements stripe={stripePromise} options={{ appearance }}>
    <PaymentForm {...props} />
  </Elements>
);

export default StripePayment;
