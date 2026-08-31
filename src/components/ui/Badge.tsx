import React from 'react';
import clsx from 'clsx';

export type BadgeTone = 'neutral' | 'live' | 'ok' | 'warn' | 'muted';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

// Il colore qui non decora: dice soltanto in che stato si trova una cosa.
const tones: Record<BadgeTone, string> = {
  neutral: 'border-white/15 text-bone',
  live: 'border-live/50 text-live',
  ok: 'border-ok/40 text-ok',
  warn: 'border-warn/40 text-warn',
  muted: 'border-white/10 text-bone-faint',
};

const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', className, ...props }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 border rounded-sm px-2 py-1',
      'font-mono text-[10px] uppercase tracking-[0.12em] leading-none whitespace-nowrap',
      tones[tone],
      className
    )}
    {...props}
  />
);

export default Badge;
