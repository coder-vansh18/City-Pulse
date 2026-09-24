import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Activity,
  HelpCircle,
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { ZoneDetail as ZoneDetailType, FeedType } from '../api/types';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { StatusBadge } from '../components/pulse/StatusBadge';
import { HeartbeatECG } from '../components/pulse/HeartbeatECG';
import { SummaryCard } from '../components/pulse/SummaryCard';
import { InsightCard } from '../components/insights/InsightCard';

const FEED_ICONS: Record<FeedType, React.ElementType> = {
  weather: CloudRain,
  transit: Bus,
  incident: Siren,
  air_quality: Wind,
  power: Zap,
  noise: Volume2,
};

export const ZoneDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ZoneDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<FeedType | 'all'>('all');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .getZoneDetail(id)
      .then((res) => setData(res))
      .catch((err) => console.warn('Failed to fetch zone detail:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const { zone, summary, recent_events, insights, sparkline } = data;

  const filteredEvents =
    selectedFeed === 'all'
      ? recent_events
      : recent_events.filter((e) => e.feed === selectedFeed);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/map"
            className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-border transition-colors cursor-pointer"
            title="Back to Civic Map"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-2xl font-bold text-text font-heading">{zone.name}</h2>
              <StatusBadge status={zone.status} size="md" />
            </div>
            <p className="text-xs text-muted font-mono">
              Zone ID: {zone.id.toUpperCase()} · Centroid: {(zone.pulse_score).toFixed(1)}/100 Pulse
            </p>
          </div>
        </div>

        {/* Mini ECG */}
        <div className="w-48 sm:w-64">
          <HeartbeatECG
            bpm={zone.bpm}
            status={zone.status}
            confidence={zone.confidence}
            height={50}
          />
        </div>
      </div>

      {/* Summary & Sub-Scores Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col">
          <SummaryCard summary={summary} status={zone.status} className="h-full" />
        </div>

        {/* Feed Sub-Scores Card */}
        <Card className="lg:col-span-6 flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text font-heading">
                Feed Health Breakdown
              </h3>
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why this score?</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(Object.keys(zone.sub_scores) as FeedType[]).map((f) => {
                const score = zone.sub_scores[f];
                const Icon = FEED_ICONS[f] || Activity;
                const isNull = score === null;
                const val = isNull ? 0 : score;
                const barColor = isNull
                  ? 'bg-muted/30'
                  : val >= 80
                  ? 'bg-status-calm'
                  : val >= 60
                  ? 'bg-status-watch'
                  : val >= 40
                  ? 'bg-status-strained'
                  : 'bg-status-critical';

                return (
                  <div key={f} className="bg-surface-2/40 p-3 rounded-xl border border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-muted">
                        <Icon className="w-3.5 h-3.5 text-accent" />
                        <span className="capitalize">{f.replace('_', ' ')}</span>
                      </div>
                      <span className="font-mono font-bold text-text">
                        {isNull ? 'n/a' : `${val.toFixed(0)}/100`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
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

          {/* Expandable "Why this score?" */}
          {showWhy && (
            <div className="mt-4 pt-3 border-t border-border text-xs text-muted leading-relaxed space-y-2 bg-surface-2/30 p-3 rounded-xl">
              <div className="font-semibold text-text">Scoring Weights Formula:</div>
              <p>
                Pulse Score is computed over a rolling 15-minute window with exponential time decay:
                Transit (25%), Incidents (25%), Weather (15%), Air Quality (15%), Power (15%), Noise (5%).
              </p>
              <p>
                If a feed is offline or delayed, weights are dynamically renormalized across active signals to avoid faking zeros.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Historical Area Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text font-heading mb-4">
          6-Hour Zone Health Sparkline & Trajectory
        </h3>
        <div className="h-56 w-full">
          {sparkline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline}>
                <defs>
                  <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="t"
                  tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="var(--muted)"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                />
                <YAxis domain={[0, 100]} stroke="var(--muted)" fontSize={11} fontFamily="JetBrains Mono" />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surface border border-border p-2 rounded-lg text-xs font-mono shadow-xl">
                          <div className="text-muted">{new Date(payload[0].payload.t).toLocaleTimeString()}</div>
                          <div className="text-accent font-bold">Pulse Score: {payload[0].value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pulse"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#pulseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted font-mono">
              Collecting rolling history...
            </div>
          )}
        </div>
      </Card>

      {/* Zone Insights & Recent Telemetry Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Insights */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text font-heading">
            Zone Signals & Correlation Insights ({insights.length})
          </h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((ins) => (
                <InsightCard key={ins.id} insight={ins} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-xs text-muted">
              No anomalies or cross-feed stress links detected in {zone.name}.
            </Card>
          )}
        </div>

        {/* Recent Events List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text font-heading">
              Recent Events ({filteredEvents.length})
            </h3>
            <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-border">
              {(['all', 'transit', 'incident', 'weather'] as (FeedType | 'all')[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFeed(f)}
                  className={`px-2 py-0.5 rounded text-[10px] font-heading font-medium capitalize cursor-pointer transition-colors ${
                    selectedFeed === f ? 'bg-accent text-white' : 'text-muted hover:text-text'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-surface border border-border/60 hover:border-border text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-2 text-accent border border-border">
                      {ev.feed}
                    </span>
                    <span className="font-bold text-text font-heading">{ev.title}</span>
                  </div>
                  <p className="text-muted text-[11px] leading-relaxed">{ev.description}</p>
                </div>
                <span className="font-mono text-[10px] text-muted flex-shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
