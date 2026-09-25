import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  ListFilter,
  CheckCircle2,
  Sparkles,
  MapPin,
  Send,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  FileText,
  Map as MapIcon,
  User,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useCitizenReportStore } from '../store/useCitizenReportStore';
import { ReportCategory, ReportStatus, PriorityLevel, EvidenceStatus, CitizenReport } from '../types/citizenReport';
import { ReportCard } from '../components/citizenReport/ReportCard';
import { ReportDetailDrawer } from '../components/citizenReport/ReportDetailDrawer';
import { AnalyticsSummary } from '../components/citizenReport/AnalyticsSummary';
import { NearbyIssuesCard } from '../components/citizenReport/NearbyIssuesCard';
import { IssueMapModal } from '../components/citizenReport/IssueMapModal';
import { ReportSubmissionWizard } from '../components/citizenReport/ReportSubmissionWizard';
import { Card } from '../components/common/Card';

export const CitizenReportPage: React.FC = () => {
  const {
    reports,
    selectedReport,
    filterCategory,
    filterStatus,
    filterPriority,
    filterEvidenceStatus,
    filterDepartment,
    sortBy,
    searchQuery,
    viewMode,
    isMapOpen,
    setSelectedReport,
    setFilterCategory,
    setFilterStatus,
    setFilterPriority,
    setFilterEvidenceStatus,
    setFilterDepartment,
    setSortBy,
    setSearchQuery,
    setViewMode,
    setIsMapOpen,
    toggleConfirmReport,
  } = useCitizenReportStore();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [submissionSuccessId, setSubmissionSuccessId] = useState<string | null>(null);

  // My Reports stats
  const myReportsList = useMemo(() => reports.filter((r) => r.isMyReport), [reports]);
  const mySubmitted = myReportsList.filter((r) => r.status === 'submitted').length;
  const myInProgress = myReportsList.filter((r) => r.status === 'in_progress' || r.status === 'acknowledged').length;
  const myResolved = myReportsList.filter((r) => r.status === 'resolved' || r.status === 'disputed').length;

  // Filtered & Sorted Reports List
  const displayedReports = useMemo(() => {
    let list = viewMode === 'my_reports' ? myReportsList : reports;

    // Filter Category
    if (filterCategory !== 'all') {
      list = list.filter((r) => r.category === filterCategory);
    }
    // Filter Status
    if (filterStatus !== 'all') {
      list = list.filter((r) => r.status === filterStatus);
    }
    // Filter Priority
    if (filterPriority !== 'all') {
      list = list.filter((r) => r.priority === filterPriority);
    }
    // Filter Evidence Status
    if (filterEvidenceStatus !== 'all') {
      list = list.filter((r) => r.evidence.evidenceStatus === filterEvidenceStatus);
    }
    // Filter Department
    if (filterDepartment !== 'all') {
      list = list.filter((r) => r.department === filterDepartment);
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const mId = r.id.toLowerCase().includes(q);
        const mTitle = r.title.toLowerCase().includes(q);
        const mLoc = r.location.address.toLowerCase().includes(q);
        const mDesc = r.description.toLowerCase().includes(q);
        return mId || mTitle || mLoc || mDesc;
      });
    }

    // Sorting
    const priorityWeight: Record<PriorityLevel, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...list].sort((a, b) => {
      if (sortBy === 'priority') {
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'evidence_score') {
        return b.evidence.scoreBreakdown.totalScore - a.evidence.scoreBreakdown.totalScore;
      }
      if (sortBy === 'confirmed') {
        return b.upvotes - a.upvotes;
      }
      if (sortBy === 'distance') {
        return (a.location.distanceMeters || 9999) - (b.location.distanceMeters || 9999);
      }
      if (sortBy === 'sla') {
        return a.sla.remainingMinutes - b.sla.remainingMinutes;
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // default newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reports, myReportsList, viewMode, filterCategory, filterStatus, filterPriority, filterEvidenceStatus, filterDepartment, searchQuery, sortBy]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    reports.forEach((r) => {
      if (r.department) depts.add(r.department);
    });
    return Array.from(depts);
  }, [reports]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight font-heading">
              Citizen Civic Issue Reporting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold text-xs border border-accent/30">
              CityPulse Civic Health
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time multi-signal evidence verification, automated dispatch & citizen corroboration.
          </p>
        </div>

        {/* View Mode Switches & Map Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interactive Map Button */}
          <button
            onClick={() => setIsMapOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text border border-border text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            <MapIcon className="w-3.5 h-3.5 text-accent" />
            <span>View Issue Map</span>
          </button>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-2xl border border-border">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'feed'
                  ? 'bg-surface text-accent shadow-sm border border-border font-bold'
                  : 'text-muted hover:text-text'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Reports Feed ({reports.length})</span>
            </button>

            <button
              onClick={() => setViewMode('my_reports')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'my_reports'
                  ? 'bg-surface text-accent shadow-sm border border-border font-bold'
                  : 'text-muted hover:text-text'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Reports ({myReportsList.length})</span>
            </button>

            <button
              onClick={() => setViewMode('create')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'create'
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-muted hover:text-text'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submission Success Banner */}
      {submissionSuccessId && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Report Ingested into Evidence Engine!</h4>
              <p className="text-xs opacity-90 mt-0.5">
                Report ID: <strong className="font-mono underline">{submissionSuccessId}</strong> verified with live telemetry and dispatched to taskforce.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewMode('feed');
                setSubmissionSuccessId(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              View in Feed →
            </button>
            <button
              onClick={() => setSubmissionSuccessId(null)}
              className="text-xs text-muted hover:text-text px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* COMPACT ANALYTICS KPI SUMMARY */}
      {viewMode !== 'create' && <AnalyticsSummary reports={reports} />}

      {/* NEARBY ISSUES ROW */}
      {viewMode === 'feed' && <NearbyIssuesCard reports={reports} onSelect={(r) => setSelectedReport(r)} />}

      {/* "MY REPORTS" STATS OVERVIEW (When in My Reports Mode) */}
      {viewMode === 'my_reports' && (
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text font-heading">
              My Submitted Civic Complaints
            </h3>
            <span className="text-xs font-mono text-accent font-bold">
              {myReportsList.length} Total Registered
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border">
              <span className="text-muted block text-[11px]">Total Submitted</span>
              <span className="text-lg font-bold font-mono text-text">{myReportsList.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border">
              <span className="text-muted block text-[11px]">Submitted / Triage</span>
              <span className="text-lg font-bold font-mono text-amber-400">{mySubmitted}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border">
              <span className="text-muted block text-[11px]">In Progress / Work Crew</span>
              <span className="text-lg font-bold font-mono text-purple-400">{myInProgress}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border">
              <span className="text-muted block text-[11px]">Resolved / Disputed</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{myResolved}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6-STEP REPORT SUBMISSION WIZARD */}
      {viewMode === 'create' && (
        <ReportSubmissionWizard
          onSuccess={(newId) => {
            setSubmissionSuccessId(newId);
            setViewMode('feed');
          }}
          onCancel={() => setViewMode('feed')}
        />
      )}

      {/* REPORTS FEED / MY REPORTS MAIN LIST VIEW */}
      {viewMode !== 'create' && (
        <div className="space-y-4">
          {/* Search, Filter & Sorting Bar */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search report ID, title, address, evidence..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {/* Category Dropdown */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="pothole">🚧 Potholes</option>
                  <option value="garbage">🚮 Garbage</option>
                  <option value="waterlogging">🌊 Drainage / Flooding</option>
                  <option value="streetlight">💡 Streetlights</option>
                  <option value="traffic">🚦 Traffic Obstruction</option>
                  <option value="noise">🔊 Noise</option>
                  <option value="other">⚠️ Other</option>
                </select>

                {/* Evidence Status Filter */}
                <select
                  value={filterEvidenceStatus}
                  onChange={(e) => setFilterEvidenceStatus(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer font-medium"
                >
                  <option value="all">All Evidence States</option>
                  <option value="verified">🛡️ Evidence Verified</option>
                  <option value="under_verification">🔍 Under Verification</option>
                  <option value="needs_review">⚠️ Needs Review</option>
                  <option value="submitted">⏳ Submitted</option>
                </select>

                {/* Priority Dropdown */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer font-medium"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-xl border border-border">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-text text-xs focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="priority">Highest Priority</option>
                    <option value="evidence_score">Evidence Score (High)</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="confirmed">Most Confirmed</option>
                    <option value="sla">SLA Deadline</option>
                    <option value="distance">Nearest Distance</option>
                  </select>
                </div>

                {/* Advanced Filter Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    showAdvancedFilters
                      ? 'bg-accent/15 text-accent border-accent/40'
                      : 'bg-surface-2 text-muted hover:text-text border-border'
                  }`}
                  title="Advanced Filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Advanced Filters Drawer Panel */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs animate-in fade-in">
                <div>
                  <label className="block text-muted text-[11px] mb-1 font-mono uppercase">
                    Complaint Lifecycle Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs"
                  >
                    <option value="all">All Lifecycle States</option>
                    <option value="submitted">Submitted</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="disputed">Resolution Disputed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted text-[11px] mb-1 font-mono uppercase">
                    Assigned Municipal Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs"
                  >
                    <option value="all">All Departments</option>
                    {uniqueDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterCategory('all');
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterEvidenceStatus('all');
                      setFilterDepartment('all');
                      setSearchQuery('');
                      setSortBy('priority');
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface text-muted hover:text-text border border-border text-xs font-medium cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reports Grid List */}
          {displayedReports.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-muted mx-auto opacity-40" />
              <h3 className="text-sm font-bold text-text font-heading">No Civic Complaints Found</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No complaint matches your current multi-signal filter criteria. Be the first to report an issue in your area!
              </p>
              <button
                onClick={() => setViewMode('create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs mt-2 cursor-pointer shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report an Issue</span>
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onSelect={(r) => setSelectedReport(r)}
                  onToggleConfirm={(id, e) => {
                    e.stopPropagation();
                    toggleConfirmReport(id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPANDABLE RIGHT-SIDE DETAIL DRAWER */}
      <ReportDetailDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {/* INTERACTIVE CIVIC ISSUE MAP MODAL */}
      <IssueMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        reports={reports}
        onSelectReport={(r) => setSelectedReport(r)}
      />
    </div>
  );
};
