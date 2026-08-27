import { Routes, Route, Navigate } from 'react-router-dom';
// import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import Home from './pages/Home';
import Event from './pages/Event';
import DiscoverEvents from './pages/DiscoverEvents';
import DJLogin from './pages/DJLogin';
import DJPanel from './pages/DJPanel';
import AdminDashboard from './pages/AdminDashboard';
import Subscription from './pages/Subscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import UpdateBanner from './components/UpdateBanner';

// const paypalOptions = {
//   "clientId": import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
//   currency: "EUR",
//   intent: "authorize",
// };

// Stripe is no longer set up here. Its provider lives next to the payment form,
// which is the only thing that ever needed it.
function App() {
  return (
    <>
      {/* PayPal temporarily disabled */}
      {/* <PayPalScriptProvider options={paypalOptions}> */}
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<DiscoverEvents />} />
            <Route path="/event/:eventCode" element={<Event />} />
            <Route path="/dj/login" element={<DJLogin />} />
            <Route path="/dj/panel" element={<DJPanel />} />
            <Route path="/dj/subscription" element={<Subscription />} />
            <Route path="/dj/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <UpdateBanner />
        </div>
      {/* </PayPalScriptProvider> */}
    </>
  );
}

export default App;