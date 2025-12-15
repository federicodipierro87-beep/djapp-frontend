import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Music, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

const DJLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('dj_token', data.token);
      toast.success('Accesso effettuato con successo!');
      navigate('/dj/panel');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Accesso fallito';
      toast.error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('dj_token', data.token);
      toast.success('Registrazione completata!');
      navigate('/dj/panel');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Registrazione fallita';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    if (!isLogin && !formData.name) {
      toast.error('Inserisci il tuo nome');
      return;
    }

    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white animate-pulse-slow"></div>
          <div className="absolute top-60 right-32 w-20 h-20 rounded-full bg-white animate-bounce-gentle"></div>
          <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-white animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Back Button */}
          <div className="w-full max-w-md mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </button>
          </div>

          {/* Login/Register Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Music className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Bentornato' : 'Registrati come DJ'}
              </h1>
              <p className="text-purple-100">
                {isLogin ? 'Accedi alla tua dashboard DJ' : 'Crea il tuo account DJ'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">
                    Nome DJ
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    placeholder="Inserisci il tuo nome DJ"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block text-purple-100 text-sm font-medium mb-2">
                  Indirizzo Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-200" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    placeholder="tua@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-100 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-200" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                    placeholder="Inserisci la tua password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-purple-200 text-xs mt-1">
                    La password deve essere di almeno 6 caratteri
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? 'Attendi...' : (isLogin ? 'Accedi' : 'Crea Account')}
              </button>
            </form>

            {/* Toggle Login/Register */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', name: '' });
                }}
                className="text-purple-200 hover:text-white transition-colors underline decoration-dotted underline-offset-4"
              >
                {isLogin ? "Non hai un account? Registrati" : 'Hai già un account? Accedi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DJLogin;