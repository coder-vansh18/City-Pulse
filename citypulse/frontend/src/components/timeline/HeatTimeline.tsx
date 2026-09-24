import React, { useState } from 'react';
import { useCityStore } from '../../store/useCityStore';
import { apiClient } from '../../api/client';
import { Info, Sparkles, AlertTriangle, Activity, BarChart2 } from 'lucide-react';

const ZONES = [
  { id: 'z1', name: 'Hillcrest', desc: 'Residential & Upland' },
  { id: 'z2', name: 'Green Park', desc: 'Parks & Suburban' },
  { id: 'z3', name: 'Univ. Quarter', desc: 'Campus & High-Density Student Area' },
  { id: 'z4', name: 'Riverside', desc: 'Low-Lying Riverfront & Commercial' },
  { id: 'z5', name: 'Central Station', desc: 'Transit Hub & Downtown Core' },
  { id: 'z6', name: 'Market Dist.', desc: 'Retail, Hospitality & Dining' },
  { id: 'z7', name: 'Old Town', desc: 'Historic District & Narrow Roads' },
  { id: 'z8', name: 'Lakeside', desc: 'Waterfront & Harbor Facilities' },
  { id: 'z9', name: 'Industrial Belt', desc: 'Manufacturing & Logistics Corridor' },
];

const NUM_BUCKETS = 48; // 48 buckets across 72 hours (1.5h per bucket)

export interface BucketCellInfo {
  zoneId: string;
  zoneName: string;
  bucketIdx: number;
  simHour: number;
  day: number;
  timeLabel: string;
  score: number;
  status: 'calm' | 'watch' | 'strained' | 'critical';
  topIssue: string;
  confidence: number;
  eventCount: number;
  density: 'low' | 'med' | 'high';
}

export const getBucketMetadata = (zoneId: string, bucketIdx: number): BucketCellInfo => {
  const zone = ZONES.find((z) => z.id === zoneId) || ZONES[0];
  const totalHours = (bucketIdx * 1.5);
  const day = Math.floor(totalHours / 24) + 1;
  const hourInDay = Math.floor(totalHours % 24);
  const minuteInHour = (totalHours % 1) * 60;
  const timeLabel = `Day ${day} · ${String(hourInDay).padStart(2, '0')}:${String(minuteInHour).padStart(2, '0')}`;

  // Default calm baseline
  let score = 88.5 + (Math.sin(bucketIdx) * 3);
  let status: 'calm' | 'watch' | 'strained' | 'critical' = 'calm';
  let topIssue = 'Nominal urban flow; no active telemetry anomalies';
  let confidence = 96.4;
  let eventCount = Math.floor(8 + (Math.cos(bucketIdx) * 4));
  let density: 'low' | 'med' | 'high' = 'low';

  // Day 1 rush hours (buckets 5..7, 11..13)
  if ((bucketIdx >= 5 && bucketIdx <= 7) || (bucketIdx >= 11 && bucketIdx <= 13)) {
    density = 'med';
    eventCount = 22;
    if (['z5', 'z9'].includes(zoneId)) {
      score = 71.0;
      status = 'watch';
      topIssue = 'Elevated peak transit headways & arterial congestion';
      confidence = 94.0;
    }
  }

  // Day 2 Afternoon Severe Storm Surge (buckets 24..27: ~12:00 to 18:00)
  if (bucketIdx >= 24 && bucketIdx <= 27) {
    density = 'high';
    eventCount = 48 + Math.floor(Math.random() * 12);
    if (['z4', 'z5', 'z7', 'z8'].includes(zoneId)) {
      score = 31.4;
      status = 'critical';
      topIssue = 'Severe Storm: Flash flood alerts (Rain > 48mm/h) & 911 traffic hazard surge';
      confidence = 97.8;
      eventCount = 68;
    } else {
      score = 56.2;
      status = 'strained';
      topIssue = 'Secondary storm runoff & localized transit speed restrictions';
      confidence = 93.1;
      eventCount = 38;
    }
  }

  // Day 2 Evening Power Outage & Grid Stress (buckets 28..30: ~18:00 to 22:30)
  if (bucketIdx >= 28 && bucketIdx <= 30) {
    density = 'high';
    if (['z5', 'z4'].includes(zoneId)) {
      score = 24.8;
      status = 'critical';
      topIssue = 'Substation fault: 12,400 customers offline, signals dark & trapped elevator reports';
      confidence = 98.6;
      eventCount = 74;
    } else if (['z6', 'z8'].includes(zoneId)) {
      score = 49.0;
      status = 'strained';
      topIssue = 'Spillover commercial grid voltage fluctuations & noise anomalies';
      confidence = 91.5;
      eventCount = 34;
    } else {
      score = 69.5;
      status = 'watch';
      topIssue = 'Grid load rebalancing in adjacent feeder sectors';
      confidence = 89.2;
      eventCount = 18;
    }
  }

  // Day 3 Morning Transit Strike (buckets 36..39: ~06:00 to 12:00)
  if (bucketIdx >= 36 && bucketIdx <= 39) {
    density = 'high';
    if (['z5', 'z6', 'z3'].includes(zoneId)) {
      score = 28.5;
      status = 'critical';
      topIssue = 'Metro Union Walkout: 78% service cancellation & dense platform overcrowding';
      confidence = 99.1;
      eventCount = 82;
    } else {
      score = 52.3;
      status = 'strained';
      topIssue = 'High vehicle traffic diversion onto local neighborhood corridors';
      confidence = 92.4;
      eventCount = 42;
    }
  }

  // Day 3 Afternoon Recovery (buckets 41..47)
  if (bucketIdx >= 41) {
    density = 'med';
    score = 79.0 + ((bucketIdx - 41) * 2.5);
    if (score > 92) score = 92;
    status = score > 80 ? 'calm' : 'watch';
    topIssue = 'Systemic telemetry returning to nominal baseline parameters';
    confidence = 95.0;
    eventCount = 14;
  }

  return {
    zoneId,
    zoneName: zone.name,
    bucketIdx,
    simHour: totalHours,
    day,
    timeLabel,
    score: Math.round(score * 10) / 10,
    status,
    topIssue,
    confidence: Math.round(confidence * 10) / 10,
    eventCount,
    density,
  };
};

