import React from 'react';
import { Network, Sparkles, ArrowRight, Layers, ShieldAlert } from 'lucide-react';
import { Card } from '../common/Card';
import { CrossFeedCorrelationItem } from '../../types/feedHealth';
import { FeedType } from '../../api/types';

interface CrossFeedCorrelationCardProps {
  correlations: CrossFeedCorrelationItem[];
  onInvestigate: (correlation: CrossFeedCorrelationItem) => void;
}

export const CrossFeedCorrelationCard: React.FC<CrossFeedCorrelationCardProps> = ({
  correlations,
  onInvestigate,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider">
              Cross-Feed Multi-Stream Correlation
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold">
              FUSION ENGINE
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted">Multi-Source</span>
        </div>

        <p className="text-xs text-muted mb-4">
          CityPulse combines disparate telemetry streams to detect compound civic risks before cascading failures occur
        </p>

        <div className="space-y-3.5">
          {correlations.map((corr) => (
            <div
              key={corr.id}
              className="p-4 rounded-xl bg-surface-2/40 border border-border/50 hover:border-accent/40 transition-all text-xs"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-heading font-bold text-text text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>{corr.title}</span>
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30 flex-shrink-0">
                  {corr.confidenceScore}% Confidence
                </span>
              </div>

              {/* Feed Source Badges */}
              <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                <span className="text-[10px] font-mono text-muted uppercase">Sources:</span>
                {corr.sources.map((src, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-surface text-text border border-border uppercase"
                  >
                    {src}
                  </span>
                ))}
                <span className="text-[10px] font-mono text-accent font-bold">➔ FUSED</span>
              </div>

              <p className="text-[11px] text-muted leading-relaxed mb-3">
                {corr.hypothesis}
              </p>

              <div className="p-2.5 rounded-lg bg-surface border border-border/60 text-[11px] font-mono mb-3">
                <span className="text-muted block text-[10px] uppercase font-bold text-accent">
                  Action Recommendation:
                </span>
                <span className="text-text font-medium">{corr.actionRecommendation}</span>
              </div>

              <button
                onClick={() => onInvestigate(corr)}
                className="w-full py-1.5 px-3 rounded-lg bg-accent text-white hover:bg-accent-hover text-[11px] font-heading font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>Investigate Correlation Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>Spatial-Temporal Window: ±15 min / 500m</span>
        <span className="text-accent font-bold">● Multi-Source Fusion</span>
      </div>
    </Card>
  );
};
