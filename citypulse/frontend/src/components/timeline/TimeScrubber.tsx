import React from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
  Gauge,
  Zap,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { apiClient } from '../../api/client';

export const KEY_MOMENTS = [
  { progress: 0.0, label: 'Day 1: Baseline Start', time: 'Day 1 00:00' },
  { progress: 0.18, label: 'Day 1: Lunch Rush & Normal Flow', time: 'Day 1 13:00' },
  { progress: 0.52, label: 'Day 2: Severe Storm Surge', time: 'Day 2 13:30' },
  { progress: 0.58, label: 'Day 2: Substation Power Outage', time: 'Day 2 18:00' },
  { progress: 0.62, label: 'Day 2: Multi-Feed Correlation Spike', time: 'Day 2 21:00' },
  { progress: 0.76, label: 'Day 3: Transit Walkout & Gridlock', time: 'Day 3 07:00' },
  { progress: 0.90, label: 'Day 3: Systemic Baseline Recovery', time: 'Day 3 17:00' },
];

export const TimeScrubber: React.FC<{ className?: string }> = ({ className = '' }) => {
  const replay = useCityStore((s) => s.replay);
  const setReplay = useCityStore((s) => s.setReplay);

  const handlePlayPause = async () => {
    if (replay.active) {
      const res = await apiClient.stopReplay();
      setReplay(res);
    } else {
      const res = await apiClient.startReplay('storm_day', replay.speed || 10);
      setReplay(res);
    }
  };

  const handleSpeedChange = async (spd: number) => {
    const res = await apiClient.startReplay('storm_day', spd);
    setReplay(res);
  };

  const handleSeek = async (progressVal: number) => {
    const clamped = Math.max(0, Math.min(1, progressVal));
    const res = await apiClient.seekReplay(clamped);
    setReplay(res);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    handleSeek(val);
  };

  const handleReset = async () => {
    const res = await apiClient.seekReplay(0);
    setReplay(res);
  };

  const handleStepPrev = () => {
    const curr = replay.progress || 0;
    // Find previous key moment
    const prevMoments = KEY_MOMENTS.filter((m) => m.progress < curr - 0.02);
    if (prevMoments.length > 0) {
      handleSeek(prevMoments[prevMoments.length - 1].progress);
    } else {
      handleSeek(0);
    }
  };

  const handleStepNext = () => {
    const curr = replay.progress || 0;
    // Find next key moment
    const nextMoment = KEY_MOMENTS.find((m) => m.progress > curr + 0.02);
    if (nextMoment) {
      handleSeek(nextMoment.progress);
    } else {
      handleSeek(1.0);
    }
  };

  const currentProgress = replay.progress || 0;

  // Format simulated time string
  const formatSimTime = () => {
    if (replay.sim_time) {
      const date = new Date(replay.sim_time);
      return date.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    // Calculate estimated time from progress if no backend sim_time
    const totalSimHours = currentProgress * 72;
    const day = Math.floor(totalSimHours / 24) + 1;
    const hour = Math.floor(totalSimHours % 24);
    const minute = Math.floor((totalSimHours % 1) * 60);
    return `Simulated Day ${day} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  };

  return (
    <div className={`bg-surface border border-border rounded-2xl p-5 shadow-xl space-y-4 ${className}`}>
      {/* Top row: Transport Controls, Sim Time, Speed Multipliers */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Playback buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-bold transition-all shadow-md cursor-pointer ${
              replay.active
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-accent hover:bg-accent-hover text-white shadow-accent/20'
            }`}
            aria-label={replay.active ? 'Pause Playback' : 'Start Playback'}
          >
            {replay.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{replay.active ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-border transition-colors cursor-pointer"
            title="Reset to 0% (Beginning)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Prev / Next Step */}
          <button
            onClick={handleStepPrev}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text border border-border text-xs font-mono font-medium transition-colors cursor-pointer"
            title="Step to Previous Key Incident"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Incident</span>
          </button>

          <button
            onClick={handleStepNext}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text border border-border text-xs font-mono font-medium transition-colors cursor-pointer"
            title="Step to Next Key Incident"
          >
            <span className="hidden sm:inline">Next Incident</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Simulated Time Readout */}
        <div className="flex items-center gap-2.5 bg-surface-2/70 border border-border px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-accent animate-pulse" />
          <div>
            <div className="text-[10px] text-muted uppercase font-heading font-bold tracking-wider">
              Simulated Telemetry Clock
            </div>
            <div className="font-mono text-xs font-bold text-text">
              {formatSimTime()}
            </div>
          </div>
        </div>

        {/* Right: Speed controls */}
        <div className="flex items-center gap-1.5 bg-surface-2 p-1.5 rounded-xl border border-border">
          <div className="flex items-center gap-1 px-2 text-[11px] font-mono text-muted uppercase">
            <Gauge className="w-3.5 h-3.5" />
            <span>Speed:</span>
          </div>
          {[1, 10, 60, 300].map((spd) => (
            <button
              key={spd}
              onClick={() => handleSpeedChange(spd)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                replay.speed === spd
                  ? 'bg-accent text-white shadow-sm shadow-accent/40 scale-105'
                  : 'text-muted hover:text-text hover:bg-surface'
              }`}
            >
              ×{spd}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scrubber Slider with Marker Pointers */}
      <div className="space-y-2 pt-1">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={currentProgress}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent"
          />

          {/* Key event tick markers */}
          <div className="absolute top-3.5 left-0 right-0 h-2 pointer-events-none">
            {KEY_MOMENTS.map((m, idx) => (
              <div
                key={idx}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${m.progress * 100}%` }}
              >
                <div className="w-1 h-2 bg-border rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Progress & Day jumps bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-muted font-mono pt-1">
          {/* Day Jump Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSeek(0.0)}
              className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-2/80 hover:text-text border border-border text-[11px] transition-colors cursor-pointer"
            >
              Day 1 (00:00)
            </button>
            <button
              onClick={() => handleSeek(0.334)}
              className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-2/80 hover:text-status-critical border border-border text-[11px] transition-colors cursor-pointer"
            >
              Day 2 (Storm & Outage)
            </button>
            <button
              onClick={() => handleSeek(0.667)}
              className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-2/80 hover:text-status-strained border border-border text-[11px] transition-colors cursor-pointer"
            >
              Day 3 (Transit Strike)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-text">
              {(currentProgress * 100).toFixed(1)}% Completed
            </span>
            <span className="text-muted">({(currentProgress * 72).toFixed(1)}h / 72.0h)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