export const HeatTimeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  const replay = useCityStore((s) => s.replay);
  const setReplay = useCityStore((s) => s.setReplay);
  const selectedZoneId = useCityStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useCityStore((s) => s.setSelectedZoneId);

  const [hoveredCell, setHoveredCell] = useState<BucketCellInfo | null>(null);

  const statusColors = {
    calm: 'bg-status-calm/70 hover:bg-status-calm',
    watch: 'bg-status-watch/80 hover:bg-status-watch',
    strained: 'bg-status-strained/80 hover:bg-status-strained',
    critical: 'bg-status-critical hover:bg-status-critical shadow-sm shadow-status-critical/30',
  };

  const densityColors = {
    low: 'bg-muted/30',
    med: 'bg-amber-500/60',
    high: 'bg-rose-500/90',
  };

  const handleCellClick = async (bucketIdx: number, zoneId: string) => {
    const progress = bucketIdx / (NUM_BUCKETS - 1);
    setSelectedZoneId(zoneId);
    const res = await apiClient.seekReplay(progress);
    setReplay(res);
  };

  const playheadPercent = (replay.progress || 0) * 100;

  return (
    <div className={`bg-surface border border-border rounded-2xl p-5 shadow-xl relative ${className}`}>
      {/* Header & Legends */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent" />
            <h4 className="text-base font-bold text-text font-heading">
              3-Day Civic Strain Heat Matrix
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted">
              48 Time Buckets · 72h
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Synchronized stress matrix across all 9 zones. Hover for full diagnostic telemetry, click to jump playhead.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono bg-surface-2/60 px-3 py-1.5 rounded-xl border border-border">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-status-calm" /> Calm (80-100)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-status-watch" /> Watch (65-79)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-status-strained" /> Strained (45-64)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-status-critical" /> Critical (0-44)
          </span>
        </div>
      </div>

      {/* Matrix Container */}
      <div className="relative overflow-x-auto pb-2">
        {/* Playhead Vertical Guideline */}
        <div
          className="absolute top-0 bottom-12 w-0.5 bg-text shadow-glow-critical z-20 pointer-events-none transition-all duration-200"
          style={{ left: `calc(130px + (100% - 130px) * ${playheadPercent / 100})` }}
        >
          <div className="absolute -top-3 -translate-x-1/2 px-2 py-0.5 rounded bg-accent text-white font-mono text-[9px] font-bold shadow-md whitespace-nowrap">
            PLAYHEAD {playheadPercent.toFixed(1)}%
          </div>
        </div>

        {/* Days Header */}
        <div className="flex text-[11px] font-mono font-bold text-muted pl-[130px] mb-2 border-b border-border/60 pb-1.5">
          <div className="w-1/3 text-left flex items-center gap-1.5 text-text">
            <span className="w-2 h-2 rounded-full bg-status-calm" />
            <span>DAY 1: Nominal Baseline</span>
          </div>
          <div className="w-1/3 text-center flex items-center justify-center gap-1.5 text-status-critical">
            <span className="w-2 h-2 rounded-full bg-status-critical animate-pulse" />
            <span>DAY 2: Storm Surge & Grid Outage</span>
          </div>
          <div className="w-1/3 text-right flex items-center justify-end gap-1.5 text-status-strained">
            <span className="w-2 h-2 rounded-full bg-status-strained" />
            <span>DAY 3: Transit Walkout</span>
          </div>
        </div>

        {/* Zone Matrix Rows */}
        <div className="space-y-1.5">
          {ZONES.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            return (
              <div
                key={zone.id}
                className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${
                  isSelected ? 'bg-accent/10 ring-1 ring-accent/40' : 'hover:bg-surface-2/40'
                }`}
              >
                <div
                  className="w-[122px] flex flex-col justify-center cursor-pointer group"
                  onClick={() => setSelectedZoneId(zone.id)}
                >
                  <span className={`text-xs font-heading font-semibold truncate ${isSelected ? 'text-accent font-bold' : 'text-text'}`}>
                    {zone.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted truncate">
                    [{zone.id}] {zone.desc}
                  </span>
                </div>

                {/* 48 Buckets */}
                <div className="flex-1 grid grid-cols-48 gap-0.5 h-6 bg-surface-2/40 rounded overflow-hidden p-0.5 border border-border/40">
                  {Array.from({ length: NUM_BUCKETS }).map((_, bIdx) => {
                    const info = getBucketMetadata(zone.id, bIdx);
                    const isHovered = hoveredCell?.zoneId === zone.id && hoveredCell?.bucketIdx === bIdx;

                    return (
                      <button
                        key={bIdx}
                        onClick={() => handleCellClick(bIdx, zone.id)}
                        onMouseEnter={() => setHoveredCell(info)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-full rounded-xs transition-all cursor-pointer ${statusColors[info.status]} ${
                          isHovered ? 'ring-2 ring-white scale-125 z-10' : ''
                        }`}
                        aria-label={`${zone.name} - ${info.timeLabel}: ${info.status}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Event Density Indicator Strip */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40 pl-[130px]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1">
            <span>Event Density:</span>
          </div>
          <div className="flex-1 grid grid-cols-48 gap-0.5 h-2 rounded overflow-hidden">
            {Array.from({ length: NUM_BUCKETS }).map((_, bIdx) => {
              const info = getBucketMetadata('z5', bIdx);
              return (
                <div
                  key={bIdx}
                  className={`h-full rounded-xs ${densityColors[info.density]}`}
                  title={`${info.timeLabel} - Density: ${info.density.toUpperCase()} (~${info.eventCount} evts)`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted/40" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Med</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> High</span>
          </div>
        </div>
      </div>

      {/* Hover Diagnostic Telemetry Card */}
      {hoveredCell && (
        <div className="mt-3 p-3.5 rounded-xl bg-surface-2 border border-accent/40 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text font-heading">
                {hoveredCell.zoneName} [{hoveredCell.zoneId}]
              </span>
              <span className="text-[11px] font-mono text-muted bg-surface px-2 py-0.5 rounded border border-border">
                {hoveredCell.timeLabel}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  hoveredCell.status === 'critical'
                    ? 'bg-status-critical/20 text-status-critical border border-status-critical/40'
                    : hoveredCell.status === 'strained'
                    ? 'bg-status-strained/20 text-status-strained border border-status-strained/40'
                    : hoveredCell.status === 'watch'
                    ? 'bg-status-watch/20 text-status-watch border border-status-watch/40'
                    : 'bg-status-calm/20 text-status-calm border border-status-calm/40'
                }`}
              >
                {hoveredCell.status} ({hoveredCell.score}/100)
              </span>
            </div>
            <p className="text-xs text-text/90 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>{hoveredCell.topIssue}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <div className="text-[10px] text-muted uppercase">Confidence</div>
              <div className="font-bold text-text">{hoveredCell.confidence}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted uppercase">Window Events</div>
              <div className="font-bold text-accent">{hoveredCell.eventCount} telemetry evts</div>
            </div>
            <div className="text-[11px] text-muted italic bg-surface/50 px-2 py-1 rounded border border-border/60">
              Click cell to seek playhead
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
