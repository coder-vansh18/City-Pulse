import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Shield,
  Activity,
  Layers,
  Building,
  Hourglass,
  Camera,
  Copy,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { CitizenReport, ReportStatus } from '../../types/citizenReport';
import { SeverityBadge } from './SeverityBadge';
import { EvidenceEnginePanel } from './EvidenceEnginePanel';
import { useCitizenReportStore } from '../../store/useCitizenReportStore';

interface ReportDetailDrawerProps {
  report: CitizenReport | null;
  onClose: () => void;
}

export const ReportDetailDrawer: React.FC<ReportDetailDrawerProps> = ({
  report,
  onClose,
}) => {
  const {
    reports,
    updateReportStatus,
    toggleConfirmReport,
    voteResolutionEvidence,
    disputeResolution,
    setSelectedReport,
  } = useCitizenReportStore();

  const [copiedId, setCopiedId] = useState(false);
  const [evidenceToast, setEvidenceToast] = useState<string | null>(null);

  if (!report) return null;

  const isResolved = report.status === 'resolved' || report.status === 'disputed';
  const isDisputed = report.status === 'disputed' || Boolean(report.resolutionEvidence?.isDisputed);

  const handleCopyId = () => {
    navigator.clipboard.writeText(report.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAddEvidence = () => {
    setEvidenceToast('Camera / Evidence interface opened. New photo appended to evidence telemetry.');
    setTimeout(() => setEvidenceToast(null), 3000);
  };

  const handleReportDuplicate = () => {
    setEvidenceToast('Duplicate flag submitted. Municipal deduplication engine notified.');
    setTimeout(() => setEvidenceToast(null), 3000);
  };

  // Nearby issues in the same zone or within 1.5km
  const nearbyIssues = reports.filter(
    (r) => r.id !== report.id && (r.location.zoneId === report.location.zoneId || (r.location.distanceMeters || 1000) < 1200)
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-2xl bg-surface border-l border-border h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyId}
              className="font-mono text-xs px-2.5 py-1 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 font-bold border border-accent/30 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Click to copy Report ID"
            >
              <span>{report.id}</span>
              <Copy className="w-3 h-3 opacity-70" />
            </button>
            {copiedId && (
              <span className="text-[10px] text-emerald-400 font-mono font-bold animate-in fade-in">
                Copied!
              </span>
            )}
            <SeverityBadge priority={report.priority} size="md" />
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notification Toast */}
          {evidenceToast && (
            <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 text-accent text-xs font-semibold animate-in fade-in">
              {evidenceToast}
            </div>
          )}

          {/* Title & Reporter Header */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="px-2 py-0.5 rounded-md bg-surface-2 text-accent font-mono font-bold">
                #{report.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(report.createdAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>•</span>
              <span>By {report.reporterName || 'Anonymous Resident'}</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-text leading-snug">
              {report.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>{report.location.address}</span>
              <span className="font-mono text-[11px] text-accent font-bold">
                ({report.location.distanceMeters || 320}m away)
              </span>
            </div>
          </div>

          {/* FLAGSHIP CITYPULSE EVIDENCE ENGINE PANEL */}
          <EvidenceEnginePanel report={report} />

          {/* Before & After Resolution Evidence (For Resolved Issues) */}
          {isResolved && report.resolutionEvidence ? (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDisputed
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-surface-2/70 border-emerald-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDisputed ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text font-heading">
                    Before / After Resolution Evidence
                  </h4>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  isDisputed
                    ? 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                }`}>
                  {isDisputed ? '⚠ Resolution Disputed' : `Resolution Evidence: ${report.resolutionEvidence.resolutionEvidenceScore}/100`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-muted uppercase">Before (Reported Problem)</span>
                  <img
                    src={report.resolutionEvidence.beforeImage}
                    alt="Before Repair"
                    className="w-full h-32 rounded-xl object-cover border border-border"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">After (Municipal Fix)</span>
                  <img
                    src={report.resolutionEvidence.afterImage}
                    alt="After Repair"
                    className="w-full h-32 rounded-xl object-cover border border-emerald-500/40"
                  />
                </div>
              </div>

              <div className="text-[11px] text-text/90 font-mono flex items-center justify-between pt-1">
                <span>GPS Alignment: ✓ Matches reported site</span>
                <span className="text-emerald-400 font-bold">AI Clearance: Confirmed Defect Removed</span>
              </div>

              {/* Citizen Resolution Verification Prompt */}
              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-text font-medium">Was this issue actually resolved in person?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => voteResolutionEvidence(report.id, 'yes')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      report.resolutionEvidence.userVoted === 'yes'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-surface hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Yes ({report.resolutionEvidence.verifiedCount})</span>
                  </button>
                  <button
                    onClick={() => disputeResolution(report.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      report.resolutionEvidence.userVoted === 'no' || isDisputed
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-surface hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Not yet ({report.resolutionEvidence.unverifiedCount})</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Photos Gallery */
            report.images && report.images.length > 0 && (
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
                      className="group rounded-xl overflow-hidden border border-border aspect-square bg-surface-2 block"
                    >
                      <img
                        src={img}
                        alt={`Evidence ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
              Issue Description
            </h4>
            <p className="text-sm text-text bg-surface-2/50 p-4 rounded-2xl border border-border/60 leading-relaxed font-sans">
              {report.description}
            </p>
          </div>

          {/* AI CIVIC IMPACT SCORE */}
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-accent" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text font-heading">
                  AI Civic Impact Score
                </h4>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-muted hover:text-text cursor-pointer" />
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-60 p-2 rounded-xl bg-slate-900 text-[10px] text-slate-200 shadow-xl border border-white/10 z-30 font-sans pointer-events-none">
                    AI Civic Impact Score estimates how urgently this issue may affect citizens and city operations.
                  </div>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-accent">
                {report.civicImpact.score} <span className="text-xs text-muted">/ 100</span>
              </span>
            </div>

            {/* Impact Breakdown Bars */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted">Traffic Impact</span>
                  <span className="font-mono font-bold text-text">{report.civicImpact.trafficImpact}%</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${report.civicImpact.trafficImpact}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted">Safety Risk</span>
                  <span className="font-mono font-bold text-text">{report.civicImpact.safetyRisk}%</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${report.civicImpact.safetyRisk}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted">Citizen Demand / Reports</span>
                  <span className="font-mono font-bold text-text">{report.civicImpact.citizenReports}%</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${report.civicImpact.citizenReports}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted">Location & Arterial Importance</span>
                  <span className="font-mono font-bold text-text">{report.civicImpact.locationImportance}%</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${report.civicImpact.locationImportance}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* SLA / RESOLUTION DEADLINE TRACKER */}
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text font-heading">
                  SLA / Resolution Deadline Tracker
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-text">
                {report.sla.durationHours}h Target
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Deadline: {new Date(report.sla.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
              <span className={`font-mono font-bold ${isResolved ? 'text-emerald-400' : report.sla.breached ? 'text-rose-400' : 'text-amber-400'}`}>
                {isResolved ? '✓ Resolved within SLA' : report.sla.breached ? '⚠ SLA Breached' : `${Math.floor(report.sla.remainingMinutes / 60)}h ${report.sla.remainingMinutes % 60}m remaining`}
              </span>
            </div>

            <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isResolved ? 'bg-emerald-500' : report.sla.breached ? 'bg-rose-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, report.sla.compliancePercentage || 50)}%` }}
              />
            </div>
          </div>

          {/* STATUS LIFECYCLE TIMELINE */}
          <div className="p-4 rounded-2xl bg-surface-2/40 border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
              Status Lifecycle Timeline
            </h4>
            <div className="space-y-3 pl-2 border-l-2 border-border/80 ml-2">
              {report.timeline.map((step, idx) => (
                <div key={idx} className="relative pl-4 space-y-0.5">
                  <div
                    className={`absolute -left-[17px] top-0.5 w-3 h-3 rounded-full border-2 ${
                      step.current
                        ? 'bg-accent border-white animate-ping'
                        : step.completed
                        ? 'bg-emerald-500 border-emerald-400'
                        : 'bg-surface border-border'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${step.completed ? 'text-text' : 'text-muted'}`}>
                      {step.label}
                    </span>
                    {step.timestamp && (
                      <span className="text-[10px] font-mono text-muted">{step.timestamp}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted">{step.note}</p>
                </div>
              ))}
            </div>

            {/* Simulated Municipal Status Action Buttons for Demo */}
            <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-muted text-[11px]">Simulate Municipal Workflow:</span>
              <div className="flex items-center gap-1.5">
                {(['submitted', 'acknowledged', 'in_progress', 'resolved'] as ReportStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateReportStatus(report.id, st)}
                    disabled={report.status === st}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors cursor-pointer capitalize ${
                      report.status === st
                        ? 'bg-accent text-white font-bold'
                        : 'bg-surface text-muted hover:text-text border border-border'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NEARBY ISSUES */}
          {nearbyIssues.length > 0 && (
            <div className="p-4 rounded-2xl bg-surface-2/40 border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
                Nearby Issues ({nearbyIssues.length} within 1.5 km)
              </h4>
              <div className="space-y-2">
                {nearbyIssues.map((nr) => (
                  <div
                    key={nr.id}
                    onClick={() => setSelectedReport(nr)}
                    className="p-3 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <SeverityBadge priority={nr.priority} size="sm" />
                        <span className="text-xs font-bold text-text truncate group-hover:text-accent transition-colors">
                          {nr.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted truncate block">
                        {nr.location.address} • {nr.location.distanceMeters || 450}m away
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Sticky Bottom Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-2/80 flex items-center justify-between gap-3">
          <button
            onClick={() => toggleConfirmReport(report.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
              report.confirmedByMe
                ? 'bg-accent text-white shadow-accent/20'
                : 'bg-surface hover:bg-surface-2 text-text border border-border'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${report.confirmedByMe ? 'fill-current' : ''}`} />
            <span>{report.confirmedByMe ? 'Confirmed by You' : 'Confirm Issue'} ({report.upvotes})</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddEvidence}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface hover:bg-surface-2 text-muted hover:text-text border border-border text-xs font-medium cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Add Evidence</span>
            </button>
            <button
              onClick={handleReportDuplicate}
              className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-2 text-muted hover:text-rose-400 border border-border text-xs font-medium cursor-pointer"
            >
              Report Duplicate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
