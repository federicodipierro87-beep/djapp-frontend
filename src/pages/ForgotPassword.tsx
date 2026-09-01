import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Label from '../components/ui/Label';
import Surface from '../components/ui/Surface';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => setSent(true),
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Richiesta non riuscita, riprova.';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Inserisci la tua email');
      return;
    }

    mutation.mutate({ email: email.trim() });
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
          <Label as="div">{sent ? 'Controlla la posta' : 'Password dimenticata'}</Label>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.05]">
            {sent ? 'Se l’account esiste, è partita.' : 'Riprendi la console.'}
          </h1>

          {/* Il "se" è voluto: confermare che un indirizzo è registrato
              renderebbe questa pagina un modo per scoprire chi c'è. */}
          <p className="mt-3 text-sm text-bone-dim text-pretty">
            {sent
              ? 'Apri il link entro un’ora: vale una volta sola. Se non arriva niente, controlla lo spam o riprova con un altro indirizzo.'
              : 'Inserisci l’email dell’account: ti mandiamo un link per scegliere una nuova password.'}
          </p>

          {!sent && (
            <Surface padding="lg" className="mt-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.com"
                  autoComplete="email"
                  required
                />

                <Button type="submit" block disabled={mutation.isPending} className="!mt-6">
                  {mutation.isPending ? 'Invio…' : 'Invia il link'}
                </Button>
              </form>

              <hr className="rule my-6" />

              <Link
                to="/dj/login"
                className="block w-full text-center text-[13px] text-bone-dim hover:text-bone transition-colors"
              >
                Torna all’accesso
              </Link>
            </Surface>
          )}

          {sent && (
            <div className="mt-8">
              <Button block onClick={() => navigate('/dj/login')}>
                Torna all’accesso
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
