import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { djApi } from '../services/api';
import type { DJ } from '../types';

interface DJProfileProps {
  dj: DJ;
}

const DJProfile: React.FC<DJProfileProps> = ({ dj }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: dj.name || '',
    firstName: dj.firstName || '',
    lastName: dj.lastName || '',
    address: dj.address || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const queryClient = useQueryClient();

  const profileMutation = useMutation({
    mutationFn: djApi.updateSettings,
    onSuccess: (data) => {
      toast.success('Profilo aggiornato con successo!');
      queryClient.invalidateQueries({ queryKey: ['dj', 'settings'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nell\'aggiornamento del profilo';
      toast.error(message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: djApi.changePassword,
    onSuccess: (data) => {
      toast.success(data.message);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Errore nel cambio password';
      toast.error(message);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      toast.error('Il nome DJ è obbligatorio');
      return;
    }

    profileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Inserisci la password attuale');
      return;
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('La nuova password deve essere di almeno 6 caratteri');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 shadow-2xl shadow-green-400/20">
      <div className="flex items-center mb-6">
        <User className="w-8 h-8 text-green-400 mr-3" style={{filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'}} />
        <h2 className="text-2xl font-bold text-white" style={{textShadow: '0 0 30px rgba(34, 197, 94, 0.5)'}}>
          Il Mio Profilo
        </h2>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'profile'
                ? 'bg-green-400 text-black shadow-lg shadow-green-400/30'
                : 'text-green-200 hover:text-green-100'
            }`}
          >
            Informazioni Personali
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'password'
                ? 'bg-green-400 text-black shadow-lg shadow-green-400/30'
                : 'text-green-200 hover:text-green-100'
            }`}
          >
            Cambia Password
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-green-200 text-sm font-medium mb-2">
              Nome DJ *
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
              placeholder="Il tuo nome DJ"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-green-200 text-sm font-medium mb-2">
                Nome
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                placeholder="Il tuo nome"
              />
            </div>

            <div>
              <label className="block text-green-200 text-sm font-medium mb-2">
                Cognome
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                placeholder="Il tuo cognome"
              />
            </div>
          </div>

          <div>
            <label className="block text-green-200 text-sm font-medium mb-2">
              Indirizzo
            </label>
            <textarea
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20 resize-none"
              placeholder="Il tuo indirizzo completo"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/30 hover:shadow-green-400/50 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {profileMutation.isPending ? 'Aggiornamento...' : 'Salva Profilo'}
            </button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-green-200 text-sm font-medium mb-2">
              Password Attuale *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                placeholder="Inserisci la password attuale"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-green-400"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-green-200 text-sm font-medium mb-2">
              Nuova Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                placeholder="Inserisci la nuova password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-green-400"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-green-200 text-xs mt-1">
              La password deve essere di almeno 6 caratteri
            </p>
          </div>

          <div>
            <label className="block text-green-200 text-sm font-medium mb-2">
              Conferma Nuova Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                placeholder="Conferma la nuova password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-green-400"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/30 hover:shadow-green-400/50 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
            >
              <Lock className="w-5 h-5 mr-2" />
              {passwordMutation.isPending ? 'Aggiornamento...' : 'Cambia Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DJProfile;