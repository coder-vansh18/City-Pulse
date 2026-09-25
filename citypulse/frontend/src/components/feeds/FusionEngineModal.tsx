import React from 'react';
import { X, Network, Database, Cpu, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FusionEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FusionEngineModal: React.FC<FusionEngineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const pipelineStages = [
    { num: '01', title: 'Raw Feeds', desc: 'Weather, GTFS-RT, 311 Socrata, Air Quality, Power SCADA, Acoustic IoT' },
    { num: '02', title: 'Ingestion Workers', desc: 'Asynchronous event loops polling and consuming WebSockets / Protobuf streams' },
    { num: '03', title: 'Parsing & Cleaning', desc: 'Strip vendor anomalies, parse varied timestamp standards into ISO-8601 UTC' },
    { num: '04', title: 'Normalization', desc: 'Map disparate values to a continuous 0.0–1.0 severity spectrum' },
    { num: '05', title: 'Spatial Mapping', desc: 'Snap geospatial coordinates into 9 canonical city sector zones' },
    { num: '06', title: 'AI Anomaly Detection', desc: 'Statistical Z-score & LSTM diurnal baseline divergence scoring' },
    { num: '07', title: 'Cross-Feed Correlation', desc: 'Multi-stream spatial-temporal clustering & compound risk synthesis' },
    { num: '08', title: 'Unified City Event', desc: 'Broadcast to LivePulse, MapView, Alert Matrix & Operator Dashboard' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border bg-surface-2/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text font-heading">
                CityPulse End-to-End Fusion Architecture
              </h3>
              <p className="text-xs text-muted">
                From disparate municipal data feeds to unified real-time civic intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border text-xs text-muted leading-relaxed">
            CityPulse treats all incoming civic data as a continuous multi-dimensional stream. Rather than siloing transit delays from weather shifts or power outages, our pipeline fuses them to calculate real-time civic strain and prevent cascading city infrastructure failures.
          </div>

          {/* 8-Stage Architecture Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {pipelineStages.map((st, idx) => (
              <div
                key={st.num}
                className="p-3.5 rounded-xl bg-surface-2/50 border border-border hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-accent mb-1">
                    <span>STAGE {st.num}</span>
                    {idx < 7 && <ArrowRight className="w-3 h-3 text-muted" />}
                  </div>
                  <h5 className="font-heading font-bold text-sm text-text mb-1">
                    {st.title}
                  </h5>
                </div>
                <p className="text-[11px] text-muted leading-snug mt-2">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Key Architectural Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-2/30 border border-border">
              <div className="font-bold text-text font-heading mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Zero-Silo Normalization
              </div>
              <p className="text-muted text-[11px]">
                Every event receives a normalized timestamp, geographic polygon, and uniform 0..1 severity index.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2/30 border border-border">
              <div className="font-bold text-text font-heading mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Dynamic Weighting
              </div>
              <p className="text-muted text-[11px]">
                If a feed degrades or goes offline, the pulse fusion engine automatically renormalizes weights.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2/30 border border-border">
              <div className="font-bold text-text font-heading mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                Sub-300ms SLA
              </div>
              <p className="text-muted text-[11px]">
                High-performance async queues guarantee rapid ingestion from edge IoT to operator screens.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-surface-2/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-accent text-white font-heading font-semibold hover:bg-accent-hover text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
