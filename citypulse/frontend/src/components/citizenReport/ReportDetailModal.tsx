import React from 'react';
import { X, MapPin, Clock, ThumbsUp, AlertTriangle, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { CitizenReport, ReportStatus } from '../../types/citizenReport';

interface ReportDetailModalProps {
  report: CitizenReport | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
  onUpdateStatus: (id: string, status: ReportStatus) => void;
}

const STEPS: { status: ReportStatus; label: string; desc: string }[] = [
  { status: 'submitted', label: 'Submitted', desc: 'Complaint received by CityPulse' },
  { status: 'acknowledged', label: 'Acknowledged', desc: 'Assigned to municipal taskforce' },
  { status: 'in_progress', label: 'In Progress', desc: 'Work crew dispatched to site' },
  { status: 'resolved', label: 'Resolved', desc: 'Issue inspected & cleared' },
];

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onUpvote,
  onUpdateStatus,
}) => {
  if (!report) return null;

  const currentStepIdx = STEPS.findIndex((s) => s.status === report.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-accent/20 text-accent font-bold border border-accent/30">
              {report.id}
            </span>
            <div>
              <h2 className="text-base font-bold text-text line-clamp-1">{report.title}</h2>
              <p className="text-xs text-muted">Category: {report.categoryLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Stepper */}
          <div className="bg-surface-2/40 p-4 rounded-2xl border border-border/60">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Complaint Status Lifecycle
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
              {STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div
                    key={step.status}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-accent/15 border-accent text-accent font-bold'
                        : isCompleted
                        ? 'bg-surface border-emerald-500/40 text-emerald-400'
                        : 'bg-surface/30 border-border/50 text-muted'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-current flex-shrink-0" />
                      )}
                      <span className="font-medium text-xs truncate">{step.label}</span>
                    </div>
                    <p className="text-[10px] text-muted mt-1 leading-tight">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Demo Action to update status */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40 text-xs">
              <span className="text-muted">Simulate Municipal Status Action:</span>
              <div className="flex items-center gap-1.5">
                {STEPS.map((s) => (
                  <button
                    key={s.status}
                    onClick={() => onUpdateStatus(report.id, s.status)}
                    disabled={report.status === s.status}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      report.status === s.status
                        ? 'bg-accent text-white font-bold'
                        : 'bg-surface-2 hover:bg-surface text-muted hover:text-text border border-border'
                    }`}
                  >
                    Mark {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis section if present */}
          {report.aiAnalysis && (
            <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <div>
                  <span className="font-bold text-accent">Demo AI Vision Tagged: </span>
                  <span className="text-text">{report.aiAnalysis.detectedIssue}</span>
                </div>
              </div>
              <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                {report.aiAnalysis.confidence}% Match
              </span>
            </div>
          )}

          {/* Report Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-sm text-text bg-surface-2/30 p-3.5 rounded-xl border border-border/50 leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Photos */}
          {report.images && report.images.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Attached Photos ({report.images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.images.map((img, i) => (
                  <a
                    key={i}
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-surface-2"
                  >
                    <img
                      src={img}
                      alt={`Report photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Location & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-surface-2/40 p-4 rounded-xl border border-border/60">
            <div>
              <span className="text-muted block text-[11px] mb-0.5">Location & Address</span>
              <div className="flex items-center gap-1.5 font-medium text-text">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{report.location.address}</span>
              </div>
              <span className="text-[11px] font-mono text-muted block mt-1">
                Zone: {report.location.zoneId.toUpperCase()} ({report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)})
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px] mb-0.5">Report Metadata</span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Severity:</span>
                  <span className="font-bold text-amber-400">{report.severity} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Reported By:</span>
                  <span className="font-medium text-text">{report.reporterName || 'Citizen'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Created:</span>
                  <span className="font-mono text-muted">{new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-2/60 flex items-center justify-between">
          <button
            onClick={() => onUpvote(report.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors font-medium text-xs cursor-pointer"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Confirm & Upvote Issue ({report.upvotes})</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface text-text border border-border font-medium text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
