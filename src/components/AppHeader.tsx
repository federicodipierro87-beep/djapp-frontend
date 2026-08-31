import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo';
import Label from './ui/Label';

interface AppHeaderProps {
  /** Titolo della pagina. Se assente resta solo il wordmark. */
  title?: React.ReactNode;
  /** Micro-label mono sopra al titolo (es. CODICE EVENTO). */
  eyebrow?: React.ReactNode;
  /** Riga sotto al titolo: luogo, orario, stato. */
  meta?: React.ReactNode;
  /** Azioni a destra. */
  actions?: React.ReactNode;
  /** Mostra la freccia indietro. Stringa = destinazione, true = history back. */
  back?: string | boolean;
  /** Larghezza del contenitore interno. */
  width?: 'md' | 'lg' | 'xl';
  sticky?: boolean;
  className?: string;
}

const widths = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
};

/**
 * Header unico dell'app. Prima ogni pagina aveva il suo, tutti diversi.
 */
const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  eyebrow,
  meta,
  actions,
  back,
  width = 'lg',
  sticky = true,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className={clsx(
        'bg-ink-950/95 backdrop-blur-sm border-b border-white/[0.08]',
        sticky && 'sticky top-0 z-30',
        className
      )}
    >
      <div className={clsx('mx-auto px-4 sm:px-6 lg:px-8 py-3.5', widths[width])}>
        <div className="flex items-center gap-3 sm:gap-4">
          {back && (
            <button
              type="button"
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              aria-label="Torna indietro"
              className="-ml-1.5 p-2 rounded-md text-bone-dim hover:text-bone hover:bg-white/[0.06] transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {title ? (
            <div className="min-w-0 flex-1">
              {eyebrow && (
                <Label as="div" className="mb-1.5 truncate">
                  {eyebrow}
                </Label>
              )}
              <h1 className="font-display text-base sm:text-lg font-bold leading-tight truncate">
                {title}
              </h1>
              {meta && (
                <div className="mt-1 text-[13px] text-bone-dim truncate">{meta}</div>
              )}
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <Link to="/" className="inline-flex" aria-label="Home">
                <Logo size="md" />
              </Link>
            </div>
          )}

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
