import React from 'react';
import { Sparkles, AlertTriangle, ArrowUpRight, Cpu } from 'lucide-react';
import { Card } from '../common/Card';
import { AiAnomalyItem } from '../../types/feedHealth';
import { FeedType } from '../../api/types';

interface AiAnomalyDetectionCardProps {
  anomalies: AiAnomalyItem[];
  onInvestigate: (feedId: FeedType) => void;
}

export const AiAnomalyDetectionCard: React.FC<AiAnomalyDetectionCardProps> = ({
  anomalies,
  onInvestigate,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider">
              AI Anomaly Detection
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold">
              DEMO AI ENGINE
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted">Z-Score &gt; 2.5σ</span>
        </div>

        <p className="text-xs text-muted mb-4">
          Automated diurnal curve matching & statistical deviation detection across ingested streams
        </p>

        <div className="space-y-3">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-3.5 rounded-xl bg-surface-2/40 border border-border/50 hover:border-purple-500/40 transition-all text-xs"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="font-heading font-bold text-text block">
                      {anom.title}
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase">
                      Feed: {anom.feedName}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                  {anom.anomalyScore}% Anomaly
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-surface p-2.5 rounded-lg border border-border/40 mb-2.5">
                <div>
                  <span className="text-muted block text-[10px]">Expected Baseline:</span>
                  <span className="text-text font-bold">{anom.expected}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Observed Telemetry:</span>
                  <span className="text-rose-500 font-bold">{anom.observed}</span>
                </div>
              </div>

              <button
                onClick={() => onInvestigate(anom.feedId)}
                className="w-full py-1.5 px-3 rounded-lg bg-surface-2 hover:bg-surface text-text hover:text-accent border border-border text-[11px] font-mono font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>Investigate Anomaly</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>Model: Isolation Forest + LSTM Baseline</span>
        <span className="text-purple-400 font-bold">● Active 24/7</span>
      </div>
    </Card>
  );
};
