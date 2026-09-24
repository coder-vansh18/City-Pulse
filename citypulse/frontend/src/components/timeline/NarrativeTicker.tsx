import React, { useState } from 'react';
import { Radio, AlertCircle, Sparkles } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const NarrativeTicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const events = useCityStore((s) => s.events);
  const insights = useCityStore((s) => s.insights);
  const [isPaused, setIsPaused] = useState(false);

  const activeInsightsList = Object.values(insights).filter((i) => i.status === 'active');
  const recentEvents = events.slice(0, 8);

  const tickerItems = [
    ...activeInsightsList.map((ins) => ({
      id: ins.id,
      tag: ins.kind.toUpperCase(),
      text: `${ins.title} — ${ins.plain_text}`,
      isInsight: true,
    })),
    ...recentEvents.map((ev) => ({
      id: ev.id,
      tag: ev.feed.toUpperCase(),
      text: `${new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Zone ${ev.zone_id.toUpperCase()} — ${ev.title}`,
      isInsight: false,
    })),
  ];

  if (tickerItems.length === 0) return null;

  return (
    <div
      className={`relative flex items-center bg-surface border border-border rounded-xl px-4 py-2 overflow-hidden shadow-sm ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 pr-3 border-r border-border flex-shrink-0 z-10 bg-surface">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-text font-heading flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-accent" />
          <span>Live Pulse Wire</span>
        </span>
      </div>

      <div className="flex-1 overflow-hidden ml-3 relative">
        <div
          className="flex items-center gap-8 whitespace-nowrap"
          style={{
            animation: isPaused ? 'none' : 'marquee 30s linear infinite',
          }}
        >
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-2 text-xs">
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border uppercase ${
                  item.isInsight
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    : 'bg-surface-2 text-muted border-border'
                }`}
              >
                {item.tag}
              </span>
              <span className="text-text/90 font-sans">{item.text}</span>
              <span className="text-muted/40 font-mono">/</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
