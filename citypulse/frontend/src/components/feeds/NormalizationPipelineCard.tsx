import React, { useState } from 'react';
import {
  Database,
  Layers,
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../common/Card';

interface NormalizationPipelineCardProps {
  onOpenArchitectureModal: () => void;
}

export const NormalizationPipelineCard: React.FC<NormalizationPipelineCardProps> = ({
  onOpenArchitectureModal,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      stepNum: '01',
      title: 'INGEST & PARSE',
      subtitle: 'Heterogeneous Raw Streams',
      description: 'Ingests REST, Protobuf, MQTT & WebSockets. Handles epoch seconds (Weather), local 24h timestamps (Transit), Socrata US strings (311), and ISO-8601.',
      color: 'text-accent',
      borderColor: 'border-accent',
      bgGlow: 'bg-accent/10',
    },
    {
      stepNum: '02',
      title: 'MAP & ASSIGN',
      subtitle: 'Severity & Spatial Snapping',
      description: 'Converts disparate physical units (m/s, °C, dBA, MW, AQI) to a normalized 0.0–1.0 civic severity curve and snaps coordinates to 9 municipal zones.',
      color: 'text-purple-400',
      borderColor: 'border-purple-400',
      bgGlow: 'bg-purple-400/10',
    },
    {
      stepNum: '03',
      title: 'NORMALIZE',
      subtitle: 'Canonical UTC Schema',
      description: 'Enforces strict TypeScript/Pydantic schemas with UTC ISO timestamps, exponential confidence decay scoring, and deduplication verification.',
      color: 'text-status-calm',
      borderColor: 'border-status-calm',
      bgGlow: 'bg-status-calm/10',
    },
    {
      stepNum: '04',
      title: 'FUSE',
      subtitle: 'Cross-Feed AI Intelligence',
      description: 'Correlates spatial-temporal clusters across feeds into unified CityPulse Pulse scores, anomaly alerts, and real-time WebSocket distribution.',
      color: 'text-indigo-400',
      borderColor: 'border-indigo-400',
      bgGlow: 'bg-indigo-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Step Pipeline */}
      <Card className="p-6 bg-surface border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-base font-bold text-text font-heading flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              <span>How Heterogeneous Feeds Are Normalized</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Civic feeds arrive in completely different raw schemas, time representations, and metric formats.
              Our pipeline normalizes everything into a unified UTC schema in 4 deterministic steps:
            </p>
          </div>

          <button
            onClick={onOpenArchitectureModal}
            className="px-3.5 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-heading font-semibold flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer"
          >
            <span>View Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
          {steps.map((step, idx) => {
            const isSelected = selectedStep === idx + 1;

            return (
              <div
                key={step.stepNum}
                onClick={() => setSelectedStep(idx + 1)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `${step.bgGlow} ${step.borderColor} shadow-sm ring-1 ring-accent/30`
                    : 'bg-surface-2/40 border-border/60 hover:bg-surface-2 hover:border-border'
                }`}
              >
                <div className={`text-xs font-mono font-bold ${step.color} mb-1 flex items-center justify-between`}>
                  <span>{step.stepNum}. {step.title}</span>
                  {isSelected && <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border">Active View</span>}
                </div>
                <h5 className="font-heading font-semibold text-sm text-text mb-2">
                  {step.subtitle}
                </h5>
                <p className="text-xs text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Telemetry Stats Under Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60 text-xs font-mono">
          <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40">
            <span className="text-muted block text-[10px] uppercase">Processing Velocity:</span>
            <span className="text-text font-bold text-sm">423 / min</span>
            <span className="text-emerald-500 block text-[10px]">Nominal throughput</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40">
            <span className="text-muted block text-[10px] uppercase">Average Latency:</span>
            <span className="text-text font-bold text-sm">256 ms</span>
            <span className="text-emerald-500 block text-[10px]">Target &lt;300ms</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40">
            <span className="text-muted block text-[10px] uppercase">Schema Error Rate:</span>
            <span className="text-text font-bold text-sm">0.5 %</span>
            <span className="text-emerald-500 block text-[10px]">99.5% adherence</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-2/40 border border-border/40">
            <span className="text-muted block text-[10px] uppercase">Pipeline Health:</span>
            <span className="text-status-calm font-bold text-sm">98.5 %</span>
            <span className="text-status-calm block text-[10px]">All stages green</span>
          </div>
        </div>
      </Card>

      {/* Dual Cards: Data Pipeline Health + CityPulse Fusion Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Data Pipeline Health */}
        <Card className="p-5 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                Data Pipeline Health
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-calm/15 text-status-calm border border-status-calm/30 font-bold">
                ● HEALTHY
              </span>
            </div>

            {/* Health Bar */}
            <div className="my-3">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-text font-bold">Aggregate Ingestion Integrity</span>
                <span className="text-emerald-500 font-bold">98.5%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-2 overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: '98.5%' }} />
                <div className="h-full bg-surface-2" style={{ width: '1.5%' }} />
              </div>
            </div>

            <p className="text-xs text-muted mb-4">
              Real-time pipeline monitoring of all serialization, geographic bounding, and message bus queues.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono p-3 rounded-xl bg-surface-2/40 border border-border/40">
            <div>
              <span className="text-muted block text-[10px]">Processing</span>
              <span className="text-text font-bold">423/min</span>
            </div>
            <div>
              <span className="text-muted block text-[10px]">Avg Latency</span>
              <span className="text-text font-bold">256ms</span>
            </div>
            <div>
              <span className="text-muted block text-[10px]">Error Rate</span>
              <span className="text-emerald-500 font-bold">0.5%</span>
            </div>
          </div>
        </Card>

        {/* Card 2: CityPulse Fusion Engine */}
        <Card className="p-5 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-accent" />
                CityPulse Fusion Engine
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold">
                AI FUSION
              </span>
            </div>

            <p className="text-xs text-muted mb-4">
              "Combining multiple data streams for smarter, predictive city operations and rapid anomaly isolation."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-4">
              <div className="p-2.5 rounded-xl bg-surface-2/50 border border-border text-center">
                <span className="text-muted block text-[10px]">Active Sources</span>
                <span className="text-text font-bold text-base">6</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-2/50 border border-border text-center">
                <span className="text-muted block text-[10px]">Normalized/min</span>
                <span className="text-text font-bold text-base">423</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-2/50 border border-border text-center">
                <span className="text-muted block text-[10px]">Correlated</span>
                <span className="text-accent font-bold text-base">18</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-2/50 border border-border text-center">
                <span className="text-muted block text-[10px]">AI Confidence</span>
                <span className="text-purple-400 font-bold text-base">92%</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenArchitectureModal}
            className="w-full py-2 px-3 rounded-xl bg-surface-2 hover:bg-surface text-text hover:text-accent border border-border hover:border-accent/40 text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>View Architecture Diagram</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>
      </div>
    </div>
  );
};
