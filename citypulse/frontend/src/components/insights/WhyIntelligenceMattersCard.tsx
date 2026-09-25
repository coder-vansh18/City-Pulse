import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Activity,
  GitMerge,
  HelpCircle,
  ShieldCheck,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const WhyIntelligenceMattersCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'City Telemetry Ingestion',
      desc: 'Real-time multi-feed ingestion across weather, transit, power, air quality, acoustic, and 311 incident streams.',
      icon: Cpu,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      num: '02',
      title: 'Single-Feed Anomaly Detection',
      desc: 'Statistical deviations exceeding baseline standard deviations (Z > 2.5σ) are flagged in real-time.',
      icon: Activity,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      num: '03',
      title: 'Cross-Feed Correlation Fusion',
      desc: 'Spatial and temporal windows are overlaid to detect coincidences across distinct municipal domains.',
      icon: GitMerge,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      num: '04',
      title: 'Epistemic Evidence Scoring',
      desc: 'Quantifies temporal overlap %, spatial proximity %, and historical similarity without assuming causation.',
      icon: ShieldCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      num: '05',
      title: 'Actionable Civic Triage',
      desc: 'Translates raw mathematical correlations into prioritized field dispatch recommendations for city operators.',
      icon: Send,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text font-heading">
              Why Cross-Feed Civic Intelligence Matters
            </h3>
            <p className="text-xs text-muted">
              How CityPulse transforms disconnected municipal sensor streams into verified systemic insights.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Architecture Flow' : 'Explore Architecture Flow'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-border/80 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {steps.map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="bg-surface-2/40 border border-border/80 rounded-xl p-3.5 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-mono font-bold text-muted">
                        {st.num}
                      </span>
                      <div className={`p-1.5 rounded-lg border ${st.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${st.color}`} />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-text font-heading mb-1.5 leading-snug">
                      {st.title}
                    </h4>

                    <p className="text-[11px] text-text/80 leading-relaxed font-sans">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 text-[11px] text-muted flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <span>
              <strong>Epistemic Design Principle:</strong> CityPulse never claims absolute causality from telemetry alone. Correlations are flagged as testable hypotheses and presented with complete metric provenance to empower human municipal operators.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
