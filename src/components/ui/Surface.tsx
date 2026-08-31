import React from 'react';
import clsx from 'clsx';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `inset` per pannelli annidati dentro un'altra Surface. */
  tone?: 'default' | 'inset' | 'bare';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const tones = {
  default: 'bg-ink-900 border border-white/[0.08]',
  inset: 'bg-ink-800 border border-white/[0.06]',
  bare: 'bg-transparent border border-white/[0.08]',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-8',
};

const Surface: React.FC<SurfaceProps> = ({
  tone = 'default',
  padding = 'md',
  className,
  ...props
}) => <div className={clsx('rounded-lg', tones[tone], paddings[padding], className)} {...props} />;

export default Surface;
