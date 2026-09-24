import React from 'react';
import { Play, Pause, Square, FastForward, RotateCcw } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { apiClient } from '../../api/client';

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

  const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const res = await apiClient.seekReplay(val);
    setReplay(res);
  };

  const handleStop = async () => {
    const res = await apiClient.stopReplay();
    setReplay(res);
  };

  return (
    <div className={`bg-surface border border-border rounded-2xl p-4 shadow-xl ${className}`}>
      {/* Top row: Status & Speed */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="p-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors cursor-pointer"
            aria-label={replay.active ? 'Pause Replay' : 'Start Replay'}
          >
            {replay.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={handleStop}
            className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-border transition-colors cursor-pointer"
            aria-label="Stop Replay"
          >
            <Square className="w-4 h-4" />
          </button>

          <div className="ml-2">
            <div className="text-[10px] text-muted uppercase font-heading tracking-wider">
              Simulated Timeline Time
            </div>
            <div className="font-mono text-sm font-bold text-text">
              {replay.sim_time
                ? new Date(replay.sim_time).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Standby — Live Paused'}
            </div>
          </div>
        </div>

        {/* Speed Buttons */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
          {[1, 10, 60, 300].map((spd) => (
            <button
              key={spd}
              onClick={() => handleSpeedChange(spd)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                replay.speed === spd
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-text'
              }`}
            >
              ×{spd}
            </button>
          ))}
        </div>
      </div>

      {/* Scrubber slider */}
      <div className="space-y-1.5">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={replay.progress || 0}
          onChange={handleSeek}
          className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex items-center justify-between text-[11px] text-muted font-mono">
          <span>Day 1 (Start)</span>
          <span>{((replay.progress || 0) * 100).toFixed(1)}% Completed</span>
          <span>Day 3 (End)</span>
        </div>
      </div>
    </div>
  );
};
