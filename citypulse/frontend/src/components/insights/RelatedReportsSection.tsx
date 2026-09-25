import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, ArrowRight, MapPin, Users } from 'lucide-react';
import { useCitizenReportStore } from '../../store/useCitizenReportStore';

export const RelatedReportsSection: React.FC = () => {
  const navigate = useNavigate();
  const reports = useCitizenReportStore((s) => s.reports);

  // Take top 3 verified or in-progress reports
  const activeReports = reports.slice(0, 3);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold text-text font-heading">
              Correlated Citizen Ground Reports
            </h3>
          </div>
          <p className="text-xs text-muted">
            Ground-level citizen submissions corroborating telemetry anomalies and cross-feed stresses.
          </p>
        </div>

        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer"
        >
          <span>View All Citizen Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {activeReports.map((report) => (
          <div
            key={report.id}
            onClick={() => navigate('/reports')}
            className="bg-surface-2/40 border border-border/80 hover:border-accent/60 rounded-xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-border text-muted">
                  {report.id}
                </span>

                <span
                  className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    report.priority === 'critical'
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      : report.priority === 'high'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                  }`}
                >
                  {report.priority}
                </span>
              </div>

              <h4 className="text-xs font-bold text-text font-heading group-hover:text-accent transition-colors line-clamp-1 mb-1">
                {report.title}
              </h4>

              <p className="text-[11px] text-text/80 line-clamp-2 mb-2 font-sans">
                {report.description}
              </p>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted font-mono">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-accent" />
                <span className="line-clamp-1">{report.location.address.split(',')[0]}</span>
              </div>

              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                {report.evidence.scoreBreakdown.totalScore}% Verif
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
