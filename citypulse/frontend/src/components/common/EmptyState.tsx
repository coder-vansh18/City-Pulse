import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-surface/30">
      <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-muted mb-3">
        <Icon className="w-6 h-6 text-muted" />
      </div>
      <h4 className="text-base font-semibold text-text mb-1 font-heading">{title}</h4>
      <p className="text-sm text-muted max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
