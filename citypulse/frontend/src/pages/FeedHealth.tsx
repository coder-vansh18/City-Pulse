import React from 'react';
import {
  Radio,
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  Clock,
  Activity,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { apiClient } from '../api/client';
import { Card } from '../components/common/Card';
import { FeedType } from '../api/types';

const FEED_ICONS: Record<FeedType, React.ElementType> = {
  weather: CloudRain,
  transit: Bus,
  incident: Siren,
  air_quality: Wind,
  power: Zap,
  noise: Volume2,
};

export const FeedHealth: React.FC = () => {
  const feeds = useCityStore((s) => s.feeds);
  const setFeeds = useCityStore((s) => s.setFeeds);

  const handleToggleFeed = async (feedType: string, currentEnabled: boolean) => {
    try {
      const updated = await apiClient.toggleFeed(feedType, !currentEnabled);
      setFeeds(feeds.map((f) => (f.feed === feedType ? updated : f)));
    } catch (err) {
      console.warn('Failed to toggle feed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-text font-heading">
            Civic Telemetry Feeds & Ingestion Health
          </h2>
        </div>
        <p className="text-xs text-muted">
          Real-time status of 6 heterogeneous civic data streams. Toggle any feed to verify dynamic weight renormalization and graceful degradation.
        </p>
      </div>

      {/* 6 Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeds.map((f) => {
          const Icon = FEED_ICONS[f.feed] || Radio;
          const isLive = f.status === 'live';
          const isDown = f.status === 'down' || f.status === 'disabled';

          return (
            <Card key={f.feed} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-accent border border-border">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text font-heading">{f.label}</h4>
                      <span className="font-mono text-[10px] uppercase text-muted">
                        Feed ID: {f.feed}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={f.enabled}
                      onChange={() => handleToggleFeed(f.feed, f.enabled)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent border border-border"></div>
                  </label>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                      isDown
                        ? 'bg-status-critical/15 text-status-critical border-status-critical/30'
                        : isLive
                        ? 'bg-status-calm/15 text-status-calm border-status-calm/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {f.status}
                  </span>

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
                    {f.source === 'real' ? 'Live API Source' : 'Diurnal Sim'}
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-2 text-xs font-mono bg-surface-2/40 p-3 rounded-xl border border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted">Expected Cadence:</span>
                    <span className="text-text font-bold">~{f.expected_interval_s}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Events (Last Hour):</span>
                    <span className="text-text font-bold">{f.events_last_hour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Last Received:</span>
                    <span className="text-text">
                      {f.last_update
                        ? new Date(f.last_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Normalization Explainer */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-accent" />
          <span>How Heterogeneous Feeds Are Normalized</span>
        </h3>
        <p className="text-xs text-muted mb-6 leading-relaxed">
          Civic feeds arrive in completely different raw schemas, time representations, and metric formats.
          Our pipeline normalizes everything into a unified UTC schema in 3 deterministic steps:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-2/40 p-4 rounded-xl border border-border/60">
            <div className="text-xs font-mono font-bold text-accent mb-1">01. INGEST & PARSE</div>
            <h5 className="font-heading font-semibold text-sm text-text mb-2">Heterogeneous Raw Data</h5>
            <p className="text-xs text-muted leading-relaxed">
              Handles epoch seconds (Weather), local time HH:MM (Transit), US date strings (311), and ISO offsets (Power).
            </p>
          </div>

          <div className="bg-surface-2/40 p-4 rounded-xl border border-border/60">
            <div className="text-xs font-mono font-bold text-purple-400 mb-1">02. MAP & ASSIGN</div>
            <h5 className="font-heading font-semibold text-sm text-text mb-2">Severity & Spatial Grid</h5>
            <p className="text-xs text-muted leading-relaxed">
              Maps complaint types and physical values to a continuous 0..1 severity scale and snaps to one of 9 grid zones.
            </p>
          </div>

          <div className="bg-surface-2/40 p-4 rounded-xl border border-border/60">
            <div className="text-xs font-mono font-bold text-status-calm mb-1">03. EMIT & FUSE</div>
            <h5 className="font-heading font-semibold text-sm text-text mb-2">Unified NormalizedEvent</h5>
            <p className="text-xs text-muted leading-relaxed">
              Standardized UTC ISO-8601 timestamps, confidence decay scoring, and real-time WebSocket push.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
