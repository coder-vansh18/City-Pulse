import React, { useEffect } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  FileSearch,
  ExternalLink,
  Layers,
  BarChart2,
  AlertCircle,
  Radio,
  Send,
  Check,
} from 'lucide-react';
import {
  CrossFeedRelationship,
  SingleFeedAnomaly,
} from '../../types/intelligence';
import { useCitizenReportStore } from '../../store/useCitizenReportStore';

interface CrossFeedEvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: CrossFeedRelationship | SingleFeedAnomaly | null;
  onShowOnMap?: (zoneId: string) => void;
}

export const CrossFeedEvidenceDrawer: React.FC<CrossFeedEvidenceDrawerProps> = ({
  isOpen,
  onClose,
  item,
  onShowOnMap,
}) => {
  const allReports = useCitizenReportStore((s) => s.reports);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isCrossFeed = 'feedA' in item;
  const metrics = item.metrics;
  const timeline = item.timeline || [];

  // Related citizen reports if applicable
  const relatedReports = isCrossFeed && (item as CrossFeedRelationship).relatedReportIds
    ? allReports.filter((r) =>
        (item as CrossFeedRelationship).relatedReportIds?.includes(r.id)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="w-full max-w-2xl bg-surface border-l border-border h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border bg-surface-2/40 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                  isCrossFeed
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                {isCrossFeed ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {isCrossFeed ? 'Cross-Feed Relationship Evidence' : 'Single-Feed Anomaly Telemetry'}
              </span>

              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface text-muted border border-border">
                {item.id}
              </span>
            </div>

            <h2 className="text-xl font-bold text-text font-heading leading-snug">
              {item.title}
            </h2>

            <div className="flex items-center gap-3 mt-2 text-xs text-muted flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono text-text">{item.zoneName} ({item.zoneId.toUpperCase()})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted" />
                <span>Detected {item.detectedTimeAgo}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="capitalize">{item.confidence} Confidence</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface hover:bg-surface-2 border border-border text-muted hover:text-text transition-colors cursor-pointer shrink-0"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Epistemic Honesty Banner */}
          <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-purple-700 dark:text-purple-300 font-heading">
                Epistemic Intelligence Notice: Correlation ≠ Direct Causation
              </p>
              <p className="text-text/80 leading-relaxed">
                The CityPulse Intelligence Engine detected statistically significant spatial-temporal co-occurrence. These signals represent potential interrelated civic stress, not deterministic causality. Field verification is recommended before structural intervention.
              </p>
            </div>
          </div>

          {/* Overview Hypothesis or Description */}
          <div className="bg-surface-2/40 border border-border/80 rounded-xl p-4">
            <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-accent" />
              Engine Reasoning & Hypothesis
            </h4>
            <p className="text-sm text-text leading-relaxed font-sans">
              {isCrossFeed
                ? (item as CrossFeedRelationship).hypothesis
                : (item as SingleFeedAnomaly).description}
            </p>
          </div>

          {/* Quantitative Evidence Metrics Grid */}
          <div>
            <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-accent" />
              Quantitative Telemetry Evidence Metrics
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Temporal Overlap */}
              <div className="bg-surface-2/50 border border-border/80 rounded-xl p-3">
                <span className="text-[10px] text-muted font-mono uppercase block mb-1">
                  Temporal Overlap
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                    {metrics.temporalOverlapPercent}%
                  </span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden mt-2 border border-border/40">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${metrics.temporalOverlapPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted mt-1 block">Within active window</span>
              </div>

              {/* Spatial Overlap */}
              <div className="bg-surface-2/50 border border-border/80 rounded-xl p-3">
                <span className="text-[10px] text-muted font-mono uppercase block mb-1">
                  Spatial Alignment
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {metrics.spatialOverlapPercent}%
                  </span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden mt-2 border border-border/40">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${metrics.spatialOverlapPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted mt-1 block">Geo-coordinate radius</span>
              </div>

              {/* Anomaly Strength */}
              <div className="bg-surface-2/50 border border-border/80 rounded-xl p-3">
                <span className="text-[10px] text-muted font-mono uppercase block mb-1">
                  Signal Deviation
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {metrics.anomalyStrengthMultiple}×
                  </span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden mt-2 border border-border/40">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, metrics.anomalyStrengthMultiple * 25)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted mt-1 block">Above moving baseline</span>
              </div>

              {/* Historical Pattern Similarity */}
              <div className="bg-surface-2/50 border border-border/80 rounded-xl p-3">
                <span className="text-[10px] text-muted font-mono uppercase block mb-1">
                  Historical Similarity
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {metrics.historicalSimilarityPercent}%
                  </span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden mt-2 border border-border/40">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${metrics.historicalSimilarityPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted mt-1 block">Matches past patterns</span>
              </div>

              {/* Observation Count */}
              <div className="bg-surface-2/50 border border-border/80 rounded-xl p-3">
                <span className="text-[10px] text-muted font-mono uppercase block mb-1">
                  Observations Analyzed
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-text">
                    {metrics.observationCount}
                  </span>
                  <span className="text-[10px] text-muted font-mono">telemetry frames</span>
                </div>
                <span className="text-[10px] text-muted mt-2 block">Zero sensor dropout</span>
              </div>

              {/* Lifecycle State */}
              <div className="bg-surface-2/50 border border-border/80 rounded-xl p-3">
                <span className="text-[10px] text-muted font-mono uppercase block mb-1">
                  Triage Status
                </span>
                <span className="text-sm font-bold font-mono uppercase text-accent block mt-1">
                  {item.lifecycleStatus}
                </span>
                <span className="text-[10px] text-muted mt-2 block">Assigned to municipal ops</span>
              </div>
            </div>
          </div>

          {/* Chronological Vertical Event Timeline */}
          <div>
            <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Chronological Fusion Sequence Timeline
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-surface flex items-center justify-center ${
                      event.status === 'active'
                        ? 'bg-purple-500 shadow-md ring-2 ring-purple-500/20'
                        : event.status === 'anomaly'
                        ? 'bg-amber-500'
                        : event.status === 'correlation'
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Timeline content */}
                  <div className="bg-surface-2/40 border border-border/70 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold font-heading text-text">
                        {event.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted bg-surface px-2 py-0.5 rounded border border-border">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-text/80 leading-relaxed font-sans">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlated Citizen Reports (if any) */}
          {relatedReports.length > 0 && (
            <div>
              <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" />
                Correlated Citizen Civic Reports ({relatedReports.length})
              </h4>

              <div className="space-y-2.5">
                {relatedReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-surface-2/40 border border-border/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-border transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                          {rep.id}
                        </span>
                        <span className="text-xs font-bold font-heading text-text">
                          {rep.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-1">
                        {rep.location.address} • {rep.upvotes} resident confirmations
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                      Score {rep.evidence.scoreBreakdown.totalScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-2/40 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-2 border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
          >
            Close Evidence
          </button>

          <div className="flex items-center gap-2">
            {onShowOnMap && (
              <button
                onClick={() => {
                  onShowOnMap(item.zoneId);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-2 border border-border text-xs font-semibold text-accent transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Locate on Map</span>
              </button>
            )}

            <button
              onClick={() => {
                alert(`Inspection ticket dispatched for ${item.id} in ${item.zoneName}. Field teams alerted.`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Investigation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
