import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Event from './pages/Event';
import DiscoverEvents from './pages/DiscoverEvents';
import DJLogin from './pages/DJLogin';
import DJPanel from './pages/DJPanel';
import AdminDashboard from './pages/AdminDashboard';
import Subscription from './pages/Subscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import PaymentReturn from './pages/PaymentReturn';
import UpdateBanner from './components/UpdateBanner';

// Stripe is no longer set up here. Its provider lives next to the payment form,
// which is the only thing that ever needed it.
function App() {
  return (
    <div className="min-h-screen bg-ink-950 text-bone">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<DiscoverEvents />} />
        <Route path="/event/:eventCode" element={<Event />} />
        {/* Where PayPal and Satispay send the guest back to. The URLs are built
            by the server when the order is created, so they cannot move. */}
        <Route path="/payment/return" element={<PaymentReturn />} />
        <Route path="/payment/cancelled" element={<PaymentReturn cancelled />} />
        <Route path="/dj/login" element={<DJLogin />} />
        <Route path="/dj/panel" element={<DJPanel />} />
        <Route path="/dj/subscription" element={<Subscription />} />
        <Route path="/dj/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UpdateBanner />
    </div>
  );
}

export default App;