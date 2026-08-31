import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

import Logo from '../components/Logo';
import Label from '../components/ui/Label';

const STEPS = [
  {
    title: 'Entri con il codice',
    body: 'Il DJ lo tiene esposto in console o su un QR al bancone. Sei dentro, senza registrarti.',
  },
  {
    title: 'Cerchi il pezzo',
    body: 'Catalogo Spotify. Scrivi due parole, scegli la versione giusta, aggiungi un messaggio se vuoi.',
  },
  {
    title: 'Lasci una mancia',
    body: 'Facoltativa, ma sposta la tua richiesta più in alto. Pagamento sicuro, niente app da scaricare.',
  },
  {
    title: 'Segui la coda',
    body: 'Vedi in tempo reale cosa sta suonando e a che punto sei. Il DJ decide, sempre.',
  },
];

const Home: React.FC = () => {
  const [eventCode, setEventCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      toast.error('Inserisci un codice evento');
      return;
    }
    navigate(`/event/${eventCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <header className="px-5 sm:px-8 py-5">
        <Logo size="md" />
      </header>

      <main className="flex-1 px-5 sm:px-8">
        <div className="max-w-2xl mx-auto pt-10 sm:pt-20 pb-16">
          {/* Hero: tipografia stretta e grande, nessuna decorazione. */}
          <h1 className="font-display font-extrabold tracking-tightest leading-[0.92] text-[2.75rem] sm:text-6xl md:text-7xl">
            La tua canzone,
            <br />
            <span className="text-bone-dim">in console.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-bone-dim max-w-md text-pretty">
            Sei a un evento e vuoi sentire un pezzo. Inserisci il codice, mandalo al DJ,
            guarda la coda muoversi.
          </p>

          {/* Unica azione dominante della pagina. */}
          <form onSubmit={handleSubmit} className="mt-12">
            <label htmlFor="event-code" className="field-label">
              Codice evento
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="event-code"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="flex-1 min-w-0 bg-ink-900 border border-white/[0.12] rounded-md
                           px-4 py-4 font-mono text-2xl sm:text-3xl uppercase tracking-[0.35em]
                           text-bone placeholder:text-ink-600 placeholder:tracking-[0.35em]
                           focus:outline-none focus:border-bone/50 focus:bg-ink-800
                           transition-colors duration-150"
              />
              <button
                type="submit"
                className="btn-primary sm:w-auto w-full px-6 py-4 text-base shrink-0"
              >
                Entra
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Azione secondaria: testuale, non un secondo bottone che compete. */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 text-sm text-bone-dim hover:text-bone
                         underline underline-offset-4 decoration-white/20 hover:decoration-white/50
                         transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Non ce l'hai? Scopri gli eventi vicino a te
            </button>
          </div>

          {/* "Come funziona": lista numerata editoriale, non tre card con icona. */}
          <section className="mt-24 sm:mt-32">
            <Label as="div">Come funziona</Label>
            <ol className="mt-6 border-t border-white/[0.08]">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-5 sm:gap-8 py-6 border-b border-white/[0.08]"
                >
                  <span className="num text-sm text-bone-faint pt-1 shrink-0 w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg sm:text-xl font-semibold leading-snug">
                      {step.title}
                    </h2>
                    <p className="mt-1.5 text-sm sm:text-[15px] text-bone-dim text-pretty">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <footer className="px-5 sm:px-8 py-8 border-t border-white/[0.08]">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Logo size="sm" live={false} className="text-bone-faint" />
          <Link
            to="/dj/login"
            className="label-mono hover:text-bone transition-colors underline underline-offset-4 decoration-white/20"
          >
            Area DJ
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
