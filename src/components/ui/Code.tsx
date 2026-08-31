import React from 'react';
import clsx from 'clsx';

interface CodeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Codice evento in evidenza: tracking largo, sempre maiuscolo. */
  emphasis?: boolean;
}

const Code: React.FC<CodeProps> = ({ children, emphasis = false, className, ...props }) => (
  <span
    className={clsx(
      'font-mono tabular-nums uppercase',
      emphasis ? 'tracking-[0.25em] font-semibold' : 'tracking-[0.08em]',
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export default Code;
