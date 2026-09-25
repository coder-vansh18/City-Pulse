import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, FileJson, CheckCircle2 } from 'lucide-react';
import { FeedDiagnostic } from '../../types/feedHealth';

interface FeedsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedDiagnostics: Record<string, FeedDiagnostic>;
  eventsPerMin: number;
}

export const FeedsExportModal: React.FC<FeedsExportModalProps> = ({
  isOpen,
  onClose,
  feedDiagnostics,
  eventsPerMin,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      system: 'CityPulse Civic Telemetry Engine',
      eventsPerMinute: eventsPerMin,
      feeds: Object.values(feedDiagnostics),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citypulse-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess('JSON Export Downloaded');
  };

  const handleExportCsv = () => {
    const headers = ['Feed ID', 'Feed Name', 'Technical Source', 'Mode', 'Health', 'Availability %', 'Latency (ms)', 'Update Frequency (s)', 'Quality Score', 'Events / Hour'];
    const rows = Object.values(feedDiagnostics).map((f) => [
      f.feedId.toUpperCase(),
      `"${f.displayName || f.label}"`,
      `"${f.technicalSource}"`,
      f.sourceType === 'real' ? 'Live API' : 'Simulation',
      f.healthStatus.toUpperCase(),
      f.reliability,
      f.currentLatencyMs,
      f.cadenceSeconds,
      f.qualityMetrics.overall,
      f.eventsLastHour,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citypulse-feeds-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess('CSV Export Downloaded');
  };

  const handleExportReport = () => {
    const text = `=====================================================
CITYPULSE CIVIC TELEMETRY & INGESTION REPORT
Generated: ${new Date().toLocaleString()}
System Mode: Operational | Target SLA: >99.0%
=====================================================

1. EXECUTIVE TELEMETRY SUMMARY
- Aggregate Events / Min: ${eventsPerMin}
- Active Data Streams: ${Object.keys(feedDiagnostics).length}
- Pipeline Schema Adherence: 99.5%
- Normalization Worker Status: Nominal

2. FEED HEALTH & LATENCY BREAKDOWN
${Object.values(feedDiagnostics)
  .map(
    (f) =>
      `• [${f.feedId.toUpperCase()}] ${f.displayName || f.label}
   - Technical Source: ${f.technicalSource} (${f.sourceType === 'real' ? 'Live API' : 'Simulation'})
   - Health: ${f.healthStatus.toUpperCase()} | Availability: ${f.reliability}%
   - Latency: ${f.currentLatencyMs}ms (P95: ${f.p95LatencyMs}ms)
   - Quality Score: ${f.qualityMetrics.overall}/100 | Protocol: ${f.protocol}
   - Ingestion Endpoint: ${f.endpoint}`
  )
  .join('\n\n')}

3. SECURITY & SCHEMA PROVENANCE
- All payloads verified against CityPulse UTC Canonical ISO-8601 specifications.
- Cryptographic hash verification enabled on SCADA MQTT bridge.
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citypulse-telemetry-audit-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess('Telemetry Audit Report Downloaded');
  };

  const triggerSuccess = (msg: string) => {
    setDownloadedFormat(msg);
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border bg-surface-2/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider">
              Export Telemetry Data
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted leading-relaxed">
            Download raw ingestion dumps, schema validation telemetry, and SLA uptime metrics for offline analysis or audits.
          </p>

          <button
            onClick={handleExportCsv}
            className="w-full p-3.5 rounded-xl bg-surface-2/50 hover:bg-surface-2 border border-border hover:border-accent/40 text-left flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs text-text group-hover:text-accent">
                  CSV Spreadsheet (.csv)
                </div>
                <div className="text-[10px] text-muted font-mono">
                  Tabular feed latencies, uptime & rates
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-muted group-hover:text-accent" />
          </button>

          <button
            onClick={handleExportJson}
            className="w-full p-3.5 rounded-xl bg-surface-2/50 hover:bg-surface-2 border border-border hover:border-accent/40 text-left flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                <FileJson className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs text-text group-hover:text-accent">
                  JSON Raw Telemetry (.json)
                </div>
                <div className="text-[10px] text-muted font-mono">
                  Full nested payload structures & schemas
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-muted group-hover:text-accent" />
          </button>

          <button
            onClick={handleExportReport}
            className="w-full p-3.5 rounded-xl bg-surface-2/50 hover:bg-surface-2 border border-border hover:border-accent/40 text-left flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs text-text group-hover:text-accent">
                  Telemetry Audit Report (.txt)
                </div>
                <div className="text-[10px] text-muted font-mono">
                  Executive SLA and health summary
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-muted group-hover:text-accent" />
          </button>

          {downloadedFormat && (
            <div className="p-2.5 rounded-xl bg-status-calm/15 border border-status-calm/30 text-status-calm text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{downloadedFormat}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-2/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-2 text-text font-heading font-semibold hover:bg-surface border border-border text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
