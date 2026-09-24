import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoPopoverProps {
  title: string;
  items: string[];
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ title, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-medium underline underline-offset-2 transition-colors cursor-pointer"
        aria-label="View data grounding signals"
      >
        <Info className="w-3.5 h-3.5" />
        <span>Based on {items.length} live signal{items.length !== 1 ? 's' : ''}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <h5 className="text-xs font-semibold text-text uppercase tracking-wider font-heading">{title}</h5>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted font-mono">Verified</span>
          </div>
          <p className="text-xs text-muted mb-3 leading-relaxed">
            Data points and telemetry streams directly grounding this insight:
          </p>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-text bg-surface-2/50 px-2.5 py-1.5 rounded-lg border border-border/40">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <span className="font-mono text-[11px] leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
