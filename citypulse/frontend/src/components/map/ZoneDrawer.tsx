import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Activity, CloudRain, Bus, Siren, Wind, Zap, Volume2 } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { apiClient } from '../../api/client';
import { ZoneDetail, FeedType } from '../../api/types';
import { StatusBadge } from '../pulse/StatusBadge';
import { BpmCounter } from '../pulse/BpmCounter';
import { Skeleton } from '../common/Skeleton';
import { InsightCard } from '../insights/InsightCard';

const FEED_ICONS: Record<FeedType, React.ElementType> = {
  weather: CloudRain,
  transit: Bus,
  incident: Siren,
  air_quality: Wind,
  power: Zap,
  noise: Volume2,
};

export const ZoneDrawer: React.FC = () => {
  const navigate = useNavigate();
  const selectedZoneId = useCityStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useCityStore((s) => s.setSelectedZoneId);

  const [detail, setDetail] = useState<ZoneDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedZoneId) {
      setDetail(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    apiClient
      .getZoneDetail(selectedZoneId)
      .then((res) => {
        if (isMounted) setDetail(res);
      })
      .catch((err) => console.warn('Failed to load zone detail:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedZoneId]);

  if (!selectedZoneId) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-surface/95 backdrop-blur-md border-l border-border shadow-2xl z-[1000] flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-text font-heading">
              {detail ? detail.zone.name : `Zone ${selectedZoneId.toUpperCase()}`}
            </h3>
            {detail && <StatusBadge status={detail.zone.status} size="sm" />}
          </div>
          <p className="text-xs text-muted font-mono">{selectedZoneId.toUpperCase()} · Sub-grid cell</p>
        </div>

        <button
          onClick={() => setSelectedZoneId(null)}
          className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-border cursor-pointer transition-colors"
          aria-label="Close zone drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {loading && !detail ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : detail ? (
          <>
            {/* Score & BPM row */}
            <div className="grid grid-cols-2 gap-3 bg-surface-2/40 p-3 rounded-xl border border-border/60">
              <div>
                <div className="text-[10px] text-muted uppercase font-heading tracking-wider mb-0.5">
                  Pulse Score
                </div>
                <div className="font-mono text-2xl font-bold text-text">
                  {detail.zone.pulse_score.toFixed(1)}
                  <span className="text-xs text-muted font-normal">/100</span>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <BpmCounter bpm={detail.zone.bpm} status={detail.zone.status} size="sm" />
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted font-heading mb-1.5">
                Current Condition
              </h4>
              <p className="text-xs text-text/90 leading-relaxed bg-surface-2/30 p-2.5 rounded-lg border border-border/40 font-sans">
                {detail.summary.body}
              </p>
            </div>

            {/* Sub-Score Bars */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted font-heading mb-2">
                Feed Sub-Scores
              </h4>
              <div className="space-y-2">
                {(Object.keys(detail.zone.sub_scores) as FeedType[]).map((f) => {
                  const score = detail.zone.sub_scores[f];
                  const Icon = FEED_ICONS[f] || Activity;
                  const isNull = score === null;
                  const val = isNull ? 0 : score;
                  const barColor = isNull
                    ? 'bg-muted/40'
                    : val >= 80
                    ? 'bg-status-calm'
                    : val >= 60
                    ? 'bg-status-watch'
                    : val >= 40
                    ? 'bg-status-strained'
                    : 'bg-status-critical';

                  return (
                    <div key={f} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted">
                          <Icon className="w-3.5 h-3.5 text-accent" />
                          <span className="capitalize">{f.replace('_', ' ')}</span>
                        </div>
                        <span className="font-mono font-medium text-text">
                          {isNull ? 'n/a' : `${val.toFixed(0)}/100`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${isNull ? 0 : Math.min(100, Math.max(5, val))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zone Insights */}
            {detail.insights.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted font-heading mb-2">
                  Active Signals & Insights ({detail.insights.length})
                </h4>
                <div className="space-y-2.5">
                  {detail.insights.slice(0, 3).map((ins) => (
                    <InsightCard key={ins.id} insight={ins} className="p-3" />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Events in Zone */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted font-heading mb-2">
                Recent Telemetry Events
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {detail.recent_events.slice(0, 6).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-surface-2/40 border border-border/40 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-text">{ev.title}</div>
                      <div className="text-[11px] text-muted line-clamp-1">{ev.description}</div>
                    </div>
                    <span className="font-mono text-[10px] text-muted flex-shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Footer link to zone page */}
      <div className="p-3 border-t border-border bg-surface-2/30">
        <button
          onClick={() => navigate(`/zone/${selectedZoneId}`)}
          className="w-full py-2 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer font-heading"
        >
          <span>Open Full Zone Analytics</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
