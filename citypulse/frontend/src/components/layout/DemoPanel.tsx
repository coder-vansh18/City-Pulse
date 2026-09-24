import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  X,
  Play,
  CloudRain,
  Zap,
  Flame,
  Bus,
  Sun,
  ShieldCheck,
  Radio,
  Keyboard,
  PowerOff,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { apiClient } from '../../api/client';
import { mockServer } from '../../api/mock/mockServer';

export const DemoPanel: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const {
    activeScenario,
    setActiveScenario,
    feeds,
    mockMode,
    setMockMode,
    mode,
  } = useCityStore();

  const scenarios = [
    { key: 'storm', label: '1. Storm Surge', icon: CloudRain, color: 'text-blue-400' },
    { key: 'power_outage', label: '2. Grid Outage', icon: Zap, color: 'text-amber-400' },
    { key: 'gas_leak', label: '3. Gas Leak', icon: Flame, color: 'text-rose-400' },
    { key: 'transit_strike', label: '4. Transit Strike', icon: Bus, color: 'text-orange-400' },
    { key: 'heatwave', label: '5. Heatwave Alert', icon: Sun, color: 'text-yellow-400' },
    { key: 'clear', label: '6. Clear Baseline', icon: ShieldCheck, color: 'text-status-calm' },
  ];

  const handleTriggerScenario = async (name: string) => {
    if (mockMode) {
      mockServer.triggerScenario(name);
      return;
    }
    try {
      await apiClient.triggerScenario(name);
      if (name === 'clear') {
        setActiveScenario(null);
      } else {
        const scList = await apiClient.getScenarios();
        if (scList.active.length > 0) {
          setActiveScenario(scList.active[0]);
        }
      }
    } catch (err) {
      console.warn('Scenario trigger failed:', err);
    }
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
      // Ignore when focused inside input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1') handleTriggerScenario('storm');
      if (e.key === '2') handleTriggerScenario('power_outage');
      if (e.key === '3') handleTriggerScenario('gas_leak');
      if (e.key === '4') handleTriggerScenario('transit_strike');
      if (e.key === '5') handleTriggerScenario('heatwave');
      if (e.key === '6') handleTriggerScenario('clear');
      if (e.key.toLowerCase() === 'm') navigate('/map');
      if (e.key.toLowerCase() === 'r') navigate('/replay');
      if (e.key === '?') setShowHotkeys((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mockMode, navigate]);

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-xs shadow-2xl shadow-accent/40 transition-transform active:scale-95 cursor-pointer border border-white/20"
          >
            <Sliders className="w-4 h-4" />
            <span>Judge Demo Panel</span>
            {activeScenario && (
              <span className="w-2 h-2 rounded-full bg-status-critical animate-ping" />
            )}
          </button>
        ) : (
          <div className="w-84 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent" />
                <h4 className="font-bold text-sm text-text font-heading">
                  Interactive Demo Control
                </h4>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Scenario Banner */}
            {activeScenario && (
              <div className="mb-3 p-2.5 rounded-xl bg-status-critical/15 border border-status-critical/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-status-critical uppercase tracking-wide text-[10px]">
                    Scenario Injected
                  </div>
                  <div className="text-text font-medium">{activeScenario.name}</div>
                </div>
                <button
                  onClick={() => handleTriggerScenario('clear')}
                  className="px-2 py-1 rounded bg-status-critical text-white text-[10px] font-bold uppercase cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Scenario Buttons */}
            <div className="space-y-1.5 mb-4">
              <div className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted mb-1">
                Trigger Civic Scenarios (Keys 1–6)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {scenarios.map((sc) => {
                  const Icon = sc.icon;
                  return (
                    <button
                      key={sc.key}
                      onClick={() => handleTriggerScenario(sc.key)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-surface-2/60 hover:bg-surface-2 text-xs font-medium text-text border border-border/50 transition-colors text-left cursor-pointer active:scale-95"
                    >
                      <Icon className={`w-3.5 h-3.5 ${sc.color} flex-shrink-0`} />
                      <span className="truncate text-[11px]">{sc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kill/Restore Feeds (Degraded Mode Demo) */}
            <div className="mb-4">
              <div className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted mb-1.5 flex items-center justify-between">
                <span>Disrupt Civic Feed (Degraded Test)</span>
                <PowerOff className="w-3 h-3 text-muted" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                {feeds.map((f) => (
                  <button
                    key={f.feed}
                    onClick={() => handleToggleFeed(f.feed, f.enabled)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono capitalize truncate border transition-colors cursor-pointer ${
                      f.enabled
                        ? 'bg-surface-2 text-text border-border'
                        : 'bg-status-critical/15 text-status-critical border-status-critical/40'
                    }`}
                  >
                    {f.enabled ? `Kill ${f.feed}` : `Restore ${f.feed}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Replay & Mock Mode toggles */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => navigate('/replay')}
                className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-medium cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Jump to Replay (R)</span>
              </button>

              <button
                onClick={() => setShowHotkeys(!showHotkeys)}
                className="flex items-center gap-1 text-[11px] text-muted hover:text-text cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Cheatsheet (?)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hotkeys Modal */}
      {showHotkeys && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <h4 className="font-bold text-base text-text font-heading">
                Keyboard Shortcuts Cheatsheet
              </h4>
              <button
                onClick={() => setShowHotkeys(false)}
                className="p-1 rounded-lg bg-surface-2 text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs text-text">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">1</span>
                <span>Storm Surge Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">2</span>
                <span>Power Outage Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">3</span>
                <span>Gas Leak Alert</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">4</span>
                <span>Transit Strike Scenario</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">5</span>
                <span>Heatwave Alert</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">6</span>
                <span>Clear / Reset Baseline</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">M</span>
                <span>Navigate to Civic Map</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted">R</span>
                <span>Navigate to Replay</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">?</span>
                <span>Toggle Shortcuts Cheatsheet</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
