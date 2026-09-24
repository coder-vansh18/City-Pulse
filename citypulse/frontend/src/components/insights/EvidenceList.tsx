import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, Activity } from 'lucide-react';
import { EvidenceItem } from '../../api/types';

export const EvidenceList: React.FC<{ evidence: EvidenceItem[] }> = ({ evidence }) => {
  const [expanded, setExpanded] = useState(false);

  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-medium transition-colors cursor-pointer"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>{expanded ? 'Hide evidence breakdown' : `View ${evidence.length} evidence metrics`}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 border border-border rounded-xl p-3 bg-surface-2/30 animate-in fade-in duration-150">
          {evidence.map((ev, idx) => {
            const ratio = ev.baseline > 0 ? (ev.value / ev.baseline).toFixed(1) : `${ev.value}x`;
            const deviationLabel = ev.zscore > 1.0 ? `${ratio}× normal baseline` : 'elevated deviation';
            return (
              <div key={idx} className="flex items-center justify-between text-xs bg-surface p-2 rounded-lg border border-border/40">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  <div>
                    <span className="font-semibold text-text uppercase tracking-wide text-[11px] mr-1">
                      {ev.feed}:
                    </span>
                    <span className="text-muted">{ev.metric}</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-text">{ev.value}</div>
                  <div className="text-[10px] text-muted">
                    Baseline: {ev.baseline} ({deviationLabel})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
