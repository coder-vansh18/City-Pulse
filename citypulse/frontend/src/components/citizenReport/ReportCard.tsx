import React from 'react';
import { MapPin, ThumbsUp, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { CitizenReport, ReportStatus } from '../../types/citizenReport';
import { Card } from '../common/Card';

interface ReportCardProps {
  report: CitizenReport;
  onSelect: (report: CitizenReport) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onStatusChange?: (id: string, newStatus: ReportStatus, e: React.MouseEvent) => void;
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
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onSelect,
  onUpvote,
  onStatusChange,
}) => {
  const statusInfo = STATUS_CONFIG[report.status];
  const createdDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onSelect(report)}
      className="group cursor-pointer rounded-2xl border border-border bg-surface hover:bg-surface-2/80 transition-all duration-200 p-4 shadow-sm hover:shadow-md space-y-3"
    >
      {/* Header: User Info & Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center border border-accent/30">
            {report.reporterName ? report.reporterName[0] : 'C'}
          </div>
          <div>
            <div className="text-xs font-semibold text-text">
              {report.reporterName || 'Anonymous Citizen'}
            </div>
            <div className="text-[10px] text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{createdDate}</span>
            </div>
          </div>
        </div>

        <span
          className={`text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors line-clamp-1">
            {report.title}
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted border border-border">
            {report.id}
          </span>
        </div>
        <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
          {report.description}
        </p>
      </div>

      {/* Image Thumbnails (Inspired by Reference UI) */}
      {report.images && report.images.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {report.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Issue photo ${i + 1}`}
              className="w-16 h-16 rounded-xl object-cover border border-border flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Category & Location */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium text-[11px]">
            #{report.category}
          </span>
          <span className="text-muted flex items-center gap-1 text-[11px] truncate max-w-[180px]">
            <MapPin className="w-3 h-3 text-accent" />
            {report.location.address}
          </span>
        </div>

        {/* Upvote & Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onUpvote(report.id, e)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-accent/20 text-muted hover:text-accent transition-colors border border-border text-xs font-semibold cursor-pointer"
            title="Upvote/Confirm issue"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{report.upvotes}</span>
          </button>

          <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};
