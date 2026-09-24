import React from 'react';
import { AlertTriangle, Radio } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const DegradedBanner: React.FC = () => {
  const pulse = useCityStore((s) => s.pulse);
  const feeds = useCityStore((s) => s.feeds);

  if (!pulse?.degraded) return null;

  const offlineFeeds = feeds.filter((f) => !f.enabled || f.status === 'down' || f.status === 'disabled');
  const feedNames = offlineFeeds.map((f) => f.label.split(' ')[0]).join(', ') || 'telemetry';

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-300">
      <div className="flex items-center gap-2 max-w-4xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>
          <strong className="font-semibold">Showing partial civic data:</strong>{' '}
          {feedNames} feed is currently delayed or disabled. Pulse scores are operating in degraded mode and weights have been renormalized over remaining signals.
        </span>
      </div>

      <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
        <Radio className="w-3 h-3 text-amber-400" />
        Degraded
      </span>
    </div>
  );
};
