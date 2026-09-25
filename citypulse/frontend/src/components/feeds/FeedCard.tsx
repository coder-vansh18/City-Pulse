import React from 'react';
import {
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  Radio,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../common/Card';
import { FeedType } from '../../api/types';
import { FeedDiagnostic } from '../../types/feedHealth';

const FEED_ICONS: Record<FeedType, React.ElementType> = {
  weather: CloudRain,
  transit: Bus,
  incident: Siren,
  air_quality: Wind,
  power: Zap,
  noise: Volume2,
};

interface FeedCardProps {
  feed: FeedDiagnostic;
  enabled: boolean;
  onToggle: (feedId: FeedType, current: boolean) => void;
  onViewDetails: (feed: FeedDiagnostic) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  feed,
  enabled,
  onToggle,
  onViewDetails,
}) => {
  const Icon = FEED_ICONS[feed.feedId] || Radio;

  const isHealthy = feed.healthStatus === 'healthy' && enabled;
  const isDegraded = feed.healthStatus === 'degraded' && enabled;
  const isOffline = feed.healthStatus === 'offline' || !enabled;

  const getHealthBadge = () => {
    if (!enabled) {
      return (
        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
          DISABLED
        </span>
      );
    }
    if (isOffline) {
      return (
        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-status-critical/15 text-status-critical border border-status-critical/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> OFFLINE
        </span>
      );
    }
    if (isDegraded) {
      return (
        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> DEGRADED
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-status-calm/15 text-status-calm border border-status-calm/30 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> HEALTHY
      </span>
    );
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border hover:shadow-md transition-all">
      <div>
        {/* Header Row: Icon, Human-Readable Name, ID & Toggle */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-accent border border-border flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-text font-heading truncate">
                {feed.displayName || feed.label}
              </h4>
              <span className="font-mono text-[10px] uppercase text-muted block">
                FEED ID: {feed.feedId.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => onToggle(feed.feedId, enabled)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent border border-border" />
          </label>
        </div>

        {/* Badges: Status, Technical Source Tag, Availability */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {getHealthBadge()}

          {/* Secondary Technical Source Label */}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
            {feed.technicalSource} • {feed.sourceType === 'real' ? 'Live API' : 'Simulation'}
          </span>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ml-auto">
            {enabled ? `${feed.reliability.toFixed(1)}%` : '0%'} Availability
          </span>
        </div>

        {/* Metrics Grid with Improved Readability */}
        <div className="space-y-2 text-xs font-mono bg-surface-2/40 p-3.5 rounded-xl border border-border/40">
          <div className="flex justify-between items-center">
            <span className="text-muted">Events / Hour:</span>
            <span className="text-text font-bold">
              {enabled ? feed.eventsLastHour : 0}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted">Latency:</span>
            <span
              className={`font-bold ${
                !enabled
                  ? 'text-muted'
                  : feed.currentLatencyMs > 500
                  ? 'text-amber-500'
                  : 'text-text'
              }`}
            >
              {enabled ? `${feed.currentLatencyMs}ms` : '—'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted">Update Frequency:</span>
            <span className="text-text font-bold">
              ~{feed.cadenceSeconds}s
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted">Data Quality Score:</span>
            <span className="text-emerald-500 font-bold">
              {enabled ? `${feed.qualityMetrics.overall}/100` : '—'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-border/30">
            <span className="text-muted">Last Updated:</span>
            <span className="text-text text-[11px]">
              {enabled ? '2s ago' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <button
        onClick={() => onViewDetails(feed)}
        className="mt-4 w-full py-2 px-3 rounded-xl bg-surface-2/70 hover:bg-surface-2 text-xs font-heading font-semibold text-accent hover:text-accent-hover border border-border/60 hover:border-accent/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <span>View Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </Card>
  );
};
