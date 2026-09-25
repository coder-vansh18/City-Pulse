import React from 'react';
import { MapPin, ChevronRight, Compass } from 'lucide-react';
import { CitizenReport } from '../../types/citizenReport';
import { SeverityBadge } from './SeverityBadge';

interface NearbyIssuesCardProps {
  reports: CitizenReport[];
  onSelect: (report: CitizenReport) => void;
}

export const NearbyIssuesCard: React.FC<NearbyIssuesCardProps> = ({
  reports,
  onSelect,
}) => {
  // Sort by distance and take the closest 3
  const nearby = [...reports]
    .sort((a, b) => (a.location.distanceMeters || 9999) - (b.location.distanceMeters || 9999))
    .slice(0, 3);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent animate-spin-slow" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text font-heading">
            Nearby Issues ({nearby.length} within 1 km)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
          GPS Demo Coordinates
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {nearby.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelect(r)}
            className="p-3 rounded-xl bg-surface-2/60 border border-border hover:border-accent/40 hover:bg-surface-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 group shadow-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <SeverityBadge priority={r.priority} size="sm" />
                <span className="font-mono text-[10px] text-accent font-bold">
                  {r.location.distanceMeters || 320}m away
                </span>
              </div>
              <h4 className="text-xs font-bold text-text line-clamp-1 group-hover:text-accent transition-colors">
                {r.title}
              </h4>
              <p className="text-[11px] text-muted line-clamp-1">
                {r.location.address}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1 border-t border-border/40">
              <span>👍 {r.upvotes} confirmed</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
