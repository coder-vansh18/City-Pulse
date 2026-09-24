import React from 'react';
import { AlertCircle } from 'lucide-react';

export const CaveatNote: React.FC<{ message?: string | null; className?: string }> = ({
  message,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs text-muted/90 bg-surface-2/40 px-3 py-1.5 rounded-lg border border-border/40 font-sans italic ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-muted flex-shrink-0" />
      <span>{message || 'Possible link — statistical correlation; not a confirmed cause.'}</span>
    </div>
  );
};
