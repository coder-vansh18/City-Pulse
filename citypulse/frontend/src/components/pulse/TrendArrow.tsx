import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Trend } from '../../api/types';

export const TrendArrow: React.FC<{ trend: Trend | string; className?: string }> = ({
  trend,
  className,
}) => {
  if (trend === 'improving') {
    return (
      <span className={`inline-flex items-center gap-1 text-status-calm font-medium text-xs ${className}`}>
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Improving</span>
      </span>
    );
  }
  if (trend === 'worsening') {
    return (
      <span className={`inline-flex items-center gap-1 text-status-critical font-medium text-xs ${className}`}>
        <TrendingDown className="w-3.5 h-3.5" />
        <span>Worsening</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-muted font-medium text-xs ${className}`}>
      <Minus className="w-3.5 h-3.5" />
      <span>Steady</span>
    </span>
  );
};
