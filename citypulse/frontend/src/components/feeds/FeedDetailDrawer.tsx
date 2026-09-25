import React, { useState } from 'react';
import {
  X,
  Radio,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Activity,
  ShieldCheck,
  Server,
  Zap,
  RefreshCw,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { FeedDiagnostic } from '../../types/feedHealth';
import { FeedType } from '../../api/types';
import { RawNormalizedViewer } from './RawNormalizedViewer';

interface FeedDetailDrawerProps {
  feed: FeedDiagnostic | null;
  isOpen: boolean;
  onClose: () => void;
  enabled: boolean;
  onToggle: (feedId: FeedType, current: boolean) => void;
}

export const FeedDetailDrawer: React.FC<FeedDetailDrawerProps> = ({
  feed,
  isOpen,
  onClose,
  enabled,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'quality'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen || !feed) return null;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-surface border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border bg-surface-2/40 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                TELEMETRY DIAGNOSTIC
              </span>
              <span className="text-[10px] font-mono text-muted uppercase">
                FEED ID: {feed.feedId.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-text font-heading uppercase">
              {feed.displayName || feed.label}
            </h3>
            <p className="text-xs text-muted">
              {feed.technicalSource} • {feed.sourceType === 'real' ? 'Live API Source' : 'Simulation'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-surface text-xs font-heading font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              activeTab === 'overview'
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-surface-2 text-muted border-border hover:text-text'
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              activeTab === 'schema'
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-surface-2 text-muted border-border hover:text-text'
            }`}
          >
            Raw → Normalized Schema
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              activeTab === 'quality'
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-surface-2 text-muted border-border hover:text-text'
            }`}
          >
            Data Quality ({feed.qualityMetrics.overall}/100)
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Status & Action Bar */}
              <div className="p-4 rounded-2xl bg-surface-2/40 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      !enabled
                        ? 'bg-muted'
                        : feed.healthStatus === 'healthy'
                        ? 'bg-emerald-500 animate-pulse'
                        : feed.healthStatus === 'degraded'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-text uppercase font-mono">
                      {enabled ? `STATUS: ${feed.healthStatus.toUpperCase()}` : 'FEED DISABLED'}
                    </div>
                    <div className="text-[11px] text-muted">
                      {enabled ? 'Ingestion worker active' : 'Worker paused by operator'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing || !enabled}
                    className="px-3 py-1.5 text-xs font-mono rounded-xl bg-surface border border-border hover:border-accent text-text flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-accent' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                  </button>

                  <button
                    onClick={() => onToggle(feed.feedId, enabled)}
                    className={`px-3 py-1.5 text-xs font-heading font-semibold rounded-xl border transition-all cursor-pointer ${
                      enabled
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20'
                        : 'bg-status-calm/10 text-status-calm border-status-calm/30 hover:bg-status-calm/20'
                    }`}
                  >
                    {enabled ? 'Pause Feed' : 'Resume Feed'}
                  </button>
                </div>
              </div>

              {/* Core Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-2/50 border border-border">
                  <div className="text-[10px] font-mono text-muted uppercase">Availability</div>
                  <div className="text-lg font-bold font-mono text-text mt-0.5">
                    {enabled ? `${feed.reliability.toFixed(1)}%` : '0%'}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-mono">Uptime SLA</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2/50 border border-border">
                  <div className="text-[10px] font-mono text-muted uppercase">Events / Hour</div>
                  <div className="text-lg font-bold font-mono text-text mt-0.5">
                    {enabled ? feed.eventsLastHour : 0}
                  </div>
                  <div className="text-[10px] text-muted font-mono">~{feed.eventRatePerSec}/s rate</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2/50 border border-border">
                  <div className="text-[10px] font-mono text-muted uppercase">Update Frequency</div>
                  <div className="text-lg font-bold font-mono text-text mt-0.5">
                    ~{feed.cadenceSeconds}s
                  </div>
                  <div className="text-[10px] text-muted font-mono">Cadence</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2/50 border border-border">
                  <div className="text-[10px] font-mono text-muted uppercase">Current Latency</div>
                  <div className="text-lg font-bold font-mono text-text mt-0.5">
                    {enabled ? `${feed.currentLatencyMs}ms` : '—'}
                  </div>
                  <div className="text-[10px] text-muted font-mono">Target &lt;300ms</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2/50 border border-border">
                  <div className="text-[10px] font-mono text-muted uppercase">P95 Latency</div>
                  <div className="text-lg font-bold font-mono text-text mt-0.5">
                    {enabled ? `${feed.p95LatencyMs}ms` : '—'}
                  </div>
                  <div className="text-[10px] text-muted font-mono">Peak: {feed.peakLatencyMs}ms</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2/50 border border-border">
                  <div className="text-[10px] font-mono text-muted uppercase">Data Quality Score</div>
                  <div className="text-lg font-bold font-mono text-emerald-500 mt-0.5">
                    {enabled ? `${feed.qualityMetrics.overall}/100` : '—'}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-mono">Validated</div>
                </div>
              </div>

              {/* Endpoint & Connection Telemetry */}
              <div className="p-4 rounded-2xl bg-surface-2/40 border border-border space-y-3">
                <h4 className="text-xs font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-accent" />
                  Connection & Technical Details
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Source:</span>
                    <span className="text-text font-bold">{feed.technicalSource}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Connection / Mode:</span>
                    <span className="text-text font-bold">
                      {feed.sourceType === 'real' ? 'Live API' : 'Simulation'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Feed ID:</span>
                    <span className="text-text font-bold">{feed.feedId.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Protocol:</span>
                    <span className="text-text font-bold">{feed.protocol}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Last HTTP / Stream Status:</span>
                    <span className="text-emerald-500 font-bold">{feed.lastHttpStatus}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Response Time:</span>
                    <span className="text-text font-bold">{feed.currentLatencyMs}ms</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-muted block mb-1">Ingestion Endpoint:</span>
                    <div className="p-2 rounded-lg bg-surface border border-border text-[10px] text-muted break-all select-all font-mono">
                      {feed.endpoint}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent" />
                  Recent Ingested Events
                </h4>

                <div className="space-y-2">
                  {feed.recentEvents.map((evt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-2/40 border border-border/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-muted">{evt.time}</span>
                        <span className="text-text font-medium">{evt.description}</span>
                      </div>
                      <span className="font-mono font-bold text-text bg-surface px-2 py-0.5 rounded border border-border text-[11px]">
                        {evt.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'schema' && (
            <RawNormalizedViewer
              rawJson={feed.rawSampleJson}
              normalizedJson={feed.normalizedSampleJson}
              feedId={feed.feedId}
            />
          )}

          {activeTab === 'quality' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-surface-2/40 border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-text font-heading">
                    Overall Data Quality Rating
                  </div>
                  <div className="text-xs text-muted">
                    Automated schema adherence, null check and timing consistency
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-500">
                  {feed.qualityMetrics.overall} / 100
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-text font-bold">Completeness (Null / Missing Fields)</span>
                    <span className="text-emerald-500 font-bold">{feed.qualityMetrics.completeness}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${feed.qualityMetrics.completeness}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-text font-bold">Freshness (Timestamp Drift Delta)</span>
                    <span className="text-blue-500 font-bold">{feed.qualityMetrics.freshness}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${feed.qualityMetrics.freshness}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-text font-bold">Consistency (Type & Unit Validation)</span>
                    <span className="text-indigo-500 font-bold">{feed.qualityMetrics.consistency}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${feed.qualityMetrics.consistency}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-text font-bold">Validity (Spatial Bounding Box & Ranges)</span>
                    <span className="text-teal-500 font-bold">{feed.qualityMetrics.validity}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${feed.qualityMetrics.validity}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-surface-2/50 flex items-center justify-between text-xs font-mono text-muted">
          <span>Worker: ingest-worker-0{feed.feedId.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-accent text-white font-heading font-semibold hover:bg-accent-hover transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
