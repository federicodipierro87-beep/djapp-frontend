import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import Home from './pages/Home';
import Event from './pages/Event';
import DJLogin from './pages/DJLogin';
import DJPanel from './pages/DJPanel';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const paypalOptions = {
  "clientId": import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
  currency: "EUR",
  intent: "authorize",
};

function App() {
  return (
    <Elements stripe={stripePromise}>
      <PayPalScriptProvider options={paypalOptions}>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event/:eventCode" element={<Event />} />
            <Route path="/dj/login" element={<DJLogin />} />
            <Route path="/dj/panel" element={<DJPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </PayPalScriptProvider>
    </Elements>
  );
}

export default App;