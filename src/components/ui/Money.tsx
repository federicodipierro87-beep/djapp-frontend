import React from 'react';
import clsx from 'clsx';
import { formatMoney } from './format';

interface MoneyProps {
  /** Importo in euro. */
  value: number;
  /** Nasconde i decimali quando l'importo è tondo (es. "5 €" invece di "5,00 €"). */
  compact?: boolean;
  className?: string;
}

const Money: React.FC<MoneyProps> = ({ value, compact = false, className }) => (
  <span className={clsx('font-mono tabular-nums', className)}>{formatMoney(value, compact)}</span>
);

export default Money;
