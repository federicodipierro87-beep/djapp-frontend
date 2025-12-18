import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Elements } from '@stripe/react-stripe-js'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { loadStripe } from '@stripe/stripe-js'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 60000, // 1 minuto
      refetchInterval: 30000, // Solo ogni 30 secondi invece di 5
      refetchIntervalInBackground: false, // Disabilita polling in background
    },
    mutations: {
      retry: 1,
    },
  },
})

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '')

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const isPayPalEnabled = paypalClientId && paypalClientId !== 'your-paypal-client-id' && paypalClientId !== 'test';

const paypalOptions = {
  clientId: isPayPalEnabled ? paypalClientId : 'dummy-client-id',
  currency: 'EUR',
  intent: 'authorize',
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Elements stripe={stripePromise}>
          <PayPalScriptProvider options={paypalOptions}>
            <App />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </PayPalScriptProvider>
        </Elements>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)