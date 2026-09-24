import React from 'react';
import { CityMap } from '../components/map/CityMap';
import { useCityStore } from '../store/useCityStore';
import { FeedType } from '../api/types';
import { Filter, Clock } from 'lucide-react';

export const MapView: React.FC = () => {
  const {
    activeFeedFilter,
    setActiveFeedFilter,
    timeWindowMin,
    setTimeWindowMin,
    replay,
  } = useCityStore();

  const feeds: (FeedType | 'all')[] = ['all', 'weather', 'transit', 'incident', 'air_quality', 'power', 'noise'];
  const windows = [
    { label: '15 Min', value: 15 },
    { label: '1 Hour', value: 60 },
    { label: '6 Hours', value: 360 },
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border rounded-2xl p-3 shadow-md">
        {/* Feed Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 text-xs text-muted font-heading uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <span>Feed:</span>
          </div>
          {feeds.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFeedFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-heading font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                activeFeedFilter === f
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-muted hover:text-text'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Time Window Chips & Replay Banner */}
        <div className="flex items-center gap-3">
          {replay.active && (
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              REPLAY — {replay.sim_time ? new Date(replay.sim_time).toLocaleTimeString() : ''}
            </span>
          )}

          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
            <Clock className="w-3.5 h-3.5 text-muted ml-1.5" />
            {windows.map((w) => (
              <button
                key={w.value}
                onClick={() => setTimeWindowMin(w.value)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                  timeWindowMin === w.value ? 'bg-accent text-white' : 'text-muted hover:text-text'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Height Map Container */}
      <div className="flex-1 w-full relative min-h-[500px]">
        <CityMap height="100%" showControls={true} />
      </div>
    </div>
  );
};
