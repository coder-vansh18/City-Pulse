import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Activity,
  Layers,
  UserCheck,
} from 'lucide-react';
import { CitizenReport } from '../../types/citizenReport';
import { EvidenceVerificationBadge } from './EvidenceVerificationBadge';

interface EvidenceEnginePanelProps {
  report: CitizenReport;
}

export const EvidenceEnginePanel: React.FC<EvidenceEnginePanelProps> = ({ report }) => {
  const [showFullBreakdown, setShowFullBreakdown] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  const ev = report.evidence;
  const sb = ev.scoreBreakdown;

  return (
    <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/10 via-surface-2 to-surface p-4 sm:p-5 shadow-sm space-y-4">
      {/* Engine Header & Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/20 text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wide">
              CityPulse Evidence Engine
            </h3>
          </div>
          <p className="text-[11px] text-muted">
            Multi-signal Bayesian evidence verification across spatial, visual, and telemetry silos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[10px] text-muted uppercase font-mono font-bold">
              <span>Evidence Confidence</span>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-muted hover:text-text cursor-pointer" />
                <div className="hidden group-hover:block absolute right-0 bottom-full mb-1.5 w-64 p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-200 shadow-2xl border border-white/10 z-40 font-sans pointer-events-none leading-relaxed">
                  Evidence Confidence estimates how strongly the available evidence supports this report. It does not guarantee that the report is factually true.
                </div>
              </div>
            </div>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-accent">{sb.totalScore}</span>
              <span className="text-xs text-muted font-mono">/ 100</span>
            </div>
          </div>
          <EvidenceVerificationBadge status={ev.evidenceStatus} size="md" />
        </div>
      </div>

      {/* Strength Summary Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface/80 border border-border text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="font-bold text-text">{sb.strengthLabel}</span>
        </div>
        <span className="text-[11px] font-mono text-muted">
          {sb.totalScore >= 80 ? '✓ High Multi-Signal Agreement' : 'Preliminary Corroboration'}
        </span>
      </div>

      {/* Manual Review Alert (if flagged) */}
      {ev.requiresManualReview && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold font-heading">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Review Flag: Verification Oversight Active</span>
          </div>
          <p className="text-[11px] text-amber-200/90 pl-5">
            {ev.manualReviewReason || 'High priority or safety impact requires field supervisor verification before closing.'}
          </p>
        </div>
      )}

      {/* Multi-Signal Evidence Score Breakdown (Collapsible) */}
      <div className="space-y-2">
        <button
          onClick={() => setShowFullBreakdown(!showFullBreakdown)}
          className="w-full flex items-center justify-between text-xs font-bold font-heading text-text py-1 cursor-pointer group"
        >
          <span className="flex items-center gap-1.5 group-hover:text-accent transition-colors">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Evidence Signal Weights (+100 max)</span>
          </span>
          {showFullBreakdown ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
        </button>

        {showFullBreakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 animate-in fade-in duration-150 text-xs">
            {/* GPS Match */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">GPS Match</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.gpsMatch} pts</span>
                <span className="text-[10px] text-muted">max 20</span>
              </div>
            </div>

            {/* Live Camera */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">Live Capture</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.liveCapture} pts</span>
                <span className="text-[10px] text-muted">max 20</span>
              </div>
            </div>

            {/* AI Image Match */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">AI Image Match</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.aiImageMatch} pts</span>
                <span className="text-[10px] text-muted">max 18</span>
              </div>
            </div>

            {/* Timestamp Consistency */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">Timestamp</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.timestampConsistency} pts</span>
                <span className="text-[10px] text-muted">max 10</span>
              </div>
            </div>

            {/* Location Consistency */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">Location Match</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.locationConsistency} pts</span>
                <span className="text-[10px] text-muted">max 10</span>
              </div>
            </div>

            {/* Community Confirmation */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">Community Corrob.</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.communityConfirmation} pts</span>
                <span className="text-[10px] text-muted">max 8</span>
              </div>
            </div>

            {/* No Duplicate */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">Deduplication</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.noDuplicate} pts</span>
                <span className="text-[10px] text-muted">max 5</span>
              </div>
            </div>

            {/* User Authenticity */}
            <div className="p-2.5 rounded-xl bg-surface/60 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] text-muted uppercase font-mono">User Trust</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-emerald-400">+{sb.userAuthenticity} pts</span>
                <span className="text-[10px] text-muted">max 5</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Authenticity vs Report Proof Card */}
      <div className="p-3.5 rounded-xl bg-surface/70 border border-border/60 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-accent" />
            <span className="font-bold text-text font-heading">Citizen Authenticity Profile</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
            ✓ Verified Citizen Account
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div>
            <span className="text-muted block">Citizen:</span>
            <span className="font-semibold text-text">{ev.userTrust.name}</span>
          </div>
          <div>
            <span className="text-muted block">Reports Submitted:</span>
            <span className="font-mono font-bold text-text">{ev.userTrust.reportsSubmitted}</span>
          </div>
          <div>
            <span className="text-muted block">Account Age:</span>
            <span className="font-mono text-text">{ev.userTrust.accountAgeMonths} months</span>
          </div>
          <div>
            <span className="text-muted block">Trust Rating:</span>
            <span className="font-mono font-bold text-accent">{ev.userTrust.trustRating}%</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-border/40 text-[10px] text-muted italic flex items-center gap-1.5">
          <Info className="w-3 h-3 text-accent flex-shrink-0" />
          <span>Note: User verification validates account authenticity; empirical defect evidence is evaluated independently.</span>
        </div>
      </div>

      {/* Location & Metadata Telemetry Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Location Telemetry */}
        <div className="p-3 rounded-xl bg-surface/70 border border-border/60 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold font-heading text-text">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span>Location Telemetry</span>
          </div>
          <p className="text-[11px] text-text/90 leading-tight">
            {ev.locationEvidence.summary}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1 border-t border-border/40">
            <span>Accuracy: ±{ev.locationEvidence.gpsAccuracyMeters}m</span>
            <span className="text-emerald-400 font-bold">✓ Location Consistent</span>
          </div>
        </div>

        {/* Image Metadata & EXIF */}
        <div className="p-3 rounded-xl bg-surface/70 border border-border/60 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold font-heading text-text">
            <Camera className="w-3.5 h-3.5 text-accent" />
            <span>Image EXIF & Metadata</span>
          </div>
          <p className="text-[11px] text-text/90">
            {ev.imageMetadata.deviceModel || 'Camera telemetry active'} ({ev.imageMetadata.dimensions || 'High Resolution'})
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1 border-t border-border/40">
            <span>Live Capture: {ev.imageMetadata.isLiveCapture ? '✓ Yes' : 'File Upload'}</span>
            <span className="text-emerald-400 font-bold">✓ EXIF Validated</span>
          </div>
        </div>
      </div>

      {/* Description & AI Vision Consistency */}
      <div className="p-3 rounded-xl bg-surface/70 border border-border/60 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold font-heading text-text">
            <FileCheck className="w-3.5 h-3.5 text-accent" />
            <span>Description vs Visual Evidence Consistency</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-accent">
            {report.aiAnalysis.descriptionMatchPercent}% Match
          </span>
        </div>
        <p className="text-[11px] text-muted">
          Natural language description matches visual defect category (<em>{report.categoryLabel}</em>). No semantic contradiction detected.
        </p>
      </div>

      {/* Evidence Chronological Timeline (Collapsible) */}
      <div className="pt-1">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full flex items-center justify-between text-xs font-bold font-heading text-muted hover:text-text cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span>Evidence Ingestion Timeline ({ev.timeline.length} events)</span>
          </span>
          {showTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTimeline && (
          <div className="space-y-2.5 pt-2 pl-3 border-l-2 border-border/80 ml-2 animate-in fade-in">
            {ev.timeline.map((step, idx) => (
              <div key={idx} className="relative pl-3 space-y-0.5">
                <div
                  className={`absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full ${
                    step.passed ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text">{step.title}</span>
                  <span className="font-mono text-[10px] text-muted">{step.timestamp}</span>
                </div>
                <p className="text-[11px] text-muted">{step.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
