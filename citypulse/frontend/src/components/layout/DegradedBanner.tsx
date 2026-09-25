import React, { useState } from 'react';
import { AlertTriangle, Radio, X } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const DegradedBanner: React.FC = () => {
  const pulse = useCityStore((s) => s.pulse);
  const feeds = useCityStore((s) => s.feeds);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!pulse?.degraded || isDismissed) return null;

  const offlineFeeds = feeds.filter((f) => !f.enabled || f.status === 'down' || f.status === 'disabled');
  const feedNames = offlineFeeds.map((f) => f.label.split(' ')[0]).join(', ') || 'Open-Meteo';

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 transition-colors animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5 max-w-5xl">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <span className="leading-relaxed">
          <strong className="font-bold text-amber-950 dark:text-amber-100">Showing partial civic data:</strong>{' '}
          {feedNames} feed is currently delayed or disabled. Pulse scores are operating in fault-tolerant degraded mode and weights have been renormalized over remaining live signals.
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/20 dark:bg-amber-500/30 border border-amber-500/40 text-amber-800 dark:text-amber-300">
          <Radio className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
          Degraded Mode
        </span>

        <button
          onClick={() => setIsDismissed(true)}
          title="Dismiss warning"
          className="p-1 rounded-md text-amber-800/70 hover:text-amber-950 dark:text-amber-300/70 dark:hover:text-amber-100 hover:bg-amber-500/20 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
