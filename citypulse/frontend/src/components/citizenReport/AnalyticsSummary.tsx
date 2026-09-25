import React from 'react';
import { FileText, AlertOctagon, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';
import { CitizenReport } from '../../types/citizenReport';

interface AnalyticsSummaryProps {
  reports: CitizenReport[];
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ reports }) => {
  const total = reports.length;
  const criticalCount = reports.filter((r) => r.priority === 'critical').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const slaCompliantCount = reports.filter((r) => !r.sla.breached).length;
  const slaComplianceRate = total > 0 ? Math.round((slaCompliantCount / total) * 100) : 94;

  const categoryCounts: Record<string, { label: string; count: number; color: string }> = {
    pothole: { label: 'Potholes', count: 0, color: 'bg-rose-500' },
    garbage: { label: 'Garbage', count: 0, color: 'bg-amber-500' },
    streetlight: { label: 'Streetlights', count: 0, color: 'bg-yellow-500' },
    waterlogging: { label: 'Drainage', count: 0, color: 'bg-sky-500' },
    traffic: { label: 'Traffic', count: 0, color: 'bg-emerald-500' },
    other: { label: 'Other', count: 0, color: 'bg-purple-500' },
  };

  reports.forEach((r) => {
    if (categoryCounts[r.category]) {
      categoryCounts[r.category].count++;
    } else {
      categoryCounts.other.count++;
    }
  });

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-surface-2/60 border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-text">{total}</div>
            <div className="text-[11px] text-muted font-heading font-medium">Total Reports</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/60 border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-500">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-rose-500">{criticalCount}</div>
            <div className="text-[11px] text-muted font-heading font-medium">Critical Issues</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/60 border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-emerald-500">{resolvedCount}</div>
            <div className="text-[11px] text-muted font-heading font-medium">Resolved</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/60 border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-sky-500">{slaComplianceRate}%</div>
            <div className="text-[11px] text-muted font-heading font-medium">SLA Compliance</div>
          </div>
        </div>
      </div>

      {/* Distribution Breakdown Bar */}
      <div className="pt-1 border-t border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
          <span className="font-heading font-bold text-text text-[11px] uppercase tracking-wider">
            Issue Category Distribution
          </span>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted">
            {Object.entries(categoryCounts).map(([catKey, catVal]) => (
              <span key={catKey} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${catVal.color}`} />
                <span>{catVal.label}: <strong className="text-text">{catVal.count}</strong></span>
              </span>
            ))}
          </div>
        </div>

        {/* Multi-segment distribution progress bar */}
        <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden flex">
          {Object.entries(categoryCounts).map(([catKey, catVal]) => {
            const pct = total > 0 ? (catVal.count / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={catKey}
                className={`${catVal.color} h-full transition-all`}
                style={{ width: `${pct}%` }}
                title={`${catVal.label}: ${catVal.count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
