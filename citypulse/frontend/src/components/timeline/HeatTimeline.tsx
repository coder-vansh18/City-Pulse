import React from 'react';
import { useCityStore } from '../../store/useCityStore';
import { apiClient } from '../../api/client';

const ZONES = [
  { id: 'z1', name: 'Hillcrest' },
  { id: 'z2', name: 'Green Park' },
  { id: 'z3', name: 'Univ. Quarter' },
  { id: 'z4', name: 'Riverside' },
  { id: 'z5', name: 'Central Station' },
  { id: 'z6', name: 'Market Dist.' },
  { id: 'z7', name: 'Old Town' },
  { id: 'z8', name: 'Lakeside' },
  { id: 'z9', name: 'Industrial Belt' },
];

const NUM_BUCKETS = 48; // 48 buckets across 72 hours (1.5h per bucket)

export const HeatTimeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  const replay = useCityStore((s) => s.replay);
  const setReplay = useCityStore((s) => s.setReplay);

  // Status computation for cell matrix based on planted scenario patterns
  const getCellStatus = (zoneId: string, bucketIdx: number): 'calm' | 'watch' | 'strained' | 'critical' => {
    // Bucket range: 0..47
    // Day 1: 0..15 (Calm / normal)
    // Day 2: 16..31 (Bucket 25-28 is Storm, 28-30 is Power Outage)
    // Day 3: 32..47 (Bucket 37-40 is Transit Strike)

    // Storm in z4, z5, z7, z8 during Day 2 afternoon (bucket 24..27)
    if (bucketIdx >= 24 && bucketIdx <= 27) {
      if (['z4', 'z5', 'z7', 'z8'].includes(zoneId)) return 'critical';
      return 'strained';
    }

    // Power Outage in z5 and z4 (bucket 28..30)
    if (bucketIdx >= 28 && bucketIdx <= 30) {
      if (['z5', 'z4'].includes(zoneId)) return 'critical';
      if (['z6', 'z8'].includes(zoneId)) return 'strained';
      return 'watch';
    }

    // Transit strike in z5, z6, z1, z9 (bucket 36..39)
    if (bucketIdx >= 36 && bucketIdx <= 39) {
      if (['z5', 'z6', 'z3'].includes(zoneId)) return 'critical';
      return 'strained';
    }

    // Baseline rush hours (e.g. buckets 5, 11, 21, 37, 43)
    if ([5, 11, 21, 43].includes(bucketIdx)) {
      if (['z5', 'z9'].includes(zoneId)) return 'watch';
    }

    return 'calm';
  };

  const statusColors = {
    calm: 'bg-status-calm/70 hover:bg-status-calm',
    watch: 'bg-status-watch/80 hover:bg-status-watch',
    strained: 'bg-status-strained/80 hover:bg-status-strained',
    critical: 'bg-status-critical hover:bg-status-critical',
  };

  const handleCellClick = async (bucketIdx: number) => {
    const progress = bucketIdx / (NUM_BUCKETS - 1);
    const res = await apiClient.seekReplay(progress);
    setReplay(res);
  };

  const playheadPercent = (replay.progress || 0) * 100;

  return (
    <div className={`bg-surface border border-border rounded-2xl p-5 shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-text font-heading">
            3-Day Civic Strain Heat Matrix
          </h4>
          <p className="text-xs text-muted">
            Matrix of historical strain across 9 zones. Click any cell to jump the replay engine.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-status-calm/70" /> Calm
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-status-watch/80" /> Watch
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-status-strained/80" /> Strained
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-status-critical" /> Critical
          </span>
        </div>
      </div>

      {/* Matrix Container */}
      <div className="relative overflow-x-auto">
        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-6 w-0.5 bg-white shadow-glow-critical z-20 pointer-events-none transition-all duration-300"
          style={{ left: `calc(120px + (100% - 120px) * ${playheadPercent / 100})` }}
        >
          <div className="absolute -top-2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-white text-bg font-mono text-[9px] font-bold">
            PLAYHEAD
          </div>
        </div>

        {/* Days Header */}
        <div className="flex text-[11px] font-mono font-semibold text-muted pl-[120px] mb-2 border-b border-border/40 pb-1">
          <div className="w-1/3 text-left">DAY 1 (Nominal)</div>
          <div className="w-1/3 text-center text-status-critical">DAY 2 (Storm Surge & Outage)</div>
          <div className="w-1/3 text-right text-status-strained">DAY 3 (Transit Strike)</div>
        </div>

        {/* Grid rows */}
        <div className="space-y-1.5">
          {ZONES.map((zone) => (
            <div key={zone.id} className="flex items-center gap-2">
              <div className="w-[110px] text-xs font-heading font-medium text-text truncate">
                {zone.name}
              </div>
              <div className="flex-1 grid grid-cols-48 gap-0.5 h-5 bg-surface-2/30 rounded overflow-hidden p-0.5">
                {Array.from({ length: NUM_BUCKETS }).map((_, bIdx) => {
                  const st = getCellStatus(zone.id, bIdx);
                  return (
                    <button
                      key={bIdx}
                      onClick={() => handleCellClick(bIdx)}
                      className={`h-full rounded-sm transition-opacity cursor-pointer ${statusColors[st]}`}
                      title={`${zone.name} - Bucket ${bIdx + 1}: ${st.toUpperCase()}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
