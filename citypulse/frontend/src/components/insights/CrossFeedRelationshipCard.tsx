import React from 'react';
import {
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  Sparkles,
  MapPin,
  Clock,
  ArrowRightLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { CrossFeedRelationship, IntelligenceSeverity } from '../../types/intelligence';
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
    label: 'Critical Impact',
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
    label: 'High Confidence (≥85%)',
  },
  medium: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    label: 'Medium Confidence (60-84%)',
  },
  low: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    label: 'Low Confidence (<60%)',
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
    label: 'New Link',
  },
  investigating: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    label: 'Under Investigation',
  },
  correlated: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    label: 'Correlated',
  },
  confirmed: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    label: 'Field Confirmed',
  },
  resolved: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
    label: 'Resolved',
  },
};

interface CrossFeedRelationshipCardProps {
  relationship: CrossFeedRelationship;
  onViewEvidence: (relationship: CrossFeedRelationship) => void;
  onShowOnMap?: (zoneId: string) => void;
}

export const CrossFeedRelationshipCard: React.FC<CrossFeedRelationshipCardProps> = ({
  relationship,
  onViewEvidence,
  onShowOnMap,
}) => {
  const IconA = FEED_ICONS[relationship.feedA] || Activity;
  const IconB = FEED_ICONS[relationship.feedB] || Activity;
  const sevStyle = SEVERITY_STYLES[relationship.severity];
  const confStyle = CONFIDENCE_STYLES[relationship.confidence];
  const statusBadge = STATUS_BADGES[relationship.lifecycleStatus] || STATUS_BADGES.new;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Card Header with Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Cross Feed Badge */}
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Cross-Feed Relationship
            </span>

            {/* Lifecycle Status */}
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
            >
              {statusBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Severity Tag */}
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}
            >
              {sevStyle.label}
            </span>

            {/* Confidence Tag */}
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${confStyle.bg} ${confStyle.text} ${confStyle.border} flex items-center gap-1`}
            >
              <ShieldCheck className="w-3 h-3" />
              {confStyle.label}
            </span>
          </div>
        </div>

        {/* Visual Multi-Feed Link Bar */}
        <div className="flex items-center justify-between bg-surface-2/70 border border-border/80 rounded-xl p-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <IconA className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text font-heading block leading-tight">
                {relationship.feedAName}
              </span>
              <span className="text-[10px] text-muted font-mono uppercase">
                {relationship.feedA} feed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface border border-border text-purple-500 dark:text-purple-400 font-mono text-[11px] font-semibold">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Co-occurs</span>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <span className="text-xs font-bold text-text font-heading block leading-tight">
                {relationship.feedBName}
              </span>
              <span className="text-[10px] text-muted font-mono uppercase">
                {relationship.feedB} feed
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <IconB className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Title & Plain-Language Explanation */}
        <h3 className="text-base font-bold text-text font-heading mb-1.5 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
          {relationship.title}
        </h3>

        <p className="text-xs text-text/80 leading-relaxed font-sans mb-3.5">
          {relationship.hypothesis}
        </p>

        {/* Evidence Metric Summary Gauges */}
        <div className="grid grid-cols-3 gap-2 bg-surface-2/40 border border-border/60 rounded-xl p-2.5 mb-3.5 text-center">
          <div className="border-r border-border/40 pr-1">
            <span className="text-[10px] text-muted font-mono block">Temporal Overlap</span>
            <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
              {relationship.metrics.temporalOverlapPercent}%
            </span>
          </div>
          <div className="border-r border-border/40 px-1">
            <span className="text-[10px] text-muted font-mono block">Spatial Match</span>
            <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {relationship.metrics.spatialOverlapPercent}%
            </span>
          </div>
          <div className="pl-1">
            <span className="text-[10px] text-muted font-mono block">Anomaly Spike</span>
            <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
              {relationship.metrics.anomalyStrengthMultiple}× normal
            </span>
          </div>
        </div>

        {/* Non-causal Epistemic Callout */}
        <div className="flex items-start gap-2 bg-purple-500/5 border border-purple-500/15 rounded-lg p-2 mb-3.5 text-[11px] text-muted leading-tight">
          <AlertCircle className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
          <span>
            <strong className="text-text font-medium">Statistical Link:</strong> Signals co-occur within {relationship.timeWindow}. Does not confirm direct causation without field dispatch.
          </span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-[11px] text-text">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span>{relationship.zoneName}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-muted" />
            <span>{relationship.detectedTimeAgo}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onShowOnMap && (
            <button
              onClick={() => onShowOnMap(relationship.zoneId)}
              className="text-[11px] font-semibold text-muted hover:text-text px-2 py-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Map
            </button>
          )}

          <button
            onClick={() => onViewEvidence(relationship)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold border border-purple-500/30 text-xs transition-colors cursor-pointer shadow-sm"
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
