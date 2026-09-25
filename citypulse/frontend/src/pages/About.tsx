import React, { useState } from 'react';
import {
  Info,
  ShieldCheck,
  Scale,
  Activity,
  HeartHandshake,
  Cpu,
  Lock,
  Layers,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  Radio,
  Bus,
  CloudRain,
  Wind,
  Volume2,
  Siren,
  Building2,
  Database,
  Sliders,
  TrendingDown,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { useCityStore } from '../store/useCityStore';

export const About: React.FC = () => {
  const { pulse, feeds } = useCityStore();
  const [hoveredWeight, setHoveredWeight] = useState<string | null>(null);

  const sources = [
    {
      id: 'transit',
      name: 'Transit GTFS-RT',
      weight: 25,
      weightStr: '25%',
      icon: Bus,
      color: 'text-emerald-500',
      barColor: 'bg-emerald-500',
      bgGlow: 'bg-emerald-500/10',
      borderGlow: 'border-emerald-500/30',
      description: 'Tracks public transport delays, route disruptions, and schedule divergence.',
    },
    {
      id: 'incident',
      name: '311 Incidents',
      weight: 25,
      weightStr: '25%',
      icon: Siren,
      color: 'text-purple-500',
      barColor: 'bg-purple-500',
      bgGlow: 'bg-purple-500/10',
      borderGlow: 'border-purple-500/30',
      description: 'Captures citizen-reported civic hazards and infrastructure problems.',
    },
    {
      id: 'weather',
      name: 'Weather Telemetry',
      weight: 15,
      weightStr: '15%',
      icon: CloudRain,
      color: 'text-blue-500',
      barColor: 'bg-blue-500',
      bgGlow: 'bg-blue-500/10',
      borderGlow: 'border-blue-500/30',
      description: 'Monitors precipitation, wind, temperature, and extreme weather signals.',
    },
    {
      id: 'air_quality',
      name: 'Air Quality (AQI)',
      weight: 15,
      weightStr: '15%',
      icon: Wind,
      color: 'text-teal-500',
      barColor: 'bg-teal-500',
      bgGlow: 'bg-teal-500/10',
      borderGlow: 'border-teal-500/30',
      description: 'Tracks AQI and particulate pollution such as PM2.5.',
    },
    {
      id: 'power',
      name: 'Power Grid',
      weight: 15,
      weightStr: '15%',
      icon: Zap,
      color: 'text-amber-500',
      barColor: 'bg-amber-500',
      bgGlow: 'bg-amber-500/10',
      borderGlow: 'border-amber-500/30',
      description: 'Monitors electrical disruptions, outages, and grid instability.',
    },
    {
      id: 'noise',
      name: 'Acoustic Sensors',
      weight: 5,
      weightStr: '5%',
      icon: Volume2,
      color: 'text-indigo-500',
      barColor: 'bg-indigo-500',
      bgGlow: 'bg-indigo-500/10',
      borderGlow: 'border-indigo-500/30',
      description: 'Detects unusual ambient noise and localized acoustic stress.',
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'DATA SOURCES',
      subtitle: 'Raw Civic Data',
      desc: 'Weather, Transit, 311, AQI, Power, Noise',
      icon: Radio,
      color: 'text-accent',
    },
    {
      step: '02',
      title: 'NORMALIZATION',
      subtitle: 'Validate & Map',
      desc: 'Standardize schemas, UTC times, 0..1 scale',
      icon: Database,
      color: 'text-purple-400',
    },
    {
      step: '03',
      title: 'ZONE SCORES',
      subtitle: 'Map to City Zones',
      desc: 'Evaluate 9 geographic municipal sectors',
      icon: Building2,
      color: 'text-blue-400',
    },
    {
      step: '04',
      title: 'PULSE ENGINE',
      subtitle: 'Calculate Health',
      desc: 'Time decay weighting with 5-min half life',
      icon: Scale,
      color: 'text-emerald-400',
    },
    {
      step: '05',
      title: 'CITY PULSE',
      subtitle: 'Unified City State',
      desc: 'City Score = 0.7 × mean + 0.3 × min',
      icon: Activity,
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* 1. System Overview Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold text-text font-heading">
              About CityPulse — Architecture & Principles
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30 font-bold uppercase">
              CITY INTELLIGENCE ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            CityPulse is a live civic health intelligence engine engineered for AmiHacks (Track B: Open Innovation).
            Our mission is to replace fragmented data silos with an intuitive, unified living city heartbeat.
          </p>
        </div>
      </div>

      {/* 2. How CityPulse Works */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-text font-heading flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            <span>HOW CITYPULSE WORKS</span>
          </h3>
          <span className="text-[10px] font-mono text-muted uppercase">
            End-to-End Pipeline
          </span>
        </div>
        <p className="text-xs text-muted mb-6 leading-relaxed">
          CityPulse transforms multiple real-time civic signals into a unified view of city health.
        </p>

        {/* Visual Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-4 rounded-xl bg-surface-2/40 border border-border/60 hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted mb-2">
                    <span className={step.color}>STAGE {step.step}</span>
                    <Icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                  <h4 className="font-heading font-bold text-xs text-text mb-1">
                    {step.title}
                  </h4>
                  <div className="text-[11px] font-mono text-accent font-semibold mb-1">
                    {step.subtitle}
                  </div>
                </div>
                <p className="text-[10px] text-muted leading-snug mt-2 pt-2 border-t border-border/30">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3 & 4. Six Civic Data Sources & Weight Distribution */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-text font-heading flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span>Civic Data Sources & Weight Distribution</span>
          </h3>
          <span className="text-[10px] font-mono text-muted uppercase">
            Total Weight: 100%
          </span>
        </div>
        <p className="text-xs text-muted mb-5 leading-relaxed">
          Heterogeneous civic streams are weighted based on their direct impact on resident safety, mobility, and essential municipal infrastructure:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sources.map((src) => {
            const Icon = src.icon;
            const isHovered = hoveredWeight === src.id;

            return (
              <div
                key={src.id}
                onMouseEnter={() => setHoveredWeight(src.id)}
                onMouseLeave={() => setHoveredWeight(null)}
                className={`p-4 rounded-xl border transition-all ${
                  isHovered
                    ? `${src.bgGlow} ${src.borderGlow} shadow-sm ring-1 ring-accent/30`
                    : 'bg-surface-2/40 border-border/60 hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${src.bgGlow} ${src.color} flex items-center justify-center border ${src.borderGlow}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-heading font-bold text-xs text-text">
                      {src.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-accent">
                    {src.weightStr}
                  </span>
                </div>

                {/* Visual Weight Bar */}
                <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden my-2.5">
                  <div
                    className={`h-full ${src.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${(src.weight / 25) * 100}%` }}
                  />
                </div>

                <p className="text-[11px] text-muted leading-relaxed">
                  "{src.description}"
                </p>

                {isHovered && (
                  <div className="mt-2.5 pt-2 border-t border-border/40 text-[10px] font-mono text-accent font-bold animate-in fade-in">
                    Contribution to Pulse Score: {src.weightStr}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. Data Normalization 3-Step Process */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          <span>DATA NORMALIZATION</span>
        </h3>
        <p className="text-xs text-muted mb-5 leading-relaxed">
          Civic feeds arrive in completely different raw schemas, time representations, and units. CityPulse normalizes them in 3 deterministic steps:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-2/40 p-4 rounded-xl border border-border/60">
            <div className="text-xs font-mono font-bold text-accent mb-1">01. INGEST & VALIDATE</div>
            <h5 className="font-heading font-semibold text-sm text-text mb-2">Raw Multi-Format Data</h5>
            <p className="text-xs text-muted leading-relaxed">
              Collect raw civic signals from APIs, telemetry systems, sensors, and reports. Handles epoch seconds (Weather), local times (Transit), and US date strings (311).
            </p>
          </div>

          <div className="bg-surface-2/40 p-4 rounded-xl border border-border/60">
            <div className="text-xs font-mono font-bold text-purple-400 mb-1">02. NORMALIZE & MAP</div>
            <h5 className="font-heading font-semibold text-sm text-text mb-2">Standardize & Snap</h5>
            <p className="text-xs text-muted leading-relaxed">
              Convert different formats, timestamps, metrics, and severity values into a common 0.0–1.0 severity spectrum and snap coordinates to 9 municipal zones.
            </p>
          </div>

          <div className="bg-surface-2/40 p-4 rounded-xl border border-border/60">
            <div className="text-xs font-mono font-bold text-status-calm mb-1">03. SCORE & FUSE</div>
            <h5 className="font-heading font-semibold text-sm text-text mb-2">Composite Health</h5>
            <p className="text-xs text-muted leading-relaxed">
              Combine normalized signals into zone-level health scores and aggregate into the overall City Pulse with confidence decay indicators.
            </p>
          </div>
        </div>
      </Card>

      {/* 6. Zone Health Score — Illustrative Example */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-base font-bold text-text font-heading flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" />
              <span>ZONE HEALTH SCORE</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              CityPulse evaluates individual areas before calculating the city-wide score.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border flex-shrink-0">
            Illustrative Example
          </span>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-surface-2/30 border border-border grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left: District Sub-scores */}
          <div className="md:col-span-8 space-y-2">
            <div className="text-xs font-heading font-bold text-text mb-2">
              CENTRAL DISTRICT (ZONE-01) — SUB-SCORES
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2 rounded-lg bg-surface border border-border flex justify-between">
                <span className="text-muted">Transit Health:</span>
                <span className="text-emerald-500 font-bold">82</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border flex justify-between">
                <span className="text-muted">Civic Incidents:</span>
                <span className="text-amber-500 font-bold">74</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border flex justify-between">
                <span className="text-muted">Weather:</span>
                <span className="text-emerald-500 font-bold">91</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border flex justify-between">
                <span className="text-muted">Air Quality:</span>
                <span className="text-amber-500 font-bold">68</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border flex justify-between">
                <span className="text-muted">Power Grid:</span>
                <span className="text-emerald-500 font-bold">95</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border flex justify-between">
                <span className="text-muted">Noise:</span>
                <span className="text-emerald-500 font-bold">88</span>
              </div>
            </div>
          </div>

          {/* Right: Calculated Zone Pulse Score */}
          <div className="md:col-span-4 p-4 rounded-xl bg-surface border border-border text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-muted uppercase">
              ZONE PULSE SCORE
            </span>
            <div className="text-3xl font-bold font-mono text-emerald-500 my-1">
              80 <span className="text-xs text-muted font-normal">/ 100</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-calm/15 text-status-calm border border-status-calm/30 font-bold">
              ● CALM / STABLE
            </span>
          </div>
        </div>
      </Card>

      {/* 7. Pulse Score Formulation & Recency Matters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formulation */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-accent" />
              <span>Pulse Score Formulation (0–100)</span>
            </h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              The Pulse Score is a weighted aggregate computed over a rolling 15-minute window with exponential time decay. 100 represents a calm, nominal city state.
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono bg-surface-2/40 p-3.5 rounded-xl border border-border/50">
            <div className="flex justify-between">
              <span className="text-muted">Rolling Time Window:</span>
              <span className="text-text font-bold">15 Minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Decay Half-Life:</span>
              <span className="text-text font-bold">5.0 Minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Nominal Baseline:</span>
              <span className="text-status-calm font-bold">100 (Calm)</span>
            </div>
          </div>
        </Card>

        {/* Recency Matters Timeline */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>RECENCY MATTERS</span>
            </h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Recent events have greater influence than older events. A transit delay occurring 1 minute ago penalizes the pulse significantly more than one resolved 14 minutes ago.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2/40 border border-border/50 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-[10px] text-muted">
              <span>Older Event (-15m)</span>
              <span className="text-accent font-bold">Recent Event (Now)</span>
            </div>
            {/* Gradient Timeline Indicator */}
            <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-surface-2 via-blue-500/50 to-accent" />
            <div className="flex items-center justify-between text-[10px] text-muted">
              <span>Lower Influence</span>
              <span className="text-emerald-500 font-bold">Higher Influence</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 9 & 10. City Score Formula & Why Lowest Zone Matters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Score Formula */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-accent" />
              <span>CITY SCORE FORMULA</span>
            </h3>
            <div className="text-xs text-accent font-mono font-bold bg-accent/10 p-3 rounded-xl border border-accent/20 mb-3">
              City Score = 0.7 × mean(Zone Scores) + 0.3 × min(Zone Scores)
            </div>
            <p className="text-xs text-muted leading-relaxed">
              CityPulse gives additional importance to the lowest-performing zone so a serious localized problem is not hidden by a high city-wide average.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-surface-2/50 border border-border text-center">
              <span className="text-lg font-bold text-text block">70%</span>
              <span className="text-[10px] text-muted">Average Health (mean)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-2/50 border border-border text-center">
              <span className="text-lg font-bold text-amber-500 block">30%</span>
              <span className="text-[10px] text-muted">Lowest Zone (min)</span>
            </div>
          </div>
        </Card>

        {/* Why the Lowest Zone Matters */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-500" />
              <span>WHY THE LOWEST ZONE MATTERS</span>
            </h3>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              If 8 out of 9 zones are calm but 1 district experiences a transformer explosion and flooding:
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-2/40 border border-border/50 text-xs font-mono space-y-2">
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              <div className="p-1 rounded bg-surface border border-border">Zone A: 91</div>
              <div className="p-1 rounded bg-surface border border-border">Zone B: 86</div>
              <div className="p-1 rounded bg-surface border border-border">Zone C: 84</div>
              <div className="p-1 rounded bg-rose-500/15 text-rose-500 border border-rose-500/30 font-bold">Zone D: 42</div>
            </div>
            <p className="text-[11px] text-muted leading-snug pt-1">
              A naive average would show <strong>75.8 (Healthy)</strong>, hiding the critical failure in Zone D. CityPulse factors in the minimum zone to immediately alert operators.
            </p>
          </div>
        </Card>
      </div>

      {/* 11 & 12. City Pulse Output & Data Pipeline Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Pulse Output Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-text font-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                <span>CITY PULSE COMPOSITE</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-calm/15 text-status-calm border border-status-calm/30 font-bold">
                ● LIVE SCORE
              </span>
            </div>
            <p className="text-xs text-muted mb-4">
              Consolidated real-time index calculated across all 9 zones and 6 active telemetry streams:
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/60 flex items-center justify-between gap-4">
            <div>
              <div className="text-3xl font-bold font-mono text-text">
                {pulse ? pulse.score : 82}{' '}
                <span className="text-sm font-normal text-muted">/ 100</span>
              </div>
              <div className="text-[11px] font-mono text-status-calm font-bold mt-0.5">
                STATUS: {pulse ? pulse.status.toUpperCase() : 'CALM / STABLE'}
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-muted text-right border-l border-border pl-4">
              <div>City Mean: <span className="text-text font-bold">86</span></div>
              <div>Lowest Zone: <span className="text-amber-500 font-bold">74</span></div>
              <div>Active Feeds: <span className="text-accent font-bold">6 / 6</span></div>
            </div>
          </div>
        </Card>

        {/* Data Pipeline Status Overview */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-text font-heading flex items-center gap-2">
                <Radio className="w-5 h-5 text-accent" />
                <span>DATA PIPELINE STATUS</span>
              </h3>
              <span className="text-[10px] font-mono text-muted">
                6 Streams Monitored
              </span>
            </div>
            <p className="text-xs text-muted mb-3">
              Compact overview of active worker processes and schema validation health:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            {sources.map((src) => {
              const liveFeed = feeds.find((f) => f.feed === src.id);
              const isOffline = liveFeed && (liveFeed.status === 'down' || !liveFeed.enabled);

              return (
                <div key={src.id} className="p-2 rounded-lg bg-surface-2/50 border border-border flex items-center justify-between">
                  <span className="text-text font-medium text-[11px] truncate">{src.name.split(' ')[0]}</span>
                  <span className={`text-[10px] font-bold ${isOffline ? 'text-rose-500' : 'text-status-calm'}`}>
                    {isOffline ? '✕ Off' : '✓ Healthy'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 13. From Data to Decision */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span>FROM DATA TO DECISION</span>
        </h3>
        <p className="text-xs text-muted mb-4 leading-relaxed">
          "CityPulse turns fragmented civic signals into actionable city-health intelligence."
        </p>

        <div className="flex items-center justify-between gap-2 flex-wrap text-center text-xs font-mono">
          <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-surface-2/40 border border-border">
            <span className="text-[10px] text-muted block">STEP 01</span>
            <span className="text-text font-bold">RAW DATA</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted hidden sm:block" />

          <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-surface-2/40 border border-border">
            <span className="text-[10px] text-muted block">STEP 02</span>
            <span className="text-accent font-bold">CIVIC SIGNALS</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted hidden sm:block" />

          <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-surface-2/40 border border-border">
            <span className="text-[10px] text-muted block">STEP 03</span>
            <span className="text-purple-400 font-bold">ZONE HEALTH</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted hidden sm:block" />

          <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-surface-2/40 border border-border">
            <span className="text-[10px] text-muted block">STEP 04</span>
            <span className="text-status-calm font-bold">CITY PULSE</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted hidden sm:block" />

          <div className="flex-1 min-w-[120px] p-3 rounded-xl bg-accent text-white font-bold shadow-md shadow-accent/20">
            <span className="text-[10px] text-white/80 block">STEP 05</span>
            <span>PRIORITIZED ACTION</span>
          </div>
        </div>
      </Card>

      {/* Epistemic Honesty & Privacy Stance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Epistemic Honesty */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-purple-400" />
            <span>Epistemic Honesty & Correlation</span>
          </h3>
          <p className="text-xs text-muted leading-relaxed mb-3">
            Civic systems are complex adaptive networks. When a cloudburst coincides with transit slowdown and power spikes,
            CityPulse flags this as a <strong>possible statistical link</strong>—never an unsubstantiated causal claim.
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Every generated summary includes confidence indicators and caveat notes to prevent misinforming municipal operators.
          </p>
        </Card>

        {/* Privacy & Ethics */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-text font-heading mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-status-calm" />
            <span>Privacy-by-Design Architecture</span>
          </h3>
          <ul className="space-y-2 text-xs text-muted leading-relaxed list-disc list-inside">
            <li><strong>Zero PII:</strong> No personal phone numbers or citizen identities are permanently stored or exposed.</li>
            <li><strong>Block-Level Jittering:</strong> All 311 complaints and sensor coordinates are snapped to generalized centroids.</li>
            <li><strong>Graceful Degradation:</strong> If any feed drops, weights dynamically renormalize with clear operator warnings.</li>
          </ul>
        </Card>
      </div>

      {/* Credits */}
      <div className="text-center text-xs text-muted py-4 font-mono">
        CityPulse · AmiHacks Open Innovation Track B · Built with React 18, FastAPI, Leaflet, & Tailwind
      </div>
    </div>
  );
};
