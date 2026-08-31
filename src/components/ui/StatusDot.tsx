import React from 'react';
import clsx from 'clsx';
import type { BadgeTone } from './Badge';

interface StatusDotProps {
  tone?: BadgeTone;
  /** Alone pulsante: solo per stati che cambiano da soli (live, connesso). */
  pulse?: boolean;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-bone',
  live: 'bg-live',
  ok: 'bg-ok',
  warn: 'bg-warn',
  muted: 'bg-bone-faint',
};

const StatusDot: React.FC<StatusDotProps> = ({ tone = 'neutral', pulse, className }) => (
  <span className={clsx('relative inline-flex h-2 w-2 shrink-0', className)}>
    {pulse && (
      <span
        className={clsx(
          'absolute inset-0 rounded-full opacity-60 animate-ping',
          tones[tone]
        )}
      />
    )}
    <span className={clsx('relative inline-flex h-2 w-2 rounded-full', tones[tone])} />
  </span>
);

export default StatusDot;
