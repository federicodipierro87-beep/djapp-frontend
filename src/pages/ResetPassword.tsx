import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { logout } from '../services/session';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Surface from '../components/ui/Surface';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      // Il reset ha invalidato ogni sessione aperta, compresa quella che questo
      // browser potrebbe avere ancora in localStorage.
      logout();
      toast.success(data.message);
      navigate('/dj/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Non è stato possibile cambiare la password.';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    mutation.mutate({ token: token!, password });
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex" aria-label="Home">
          <Logo size="md" />
        </Link>
        <Link
          to="/dj/login"
          className="inline-flex items-center gap-1.5 text-[13px] text-bone-dim hover:text-bone transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Accedi
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Label as="div">Nuova password</Label>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.05]">
            Scegline una nuova.
          </h1>
          <p className="mt-3 text-sm text-bone-dim text-pretty">
            Da qui in poi vale solo questa: gli accessi già aperti altrove vengono chiusi.
          </p>

          <Surface padding="lg" className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="field-label">
                  Nuova password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field pr-12"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                <p className="mt-1.5 text-[13px] text-bone-faint">Almeno 6 caratteri.</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="field-label">
                  Conferma la password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="field"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" block disabled={mutation.isPending} className="!mt-6">
                {mutation.isPending ? 'Aggiornamento…' : 'Cambia password'}
              </Button>
            </form>

            <hr className="rule my-6" />

            {/* Il link vale un'ora e una volta sola: se è scaduto o già usato
                serve ripartire da qui. */}
            <Link
              to="/dj/forgot-password"
              className="block w-full text-center text-[13px] text-bone-dim hover:text-bone transition-colors"
            >
              Il link non funziona più?{' '}
              <span className="text-bone underline underline-offset-4">Chiedine un altro</span>
            </Link>
          </Surface>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
