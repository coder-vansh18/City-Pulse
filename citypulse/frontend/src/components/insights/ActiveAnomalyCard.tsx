import React from 'react';
import {
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  AlertTriangle,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Activity,
} from 'lucide-react';
import { SingleFeedAnomaly, IntelligenceSeverity } from '../../types/intelligence';
import { FeedType, InsightConfidence } from '../../api/types';

const FEED_ICONS: Record<FeedType, React.ElementType> = {
  weather: CloudRain,
  transit: Bus,
  incident: Siren,
  air_quality: Wind,
  power: Zap,
  noise: Volume2,
};

const SEVERITY_STYLES: Record<
  IntelligenceSeverity,
  { bg: string; text: string; border: string; label: string }
> = {
  critical: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    label: 'Critical',
  },
  high: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    label: 'High Severity',
  },
  medium: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    label: 'Medium Severity',
  },
  low: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
    label: 'Low Severity',
  },
};

const CONFIDENCE_STYLES: Record<
  InsightConfidence,
  { bg: string; text: string; border: string; label: string }
> = {
  high: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    label: 'High Conf',
  },
  medium: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    label: 'Med Conf',
  },
  low: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    label: 'Low Conf',
  },
};

const STATUS_BADGES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  new: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30',
    label: 'New Deviation',
  },
  investigating: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    label: 'Investigating',
  },
  correlated: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    label: 'Cross-Correlated',
  },
  confirmed: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    label: 'Confirmed',
  },
  resolved: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
    label: 'Resolved',
  },
};

interface ActiveAnomalyCardProps {
  anomaly: SingleFeedAnomaly;
  onViewEvidence: (anomaly: SingleFeedAnomaly) => void;
  onShowOnMap?: (zoneId: string) => void;
}

export const ActiveAnomalyCard: React.FC<ActiveAnomalyCardProps> = ({
  anomaly,
  onViewEvidence,
  onShowOnMap,
}) => {
  const Icon = FEED_ICONS[anomaly.feedId] || Activity;
  const sevStyle = SEVERITY_STYLES[anomaly.severity];
  const confStyle = CONFIDENCE_STYLES[anomaly.confidence];
  const statusBadge = STATUS_BADGES[anomaly.lifecycleStatus] || STATUS_BADGES.new;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Feed Anomaly
            </span>

            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${statusBadge.bg} ${statusBadge.border}`}
            >
              {statusBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}
            >
              {sevStyle.label}
            </span>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${confStyle.bg} ${confStyle.text} ${confStyle.border} flex items-center gap-1`}
            >
              <ShieldCheck className="w-3 h-3" />
              {confStyle.label}
            </span>
          </div>
        </div>

        {/* Feed Info & Deviation Multiple */}
        <div className="flex items-center justify-between bg-surface-2/70 border border-border/80 rounded-xl p-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text font-heading block leading-tight">
                {anomaly.feedName}
              </span>
              <span className="text-[10px] text-muted font-mono uppercase">
                {anomaly.feedId} telemetry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{anomaly.deviationMultiple}× baseline</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-text font-heading mb-1.5 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {anomaly.title}
        </h3>

        <p className="text-xs text-text/80 leading-relaxed font-sans mb-3.5">
          {anomaly.description}
        </p>

        {/* Value Comparison Pill */}
        <div className="grid grid-cols-2 gap-2 bg-surface-2/40 border border-border/60 rounded-xl p-2.5 mb-3.5">
          <div className="border-r border-border/40 pr-2">
            <span className="text-[10px] text-muted font-mono block">Baseline Value</span>
            <span className="text-xs font-semibold font-mono text-muted">
              {anomaly.baselineValue}
            </span>
          </div>
          <div className="pl-2">
            <span className="text-[10px] text-muted font-mono block">Observed Value</span>
            <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
              {anomaly.observedValue}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-[11px] text-text">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span>{anomaly.zoneName}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-muted" />
            <span>{anomaly.detectedTimeAgo}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onShowOnMap && (
            <button
              onClick={() => onShowOnMap(anomaly.zoneId)}
              className="text-[11px] font-semibold text-muted hover:text-text px-2 py-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Map
            </button>
          )}

          <button
            onClick={() => onViewEvidence(anomaly)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 text-xs transition-colors cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Evidence</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
