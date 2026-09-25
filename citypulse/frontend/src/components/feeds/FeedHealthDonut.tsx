import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';

interface FeedHealthDonutProps {
  overallHealthPercent: number;
  healthyCount: number;
  degradedCount: number;
  offlineCount: number;
  onSelectFilter?: (status: 'all' | 'healthy' | 'degraded' | 'offline') => void;
  activeFilter?: string;
}

export const FeedHealthDonut: React.FC<FeedHealthDonutProps> = ({
  overallHealthPercent,
  healthyCount,
  degradedCount,
  offlineCount,
  onSelectFilter,
  activeFilter,
}) => {
  const total = healthyCount + degradedCount + offlineCount || 6;
  const healthyDeg = (healthyCount / total) * 360;
  const degradedDeg = (degradedCount / total) * 360;
  const offlineDeg = (offlineCount / total) * 360;

  // SVG parameters
  const size = 130;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const healthyDash = (healthyCount / total) * circumference;
  const degradedDash = (degradedCount / total) * circumference;
  const offlineDash = (offlineCount / total) * circumference;

  const healthyOffset = 0;
  const degradedOffset = -healthyDash;
  const offlineOffset = -(healthyDash + degradedDash);

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Feed Health Score
          </h3>
          <span className="text-[10px] font-mono text-muted uppercase">
            6 Ingestors
          </span>
        </div>
        <p className="text-xs text-muted mb-4">
          Composite uptime, schema validation rate & latency score
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 my-1">
        {/* SVG Donut */}
        <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-surface-2"
            />
            {/* Healthy segment */}
            {healthyCount > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={strokeWidth}
                strokeDasharray={`${healthyDash} ${circumference - healthyDash}`}
                strokeDashoffset={healthyOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
            {/* Degraded segment */}
            {degradedCount > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${degradedDash} ${circumference - degradedDash}`}
                strokeDashoffset={degradedOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
            {/* Offline segment */}
            {offlineCount > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#ef4444"
                strokeWidth={strokeWidth}
                strokeDasharray={`${offlineDash} ${circumference - offlineDash}`}
                strokeDashoffset={offlineOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
          </svg>

          {/* Central Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold font-mono text-text leading-none">
              {overallHealthPercent.toFixed(1)}%
            </span>
            <span className="text-[9px] font-mono text-muted uppercase mt-0.5">
              Score
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 text-xs font-mono">
          <button
            onClick={() => onSelectFilter && onSelectFilter('healthy')}
            className={`w-full flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
              activeFilter === 'healthy'
                ? 'bg-status-calm/15 border-status-calm/40 font-bold'
                : 'bg-surface-2/40 border-border/40 hover:bg-surface-2'
            }`}
          >
            <span className="flex items-center gap-1.5 text-text">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Healthy
            </span>
            <span className="font-bold text-emerald-500">{healthyCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter && onSelectFilter('degraded')}
            className={`w-full flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
              activeFilter === 'degraded'
                ? 'bg-amber-500/15 border-amber-500/40 font-bold'
                : 'bg-surface-2/40 border-border/40 hover:bg-surface-2'
            }`}
          >
            <span className="flex items-center gap-1.5 text-text">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Degraded
            </span>
            <span className="font-bold text-amber-500">{degradedCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter && onSelectFilter('offline')}
            className={`w-full flex items-center justify-between p-1.5 rounded-lg border text-left transition-all ${
              activeFilter === 'offline'
                ? 'bg-status-critical/15 border-status-critical/40 font-bold'
                : 'bg-surface-2/40 border-border/40 hover:bg-surface-2'
            }`}
          >
            <span className="flex items-center gap-1.5 text-text">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Offline
            </span>
            <span className={`font-bold ${offlineCount > 0 ? 'text-rose-500' : 'text-muted'}`}>
              {offlineCount}
            </span>
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>SLA Threshold: &gt;95.0%</span>
        <span className="text-emerald-500 font-bold">● Operational</span>
      </div>
    </Card>
  );
};
