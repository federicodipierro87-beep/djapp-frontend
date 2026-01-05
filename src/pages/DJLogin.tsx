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
      
      // Check if admin login
      if (data.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dj/panel');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Accesso fallito';
      toast.error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast.success('Registrazione completata! In attesa di approvazione dall\'amministratore.');
      setIsLogin(true); // Switch to login form
      setFormData({ email: '', password: '', name: '' }); // Clear form
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neon Green Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/20 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-500/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-green-400/30 animate-pulse-slow shadow-lg shadow-green-400/50"></div>
        <div className="absolute top-60 right-32 w-20 h-20 rounded-full bg-green-300/40 animate-bounce-gentle shadow-md shadow-green-300/50"></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-green-500/35 animate-pulse shadow-sm shadow-green-500/50"></div>
        <div className="absolute bottom-60 right-1/4 w-24 h-24 rounded-full bg-green-400/25 animate-pulse-slow shadow-lg shadow-green-400/50"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="w-full max-w-md mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-green-300 hover:text-green-400 transition-colors"
            style={{textShadow: '0 0 10px rgba(134, 239, 172, 0.3)'}}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Home
          </button>
        </div>

        {/* Login/Register Form */}
        <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-green-400/30 w-full max-w-md shadow-2xl shadow-green-400/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <Music className="w-12 h-12 text-green-400" style={{filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'}} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{textShadow: '0 0 30px rgba(34, 197, 94, 0.5)'}}>
              {isLogin ? 'Bentornato' : 'Registrati come DJ'}
            </h1>
            <p className="text-green-100">
              {isLogin ? 'Accedi alla tua dashboard DJ' : 'Crea il tuo account DJ'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-green-200 text-sm font-medium mb-2">
                  Nome DJ
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                  placeholder="Inserisci il tuo nome DJ"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-green-200 text-sm font-medium mb-2">
                Indirizzo Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                  placeholder="tua@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-green-200 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-black/60 border-2 border-green-400/50 rounded-lg text-green-400 placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg shadow-green-400/20"
                  placeholder="Inserisci la tua password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-green-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-green-200 text-xs mt-1">
                  La password deve essere di almeno 6 caratteri
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-lg hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/30 hover:shadow-green-400/50 disabled:opacity-50 disabled:transform-none"
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
              className="text-green-300 hover:text-green-400 transition-colors underline decoration-dotted underline-offset-4 font-medium"
              style={{textShadow: '0 0 10px rgba(134, 239, 172, 0.3)'}}
            >
              {isLogin ? "Non hai un account? Registrati" : 'Hai già un account? Accedi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DJLogin;