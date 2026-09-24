import React from 'react';

export const MapLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  const items = [
    { label: 'Calm (≥80)', color: 'var(--status-calm)' },
    { label: 'Watch (60–79)', color: 'var(--status-watch)' },
    { label: 'Strained (40–59)', color: 'var(--status-strained)' },
    { label: 'Critical (<40)', color: 'var(--status-critical)' },
  ];

  return (
    <div
      className={`bg-surface/90 backdrop-blur border border-border rounded-xl p-3 shadow-xl text-xs text-text ${className}`}
    >
      <div className="font-heading font-semibold uppercase tracking-wider text-[10px] text-muted mb-2">
        Zone Health
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[11px]">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: it.color }}
            />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
