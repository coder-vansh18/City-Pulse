import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

interface CivicDocument {
  id: string;
  title: string;
  category: 'Audit Log' | 'Inspection Certificate' | 'Evidence Summary' | 'SLA Report';
  date: string;
  size: string;
  fileType: 'PDF' | 'JSON' | 'CSV';
  description: string;
  author: string;
}

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const documents: CivicDocument[] = useMemo(() => {
    return [
      {
        id: 'DOC-2026-8942',
        title: 'Arterial Road Cavity AI Forensics & EXIF Verification Report',
        category: 'Evidence Summary',
        date: 'Sep 25, 2026',
        size: '2.4 MB',
        fileType: 'PDF',
        description: 'Complete multi-signal audit dossier including mobile camera EXIF headers, GPS radius telemetry, and vision classification scores.',
        author: 'CityPulse Evidence Engine v3',
      },
      {
        id: 'DOC-2026-8935',
        title: 'Waterfront Culvert Debris Clearance Sign-off Certificate',
        category: 'Inspection Certificate',
        date: 'Sep 24, 2026',
        size: '1.8 MB',
        fileType: 'PDF',
        description: 'Municipal engineering supervisor sign-off with Before/After photographic comparison and hydrological flow restoration metrics.',
        author: 'Water & Drainage Authority Taskforce',
      },
      {
        id: 'DOC-2026-0925-LOG',
        title: 'City Telemetry Raw Stream Anomaly Log & Fusion Matrix',
        category: 'Audit Log',
        date: 'Sep 25, 2026',
        size: '4.1 MB',
        fileType: 'JSON',
        description: 'Continuous normalized telemetry event log with cross-feed correlation confidence metrics across 9 municipal zones.',
        author: 'CityPulse Ingestion Pipeline',
      },
      {
        id: 'DOC-2026-Q3-SLA',
        title: 'Q3 Municipal Civic Issue SLA Compliance & Resolution Ledger',
        category: 'SLA Report',
        date: 'Sep 23, 2026',
        size: '890 KB',
        fileType: 'CSV',
        description: 'Aggregated department turnaround times, on-time resolution percentages, and citizen corroboration scores.',
        author: 'Smart City Operations Center',
      },
    ];
  }, []);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mId = doc.id.toLowerCase().includes(q);
        const mTitle = doc.title.toLowerCase().includes(q);
        const mDesc = doc.description.toLowerCase().includes(q);
        const mAuthor = doc.author.toLowerCase().includes(q);
        if (!mId && !mTitle && !mDesc && !mAuthor) return false;
      }
      return true;
    });
  }, [documents, categoryFilter, searchQuery]);

  const handleDownload = (doc: CivicDocument) => {
    alert(`Downloading ${doc.title} (${doc.fileType}) from CityPulse secure archives...`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-text tracking-tight">
              Civic Evidence & Document Archives
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold border border-indigo-500/30">
              {filteredDocs.length} Verified Documents
            </span>
          </div>
          <p className="text-xs text-muted">
            Official municipal inspection certificates, photographic forensics dossiers, and exportable telemetry audit logs.
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
            placeholder="Search document ID, title, author, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2/70 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Document Types</option>
            <option value="Evidence Summary">Evidence Summaries</option>
            <option value="Inspection Certificate">Inspection Certificates</option>
            <option value="Audit Log">Audit Logs</option>
            <option value="SLA Report">SLA Reports</option>
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

      {/* Document Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const isPdf = doc.fileType === 'PDF';
            const isJson = doc.fileType === 'JSON';

            return (
              <div
                key={doc.id}
                className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-border/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-2 text-text border border-border">
                      {doc.id}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isPdf
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : isJson
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {doc.fileType} • {doc.size}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text font-heading mb-1.5 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-text/80 leading-relaxed font-sans mb-3">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    <span>{doc.date}</span>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{doc.author}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text font-semibold border border-border transition-colors cursor-pointer text-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-accent" />
                      <span>Download</span>
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
          title="No documents available"
          description="Try clearing your search query or filter to view available civic evidence records."
        />
      )}
    </div>
  );
};
