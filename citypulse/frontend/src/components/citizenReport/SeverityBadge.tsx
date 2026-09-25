import React from 'react';
import { PriorityLevel } from '../../types/citizenReport';
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps {
  priority: PriorityLevel;
  className?: string;
  size?: 'sm' | 'md';
}

const CONFIG: Record<PriorityLevel, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  critical: {
    label: 'Critical',
    bg: 'bg-rose-500/15',
    text: 'text-rose-500 dark:text-rose-400',
    border: 'border-rose-500/40',
    icon: AlertOctagon,
  },
  high: {
    label: 'High Priority',
    bg: 'bg-amber-500/15',
    text: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-500/40',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Medium',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500/40',
    icon: AlertCircle,
  },
  low: {
    label: 'Low',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/40',
    icon: CheckCircle,
  },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  priority,
  className = '',
  size = 'sm',
}) => {
  const conf = CONFIG[priority] || CONFIG.medium;
  const Icon = conf.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider rounded-full border ${conf.bg} ${conf.text} ${conf.border} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{conf.label}</span>
    </span>
  );
};
