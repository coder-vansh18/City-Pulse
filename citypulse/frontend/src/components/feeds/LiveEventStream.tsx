import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Filter } from 'lucide-react';
import { Card } from '../common/Card';
import { LiveStreamEventItem } from '../../types/feedHealth';
import { FeedType } from '../../api/types';

interface LiveEventStreamProps {
  initialEvents: LiveStreamEventItem[];
  onSelectFeed?: (feedId: FeedType) => void;
}

const SAMPLE_TICKER_EVENTS: Omit<LiveStreamEventItem, 'id' | 'time'>[] = [
  { feedId: 'weather', feedLabel: 'WEATHER', title: 'Solar Radiation Nominal', description: 'Sensor 12: 840 W/m²', zone: 'Zone 4', severity: 0.1 },
  { feedId: 'transit', feedLabel: 'TRANSIT', title: 'Tram #08 Arrival', description: 'Station Central on +0.5m', zone: 'Zone 2', severity: 0.2 },
  { feedId: 'power', feedLabel: 'POWER', title: 'Solar Inverter Sync', description: 'Substation South solar feed +12 MW', zone: 'Zone 7', severity: 0.15 },
  { feedId: 'incident', feedLabel: 'INCIDENT', title: '311 Water Pressure Inquiry', description: 'Report #SR-9912 logged', zone: 'Zone 5', severity: 0.4 },
  { feedId: 'air_quality', feedLabel: 'AIR QUALITY', title: 'PM10 Ambient Check', description: 'Concentration 18.2 µg/m³', zone: 'Zone 3', severity: 0.18 },
  { feedId: 'noise', feedLabel: 'ACOUSTIC', title: 'Acoustic Baseline Check', description: 'Ambient 52.4 dBA level', zone: 'Zone 1', severity: 0.12 },
];

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({ initialEvents, onSelectFeed }) => {
  const [events, setEvents] = useState<LiveStreamEventItem[]>(initialEvents);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const sample = SAMPLE_TICKER_EVENTS[Math.floor(Math.random() * SAMPLE_TICKER_EVENTS.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newEvt: LiveStreamEventItem = {
        ...sample,
        id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: timeStr,
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 19)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getFeedBadgeColor = (feed: FeedType) => {
    switch (feed) {
      case 'weather':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
      case 'transit':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'incident':
        return 'bg-purple-500/15 text-purple-500 border-purple-500/30';
      case 'air_quality':
        return 'bg-teal-500/15 text-teal-500 border-teal-500/30';
      case 'power':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'noise':
        return 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30';
      default:
        return 'bg-surface-2 text-muted border-border';
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-accent animate-pulse" />
            <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider">
              Live Event Stream
            </h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-calm/15 border border-status-calm/30 text-status-calm text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-status-calm animate-ping" />
              LIVE
            </span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
              isPaused
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 font-bold'
                : 'bg-surface-2 text-muted border-border hover:text-text'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <p className="text-xs text-muted mb-3">
          Continuous incoming normalized telemetry stream arriving over WebSocket
        </p>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectFeed && onSelectFeed(evt.feedId)}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-surface-2/40 hover:bg-surface-2 border border-border/40 hover:border-accent/30 transition-all cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[10px] text-muted flex-shrink-0">
                  {evt.time}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border uppercase flex-shrink-0 ${getFeedBadgeColor(
                    evt.feedId
                  )}`}
                >
                  {evt.feedLabel}
                </span>

                <div className="min-w-0">
                  <div className="font-semibold text-text truncate">
                    {evt.title}
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {evt.description}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-muted flex-shrink-0 bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                {evt.zone}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>WebSocket: wss://ingest.citypulse.io/v1/stream</span>
        <span className="text-status-calm">● 0ms delay</span>
      </div>
    </Card>
  );
};
