import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  Eye,
  User,
  MapPin,
  Clock,
  RotateCcw,
  FileText,
  HelpCircle,
  Check,
  Send,
} from 'lucide-react';
import { useCitizenReportStore } from '../store/useCitizenReportStore';
import { EmptyState } from '../components/common/EmptyState';

export const DisputedItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const { reports, voteResolutionEvidence, disputeResolution, setSelectedReport } = useCitizenReportStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'needs_review' | 'resolved'>('all');

  // Filter reports that have dispute activity or resolution evidence under scrutiny
  const disputedReports = useMemo(() => {
    return reports.filter((r) => {
      const isDisputed = r.status === 'disputed' || Boolean(r.resolutionEvidence?.isDisputed) || (r.resolutionEvidence && r.resolutionEvidence.unverifiedCount > 0);
      if (!isDisputed && activeTab !== 'all') return false;

      if (filterDepartment !== 'all' && r.department !== filterDepartment) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mId = r.id.toLowerCase().includes(q);
        const mTitle = r.title.toLowerCase().includes(q);
        const mLoc = r.location.address.toLowerCase().includes(q);
        const mDept = (r.department || '').toLowerCase().includes(q);
        if (!mId && !mTitle && !mLoc && !mDept) return false;
      }

      return true;
    });
  }, [reports, filterDepartment, searchQuery, activeTab]);

  const handleResolveDispute = (reportId: string) => {
    voteResolutionEvidence(reportId, 'yes');
    alert(`Dispute for ${reportId} acknowledged. Quality inspector sign-off recorded.`);
  };

  const handleEscalateDispute = (reportId: string) => {
    disputeResolution(reportId);
    alert(`Dispute for ${reportId} escalated to Senior Municipal Ombudsman.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-text tracking-tight">
              Disputed Civic Items & Quality Arbitration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold border border-rose-500/30">
              {disputedReports.length} Disputed Cases
            </span>
          </div>
          <p className="text-xs text-muted">
            Independent community validation and municipal resolution arbitration for contested civic repairs.
          </p>
        </div>

        {/* Action button back to reports */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text border border-border text-xs font-semibold cursor-pointer transition-colors"
          >
            ← Back to All Reports
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search disputed report ID, title, location, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2/70 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Water & Drainage Authority">Water & Drainage Authority</option>
            <option value="Electrical & Lighting">Electrical & Lighting</option>
          </select>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Disputed Items List */}
      {disputedReports.length > 0 ? (
        <div className="space-y-4">
          {disputedReports.map((report) => {
            const hasResolutionEvidence = Boolean(report.resolutionEvidence);
            const verifiedVotes = report.resolutionEvidence?.verifiedCount || 0;
            const disputeVotes = report.resolutionEvidence?.unverifiedCount || 1;

            return (
              <div
                key={report.id}
                className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-border/80 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-surface-2 text-text border border-border">
                        {report.id}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        Resolution Contested
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-2 text-muted border border-border">
                        {report.categoryLabel}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-text font-heading">
                      {report.title}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>{report.location.address}</span>
                      <span>•</span>
                      <span>Reporter: {report.reporterName}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-muted block">
                      Department Assigned
                    </span>
                    <span className="text-xs font-semibold text-accent font-heading">
                      {report.department || 'Public Works'}
                    </span>
                  </div>
                </div>

                {/* Description & Dispute Context */}
                <div className="bg-surface-2/40 border border-border/80 rounded-xl p-3 text-xs text-text/85 leading-relaxed font-sans">
                  <strong>Citizen Concern:</strong> {report.description}
                </div>

                {/* Before / After Evidence Review (if available) */}
                {hasResolutionEvidence && report.resolutionEvidence && (
                  <div className="bg-surface-2/20 border border-border/60 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-heading font-semibold text-text">
                      <span>Forensic Resolution Evidence Review</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                        Confidence Score: {report.resolutionEvidence.resolutionEvidenceScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-muted block mb-1">Before Repair Photo:</span>
                        <img
                          src={report.resolutionEvidence.beforeImage}
                          alt="Before repair"
                          className="w-full h-36 object-cover rounded-lg border border-border"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted block mb-1">After Repair Submission:</span>
                        <img
                          src={report.resolutionEvidence.afterImage}
                          alt="After repair"
                          className="w-full h-36 object-cover rounded-lg border border-border"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-muted italic">
                      AI Analysis: {report.resolutionEvidence.aiBeforeAfterAnalysis}
                    </p>
                  </div>
                )}

                {/* Arbitration & Actions */}
                <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-muted">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {verifiedVotes} Resident Approvals
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      {disputeVotes} Active Contests
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEscalateDispute(report.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 transition-colors cursor-pointer text-xs"
                    >
                      Escalate Dispute
                    </button>

                    <button
                      onClick={() => handleResolveDispute(report.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Close Case</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No disputed items found"
          description="All resolved civic reports have passed community corroboration and inspector sign-off without dispute."
        />
      )}
    </div>
  );
};
