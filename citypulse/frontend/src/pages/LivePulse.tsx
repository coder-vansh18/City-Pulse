import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Map,
  ArrowRight,
  Sparkles,
  Radio,
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  TrendingDown,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { HeartbeatECG } from '../components/pulse/HeartbeatECG';
import { PulseGauge } from '../components/pulse/PulseGauge';
import { StatusBadge } from '../components/pulse/StatusBadge';
import { TrendArrow } from '../components/pulse/TrendArrow';
import { BpmCounter } from '../components/pulse/BpmCounter';
import { SummaryCard } from '../components/pulse/SummaryCard';
import { CityMap } from '../components/map/CityMap';
import { NarrativeTicker } from '../components/timeline/NarrativeTicker';
import { InsightCard } from '../components/insights/InsightCard';
import { FeedType } from '../api/types';

const FEED_ICONS: Record<FeedType, React.ElementType> = {
  weather: CloudRain,
  transit: Bus,
  incident: Siren,
  air_quality: Wind,
  power: Zap,
  noise: Volume2,
};

export const LivePulse: React.FC = () => {
  const navigate = useNavigate();
  const { pulse, feeds, insights, setSelectedZoneId } = useCityStore();

  const activeInsights = Object.values(insights).filter((i) => i.status === 'active');

  if (!pulse) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-6 h-64" />
          <Skeleton className="lg:col-span-6 h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 10-Second Rule Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero: Pulse & ECG Vital Metrics */}
        <Card
          glowStatus={pulse.status}
          className="lg:col-span-6 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={pulse.status} size="lg" />
                <TrendArrow trend={pulse.trend} />
              </div>
              <BpmCounter bpm={pulse.bpm} status={pulse.status} size="md" />
            </div>

            <div className="flex items-center gap-6 my-2">
              <PulseGauge score={pulse.score} status={pulse.status} size={110} />
              
              <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted font-heading uppercase tracking-wider">
                    City-Wide Index
                  </span>
                  <span className="font-mono font-bold text-lg text-text">
                    {pulse.score.toFixed(1)} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted font-mono">
                  <span>Confidence:</span>
                  <span className="text-text">{(pulse.confidence * 100).toFixed(0)}%</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted font-mono">
                  <span>Active Anomalies:</span>
                  <span className={pulse.active_anomalies > 0 ? 'text-status-critical font-bold' : 'text-text'}>
                    {pulse.active_anomalies}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted font-mono">
                  <span>Feeds Online:</span>
                  <span className="text-text">{pulse.feeds_online} / {pulse.feeds_total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature ECG Component */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="text-[10px] text-muted uppercase font-heading tracking-wider mb-1 flex items-center justify-between">
              <span>Civic Pulse Rhythm</span>
              <span className="font-mono text-[10px]">
                {pulse.irregularity > 0.3 ? 'Acoustic / Telemetry Irregularity' : 'Nominal Sinus Rhythm'}
              </span>
            </div>
            <HeartbeatECG
              bpm={pulse.bpm}
              irregularity={pulse.irregularity}
              status={pulse.status}
              confidence={pulse.confidence}
              degraded={pulse.degraded}
              height={72}
            />
          </div>
        </Card>

        {/* Right Hero: Grounded Assessment Card */}
        <div className="lg:col-span-6 flex flex-col">
          <SummaryCard
            summary={pulse.summary}
            status={pulse.status}
            className="h-full"
          />
        </div>
      </div>

      {/* Middle Section: Compact Map (8 cols) + Zones at Risk & Insights (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 8 Cols: Compact Interactive Map */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-accent" />
              <h3 className="text-base font-bold text-text font-heading">
                Real-Time 9-Zone Civic Map
              </h3>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-medium font-heading transition-colors"
            >
              <span>Open full map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CityMap compact height={420} showControls={false} />
        </div>

        {/* 4 Cols: Zones at Risk & Top Insights */}
        <div className="lg:col-span-4 space-y-4">
          {/* Zones at Risk Card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text font-heading">
                <TrendingDown className="w-3.5 h-3.5 text-status-critical" />
                <span>Zones Under Observation</span>
              </div>
              <span className="text-[10px] text-muted font-mono">Worst 3</span>
            </div>

            <div className="space-y-2.5">
              {pulse.zones_at_risk.map((z) => (
                <div
                  key={z.zone_id}
                  onClick={() => setSelectedZoneId(z.zone_id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2/40 hover:bg-surface-2 border border-border/50 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-heading font-semibold text-xs text-text">{z.name}</div>
                    <div className="text-[10px] text-muted font-mono">{z.zone_id.toUpperCase()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-text">
                      {z.score.toFixed(0)}/100
                    </span>
                    <StatusBadge status={z.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Active Insight */}
          {activeInsights.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text font-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Top Correlated Signal</span>
                </span>
                <Link to="/insights" className="text-xs text-accent hover:underline font-heading">
                  All ({activeInsights.length})
                </Link>
              </div>
              <InsightCard insight={activeInsights[0]} />
            </div>
          ) : (
            <Card className="p-4 text-center">
              <Sparkles className="w-6 h-6 text-status-calm mx-auto mb-2" />
              <div className="font-heading font-semibold text-xs text-text">All Signals Nominal</div>
              <div className="text-[11px] text-muted">No cross-feed anomalies currently active.</div>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Section: Narrative Ticker & Feed Health Strip */}
      <div className="space-y-3">
        <NarrativeTicker />

        {/* 6-Feed Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {feeds.map((f) => {
            const Icon = FEED_ICONS[f.feed] || Radio;
            const isLive = f.status === 'live';
            const isDown = f.status === 'down' || f.status === 'disabled';

            return (
              <div
                key={f.feed}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDown
                    ? 'bg-status-critical/10 border-status-critical/30 text-status-critical'
                    : isLive
                    ? 'bg-surface border-border text-text'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                  <span className="capitalize truncate font-heading font-medium">
                    {f.feed.replace('_', ' ')}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full flex-shrink-0 ml-1.5" style={{
                  backgroundColor: isDown ? 'var(--status-critical)' : isLive ? 'var(--status-calm)' : 'var(--status-watch)'
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
