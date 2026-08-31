import React from 'react';
import clsx from 'clsx';

interface MarkProps {
  className?: string;
  /** Il punto rosso "on air" si accende solo dove ha senso. */
  live?: boolean;
}

/**
 * Marchio monocromatico: tre barre decrescenti (la coda che si svuota) e il
 * punto "on air". Sostituisce l'emoji 👽 con le cuffie sovrapposte.
 */
export const LogoMark: React.FC<MarkProps> = ({ className, live = true }) => (
  <svg
    viewBox="0 0 32 32"
    aria-hidden="true"
    className={clsx('block', className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="6" width="3" height="20" fill="currentColor" />
    <rect x="9" y="11" width="3" height="15" fill="currentColor" opacity="0.75" />
    <rect x="16" y="16" width="3" height="10" fill="currentColor" opacity="0.45" />
    <circle cx="26" cy="8" r="3.5" className={live ? 'fill-live' : 'fill-current'} />
  </svg>
);

interface LogoProps {
  /** Solo marchio, senza wordmark: utile nell'header stretto. */
  markOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  live?: boolean;
  className?: string;
}

const markSizes = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

const wordSizes = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-xl',
};

const Logo: React.FC<LogoProps> = ({ markOnly = false, size = 'md', live = true, className }) => (
  <span className={clsx('inline-flex items-center gap-2.5 text-bone', className)}>
    <LogoMark className={markSizes[size]} live={live} />
    {!markOnly && (
      <span
        className={clsx(
          'font-display font-extrabold uppercase tracking-[0.02em] leading-none',
          wordSizes[size]
        )}
      >
        In Console
      </span>
    )}
  </span>
);

export default Logo;
