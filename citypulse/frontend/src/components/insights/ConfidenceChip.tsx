import React from 'react';
import { clsx } from 'clsx';
import { InsightConfidence } from '../../api/types';

export const ConfidenceChip: React.FC<{ confidence: InsightConfidence; className?: string }> = ({
  confidence,
  className,
}) => {
  const styles = {
    low: 'bg-muted/15 text-muted border-border',
    medium: 'bg-accent/15 text-accent border-accent/30',
    high: 'bg-status-calm/15 text-status-calm border-status-calm/30',
  };

  return (
    <span
      className={clsx(
        'text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold',
        styles[confidence] || styles.low,
        className
      )}
    >
      {confidence} confidence
    </span>
  );
};
