import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'danger' | 'quiet';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Occupa tutta la larghezza: azione principale su mobile. */
  block?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
  'transition-colors duration-150 select-none whitespace-nowrap ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-bone text-ink-950 hover:bg-white active:bg-bone-dim',
  ghost: 'bg-transparent text-bone border border-white/15 hover:bg-white/[0.06] hover:border-white/25',
  danger: 'bg-live text-bone hover:bg-live/90 active:bg-live-dim',
  quiet: 'bg-transparent text-bone-dim hover:text-bone hover:bg-white/[0.05]',
};

// In cabina si preme al volo, spesso con una mano: niente target sotto i 36px.
const sizes: Record<Size, string> = {
  sm: 'text-[13px] px-3 py-2 min-h-[36px]',
  md: 'text-sm px-4 py-2.5 min-h-[44px]',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={clsx(base, variants[variant], sizes[size], block && 'w-full', className)}
    {...props}
  />
);

export default Button;
