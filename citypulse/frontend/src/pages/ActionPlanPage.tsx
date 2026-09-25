import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Send,
  Search,
  Filter,
  ShieldAlert,
  MapPin,
  Truck,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCitizenReportStore } from '../store/useCitizenReportStore';
import { EmptyState } from '../components/common/EmptyState';

interface ActionPlanItem {
  id: string;
  title: string;
  category: string;
  zone: string;
  department: string;
  fieldCrew: string;
  status: 'in_progress' | 'dispatched' | 'completed' | 'scheduled';
  slaDeadline: string;
  progressPercent: number;
  steps: { label: string; completed: boolean }[];
  associatedReportId?: string;
}

export const ActionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { reports } = useCitizenReportStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  const actionPlans: ActionPlanItem[] = useMemo(() => {
    return [
      {
        id: 'PLAN-2026-01',
        title: 'Arterial Road Deep Cavity Resurfacing Protocol',
        category: 'Roads & Infrastructure',
        zone: 'Downtown Core (Z5)',
        department: 'Roads & Infrastructure',
        fieldCrew: 'Rapid Asphalt Response Team #4',
        status: 'in_progress',
        slaDeadline: '4 Hours Remaining',
        progressPercent: 65,
        associatedReportId: 'REP-2026-8942',
        steps: [
          { label: 'Automated AI Vision Triage & Safety Scoring', completed: true },
          { label: 'Traffic Signal Priority Bypass & Detour Signage', completed: true },
          { label: 'Field Resurfacing Unit On-Site Milling', completed: true },
          { label: 'Hot Asphalt Pour & Compactor Verification', completed: false },
          { label: 'Inspector Photo Forensics Sign-off', completed: false },
        ],
      },
      {
        id: 'PLAN-2026-02',
        title: 'Waterfront Culvert Subterranean Clearance & Pressure Release',
        category: 'Water & Drainage Authority',
        zone: 'Waterfront Promenade (Z4)',
        department: 'Water & Drainage Authority',
        fieldCrew: 'Hydraulic Suction Taskforce #12',
        status: 'completed',
        slaDeadline: 'SLA Met (100% On-Time)',
        progressPercent: 100,
        associatedReportId: 'REP-2026-8935',
        steps: [
          { label: 'Hydraulic Backpressure Sensor Trip Flagged', completed: true },
          { label: 'Citizen Corroboration Photo Ingestion', completed: true },
          { label: 'Suction Unit Debris Vacuum Clearance', completed: true },
          { label: 'Restored Gravitational Drainage Flow Confirmed', completed: true },
        ],
      },
      {
        id: 'PLAN-2026-03',
        title: 'Bus Terminal Waste Clearance & Heavy Sweep Protocol',
        category: 'Waste Management',
        zone: 'East Hub (Z6)',
        department: 'Waste Management',
        fieldCrew: 'Commercial Sanitation Truck #08',
        status: 'dispatched',
        slaDeadline: '14 Hours Remaining',
        progressPercent: 30,
        associatedReportId: 'REP-2026-8941',
        steps: [
          { label: 'Citizen Multi-Image Submission Verified', completed: true },
          { label: 'Commercial Route Dispatch Assigned', completed: true },
          { label: 'Bulk Refuse Compaction & Sorting', completed: false },
          { label: 'Perimeter Disinfection & Sweep Complete', completed: false },
        ],
      },
    ];
  }, []);

  const filteredPlans = useMemo(() => {
    return actionPlans.filter((p) => {
      if (filterDept !== 'all' && p.department !== filterDept) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mId = p.id.toLowerCase().includes(q);
        const mTitle = p.title.toLowerCase().includes(q);
        const mCrew = p.fieldCrew.toLowerCase().includes(q);
        const mZone = p.zone.toLowerCase().includes(q);
        if (!mId && !mTitle && !mCrew && !mZone) return false;
      }
      return true;
    });
  }, [actionPlans, filterDept, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-text tracking-tight">
              Civic Action Plans & Field Dispatches
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-mono font-bold border border-accent/30">
              {filteredPlans.length} Active Plans
            </span>
          </div>
          <p className="text-xs text-muted">
            Automated operational taskforce coordination, step-by-step mitigation tracking, and municipal SLA monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text border border-border text-xs font-semibold cursor-pointer transition-colors"
          >
            ← Back to Reports
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search action plans, assigned crews, zones, or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2/70 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Taskforces</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            <option value="Water & Drainage Authority">Water & Drainage Authority</option>
            <option value="Waste Management">Waste Management</option>
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

      {/* Action Plans Grid */}
      {filteredPlans.length > 0 ? (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const isDone = plan.status === 'completed';

            return (
              <div
                key={plan.id}
                className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-border/80 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-surface-2 text-text border border-border">
                        {plan.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : plan.status === 'in_progress'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {plan.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-2 text-muted border border-border">
                        {plan.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-text font-heading">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>{plan.zone}</span>
                      <span>•</span>
                      <Truck className="w-3.5 h-3.5 text-muted" />
                      <span>{plan.fieldCrew}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-muted block">
                      Target SLA
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {plan.slaDeadline}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-muted">Mitigation Progress</span>
                    <span className="font-bold text-text">{plan.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden border border-border/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-accent'
                      }`}
                      style={{ width: `${plan.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Step Checklist */}
                <div className="space-y-2 bg-surface-2/30 border border-border/60 rounded-xl p-3.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted block mb-1">
                    Operational Execution Checklist:
                  </span>
                  <div className="space-y-1.5">
                    {plan.steps.map((st, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            st.completed
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-surface-2 border border-border text-muted'
                          }`}
                        >
                          {st.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted" />}
                        </div>
                        <span
                          className={`font-sans ${
                            st.completed ? 'text-text font-medium' : 'text-muted'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                  <span>Linked Report: <strong className="font-mono text-text">{plan.associatedReportId}</strong></span>
                  <button
                    onClick={() => {
                      alert(`Inspection log updated for ${plan.id}. Status notified to municipal dispatch.`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text font-semibold border border-border transition-colors cursor-pointer text-xs"
                  >
                    Update Dispatch Log
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No matching action plans"
          description="Try clearing your search query or department filter to view scheduled action plans."
        />
      )}
    </div>
  );
};
