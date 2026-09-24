import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  Polyline,
  Tooltip as LeafletTooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Maximize2,
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  Droplets,
  Thermometer,
  Layers as LayersIcon,
  Plus,
  Minus,
  Crosshair,
  MapPin,
  Sparkles,
  Info,
  Leaf,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { useTheme } from '../../hooks/useTheme';
import { NormalizedEvent, Status, FeedType, Insight } from '../../api/types';
import { MapLegend } from './MapLegend';
import { LayerToggles } from './LayerToggles';
import { ZoneDrawer } from './ZoneDrawer';

// Lucide icon SVG string generators for Leaflet DivIcon
const FEED_SVG_MAP: Record<FeedType, string> = {
  weather: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  transit: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>`,
  incident: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/></svg>`,
  air_quality: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  power: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  noise: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
};

function createEventIcon(event: NormalizedEvent) {
  const statusColor =
    event.severity >= 0.75
      ? '#FF4D6D'
      : event.severity >= 0.5
      ? '#FF8A3D'
      : event.severity >= 0.25
      ? '#F5C542'
      : '#2DD4A7';

  const iconSvg = FEED_SVG_MAP[event.feed] || FEED_SVG_MAP.incident;

  return L.divIcon({
    className: 'custom-event-marker',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: rgba(18, 26, 48, 0.95);
        border: 2px solid ${statusColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${statusColor};
        box-shadow: 0 4px 12px ${statusColor}55;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        ${iconSvg}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createCentroidLabelIcon(name: string, score: number, status: Status) {
  const statusColor =
    status === 'calm'
      ? '#2DD4A7'
      : status === 'watch'
      ? '#F5C542'
      : status === 'strained'
      ? '#FF8A3D'
      : '#FF4D6D';

  return L.divIcon({
    className: 'zone-centroid-label',
    html: `
      <div style="
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(0, 0, 0, 0.08);
        padding: 3px 10px;
        border-radius: 9999px;
        color: #1e293b;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        display: flex;
        align-items: center;
        gap: 6px;
        transform: translate(-50%, -50%);
      ">
        <span>${name}</span>
        <span style="color: ${statusColor}; font-family: 'JetBrains Mono', monospace; font-weight: 700;">
          ${score.toFixed(0)}
        </span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createAnomalyRingIcon(severity: number) {
  return L.divIcon({
    className: 'anomaly-ring-icon',
    html: `
      <div style="position: relative; width: 60px; height: 60px; pointer-events: none; transform: translate(-30px, -30px);">
        <div class="pulse-ring-anim" style="
          position: absolute;
          inset: 0;
          border: 2px solid #FF4D6D;
          border-radius: 50%;
          box-shadow: 0 0 15px #FF4D6D;
        "></div>
        <div style="
          position: absolute;
          inset: 18px;
          background: #FF4D6D;
          border-radius: 50%;
          opacity: 0.6;
        "></div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
}

// Map Controller Helper to center map and handle controls
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Map Action Controls Component (Right side vertical toolstrip)
const MapActionsToolstrip: React.FC = () => {
  const map = useMap();
  const { setMapLayer, mapLayers } = useCityStore();

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-black/5 dark:border-white/10 p-1.5 space-y-1">
      <button
        onClick={() => setMapLayer('heat', !mapLayers.heat)}
        className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
          mapLayers.heat
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Toggle Heat Blobs"
      >
        <LayersIcon className="w-4 h-4" />
      </button>

      <button
        onClick={() => map.zoomIn()}
        className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>

      <button
        onClick={() => map.setView([40.7128, -74.006], 13)}
        className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Recenter City Center"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
};

interface CityMapProps {
  compact?: boolean;
  height?: string | number;
  className?: string;
  showControls?: boolean;
}

export const CityMap: React.FC<CityMapProps> = ({
  compact = false,
  height = '100%',
  className = '',
  showControls = true,
}) => {
  const { isDark } = useTheme();
  const {
    config,
    zonesGeoJSON,
    events,
    insights,
    mapLayers,
    activeFeedFilter,
    selectedZoneId,
    setSelectedZoneId,
    highlightedInsightId,
    pulse,
  } = useCityStore();

  const [activeBubble, setActiveBubble] = useState<string | null>(null);

  const center: [number, number] = config?.center
    ? [config.center.lat, config.center.lng]
    : [40.7128, -74.006];
  const zoom = compact ? 12 : config?.zoom || 13;

  // Support dynamic map keys from environment variables (CARTO, Mapbox, or custom tile provider)
  const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const customTileUrl = import.meta.env.VITE_CUSTOM_TILE_URL;

  let tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  if (customTileUrl) {
    tileUrl = customTileUrl;
  } else if (mapboxToken) {
    tileUrl = `https://api.mapbox.com/styles/v1/mapbox/${isDark ? 'dark-v11' : 'light-v11'}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`;
  } else if (cartoApiKey) {
    tileUrl = `https://{s}.basemaps.cartocdn.com/${isDark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png?api_key=${cartoApiKey}`;
  }

  // Zone style generator for GeoJSON
  const zoneStyle = (feature: any) => {
    const props = feature.properties;
    const status: Status = props?.status || 'calm';
    const isSelected = selectedZoneId === props?.id;

    const colors = {
      calm: '#2DD4A7',
      watch: '#F5C542',
      strained: '#FF8A3D',
      critical: '#FF4D6D',
    };

    const color = colors[status] || colors.calm;

    return {
      fillColor: color,
      fillOpacity: isSelected ? 0.45 : 0.18,
      color: isSelected ? '#10b981' : color,
      weight: isSelected ? 2.5 : 1,
      dashArray: isSelected ? '' : '3',
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    layer.on({
      click: () => {
        if (props?.id) {
          setSelectedZoneId(props.id);
        }
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.35, weight: 2 });
      },
      mouseout: (e) => {
        const l = e.target;
        const isSelected = selectedZoneId === props?.id;
        l.setStyle({
          fillOpacity: isSelected ? 0.45 : 0.18,
          weight: isSelected ? 2.5 : 1,
        });
      },
    });
  };

  // Filtered events
  const visibleEvents = useMemo(() => {
    const list = activeFeedFilter === 'all' ? events : events.filter((e) => e.feed === activeFeedFilter);
    return list.slice(0, compact ? 20 : 60);
  }, [events, activeFeedFilter, compact]);

  // Active Anomalies for Anomaly Rings
  const activeAnomalies = useMemo(() => {
    return Object.values(insights).filter((ins) => ins.status === 'active' && ins.kind === 'anomaly');
  }, [insights]);

  // Active Correlations for Correlation Links
  const activeCorrelations = useMemo(() => {
    return Object.values(insights).filter((ins) => ins.status === 'active' && ins.kind === 'correlation');
  }, [insights]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-slate-100 dark:bg-slate-950 shadow-2xl ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={!compact}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full z-0"
      >
        <MapController center={center} zoom={zoom} />

        {/* Free, High-Res, Watermark-Free Esri Canvas Tile Layer */}
        <TileLayer
          url={tileUrl}
          maxZoom={19}
          attribution='&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        />

        {/* Zones GeoJSON Layer (Subtle) */}
        {mapLayers.zones && zonesGeoJSON && (
          <GeoJSON
            key={`geojson-${JSON.stringify(zonesGeoJSON)}`}
            data={zonesGeoJSON}
            style={zoneStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Zone Centroid Labels */}
        {mapLayers.zones &&
          zonesGeoJSON &&
          zonesGeoJSON.features.map((f: any) => {
            const props = f.properties;
            const centroid = props.centroid;
            if (!centroid) return null;
            return (
              <Marker
                key={`label-${props.id}`}
                position={[centroid.lat, centroid.lng]}
                icon={createCentroidLabelIcon(props.name, props.pulse_score || 90, props.status || 'calm')}
                interactive={false}
              />
            );
          })}

        {/* Anomaly Rings */}
        {mapLayers.anomalyRings &&
          activeAnomalies.map((anom) => {
            const zoneId = anom.zone_ids[0];
            const zoneFeature = zonesGeoJSON?.features.find((f: any) => f.properties.id === zoneId);
            const centroid = zoneFeature?.properties?.centroid;
            if (!centroid) return null;

            return (
              <Marker
                key={`anom-ring-${anom.id}`}
                position={[centroid.lat, centroid.lng]}
                icon={createAnomalyRingIcon(anom.severity)}
                interactive={false}
              />
            );
          })}

        {/* Correlation Links */}
        {mapLayers.correlationLinks &&
          activeCorrelations.map((corr) => {
            if (corr.zone_ids.length < 2) return null;
            const z1 = zonesGeoJSON?.features.find((f: any) => f.properties.id === corr.zone_ids[0]);
            const z2 = zonesGeoJSON?.features.find((f: any) => f.properties.id === corr.zone_ids[1]);
            const c1 = z1?.properties?.centroid;
            const c2 = z2?.properties?.centroid;
            if (!c1 || !c2) return null;

            const isHighlighted = highlightedInsightId === corr.id;

            return (
              <Polyline
                key={`corr-link-${corr.id}`}
                positions={[
                  [c1.lat, c1.lng],
                  [c2.lat, c2.lng],
                ]}
                pathOptions={{
                  color: isHighlighted ? '#10b981' : '#f59e0b',
                  weight: isHighlighted ? 4 : 2,
                  dashArray: '6 6',
                  className: 'animated-dash',
                }}
              >
                <LeafletTooltip direction="top" opacity={0.95}>
                  <div className="font-heading font-bold text-xs">{corr.title}</div>
                  <div className="text-[10px] text-muted italic font-sans">{corr.plain_text}</div>
                </LeafletTooltip>
              </Polyline>
            );
          })}

        {/* Event Markers */}
        {mapLayers.events &&
          visibleEvents.map((ev) => (
            <Marker key={ev.id} position={[ev.lat, ev.lng]} icon={createEventIcon(ev)}>
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-2 text-accent border border-border">
                      {ev.feed}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-text font-heading mb-1">{ev.title}</h5>
                  {ev.description && <p className="text-xs text-text/80 mb-2">{ev.description}</p>}

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted font-mono">
                    <span>Severity: {(ev.severity * 100).toFixed(0)}%</span>
                    <span>Conf: {(ev.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Right side floating toolstrip */}
        <MapActionsToolstrip />
      </MapContainer>

      {/* Organic Gaussian Radial Heat Blobs Overlay (WeatherSwim Style) */}
      <div className="absolute inset-0 pointer-events-none z-[400] flex items-center justify-center overflow-hidden">
        {/* Layer 1: Outermost Soft Green Halo */}
        <div
          className="absolute w-[620px] h-[480px] rounded-[50%] opacity-40 blur-3xl transition-transform duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.45) 0%, rgba(134, 239, 172, 0.25) 50%, rgba(240, 253, 244, 0) 80%)',
            transform: 'translate(-5%, -2%) scale(1.15)',
          }}
        />

        {/* Layer 2: Middle Yellow-Amber Ring */}
        <div
          className="absolute w-[440px] h-[380px] rounded-[50%] opacity-55 blur-2xl transition-transform duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(253, 230, 138, 0.35) 60%, rgba(254, 243, 199, 0) 85%)',
            transform: 'translate(4%, -1%)',
          }}
        />

        {/* Layer 3: Warm Coral Orange Blob */}
        <div
          className="absolute w-[300px] h-[280px] rounded-[50%] opacity-65 blur-xl transition-transform duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.75) 0%, rgba(254, 215, 170, 0.4) 65%, rgba(255, 237, 213, 0) 90%)',
            transform: 'translate(2%, 0%)',
          }}
        />

        {/* Layer 4: Intense Core Salmon-Red Heat Spot */}
        <div
          className="absolute w-[180px] h-[180px] rounded-[50%] opacity-70 blur-lg transition-transform duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(248, 113, 113, 0.85) 0%, rgba(254, 202, 202, 0.45) 60%, rgba(254, 226, 226, 0) 90%)',
            transform: 'translate(0%, 0%)',
          }}
        />
      </div>

      {/* Floating Gradient Legend Pill (Top-Left of Map) */}
      <div className="absolute top-6 left-6 z-[500] pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 px-4 shadow-xl border border-black/5 dark:border-white/10 space-y-1.5">
        <div className="flex items-center justify-between gap-6 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
          <span>Low</span>
          <span>High</span>
        </div>
        <div
          className="w-36 h-2 rounded-full shadow-inner"
          style={{
            background: 'linear-gradient(to right, #4ade80, #a3e635, #facc15, #fb923c, #f87171)',
          }}
        />
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 pt-0.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>CO₂ concentration</span>
        </div>
      </div>

      {/* Orbiting Frosted Glass Metric Pills & Center Location Pin */}
      <div className="absolute inset-0 pointer-events-none z-[500] flex items-center justify-center">
        {/* Center Target Marker */}
        <div className="relative pointer-events-auto flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-2xl border-2 border-emerald-500 flex items-center justify-center transition-transform hover:scale-110">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <MapPin className="w-3 h-3 fill-white" />
            </div>
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
          </div>
          <span className="mt-1.5 px-3 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-black/5 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white font-heading shadow-md">
            {config?.city_name || 'Singapore'}
          </span>
        </div>

        {/* Orbiting Bubble 1: Rainfall (Top-Left) */}
        <div
          onClick={() => setActiveBubble('rainfall')}
          className="absolute -translate-x-36 -translate-y-28 pointer-events-auto group cursor-pointer"
        >
          <div className="w-28 h-28 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-3 shadow-2xl border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/20">
            <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1">
              <CloudRain className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold font-heading text-slate-800 dark:text-white">0</span>
              <span className="text-[10px] font-mono text-slate-400">mm</span>
            </div>
            <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              RAINFALL
            </span>
          </div>
        </div>

        {/* Orbiting Bubble 2: Humidity (Top-Right) */}
        <div
          onClick={() => setActiveBubble('humidity')}
          className="absolute translate-x-36 -translate-y-28 pointer-events-auto group cursor-pointer"
        >
          <div className="w-28 h-28 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-3 shadow-2xl border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-110 hover:shadow-sky-500/20">
            <div className="p-1.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mb-1">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold font-heading text-slate-800 dark:text-white">84</span>
              <span className="text-[10px] font-mono text-slate-400">%</span>
            </div>
            <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              HUMIDITY
            </span>
          </div>
        </div>

        {/* Orbiting Bubble 3: Temperature (Mid-Left) */}
        <div
          onClick={() => setActiveBubble('temperature')}
          className="absolute -translate-x-32 translate-y-12 pointer-events-auto group cursor-pointer"
        >
          <div className="w-28 h-28 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-3 shadow-2xl border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-110 hover:shadow-amber-500/20">
            <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-1">
              <Wind className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold font-heading text-slate-800 dark:text-white">23</span>
              <span className="text-[10px] font-mono text-slate-400">°C</span>
            </div>
            <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              TEMPERATURE
            </span>
          </div>
        </div>

        {/* Orbiting Bubble 4: PM2.5 / Air (Mid-Right) */}
        <div
          onClick={() => setActiveBubble('air')}
          className="absolute translate-x-36 translate-y-12 pointer-events-auto group cursor-pointer"
        >
          <div className="w-28 h-28 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-3 shadow-2xl border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/20">
            <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold font-heading text-slate-800 dark:text-white">5</span>
              <span className="text-[10px] font-mono text-slate-400">idx</span>
            </div>
            <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              PM2.5/AIR
            </span>
          </div>
        </div>
      </div>

      {/* Layer Toggles & Zone Health Legend when requested */}
      {showControls && !compact && mapLayers.zones && (
        <MapLegend className="absolute bottom-6 left-6 z-[500]" />
      )}

      {/* Interactive Zone Detail Drawer */}
      <ZoneDrawer />
    </div>
  );
};
