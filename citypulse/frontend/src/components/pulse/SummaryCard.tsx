import React from 'react';
import { Sparkles, Cpu, Clock } from 'lucide-react';
import { Summary, Status } from '../../api/types';
import { Card } from '../common/Card';
import { InfoPopover } from '../common/InfoPopover';

interface SummaryCardProps {
  summary: Summary;
  status: Status;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, status, className }) => {
  return (
    <Card glowStatus={status} className={`relative overflow-hidden flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted font-heading">
              Grounded Civic Assessment
            </span>
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                summary.generated_by === 'llm'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-accent/10 text-accent border-accent/30'
              }`}
            >
              {summary.generated_by === 'llm' ? <Cpu className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              {summary.generated_by === 'llm' ? 'AI Synthesized' : 'Template Verified'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
            <Clock className="w-3 h-3" />
            <span>{new Date(summary.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        <h3
          className="text-lg md:text-xl font-bold text-text font-heading mb-2 leading-snug"
          aria-live="polite"
        >
          {summary.headline}
        </h3>

        <p className="text-sm text-text/80 leading-relaxed font-sans mb-4">
          {summary.body}
        </p>
      </div>

      <div className="pt-3 border-t border-border/50 flex items-center justify-between">
        <InfoPopover title="Telemetry Signal Grounding" items={summary.grounded_on} />
        <span className="text-[11px] text-muted italic">Epistemic honesty: Correlations are unconfirmed links.</span>
      </div>
    </Card>
  );
};
