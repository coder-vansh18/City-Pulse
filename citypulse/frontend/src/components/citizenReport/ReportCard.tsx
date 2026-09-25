import React from 'react';
import {
  MapPin,
  ThumbsUp,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
} from 'lucide-react';
import { CitizenReport, ReportStatus } from '../../types/citizenReport';
import { SeverityBadge } from './SeverityBadge';
import { EvidenceVerificationBadge } from './EvidenceVerificationBadge';

interface ReportCardProps {
  report: CitizenReport;
  onSelect: (report: CitizenReport) => void;
  onToggleConfirm: (id: string, e: React.MouseEvent) => void;
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; bg: string; text: string; border: string }> = {
  submitted: {
    label: 'Submitted',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/30',
  },
  acknowledged: {
    label: 'Acknowledged',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  disputed: {
    label: 'Resolution Disputed',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onSelect,
  onToggleConfirm,
}) => {
  const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.submitted;
  const createdDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isResolved = report.status === 'resolved';

  return (
    <div
      onClick={() => onSelect(report)}
      className="group cursor-pointer rounded-2xl border border-border bg-surface hover:bg-surface-2/90 transition-all duration-200 p-4 shadow-sm hover:shadow-md space-y-3 relative flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Header: User Info, Priority Pill & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center border border-accent/30">
              {report.reporterName ? report.reporterName[0] : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-text">
                  {report.reporterName || 'Anonymous Resident'}
                </span>
                {report.isMyReport && (
                  <span className="text-[9px] font-mono bg-accent/20 text-accent px-1.5 py-0.2 rounded font-bold">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{createdDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <SeverityBadge priority={report.priority} size="sm" />
            <span
              className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Title & Report ID */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors line-clamp-1">
              {report.title}
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border flex-shrink-0">
              {report.id}
            </span>
          </div>
          <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* Photos / Evidence Thumbnails */}
        {report.images && report.images.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {report.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Evidence ${i + 1}`}
                className="w-16 h-16 rounded-xl object-cover border border-border flex-shrink-0"
              />
            ))}
            {isResolved && report.resolutionEvidence && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/50 flex-shrink-0">
                <img
                  src={report.resolutionEvidence.afterImage}
                  alt="Resolution After"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[8px] font-bold text-white text-center py-0.5 uppercase">
                  Fixed
                </span>
              </div>
            )}
          </div>
        )}

        {/* Evidence Verification Indicator & SLA Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
          <EvidenceVerificationBadge
            status={report.evidence.evidenceStatus}
            score={report.evidence.scoreBreakdown.totalScore}
            size="sm"
          />

          <div className="flex items-center gap-1 text-[11px] font-mono">
            {isResolved ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resolved in SLA
              </span>
            ) : report.sla.breached ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> SLA Overdue
              </span>
            ) : (
              <span className="text-muted flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-amber-400" />
                {Math.floor(report.sla.remainingMinutes / 60)}h {report.sla.remainingMinutes % 60}m SLA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Location & Citizen Confirmation Button */}
      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/60 mt-2">
        <div className="flex items-center gap-1.5 text-muted text-[11px] truncate max-w-[170px]">
          <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span className="truncate">{report.location.address}</span>
        </div>

        {/* Citizen Confirmation Pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onToggleConfirm(report.id, e)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              report.confirmedByMe
                ? 'bg-accent/20 text-accent border-accent/40 font-bold shadow-sm'
                : 'bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border-border'
            }`}
            title="Confirm this issue is active in your neighborhood"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${report.confirmedByMe ? 'fill-current' : ''}`} />
            <span>{report.upvotes} confirmed</span>
          </button>

          <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};
