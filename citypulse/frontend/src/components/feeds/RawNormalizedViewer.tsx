import React, { useState } from 'react';
import { ArrowDown, Copy, Check, Code, FileJson } from 'lucide-react';

interface RawNormalizedViewerProps {
  rawJson: Record<string, any>;
  normalizedJson: Record<string, any>;
  feedId: string;
}

export const RawNormalizedViewer: React.FC<RawNormalizedViewerProps> = ({
  rawJson,
  normalizedJson,
  feedId,
}) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedNorm, setCopiedNorm] = useState(false);

  const handleCopy = (data: any, type: 'raw' | 'norm') => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    if (type === 'raw') {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } else {
      setCopiedNorm(true);
      setTimeout(() => setCopiedNorm(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
            <FileJson className="w-4 h-4 text-accent" />
            Raw → Normalized Transformation Pipeline
          </h4>
          <p className="text-[11px] text-muted">
            Inspect heterogeneous vendor payloads mapped to the canonical CityPulse schema
          </p>
        </div>
      </div>

      {/* Raw Event Container */}
      <div className="rounded-xl border border-border/80 bg-surface-2/40 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 border-b border-border text-[11px] font-mono">
          <span className="font-bold text-amber-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            01. RAW VENDOR PAYLOAD (Ingested via {feedId})
          </span>
          <button
            onClick={() => handleCopy(rawJson, 'raw')}
            className="flex items-center gap-1 text-muted hover:text-text text-[10px] px-2 py-0.5 rounded bg-surface border border-border"
          >
            {copiedRaw ? <Check className="w-3 h-3 text-status-calm" /> : <Copy className="w-3 h-3" />}
            {copiedRaw ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-3 text-[11px] font-mono text-text/90 overflow-x-auto leading-relaxed max-h-48 bg-slate-950/40 text-emerald-300">
          {JSON.stringify(rawJson, null, 2)}
        </pre>
      </div>

      {/* Transformation Pipeline Arrow */}
      <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted py-1">
        <div className="h-px w-16 bg-border" />
        <span className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-bold flex items-center gap-1">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          CityPulse Schema Normalizer (UTC + 0..1 Severity)
        </span>
        <div className="h-px w-16 bg-border" />
      </div>

      {/* Normalized Event Container */}
      <div className="rounded-xl border border-border/80 bg-surface-2/40 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 border-b border-border text-[11px] font-mono">
          <span className="font-bold text-status-calm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-calm" />
            02. CANONICAL NORMALIZED EVENT (Emitted to City Event Bus)
          </span>
          <button
            onClick={() => handleCopy(normalizedJson, 'norm')}
            className="flex items-center gap-1 text-muted hover:text-text text-[10px] px-2 py-0.5 rounded bg-surface border border-border"
          >
            {copiedNorm ? <Check className="w-3 h-3 text-status-calm" /> : <Copy className="w-3 h-3" />}
            {copiedNorm ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-3 text-[11px] font-mono text-text/90 overflow-x-auto leading-relaxed max-h-48 bg-slate-950/40 text-cyan-300">
          {JSON.stringify(normalizedJson, null, 2)}
        </pre>
      </div>
    </div>
  );
};
