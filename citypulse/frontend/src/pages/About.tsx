import React from 'react';
import {
  Info,
  ShieldCheck,
  Scale,
  Activity,
  HeartHandshake,
  Cpu,
  Lock,
} from 'lucide-react';
import { Card } from '../components/common/Card';

export const About: React.FC = () => {
  const weights = [
    { feed: 'Transit GTFS-RT', weight: '25%', desc: 'Bus & rail route delay severity and schedule divergence' },
    { feed: '311 Incidents', weight: '25%', desc: 'Poisson arrival rate of civic hazard and street condition reports' },
    { feed: 'Weather Telemetry', weight: '15%', desc: 'Precipitation volume, wind velocity, and ambient extremes' },
    { feed: 'Air Quality (AQI)', weight: '15%', desc: 'US AQI index & particulate matter PM2.5 levels' },
    { feed: 'Power Grid', weight: '15%', desc: 'Customers impacted by electrical substation flickers/blackouts' },
    { feed: 'Acoustic Sensors', weight: '5%', desc: 'Ambient decibels and localized acoustic stress spikes' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-text font-heading">
            About CityPulse — Architecture & Principles
          </h2>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          CityPulse is a live civic health intelligence engine engineered for AmiHacks (Track B: Open Innovation).
          Our mission is to replace fragmented data silos with an intuitive living city heartbeat.
        </p>
      </div>

      {/* 1. Scoring Weights Formula */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-text font-heading mb-3 flex items-center gap-2">
          <Scale className="w-5 h-5 text-accent" />
          <span>Pulse Score Formulation (0–100)</span>
        </h3>
        <p className="text-xs text-muted mb-4 leading-relaxed">
          The Pulse Score is a weighted aggregate computed over a rolling 15-minute window with exponential time decay (half-life = 5 min). 100 represents a calm, nominal city state.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {weights.map((w) => (
            <div key={w.feed} className="bg-surface-2/40 p-3 rounded-xl border border-border/50">
              <div className="flex justify-between items-center mb-1">
                <span className="font-heading font-semibold text-xs text-text">{w.feed}</span>
                <span className="font-mono font-bold text-accent text-xs">{w.weight}</span>
              </div>
              <p className="text-[11px] text-muted leading-tight">{w.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted bg-surface-2/30 p-3 rounded-xl border border-border/40 font-mono">
          City Score = 0.7 × mean(Zone Scores) + 0.3 × min(Zone Scores)
        </div>
      </Card>

      {/* 2. Epistemic Honesty Rationale */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-purple-400" />
          <span>Epistemic Honesty & Non-Causal Correlation</span>
        </h3>
        <p className="text-xs text-muted leading-relaxed mb-3">
          Civic systems are complex adaptive networks. When a storm coincides with a 15-minute bus delay and 3 flooding reports,
          CityPulse flags this as a <strong>possible statistical link</strong>—never a confirmed causal claim.
        </p>
        <p className="text-xs text-muted leading-relaxed">
          Every generated summary and insight includes explicit confidence indicators and caveat notes to prevent misinforming municipal operators and citizens.
        </p>
      </Card>

      {/* 3. Privacy & Ethics Stance */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-status-calm" />
          <span>Privacy-by-Design Architecture</span>
        </h3>
        <ul className="space-y-2 text-xs text-muted leading-relaxed list-disc list-inside">
          <li><strong>Zero PII:</strong> No personal identifiers, phone numbers, or citizen identities are stored or ingested.</li>
          <li><strong>Block-Level Jittering:</strong> All 311 complaints and sensor coordinates are snapped to a generalized block-level polygon centroid.</li>
          <li><strong>Graceful Degradation:</strong> If any feed is interrupted, CityPulse transparently lowers confidence and informs users rather than faking data.</li>
        </ul>
      </Card>

      {/* 4. Credits */}
      <div className="text-center text-xs text-muted py-4 font-mono">
        CityPulse · AmiHacks Open Innovation Track B · Built with React 18, FastAPI, Leaflet, & Tailwind
      </div>
    </div>
  );
};
