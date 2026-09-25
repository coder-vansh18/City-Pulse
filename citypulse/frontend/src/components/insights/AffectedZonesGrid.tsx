import React from 'react';
import { MapPin, AlertTriangle, Sparkles, Activity, ChevronRight } from 'lucide-react';
import { AffectedZoneSummary, IntelligenceSeverity } from '../../types/intelligence';

interface AffectedZonesGridProps {
  zones: AffectedZoneSummary[];
  onSelectZone?: (zoneId: string) => void;
  selectedZoneId?: string | null;
}

const SEVERITY_BADGES: Record<
  IntelligenceSeverity,
  { bg: string; text: string; label: string }
> = {
  critical: { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400', text: 'text-rose-500', label: 'Critical' },
  high: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', text: 'text-amber-500', label: 'High' },
  medium: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', text: 'text-blue-500', label: 'Medium' },
  low: { bg: 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400', text: 'text-slate-500', label: 'Low' },
};

export const AffectedZonesGrid: React.FC<AffectedZonesGridProps> = ({
  zones,
  onSelectZone,
  selectedZoneId,
}) => {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-text font-heading flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            Civic Zone Stress Distribution
          </h3>
          <p className="text-xs text-muted">
            Aggregated cross-feed signals and single-feed anomalies by geographical sector.
          </p>
        </div>

        <span className="text-[11px] font-mono text-muted bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
          {zones.length} Active Zones
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {zones.map((zone) => {
          const sev = SEVERITY_BADGES[zone.highestSeverity];
          const isSelected = selectedZoneId === zone.zoneId;

          return (
            <div
              key={zone.zoneId}
              onClick={() => onSelectZone && onSelectZone(zone.zoneId)}
              className={`bg-surface-2/40 border rounded-xl p-3.5 transition-all cursor-pointer hover:border-accent hover:shadow-sm flex flex-col justify-between ${
                isSelected
                  ? 'border-accent ring-2 ring-accent/20 bg-accent/5'
                  : 'border-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                    {zone.zoneId.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${sev.bg}`}
                  >
                    {sev.label}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-text font-heading line-clamp-1 mb-1">
                  {zone.zoneName}
                </h4>

                <div className="flex items-center gap-2 text-[11px] text-muted mb-2">
                  <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 font-mono font-medium">
                    <Sparkles className="w-3 h-3" /> {zone.correlationCount} Links
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-mono font-medium">
                    <AlertTriangle className="w-3 h-3" /> {zone.anomalyCount} Anom
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted">Pulse Score</span>
                <span
                  className={`font-bold ${
                    zone.pulseScore < 70
                      ? 'text-rose-500'
                      : zone.pulseScore < 85
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {zone.pulseScore}/100
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
