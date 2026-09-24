import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, Eye, AlertTriangle, Flame } from 'lucide-react';
import { Status } from '../../api/types';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const configs = {
    calm: {
      icon: ShieldCheck,
      label: 'CALM',
      classes: 'bg-status-calm/15 text-status-calm border-status-calm/30',
    },
    watch: {
      icon: Eye,
      label: 'WATCH',
      classes: 'bg-status-watch/15 text-status-watch border-status-watch/30',
    },
    strained: {
      icon: AlertTriangle,
      label: 'STRAINED',
      classes: 'bg-status-strained/15 text-status-strained border-status-strained/30',
    },
    critical: {
      icon: Flame,
      label: 'CRITICAL',
      classes: 'bg-status-critical/15 text-status-critical border-status-critical/30 animate-pulse',
    },
  };

  const current = configs[status] || configs.calm;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-heading font-semibold border tracking-wider uppercase',
        current.classes,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
};
