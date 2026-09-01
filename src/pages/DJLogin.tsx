import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Label from '../components/ui/Label';
import Surface from '../components/ui/Surface';

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
    onSuccess: (data: any) => {
      localStorage.setItem('dj_token', data.token);
      toast.success('Accesso effettuato con successo!');

      // Check if admin login
      if (data.isAdmin) {
        navigate('/admin/dashboard');
      } else if (data.subscription?.requiresSubscription) {
        // DJ needs to subscribe
        navigate('/dj/subscription');
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
    onSuccess: () => {
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
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex" aria-label="Home">
          <Logo size="md" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-bone-dim hover:text-bone transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Label as="div">{isLogin ? 'Area DJ' : 'Nuovo account'}</Label>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.05]">
            {isLogin ? 'Entra in console.' : 'Registrati come DJ.'}
          </h1>
          <p className="mt-3 text-sm text-bone-dim text-pretty">
            {isLogin
              ? 'Le richieste della serata, la coda e gli incassi.'
              : 'L’account viene attivato dopo l’approvazione dell’amministratore.'}
          </p>

          <Surface padding="lg" className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Field
                  label="Nome DJ"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Come ti annunci"
                  autoComplete="nickname"
                  required
                />
              )}

              <Field
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tua@email.com"
                autoComplete="email"
                required
              />

              <div>
                <label htmlFor="dj-password" className="field-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="dj-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="field pr-12"
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Nascondi la password' : 'Mostra la password'}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-md
                               text-bone-faint hover:text-bone hover:bg-white/[0.06] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {!isLogin ? (
                  <p className="mt-1.5 text-[13px] text-bone-faint">Almeno 6 caratteri.</p>
                ) : (
                  <div className="mt-2 text-right">
                    <Link
                      to="/dj/forgot-password"
                      className="text-[13px] text-bone-dim hover:text-bone transition-colors"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                )}
              </div>

              <Button type="submit" block disabled={isLoading} className="!mt-6">
                {isLoading ? 'Attendi…' : isLogin ? 'Accedi' : 'Crea account'}
              </Button>
            </form>

            <hr className="rule my-6" />

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '' });
              }}
              className="w-full text-center text-[13px] text-bone-dim hover:text-bone transition-colors"
            >
              {isLogin ? (
                <>
                  Non hai un account?{' '}
                  <span className="text-bone underline underline-offset-4">Registrati</span>
                </>
              ) : (
                <>
                  Hai già un account?{' '}
                  <span className="text-bone underline underline-offset-4">Accedi</span>
                </>
              )}
            </button>
          </Surface>
        </div>
      </main>
    </div>
  );
};

export default DJLogin;
