import React from 'react';
import {
  Activity,
  GitMerge,
  ShieldCheck,
  Search,
  Clock,
  Radio,
  Zap,
} from 'lucide-react';

interface IntelligenceKpiRowProps {
  activeAnomaliesCount: number;
  crossFeedLinksCount: number;
  highConfidenceCount: number;
  investigatingCount: number;
  lastAnalysisTime?: string;
}

export const IntelligenceKpiRow: React.FC<IntelligenceKpiRowProps> = ({
  activeAnomaliesCount,
  crossFeedLinksCount,
  highConfidenceCount,
  investigatingCount,
  lastAnalysisTime = '12s ago',
}) => {
  const kpis = [
    {
      label: 'Active Anomalies',
      value: activeAnomaliesCount,
      subtext: 'Single-feed statistical deviations',
      icon: Activity,
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'Z-Score > 2.5σ',
    },
    {
      label: 'Cross-Feed Links',
      value: crossFeedLinksCount,
      subtext: 'Multi-signal spatial-temporal pairs',
      icon: GitMerge,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      badge: 'Co-occurrence',
    },
    {
      label: 'High Confidence',
      value: highConfidenceCount,
      subtext: 'Supported by >85% evidence metrics',
      icon: ShieldCheck,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'Evidence Backed',
    },
    {
      label: 'Under Investigation',
      value: investigatingCount,
      subtext: 'Flagged for municipal operator review',
      icon: Search,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      badge: 'Actionable',
    },
    {
      label: 'Engine Cycle',
      value: 'Live Stream',
      subtext: `Telemetry sweep ${lastAnalysisTime}`,
      icon: Zap,
      color: 'text-indigo-500 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      badge: '15s Cycle',
      isCustomValue: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-surface border border-border rounded-xl p-3.5 shadow-sm hover:border-border/80 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className={`p-2 rounded-lg border ${kpi.bg}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
                {kpi.badge}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-text tracking-tight">
                  {kpi.value}
                </span>
                {kpi.isCustomValue && (
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs font-semibold text-text font-heading mt-0.5">
                {kpi.label}
              </p>
              <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                {kpi.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
