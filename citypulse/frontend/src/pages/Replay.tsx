import React from 'react';
import { History, Play, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { apiClient } from '../api/client';
import { TimeScrubber } from '../components/timeline/TimeScrubber';
import { HeatTimeline } from '../components/timeline/HeatTimeline';
import { Card } from '../components/common/Card';
import { HeartbeatECG } from '../components/pulse/HeartbeatECG';

export const Replay: React.FC = () => {
  const { replay, setReplay, pulse } = useCityStore();

  const handleStartDefault = async () => {
    const res = await apiClient.startReplay('storm_day', 10);
    setReplay(res);
  };

  const handleReturnToLive = async () => {
    const res = await apiClient.stopReplay();
    setReplay(res);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-text font-heading">
              Historical Timeline & Replay Studio
            </h2>
          </div>
          <p className="text-xs text-muted">
            Time-travel through historical multi-day dataset and observe how CityPulse detects and correlates stress signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {replay.active ? (
            <button
              onClick={handleReturnToLive}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text border border-border font-heading text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Live Mode</span>
            </button>
          ) : (
            <button
              onClick={handleStartDefault}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-heading text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-accent/20"
            >
              <Play className="w-4 h-4" />
              <span>Start Storm Day Replay (10x)</span>
            </button>
          )}
        </div>
      </div>

      {/* Replay Notice */}
      {replay.active && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Replay Engine Active:</strong> Live telemetry is paused. All UI elements (map, ECG, scores, summaries) are synchronizing with the historical timeline.
            </span>
          </div>
          <span className="font-mono font-bold text-amber-400">SPEED ×{replay.speed}</span>
        </div>
      )}

      {/* Main Scrubber Control Card */}
      <TimeScrubber />

      {/* Heat Matrix of 3-Day Timeline */}
      <HeatTimeline />

      {/* Replay Pulse Snapshot */}
      {pulse && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-text font-heading">
              Replay City Heartbeat at Current Playhead
            </div>
            <span className="font-mono text-xs text-accent">
              Score: {pulse.score.toFixed(1)}/100 · {pulse.bpm} BPM
            </span>
          </div>
          <HeartbeatECG
            bpm={pulse.bpm}
            irregularity={pulse.irregularity}
            status={pulse.status}
            confidence={pulse.confidence}
            height={64}
          />
        </Card>
      )}
    </div>
  );
};
