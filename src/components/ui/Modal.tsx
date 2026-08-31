import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import Label from './Label';

interface ModalProps {
  title: React.ReactNode;
  /** Micro-label mono sopra al titolo. */
  eyebrow?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  /** Barra di azioni fissa in fondo al modale. */
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-2xl',
};

const Modal: React.FC<ModalProps> = ({ title, eyebrow, onClose, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Il body non deve scorrere sotto al modale su mobile.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/80 sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={clsx(
          'w-full flex flex-col bg-ink-900 border border-white/[0.10] shadow-xl',
          'rounded-t-xl sm:rounded-lg max-h-[92vh] sm:max-h-[86vh] animate-slide-up',
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-white/[0.08] shrink-0">
          <div className="min-w-0">
            {eyebrow && (
              <Label as="div" className="mb-1.5">
                {eyebrow}
              </Label>
            )}
            <h2 className="font-display text-lg font-bold leading-tight truncate">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="-mr-1.5 -mt-1 p-2 rounded-md text-bone-dim hover:text-bone hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5">{children}</div>

        {footer && (
          <div className="px-5 py-4 border-t border-white/[0.08] shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
