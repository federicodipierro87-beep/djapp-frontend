import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { queryClient } from './services/session'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        {/* In basso e non in alto: su mobile il top-right copre l'header
            e il pulsante di chiusura dei modali. */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16161A',
              color: '#F5F4F0',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '6px',
              boxShadow: '0 10px 24px -6px rgb(0 0 0 / 0.75)',
              fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif",
              fontSize: '14px',
              padding: '10px 14px',
              maxWidth: '92vw',
            },
            success: {
              iconTheme: {
                primary: '#37D67A',
                secondary: '#08080A',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF3B1F',
                secondary: '#F5F4F0',
              },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)