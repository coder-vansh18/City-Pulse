import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Zap, Radio, Activity } from 'lucide-react';
import { Card } from '../common/Card';
import { ThroughputPoint } from '../../types/feedHealth';

interface ThroughputChartProps {
  data: ThroughputPoint[];
  currentEventRate: number;
  timeRange: string;
  onTimeRangeChange: (r: string) => void;
}

export const ThroughputChart: React.FC<ThroughputChartProps> = ({
  data,
  currentEventRate,
  timeRange,
  onTimeRangeChange,
}) => {
  const [metricUnit, setMetricUnit] = useState<'min' | 'hour'>('min');

  const chartData = data.map((d) => ({
    ...d,
    displayValue: metricUnit === 'hour' ? Math.round(d.total * 60) : d.total,
  }));

  const currentDisplayRate = metricUnit === 'hour' ? currentEventRate * 60 : currentEventRate;

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-accent" />
                Live Event Throughput
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-status-calm/15 text-status-calm border border-status-calm/30">
                LIVE 423 evt/min
              </span>
            </div>
            <p className="text-xs text-muted">
              Normalized ingest velocity across all active ingestion workers
            </p>
          </div>

          {/* Unit Toggle & Time Range */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Unit Selector */}
            <div className="flex items-center bg-surface-2 p-0.5 rounded-xl border border-border">
              <button
                onClick={() => setMetricUnit('min')}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                  metricUnit === 'min'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-muted hover:text-text'
                }`}
              >
                Evt/min
              </button>
              <button
                onClick={() => setMetricUnit('hour')}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                  metricUnit === 'hour'
                    ? 'bg-surface text-text shadow-sm border border-border'
                    : 'text-muted hover:text-text'
                }`}
              >
                Evt/hour
              </button>
            </div>

            {/* Time Window Buttons */}
            <div className="flex items-center bg-surface-2 p-0.5 rounded-xl border border-border">
              {['1m', '5m', '15m', '1h'].map((t) => (
                <button
                  key={t}
                  onClick={() => onTimeRangeChange(t)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${
                    timeRange === t
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Rate Callout */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold font-mono text-text">
            {currentDisplayRate.toLocaleString()}
          </span>
          <span className="text-xs text-muted font-mono">
            events / {metricUnit}
          </span>
          <span className="text-[10px] text-emerald-500 font-mono font-semibold ml-2">
            ↑ 8.4% above baseline
          </span>
        </div>
      </div>

      {/* Area Chart */}
      <div className="w-full h-44 sm:h-52 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="transitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
            <XAxis
              dataKey="t"
              stroke="currentColor"
              className="text-muted text-[10px] font-mono"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="currentColor"
              className="text-muted text-[10px] font-mono"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface, #ffffff)',
                borderColor: 'var(--color-border, #e5e7eb)',
                borderRadius: '0.75rem',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(val: number) => [`${val.toLocaleString()} events`, 'Throughput']}
              labelStyle={{ color: 'var(--color-text, #111827)', fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="displayValue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#throughputGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-Legend */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] font-mono text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Total Flow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            GTFS Fleet
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Grid Substation
          </span>
        </div>
        <span>Buffer Utilization: 14%</span>
      </div>
    </Card>
  );
};
