import React, { useState } from 'react';
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
  requestId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// The Express Checkout Element reads the amount and the currency from the intent
// its group was built with, so Apple Pay and Google Pay need the client secret
// here rather than only on the confirm call. The card does not, and gets the
// group it has always had: mixing the legacy Card Element into a client-secret
// group is undocumented either way, and the card is the path that works.
//
// The `key` is what makes the fallback possible. A group's options cannot be
// changed after it is created, so when a browser turns out to have no wallet the
// only way back to the card is a new group.
const StripePayment: React.FC<StripePaymentProps> = (props) => {
  const isWalletMethod =
    props.paymentMethod === 'APPLE_PAY' || props.paymentMethod === 'GOOGLE_PAY';
  const [walletUnavailable, setWalletUnavailable] = useState(false);
  const useWallet = isWalletMethod && !walletUnavailable;

  return (
    <Elements
      key={useWallet ? 'wallet' : 'card'}
      stripe={stripePromise}
      options={useWallet ? { clientSecret: props.clientSecret, appearance } : { appearance }}
    >
      <PaymentForm
        {...props}
        useWallet={useWallet}
        onWalletUnavailable={() => setWalletUnavailable(true)}
      />
    </Elements>
  );
};

export default StripePayment;
