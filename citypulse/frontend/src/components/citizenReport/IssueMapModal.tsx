import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Eye, ThumbsUp, Sparkles, Filter, ShieldCheck } from 'lucide-react';
import { CitizenReport, PriorityLevel } from '../../types/citizenReport';
import { useTheme } from '../../hooks/useTheme';
import { SeverityBadge } from './SeverityBadge';
import { EvidenceVerificationBadge } from './EvidenceVerificationBadge';

interface IssueMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: CitizenReport[];
  onSelectReport: (report: CitizenReport) => void;
}

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  critical: '#FF4D6D',
  high: '#FF8A3D',
  medium: '#F5C542',
  low: '#2DD4A7',
};

function createReportMarkerIcon(priority: PriorityLevel, title: string) {
  const color = PRIORITY_COLORS[priority] || '#FF4D6D';
  const isCritical = priority === 'critical';

  return L.divIcon({
    className: 'custom-report-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; transform: translate(-17px, -17px); cursor: pointer;">
        ${
          isCritical
            ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${color}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>`
            : ''
        }
        <div style="
          width: 34px;
          height: 34px;
          background: rgba(18, 26, 48, 0.95);
          border: 2.5px solid ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          box-shadow: 0 4px 14px ${color}66;
          transition: transform 0.15s ease;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export const IssueMapModal: React.FC<IssueMapModalProps> = ({
  isOpen,
  onClose,
  reports,
  onSelectReport,
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const center: [number, number] = [40.714, -74.004];

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Map Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border bg-surface-2/70 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20 text-accent border border-accent/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-text">
                Interactive Civic Issue Map & Evidence Telemetry
              </h3>
              <p className="text-xs text-muted">
                Displaying {reports.length} active civic issues geolocated across municipal zones.
              </p>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Critical
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High
            </span>
            <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Medium
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Low
            </span>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full h-full relative">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={true}
            attributionControl={false}
            className="w-full h-full z-0"
          >
            <TileLayer url={tileUrl} maxZoom={19} />

            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[report.location.lat, report.location.lng]}
                icon={createReportMarkerIcon(report.priority, report.title)}
              >
                <Popup>
                  <div className="p-1.5 min-w-[240px] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <SeverityBadge priority={report.priority} size="sm" />
                      <span className="text-[10px] font-mono text-muted">{report.id}</span>
                    </div>

                    <h4 className="font-bold text-xs text-text font-heading line-clamp-2">
                      {report.title}
                    </h4>

                    <div className="flex items-center gap-1 text-[11px] text-muted">
                      <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="truncate">{report.location.address}</span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/60">
                      <EvidenceVerificationBadge
                        status={report.evidence.evidenceStatus}
                        score={report.evidence.scoreBreakdown.totalScore}
                        size="sm"
                      />
                      <span className="text-[10px] font-mono text-muted">
                        👍 {report.upvotes}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-border flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectReport(report);
                        }}
                        className="w-full py-1.5 rounded-lg bg-accent text-white font-bold text-[11px] hover:bg-accent/90 cursor-pointer text-center transition-colors"
                      >
                        View Evidence Engine Details →
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
