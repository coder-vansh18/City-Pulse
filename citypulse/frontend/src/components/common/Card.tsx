import React from 'react';
import { clsx } from 'clsx';
import { Status } from '../../api/types';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowStatus?: Status;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glowStatus,
  className,
  interactive = false,
  ...props
}) => {
  const glowClasses = {
    calm: 'border-status-calm/30 hover:border-status-calm/60 hover:shadow-glow-calm',
    watch: 'border-status-watch/30 hover:border-status-watch/60 hover:shadow-glow-watch',
    strained: 'border-status-strained/30 hover:border-status-strained/60 hover:shadow-glow-strained',
    critical: 'border-status-critical/30 hover:border-status-critical/60 hover:shadow-glow-critical',
  };

  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-2xl p-5 transition-all duration-200',
        glowStatus && glowClasses[glowStatus],
        interactive && 'cursor-pointer hover:border-accent/40 active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
