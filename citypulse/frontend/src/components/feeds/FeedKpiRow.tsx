import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card } from '../common/Card';

interface FeedKpiRowProps {
  activeFeedsCount: number;
  healthyFeedsCount: number;
  delayedFeedsCount: number;
  offlineFeedsCount: number;
  overallReliability: number;
  eventsPerMin: number;
  onFilterStatus?: (status: 'all' | 'healthy' | 'degraded' | 'offline') => void;
  activeFilter?: string;
}

export const FeedKpiRow: React.FC<FeedKpiRowProps> = ({
  activeFeedsCount,
  healthyFeedsCount,
  delayedFeedsCount,
  offlineFeedsCount,
  overallReliability,
  eventsPerMin,
  onFilterStatus,
  activeFilter,
}) => {
  const kpis = [
    {
      id: 'active',
      label: 'ACTIVE FEEDS',
      value: activeFeedsCount,
      subValue: '6 registered streams',
      trend: '↑ 1',
      trendType: 'positive',
      icon: Activity,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      filterKey: 'all',
    },
    {
      id: 'healthy',
      label: 'HEALTHY FEEDS',
      value: healthyFeedsCount,
      subValue: 'Nominal latency <300ms',
      trend: '↑ 1',
      trendType: 'positive',
      icon: CheckCircle2,
      color: 'text-status-calm',
      bg: 'bg-status-calm/10',
      border: 'border-status-calm/30',
      filterKey: 'healthy',
    },
    {
      id: 'delayed',
      label: 'DELAYED FEEDS',
      value: delayedFeedsCount,
      subValue: delayedFeedsCount > 0 ? 'Transit cadence +8s' : 'Zero cadence lag',
      trend: delayedFeedsCount > 0 ? '↓ lag' : '0',
      trendType: delayedFeedsCount > 0 ? 'warning' : 'neutral',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      filterKey: 'degraded',
    },
    {
      id: 'offline',
      label: 'OFFLINE FEEDS',
      value: offlineFeedsCount,
      subValue: offlineFeedsCount > 0 ? 'Requires attention' : 'All endpoints up',
      trend: offlineFeedsCount > 0 ? '↑ 1' : '—',
      trendType: offlineFeedsCount > 0 ? 'critical' : 'neutral',
      icon: AlertCircle,
      color: offlineFeedsCount > 0 ? 'text-status-critical' : 'text-muted',
      bg: offlineFeedsCount > 0 ? 'bg-status-critical/10' : 'bg-surface-2',
      border: offlineFeedsCount > 0 ? 'border-status-critical/30' : 'border-border',
      filterKey: 'offline',
    },
    {
      id: 'reliability',
      label: 'RELIABILITY',
      value: `${overallReliability.toFixed(1)}%`,
      subValue: 'SLA uptime target 99.5%',
      trend: '↑ 2.1%',
      trendType: 'positive',
      icon: ShieldCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      filterKey: null,
    },
    {
      id: 'events_live',
      label: 'EVENTS LIVE',
      value: `${eventsPerMin}/min`,
      subValue: '~7.1 events/sec avg',
      trend: '↑ 12%',
      trendType: 'positive',
      icon: Zap,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      filterKey: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = kpi.filterKey && activeFilter === kpi.filterKey;

        return (
          <div
            key={kpi.id}
            onClick={() => kpi.filterKey && onFilterStatus && onFilterStatus(kpi.filterKey as any)}
            className={`bg-surface border rounded-2xl p-4 transition-all duration-200 ${
              kpi.filterKey ? 'cursor-pointer hover:border-accent/40' : ''
            } ${
              isSelected
                ? 'ring-2 ring-accent border-accent shadow-sm'
                : 'border-border hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className={`w-8 h-8 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center border ${kpi.border}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                  kpi.trendType === 'positive'
                    ? 'bg-status-calm/10 text-status-calm'
                    : kpi.trendType === 'warning'
                    ? 'bg-amber-500/10 text-amber-500'
                    : kpi.trendType === 'critical'
                    ? 'bg-status-critical/10 text-status-critical'
                    : 'bg-surface-2 text-muted'
                }`}
              >
                {kpi.trend}
              </span>
            </div>

            <div className="text-xl font-bold font-mono text-text tracking-tight mb-0.5">
              {kpi.value}
            </div>
            <div className="text-[11px] font-bold text-muted font-heading uppercase tracking-wider">
              {kpi.label}
            </div>
            <div className="text-[10px] text-muted/70 truncate mt-1">
              {kpi.subValue}
            </div>
          </div>
        );
      })}
    </div>
  );
};
