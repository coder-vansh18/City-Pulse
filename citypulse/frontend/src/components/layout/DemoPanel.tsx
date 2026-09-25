import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  X,
  Play,
  Pause,
  CloudRain,
  Zap,
  Flame,
  Bus,
  Sun,
  ShieldCheck,
  RotateCcw,
  Radio,
  Keyboard,
  PowerOff,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { apiClient } from '../../api/client';
import { mockServer } from '../../api/mock/mockServer';

interface ScenarioDef {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  description: string;
  affects: string[];
  impacts: { system: string; level: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW'; color: string }[];
  expectedResponses: string[];
}

const SCENARIO_DEFS: ScenarioDef[] = [
  {
    key: 'storm',
    label: 'Storm Surge',
    icon: CloudRain,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    description: 'Simulates sudden intense micro-burst rainfall, arterial water pooling, and culvert backpressure.',
    affects: ['Weather', 'Drainage', 'Transit', 'Civic Reports'],
    impacts: [
      { system: 'Weather Gauges', level: 'HIGH', color: 'text-amber-500' },
      { system: 'Drainage Culverts', level: 'CRITICAL', color: 'text-rose-500' },
      { system: 'Transit Headways', level: 'MEDIUM', color: 'text-blue-500' },
      { system: '311 Citizen Reports', level: 'MEDIUM', color: 'text-blue-500' },
    ],
    expectedResponses: [
      'Precipitation anomaly flagged (>40mm/hr)',
      'Waterfront culvert backpressure alert generated',
      'Citizen waterlogging reports clustered',
      'Weather ↔ Transit cross-feed relationship linked',
    ],
  },
  {
    key: 'power_outage',
    label: 'Grid Outage',
    icon: Zap,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    description: 'Simulates major substation transformer trip, line frequency sag, and darkened intersections.',
    affects: ['Power Grid', 'Traffic Signals', 'Civic Reports'],
    impacts: [
      { system: 'Substation B4', level: 'CRITICAL', color: 'text-rose-500' },
      { system: 'Traffic Intersections', level: 'HIGH', color: 'text-amber-500' },
      { system: 'Citizen Dark Block Calls', level: 'HIGH', color: 'text-amber-500' },
    ],
    expectedResponses: [
      'Grid telemetry frequency sag (49.1 Hz)',
      'Substation failure alert dispatched',
      'Streetlight outage citizen reports correlated',
      'Power ↔ Incident cross-feed hypothesis evaluated',
    ],
  },
  {
    key: 'gas_leak',
    label: 'Gas Leak Alert',
    icon: Flame,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
    description: 'Simulates subterranean methane sensor trip, air quality degradation, and safety perimeter.',
    affects: ['311 Incidents', 'Air Quality', 'Road Traffic'],
    impacts: [
      { system: '311 Hazard Dispatch', level: 'CRITICAL', color: 'text-rose-500' },
      { system: 'Air Quality Sensors', level: 'HIGH', color: 'text-amber-500' },
      { system: 'Perimeter Traffic Reroute', level: 'MEDIUM', color: 'text-blue-500' },
    ],
    expectedResponses: [
      'Optical volatile organic compound spike',
      'Emergency safety perimeter alerted',
      'Citizen odor reports verified',
      'Cross-zone evacuation routing calculated',
    ],
  },
  {
    key: 'transit_strike',
    label: 'Transit Strike',
    icon: Bus,
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
    description: 'Simulates sudden arterial bus depot halt, passenger crowding, and vehicle dwell delays.',
    affects: ['GTFS Transit', 'Traffic Flow', 'Citizen Reports'],
    impacts: [
      { system: 'GTFS-RT Fleet Stream', level: 'CRITICAL', color: 'text-rose-500' },
      { system: 'Arterial Congestion', level: 'HIGH', color: 'text-amber-500' },
      { system: 'Commuter Delay Reports', level: 'HIGH', color: 'text-amber-500' },
    ],
    expectedResponses: [
      'GTFS schedule adherence drop (+18 min)',
      'Corridor dwell congestion alert tripped',
      'Citizen overcrowding complaints linked',
      'Transit ↔ Traffic acoustic correlation generated',
    ],
  },
  {
    key: 'heatwave',
    label: 'Heatwave Alert',
    icon: Sun,
    color: 'text-yellow-500 dark:text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    description: 'Simulates extreme ambient temperature (+6°C), grid HVAC load surge, and ozone elevation.',
    affects: ['Weather', 'Power Substation', 'Emergency Services'],
    impacts: [
      { system: 'Thermal Telemetry', level: 'HIGH', color: 'text-amber-500' },
      { system: 'Grid Peak HVAC Load', level: 'HIGH', color: 'text-amber-500' },
      { system: 'Ozone / Air Quality', level: 'MEDIUM', color: 'text-blue-500' },
    ],
    expectedResponses: [
      'Ambient temperature baseline exceedance',
      'Transformer cooling throttling warnings',
      'Weather ↔ Power load cross-feed correlation confirmed',
    ],
  },
];

interface SimulationHistoryItem {
  id: string;
  name: string;
  timestamp: string;
  status: 'completed' | 'active' | 'cleared';
}

export const DemoPanel: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [selectedPreviewScenario, setSelectedPreviewScenario] = useState<ScenarioDef | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [history, setHistory] = useState<SimulationHistoryItem[]>([
    { id: 'sim-h-1', name: 'Storm Surge Simulation', timestamp: '2 min ago', status: 'completed' },
    { id: 'sim-h-2', name: 'Grid Outage Simulation', timestamp: '8 min ago', status: 'completed' },
  ]);

