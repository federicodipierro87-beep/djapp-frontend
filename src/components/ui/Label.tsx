import React from 'react';
import clsx from 'clsx';

interface LabelProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'span' | 'div' | 'p';
  tone?: 'dim' | 'bone' | 'live';
}

const tones = {
  dim: 'text-bone-dim',
  bone: 'text-bone',
  live: 'text-live',
};

/**
 * Micro-label mono maiuscola: la firma visiva ricorrente dell'interfaccia
 * (CODICE EVENTO, IN CODA, ORA IN RIPRODUZIONE).
 */
const Label: React.FC<LabelProps> = ({ as: Tag = 'span', tone = 'dim', className, ...props }) => (
  <Tag
    className={clsx(
      'font-mono text-[11px] uppercase tracking-[0.14em] leading-none',
      tones[tone],
      className
    )}
    {...props}
  />
);

export default Label;
