import React from 'react';
import { EvidenceStatus } from '../../types/citizenReport';
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EvidenceVerificationBadgeProps {
  status: EvidenceStatus;
  score?: number;
  className?: string;
  size?: 'sm' | 'md';
}

const CONFIG: Record<EvidenceStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  verified: {
    label: 'Evidence Verified',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-emerald-500/40',
    icon: ShieldCheck,
  },
  under_verification: {
    label: 'Under Verification',
    bg: 'bg-blue-500/15',
    text: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/40',
    icon: Shield,
  },
  needs_review: {
    label: 'Needs Review',
    bg: 'bg-rose-500/15',
    text: 'text-rose-500 dark:text-rose-400',
    border: 'border-rose-500/40',
    icon: ShieldAlert,
  },
  submitted: {
    label: 'Submitted',
    bg: 'bg-amber-500/15',
    text: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-500/40',
    icon: Shield,
  },
};

export const EvidenceVerificationBadge: React.FC<EvidenceVerificationBadgeProps> = ({
  status,
  score,
  className = '',
  size = 'sm',
}) => {
  const conf = CONFIG[status] || CONFIG.submitted;
  const Icon = conf.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider rounded-full border ${conf.bg} ${conf.text} ${conf.border} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{conf.label}</span>
      {typeof score === 'number' && (
        <span className="opacity-90 pl-0.5 font-mono">({score}/100)</span>
      )}
    </span>
  );
};
