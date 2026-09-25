import React, { useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  Clock,
  Zap,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Card } from '../common/Card';

interface FeedDemoControlsProps {
  onSimulateFailure: () => void;
  onSimulateLatency: () => void;
  onSimulateSpike: () => void;
  onRestoreAll: () => void;
  activeScenarioName?: string | null;
}

export const FeedDemoControls: React.FC<FeedDemoControlsProps> = ({
  onSimulateFailure,
  onSimulateLatency,
  onSimulateSpike,
  onRestoreAll,
  activeScenarioName,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerAction = (label: string, action: () => void) => {
    action();
    setToastMessage(`Triggered: ${label}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <Card className="p-5 bg-surface border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider">
              Hackathon Judge Demo Controls
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-bold">
              INTERACTIVE SIMULATOR
            </span>
          </div>
          <p className="text-xs text-muted">
            Inject realistic failure modes, latency spikes, and ingestion floods to verify real-time degradation & recalculations
          </p>
        </div>

        {activeScenarioName && (
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Active Mode: {activeScenarioName}
          </span>
        )}
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => triggerAction('Simulate Feed Failure', onSimulateFailure)}
          className="p-3 rounded-xl bg-surface-2/60 hover:bg-rose-500/10 border border-border hover:border-rose-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-muted uppercase">Chaos Eng</span>
          </div>
          <div className="font-heading font-bold text-xs text-text group-hover:text-rose-500 transition-colors">
            Simulate Feed Failure
          </div>
          <div className="text-[10px] text-muted mt-0.5">
            Sets Power to Offline & Transit to Degraded
          </div>
        </button>

        <button
          onClick={() => triggerAction('Simulate Latency Spike', onSimulateLatency)}
          className="p-3 rounded-xl bg-surface-2/60 hover:bg-amber-500/10 border border-border hover:border-amber-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-muted uppercase">Latency</span>
          </div>
          <div className="font-heading font-bold text-xs text-text group-hover:text-amber-500 transition-colors">
            Simulate Latency Spike
          </div>
          <div className="text-[10px] text-muted mt-0.5">
            Spikes API response times to &gt;1,200ms
          </div>
        </button>

        <button
          onClick={() => triggerAction('Simulate Ingestion Surge', onSimulateSpike)}
          className="p-3 rounded-xl bg-surface-2/60 hover:bg-indigo-500/10 border border-border hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Zap className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-muted uppercase">Throughput</span>
          </div>
          <div className="font-heading font-bold text-xs text-text group-hover:text-indigo-500 transition-colors">
            Simulate Event Surge
          </div>
          <div className="text-[10px] text-muted mt-0.5">
            Floods throughput to 1,450 events/min
          </div>
        </button>

        <button
          onClick={() => triggerAction('Restore All Feeds', onRestoreAll)}
          className="p-3 rounded-xl bg-surface-2/60 hover:bg-emerald-500/10 border border-border hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <RotateCcw className="w-4 h-4 text-emerald-500 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-mono text-muted uppercase">Reset</span>
          </div>
          <div className="font-heading font-bold text-xs text-text group-hover:text-emerald-500 transition-colors">
            Restore All to Healthy
          </div>
          <div className="text-[10px] text-muted mt-0.5">
            Resets all 6 feeds to 100% nominal health
          </div>
        </button>
      </div>

      {toastMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-accent/15 border border-accent/30 text-accent font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </Card>
  );
};
