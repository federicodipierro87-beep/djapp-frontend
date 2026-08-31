import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { djApi } from '../services/api';
import Button from './ui/Button';
import Field from './ui/Field';
import Label from './ui/Label';
import type { DJ } from '../types';

interface DJProfileProps {
  dj: DJ;
}

/** Campo password con l'occhio: si digita al buio, poterla rileggere serve. */
const PasswordField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  minLength?: number;
  autoComplete: string;
}> = ({ id, label, value, onChange, placeholder, hint, minLength, autoComplete }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field pr-12"
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Nascondi la password' : 'Mostra la password'}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-md
                     text-bone-faint hover:text-bone hover:bg-white/[0.06] transition-colors"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-[13px] text-bone-faint">{hint}</p>}
    </div>
  );
};

const DJProfile: React.FC<DJProfileProps> = ({ dj }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

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
    onSuccess: () => {
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
    <div className="max-w-2xl">
      <Label as="div">Account</Label>
      <h3 className="mt-2 font-display text-xl font-bold tracking-tight">Il tuo profilo</h3>

      {/* Due sole schede: sottolineatura, non pillole dentro un riquadro grigio. */}
      <div className="mt-5 flex items-center gap-6 border-b border-white/[0.08]">
        {([
          { id: 'profile', label: 'Dati personali' },
          { id: 'password', label: 'Password' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px pb-3 text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-bone text-bone font-medium'
                : 'border-transparent text-bone-dim hover:text-bone'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
          <Field
            label="Nome DJ"
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            placeholder="Come ti annunci"
            hint="È il nome che vedono i tuoi ospiti."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Nome"
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              autoComplete="given-name"
            />

            <Field
              label="Cognome"
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              autoComplete="family-name"
            />
          </div>

          <div>
            <label htmlFor="dj-address" className="field-label">
              Indirizzo
            </label>
            <textarea
              id="dj-address"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              rows={3}
              className="field resize-none"
              placeholder="Via, città, CAP"
              autoComplete="street-address"
            />
            <p className="mt-1.5 text-[13px] text-bone-faint">
              Serve solo per la fatturazione: non viene mostrato a nessuno.
            </p>
          </div>

          <Button type="submit" disabled={profileMutation.isPending} className="!mt-6">
            <Save className="h-4 w-4" />
            {profileMutation.isPending ? 'Salvataggio…' : 'Salva'}
          </Button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
          <PasswordField
            id="current-password"
            label="Password attuale"
            value={passwordData.currentPassword}
            onChange={(v) => setPasswordData({ ...passwordData, currentPassword: v })}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <PasswordField
            id="new-password"
            label="Nuova password"
            value={passwordData.newPassword}
            onChange={(v) => setPasswordData({ ...passwordData, newPassword: v })}
            placeholder="••••••••"
            hint="Almeno 6 caratteri."
            minLength={6}
            autoComplete="new-password"
          />

          <PasswordField
            id="confirm-password"
            label="Conferma la nuova password"
            value={passwordData.confirmPassword}
            onChange={(v) => setPasswordData({ ...passwordData, confirmPassword: v })}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <Button type="submit" disabled={passwordMutation.isPending} className="!mt-6">
            {passwordMutation.isPending ? 'Aggiornamento…' : 'Cambia password'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default DJProfile;
