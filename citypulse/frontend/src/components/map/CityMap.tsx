import React, { useEffect, useMemo } from 'react';
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
import { Maximize2, CloudRain, Bus, Siren, Wind, Zap, Volume2 } from 'lucide-react';
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
        background: #121A30;
        border: 2px solid ${statusColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${statusColor};
        box-shadow: 0 0 12px ${statusColor}66;
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
        background: rgba(18, 26, 48, 0.88);
        border: 1px solid ${statusColor}88;
        padding: 2px 8px;
        border-radius: 9999px;
        color: #E8ECF8;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 4px;
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

// Map Controller Helper to center map
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
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
  } = useCityStore();

  const center: [number, number] = config?.center
    ? [config.center.lat, config.center.lng]
    : [40.7128, -74.006];
  const zoom = compact ? 12 : config?.zoom || 13;

  // CARTO Tile URL
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

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
      fillOpacity: isSelected ? 0.55 : 0.28,
      color: isSelected ? '#FFFFFF' : color,
      weight: isSelected ? 3 : 1.5,
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
        l.setStyle({ fillOpacity: 0.45, weight: 2.5 });
      },
      mouseout: (e) => {
        const l = e.target;
        const isSelected = selectedZoneId === props?.id;
        l.setStyle({
          fillOpacity: isSelected ? 0.55 : 0.28,
          weight: isSelected ? 3 : 1.5,
        });
      },
    });
  };

  // Filtered events
  const visibleEvents = useMemo(() => {
    const list = activeFeedFilter === 'all' ? events : events.filter((e) => e.feed === activeFeedFilter);
    return list.slice(0, compact ? 40 : 150);
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
      className={`relative w-full overflow-hidden rounded-2xl border border-border bg-bg ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={!compact}
        zoomControl={!compact}
        attributionControl={false}
        className="w-full h-full z-0"
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          url={tileUrl}
          maxZoom={19}
          subdomains="abcd"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Zones GeoJSON Layer */}
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
                  color: isHighlighted ? '#FFFFFF' : '#A855F7',
                  weight: isHighlighted ? 4 : 2.5,
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
      </MapContainer>

      {/* Floating Controls (Full view) */}
      {showControls && !compact && (
        <>
          <LayerToggles className="absolute top-4 left-4 z-[999] max-w-[200px]" />
          <MapLegend className="absolute bottom-6 left-4 z-[999]" />
        </>
      )}

      {/* Interactive Zone Detail Drawer */}
      <ZoneDrawer />
    </div>
  );
};
