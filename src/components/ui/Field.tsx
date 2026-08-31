import React, { useId } from 'react';
import clsx from 'clsx';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Codici, importi, orari: tutto ciò che è numerico va in mono. */
  mono?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, error, hint, mono, className, id, ...props }) => {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-err` : undefined}
        className={clsx(
          'field',
          mono && 'font-mono tabular-nums',
          error && 'border-live/70 focus:border-live',
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-err`} className="mt-1.5 text-[13px] text-live">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-bone-faint">{hint}</p>
      ) : null}
    </div>
  );
};

export default Field;
