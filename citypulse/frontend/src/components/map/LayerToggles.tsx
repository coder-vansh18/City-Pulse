import React from 'react';
import { Layers, Eye, EyeOff, Flame, Activity, Link2, Radio } from 'lucide-react';
import { useCityStore, MapLayerToggles } from '../../store/useCityStore';

export const LayerToggles: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mapLayers = useCityStore((s) => s.mapLayers);
  const setMapLayer = useCityStore((s) => s.setMapLayer);

  const layerConfigs: { key: keyof MapLayerToggles; label: string; icon: React.ElementType }[] = [
    { key: 'zones', label: 'Zones Choropleth', icon: Layers },
    { key: 'events', label: 'Event Markers', icon: Radio },
    { key: 'anomalyRings', label: 'Anomaly Rings', icon: Activity },
    { key: 'correlationLinks', label: 'Correlation Links', icon: Link2 },
    { key: 'heat', label: 'Severity Heatmap', icon: Flame },
  ];

  return (
    <div className={`bg-surface/90 backdrop-blur border border-border rounded-xl p-3 shadow-xl ${className}`}>
      <div className="flex items-center gap-1.5 font-heading font-semibold uppercase tracking-wider text-[10px] text-muted mb-2.5">
        <Layers className="w-3.5 h-3.5 text-accent" />
        <span>Map Layers</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {layerConfigs.map(({ key, label, icon: Icon }) => {
          const active = mapLayers[key];
          return (
            <button
              key={key}
              onClick={() => setMapLayer(key, !active)}
              className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                active
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-surface-2/40 text-muted hover:text-text border border-border/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
              {active ? <Eye className="w-3 h-3 text-accent" /> : <EyeOff className="w-3 h-3 text-muted" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