  const {
    activeScenario,
    setActiveScenario,
    pulse,
    feeds,
    mockMode,
    addAlert,
  } = useCityStore();

  const timerRef = useRef<any>(null);

  // Track elapsed simulation time
  useEffect(() => {
    if (activeScenario && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeScenario, isPaused]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleTriggerScenario = async (name: string) => {
    if (name === 'clear') {
      await handleClearScenario();
      return;
    }

    const scDef = SCENARIO_DEFS.find((s) => s.key === name);
    if (!scDef) return;

    // Show quick initialization progress
    setIsInitializing(true);
    setInitProgress(20);
    setTimeout(() => setInitProgress(65), 150);
    setTimeout(() => setInitProgress(100), 300);

    setTimeout(async () => {
      setIsInitializing(false);
      setInitProgress(0);
      setSelectedPreviewScenario(null);
      setElapsedSeconds(0);
      setIsPaused(false);

      const nowIso = new Date().toISOString();
      const endsIso = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Trigger real-time incident alert & popup
      addAlert({
        id: `alt-${name}-${Date.now()}`,
        rule_id: `rule_${name}`,
        level: name === 'storm' || name === 'power_outage' || name === 'gas_leak' ? 'critical' : 'warning',
        zone_id: 'z5',
        title: `[INCIDENT WARNING] ${scDef.label} Occurred in Downtown Core`,
        message: scDef.description,
        created_at: nowIso,
        acknowledged: false,
      });

      if (mockMode) {
        mockServer.triggerScenario(name);
        setActiveScenario({
          name: scDef.label,
          zone_id: 'z5',
          started_at: nowIso,
          ends_at: endsIso,
        });
      } else {
        try {
          await apiClient.triggerScenario(name);
          const scList = await apiClient.getScenarios();
          if (scList.active.length > 0) {
            setActiveScenario(scList.active[0]);
          } else {
            setActiveScenario({
              name: scDef.label,
              zone_id: 'z5',
              started_at: nowIso,
              ends_at: endsIso,
            });
          }
        } catch (err) {
          console.warn('Scenario trigger failed:', err);
          setActiveScenario({
            name: scDef.label,
            zone_id: 'z5',
            started_at: nowIso,
            ends_at: endsIso,
          });
        }
      }

      setHistory((prev) => [
        {
          id: `sim-${Date.now()}`,
          name: `${scDef.label} Simulation`,
          timestamp: 'Just now',
          status: 'active',
        },
        ...prev.slice(0, 4),
      ]);
    }, 350);
  };

  const handleClearScenario = async () => {
    try {
      if (mockMode) {
        mockServer.triggerScenario('clear');
      } else {
        await apiClient.triggerScenario('clear');
      }
    } catch (err) {
      console.warn('Clear scenario error:', err);
    }
    setActiveScenario(null);
    setSelectedPreviewScenario(null);
    setElapsedSeconds(0);
    setIsPaused(false);
    setHistory((prev) => [
      {
        id: `sim-clr-${Date.now()}`,
        name: 'Normal Baseline Restored',
        timestamp: 'Just now',
        status: 'cleared',
      },
      ...prev.slice(0, 4),
    ]);
  };

  const handleToggleFeed = async (feedType: string, currentEnabled: boolean) => {
    try {
      await apiClient.toggleFeed(feedType, !currentEnabled);
    } catch (err) {
      console.warn('Feed toggle failed:', err);
    }
  };

  // Keyboard Shortcuts Hook (1-6, M, R, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1') handleTriggerScenario('storm');
      if (e.key === '2') handleTriggerScenario('power_outage');
      if (e.key === '3') handleTriggerScenario('gas_leak');
      if (e.key === '4') handleTriggerScenario('transit_strike');
      if (e.key === '5') handleTriggerScenario('heatwave');
      if (e.key === '6') handleClearScenario();
      if (e.key.toLowerCase() === 'm') navigate('/map');
      if (e.key.toLowerCase() === 'r') navigate('/replay');
      if (e.key === '?') setShowHotkeys((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mockMode, navigate]);

  // Current City Status
  const isStrained = pulse && (pulse.status === 'strained' || pulse.status === 'critical' || activeScenario !== null);
  const cityStatusLabel = isStrained ? 'Elevated Strain' : 'Normal Baseline';

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs shadow-2xl shadow-accent/40 transition-transform active:scale-95 cursor-pointer border border-white/20"
          >
            <Sliders className="w-4 h-4" />
            <span>City Scenario Simulator</span>
            {activeScenario ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-[10px] font-mono font-bold animate-pulse">
                ACTIVE
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        ) : (
          <div className="w-[380px] sm:w-[420px] max-h-[85vh] bg-surface/95 dark:bg-surface-solid/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-border bg-surface-2/40 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-text font-heading">
                    City Scenario Simulator
                  </h3>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                    Demo Simulation
                  </span>
                </div>
                <p className="text-[11px] text-muted leading-tight font-sans">
                  Simulate civic events and see how CityPulse responds in real time.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-xl bg-surface hover:bg-surface-2 text-muted hover:text-text border border-border transition-colors cursor-pointer shrink-0"
                title="Close simulator"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Simulator Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* 1. CURRENT SIMULATION STATUS AREA */}
              <div className="bg-surface-2/60 border border-border rounded-xl p-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                  <span>Current Simulation Status</span>
                  {activeScenario ? (
                    <span className="text-rose-500 font-mono flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      SIMULATION RUNNING
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-mono font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      IDLE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-surface p-2 rounded-lg border border-border/60">
                    <span className="text-[10px] text-muted block mb-0.5">City Status</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isStrained ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isStrained ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      {cityStatusLabel}
                    </span>
                  </div>

                  <div className="bg-surface p-2 rounded-lg border border-border/60">
                    <span className="text-[10px] text-muted block mb-0.5">Active Scenario</span>
                    <span className="font-bold text-text truncate block">
                      {activeScenario ? activeScenario.name : 'None (Baseline)'}
                    </span>
                  </div>
                </div>

                {/* If scenario is active, show elapsed & live actions */}
                {activeScenario && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>Elapsed: {formatElapsed(elapsedSeconds)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="px-2 py-1 rounded-md bg-surface border border-border hover:bg-surface-2 text-[11px] font-semibold text-text transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {isPaused ? <Play className="w-3 h-3 text-emerald-500" /> : <Pause className="w-3 h-3 text-amber-500" />}
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                      </button>

                      <button
                        onClick={handleClearScenario}
                        className="px-2.5 py-1 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold uppercase transition-colors cursor-pointer shadow-xs"
                      >
                        Stop Scenario
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. INITIALIZING LOADING STATE (When triggering) */}
              {isInitializing && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-[10px] text-purple-600 dark:text-purple-300 uppercase">
                      Initializing Scenario Simulation...
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-300">
                      {initProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-purple-500/20">
                    <div
                      className="bg-purple-500 h-full transition-all duration-150 rounded-full"
                      style={{ width: `${initProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 3. SCENARIO PREVIEW & CONFIRMATION MODAL/INLINE */}
              {selectedPreviewScenario && (
                <div className="bg-accent/5 border border-accent/30 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${selectedPreviewScenario.bg}`}>
                        <selectedPreviewScenario.icon className={`w-4 h-4 ${selectedPreviewScenario.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-text font-heading">
                          Preview: {selectedPreviewScenario.label}
                        </h4>
                        <span className="text-[10px] text-muted">Estimated City Impact</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPreviewScenario(null)}
                      className="text-muted hover:text-text p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-text/90 leading-relaxed font-sans">
                    {selectedPreviewScenario.description}
                  </p>

                  {/* Expected Impact Breakdown */}
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-muted block mb-1">
                      Expected System Stress:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {selectedPreviewScenario.impacts.map((imp, i) => (
                        <div key={i} className="flex items-center justify-between bg-surface px-2 py-1 rounded border border-border/50 text-[10px]">
                          <span className="text-text font-medium truncate">{imp.system}</span>
                          <span className={`font-mono font-bold ${imp.color}`}>{imp.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expected Response Pipeline */}
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-muted block mb-1">
                      What Will Happen:
                    </span>
                    <div className="space-y-1 bg-surface p-2 rounded-lg border border-border/50 text-[10px] text-muted font-sans">
                      {selectedPreviewScenario.expectedResponses.map((res, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                          <span>{res}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Simulation Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedPreviewScenario(null)}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleTriggerScenario(selectedPreviewScenario.key)}
                      className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run Simulation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. EMERGENCY SCENARIOS LIST */}
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                  <span>Emergency Scenarios (Keys 1–5)</span>
                  <span className="text-[10px] text-accent font-semibold">Click to preview</span>
                </div>

                <div className="space-y-2">
                  {SCENARIO_DEFS.map((sc) => {
                    const Icon = sc.icon;
                    const isCurrent = activeScenario?.name.toLowerCase().includes(sc.label.toLowerCase());

                    return (
                      <div
                        key={sc.key}
                        className={`bg-surface-2/40 border rounded-xl p-2.5 transition-all flex items-center justify-between gap-2.5 ${
                          isCurrent
                            ? 'border-rose-500/50 bg-rose-500/10 shadow-sm'
                            : 'border-border/70 hover:border-accent/50 hover:bg-surface-2/70'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg border shrink-0 ${sc.bg}`}>
                            <Icon className={`w-4 h-4 ${sc.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className="font-bold text-xs text-text font-heading truncate">
                                {sc.label}
                              </h4>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-rose-500 text-white">
                                  Live
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted line-clamp-1">
                              Affects: {sc.affects.join(' • ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setSelectedPreviewScenario(sc)}
                            className="px-2 py-1 rounded-lg bg-surface border border-border hover:bg-surface-2 text-text text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Preview expected impact"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleTriggerScenario(sc.key)}
                            className="px-2.5 py-1 rounded-lg bg-accent hover:bg-accent-hover text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Simulate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. FEED HEALTH TESTING (Replaces "Disrupt Civic Feed / Kill Weather") */}
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1 flex items-center justify-between">
                  <span>Feed Health Testing</span>
                  <span className="text-[10px] text-muted">Test fault tolerance</span>
                </div>
                <p className="text-[10px] text-muted mb-2 leading-tight">
                  Simulate offline or delayed telemetry data sources to verify resilience.
                </p>

                <div className="grid grid-cols-2 gap-1.5">
                  {feeds.map((f) => {
                    const isHealthy = f.enabled && f.status !== 'down' && f.status !== 'disabled';

                    return (
                      <button
                        key={f.feed}
                        onClick={() => handleToggleFeed(f.feed, f.enabled)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                          isHealthy
                            ? 'bg-surface-2/40 border-border/70 hover:border-border text-text'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold capitalize block truncate">
                            {f.feed.replace('_', ' ')} Feed
                          </span>
                          <span className="text-[9px] font-mono block text-muted">
                            {isHealthy ? '● Online' : '⚠ Degraded / Off'}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                            isHealthy
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40'
                          }`}
                        >
                          {isHealthy ? 'Healthy' : 'Offline'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. RESTORE NORMAL CITY (Prominent Recovery Button) */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300 font-heading flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Restore Normal City
                  </h4>
                  <p className="text-[10px] text-muted">
                    Clear all simulated events and return city telemetry to baseline.
                  </p>
                </div>

                <button
                  onClick={handleClearScenario}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  Restore (Key 6)
                </button>
              </div>

              {/* 7. DEMO PRESETS (Collapsible) */}
              <div className="border border-border/60 rounded-xl overflow-hidden bg-surface-2/30">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="w-full p-2.5 flex items-center justify-between text-left text-xs font-heading font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Demo Presets & Bundles</span>
                  </div>
                  {showPresets ? <ChevronUp className="w-3.5 h-3.5 text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-muted" />}
                </button>

                {showPresets && (
                  <div className="p-2.5 pt-0 space-y-1.5 border-t border-border/40 animate-in fade-in duration-150">
                    <button
                      onClick={() => handleTriggerScenario('storm')}
                      className="w-full p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-left text-[11px] transition-colors cursor-pointer"
                    >
                      <strong className="block text-text">🚨 Major City Emergency</strong>
                      <span className="text-muted text-[10px]">Storm Surge + Hydrological Pooling</span>
                    </button>
                    <button
                      onClick={() => handleTriggerScenario('power_outage')}
                      className="w-full p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-left text-[11px] transition-colors cursor-pointer"
                    >
                      <strong className="block text-text">⚡ Infrastructure Disruption</strong>
                      <span className="text-muted text-[10px]">Grid Outage + Traffic Light Halts</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 8. RECENT SIMULATIONS HISTORY (Collapsible) */}
              <div className="border border-border/60 rounded-xl overflow-hidden bg-surface-2/30">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full p-2.5 flex items-center justify-between text-left text-xs font-heading font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-muted" />
                    <span>Recent Simulation History</span>
                  </div>
                  {showHistory ? <ChevronUp className="w-3.5 h-3.5 text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-muted" />}
                </button>

                {showHistory && (
                  <div className="p-2.5 pt-0 space-y-1 border-t border-border/40 animate-in fade-in duration-150 text-[10px] font-mono">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                        <span className="text-text font-medium">{h.name}</span>
                        <span className="text-muted">{h.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation & Shortcuts */}
            <div className="p-3 border-t border-border bg-surface-2/40 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/replay');
                }}
                className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover font-semibold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Scenario Replay (R)</span>
              </button>

              <button
                onClick={() => setShowHotkeys(true)}
                className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-text cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Shortcuts (?)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showHotkeys && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-accent" />
                <h4 className="font-bold text-sm text-text font-heading">
                  Keyboard Shortcuts Cheatsheet
                </h4>
              </div>
              <button
                onClick={() => setShowHotkeys(false)}
                className="p-1 rounded-lg bg-surface-2 text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs text-text">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">1</span>
                <span>Storm Surge Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">2</span>
                <span>Grid Outage Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">3</span>
                <span>Gas Leak Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">4</span>
                <span>Transit Strike Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">5</span>
                <span>Heatwave Alert Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">6</span>
                <span>Restore Normal Baseline</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">M</span>
                <span>Navigate to Civic Map</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold">R</span>
                <span>Navigate to Scenario Replay</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted font-bold">?</span>
                <span>Toggle Shortcuts Cheatsheet</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
