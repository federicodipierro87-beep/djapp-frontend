import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings, Euro, CreditCard, Mail, Save, Copy, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { djApi } from '../services/api';
import type { DJ } from '../types';

interface DJSettingsProps {
  dj: DJ;
  onUpdate: () => void;
}

const DJSettings: React.FC<DJSettingsProps> = ({ dj, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: dj.name,
    minDonation: dj.minDonation,
    stripeAccountId: dj.stripeAccountId || '',
    paypalEmail: dj.paypalEmail || '',
    satispayId: dj.satispayId || '',
  });

  const updateMutation = useMutation({
    mutationFn: djApi.updateSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      onUpdate();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update settings';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.minDonation < 0.01 || formData.minDonation > 1000) {
      toast.error('Minimum donation must be between €0.01 and €1000');
      return;
    }

    updateMutation.mutate({
      name: formData.name,
      minDonation: formData.minDonation,
      stripeAccountId: formData.stripeAccountId || undefined,
      paypalEmail: formData.paypalEmail || undefined,
      satispayId: formData.satispayId || undefined,
    });
  };

  const handleCopyEventUrl = () => {
    const url = `${window.location.origin}/event/${dj.eventCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Event URL copied to clipboard!');
  };

  const handleCopyEventCode = () => {
    navigator.clipboard.writeText(dj.eventCode);
    toast.success('Event code copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Event Information */}
      <div className="card">
        <div className="flex items-center mb-4">
          <QrCode className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Event Code</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={dj.eventCode}
                readOnly
                className="form-input font-mono text-lg font-bold bg-gray-50"
              />
              <button
                onClick={handleCopyEventCode}
                className="btn-secondary flex items-center"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Event URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/event/${dj.eventCode}`}
                readOnly
                className="form-input bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyEventUrl}
                className="btn-secondary flex items-center"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Settings */}
      <form onSubmit={handleSubmit} className="card">
        <div className="flex items-center mb-6">
          <Settings className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">DJ Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={dj.email}
              readOnly
              className="form-input bg-gray-50"
            />
          </div>

          <div>
            <label className="form-label">Minimum Donation (€)</label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="0.01"
                max="1000"
                step="0.01"
                value={formData.minDonation}
                onChange={(e) => setFormData({ ...formData, minDonation: Number(e.target.value) })}
                className="form-input pl-10"
                required
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Customers must donate at least this amount to request songs
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Payment Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <CreditCard className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="form-label">Stripe Account ID (Optional)</label>
            <input
              type="text"
              value={formData.stripeAccountId}
              onChange={(e) => setFormData({ ...formData, stripeAccountId: e.target.value })}
              className="form-input"
              placeholder="acct_1234567890"
            />
            <p className="text-sm text-gray-600 mt-1">
              Connect your Stripe account to receive payments directly
            </p>
          </div>

          <div>
            <label className="form-label">PayPal Email (Optional)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.paypalEmail}
                onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                className="form-input pl-10"
                placeholder="your@paypal.email"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Satispay ID (Optional)</label>
            <input
              type="text"
              value={formData.satispayId}
              onChange={(e) => setFormData({ ...formData, satispayId: e.target.value })}
              className="form-input"
              placeholder="Your Satispay business ID"
            />
            <p className="text-sm text-gray-600 mt-1">
              Satispay Business API integration (Italy only)
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Payment Integration Notes:</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Payment accounts are optional but recommended for automatic payouts</li>
            <li>• Without payment integration, you'll need to handle payments manually</li>
            <li>• Contact support for help setting up payment integrations</li>
          </ul>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-gray-600">Account created</label>
            <p className="font-medium text-gray-900">
              {new Date(dj.createdAt).toLocaleDateString()}
            </p>
          </div>

          {dj.updatedAt && (
            <div>
              <label className="block text-gray-600">Last updated</label>
              <p className="font-medium text-gray-900">
                {new Date(dj.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DJSettings;