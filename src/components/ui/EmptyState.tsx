import React from 'react';
import Label from './Label';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Micro-label mono sopra al titolo. */
  eyebrow?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ eyebrow, title, description, action }) => (
  <div className="py-12 px-4 text-center">
    {eyebrow && (
      <Label as="div" className="mb-3">
        {eyebrow}
      </Label>
    )}
    <p className="font-display text-lg font-semibold text-bone">{title}</p>
    {description && (
      <p className="mt-2 text-sm text-bone-dim max-w-sm mx-auto text-pretty">{description}</p>
    )}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
