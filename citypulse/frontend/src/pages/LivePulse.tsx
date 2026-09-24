import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Navigation,
  Droplets,
  Siren,
  Plane,
  Wind,
  Layers,
  Maximize2,
  Users,
  Building2,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronRight,
  Plus,
  Minus,
  Crosshair,
  Volume2,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { useTheme } from '../hooks/useTheme';
import { CityMap } from '../components/map/CityMap';
import { HeartbeatECG } from '../components/pulse/HeartbeatECG';
import { SummaryCard } from '../components/pulse/SummaryCard';
import { Skeleton } from '../components/common/Skeleton';
import { FeedType, Status } from '../api/types';

// Mini Sparkline SVG Generator
const MiniSparkline: React.FC<{ color: string; trend: 'up' | 'down' | 'steady' }> = ({
  color,
  trend,
}) => {
  const pathData =
    trend === 'up'
      ? 'M0,18 Q15,14 30,16 T60,8 T90,4'
      : trend === 'down'
      ? 'M0,6 Q15,10 30,8 T60,16 T90,19'
      : 'M0,12 Q15,8 30,14 T60,10 T90,12';

  return (
    <svg className="w-16 h-6 overflow-visible" viewBox="0 0 90 24" fill="none">
      <path
        d={pathData}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const LivePulse: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { pulse, feeds, alerts, insights, setSelectedZoneId } = useCityStore();
  const [mapMode, setMapMode] = useState<'3D' | '2D'>('3D');

  if (!pulse) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[550px] rounded-3xl" />
          <Skeleton className="lg:col-span-4 h-[550px] rounded-3xl" />
        </div>
      </div>
    );
  }

  // Active unread alerts
  const recentAlerts = alerts.slice(0, 3);
  const activeInsightsList = Object.values(insights).filter((i) => i.status === 'active');

  // Breakdown counts for System Overview card
  const operationalCount = feeds.filter((f) => f.status === 'live').length;
  const moderateCount = feeds.filter((f) => f.status === 'delayed').length;
  const attentionCount = feeds.filter((f) => f.status === 'down').length;
  const criticalCount = pulse.status === 'critical' ? 1 : 0;

  // 6 Top Metric Cards Data
  const metricCards = [
    {
      title: 'Electricity',
      score: 98,
      statusLabel: 'Healthy',
      statusColor: '#10B981',
      sparkColor: '#F59E0B',
      icon: Zap,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
      trend: 'up' as const,
    },
    {
      title: 'Roads & Transit',
      score: 86,
      statusLabel: 'Moderate',
      statusColor: '#F59E0B',
      sparkColor: '#3B82F6',
      icon: Navigation,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      trend: 'steady' as const,
    },
    {
      title: 'Water Supply',
      score: 92,
      statusLabel: 'Healthy',
      statusColor: '#10B981',
      sparkColor: '#06B6D4',
      icon: Droplets,
      iconColor: 'text-cyan-500',
      iconBg: 'bg-cyan-500/10',
      trend: 'up' as const,
    },
    {
      title: 'Emergency 311',
      score: 100,
      statusLabel: 'Ready',
      statusColor: '#10B981',
      sparkColor: '#EF4444',
      icon: Siren,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-500/10',
      trend: 'up' as const,
    },
    {
      title: 'Drones & Patrols',
      score: 72,
      statusLabel: 'Active',
      statusColor: '#8B5CF6',
      sparkColor: '#8B5CF6',
      icon: Plane,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
      trend: 'steady' as const,
    },
    {
      title: 'Air Taxis / AQI',
      score: 68,
      statusLabel: 'Active',
      statusColor: '#14B8A6',
      sparkColor: '#14B8A6',
      icon: Wind,
      iconColor: 'text-teal-500',
      iconBg: 'bg-teal-500/10',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Top 6 Infrastructure Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="bg-surface border border-border/80 hover:border-accent/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${m.iconBg} ${m.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-heading font-semibold text-xs text-text truncate">
                  {m.title}
                </span>
              </div>

              <div className="flex items-end justify-between mt-1">
                <div>
                  <div className="font-heading font-bold text-xl text-text leading-none">
                    {m.score}%
                  </div>
                  <div
                    className="text-[11px] font-medium mt-1 font-sans"
                    style={{ color: m.statusColor }}
                  >
                    {m.statusLabel}
                  </div>
                </div>

                <MiniSparkline color={m.sparkColor} trend={m.trend} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Main Dashboard Split: City Live Map (Left) + System Overview & Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: City Live Map Card (8 Columns) */}
        <div className="lg:col-span-8 bg-surface border border-border/80 rounded-3xl p-5 shadow-md flex flex-col justify-between overflow-hidden">
          {/* Map Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading font-bold text-base text-text">City Live Map</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-calm/15 text-status-calm text-[10px] font-mono font-bold uppercase border border-status-calm/30">
                <span className="w-1.5 h-1.5 rounded-full bg-status-calm animate-pulse" />
                Live
              </span>
            </div>

            {/* 3D / 2D Switch & Expand */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-border">
                <button
                  onClick={() => setMapMode('3D')}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                    mapMode === '3D'
                      ? 'bg-surface-solid text-accent shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  3D
                </button>
                <button
                  onClick={() => setMapMode('2D')}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                    mapMode === '2D'
                      ? 'bg-surface-solid text-accent shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  2D
                </button>
              </div>

              <button
                onClick={() => navigate('/map')}
                className="p-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-border transition-colors cursor-pointer"
                title="Fullscreen Map"
                aria-label="Expand Map"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Map Visual Area */}
          <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-border/60 bg-bg">
            {mapMode === '2D' ? (
              <CityMap compact height="100%" showControls={false} />
            ) : (
              /* 3D Futuristic Isometric City Landscape with Interactive Glowing Pins */
              <div className={`relative w-full h-full ${isDark ? 'bg-gradient-to-b from-[#101935] to-[#0B1020]' : 'bg-gradient-to-b from-[#EEF4FC] to-[#DCE6F5]'} overflow-hidden flex items-center justify-center select-none transition-colors duration-300`}>
                {/* 3D Grid & Horizon Glow */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    backgroundImage: isDark
                      ? `radial-gradient(ellipse at 50% 40%, rgba(79, 120, 255, 0.25) 0%, transparent 70%), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`
                      : `radial-gradient(ellipse at 50% 40%, rgba(37, 99, 235, 0.15) 0%, transparent 70%), linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 36px 36px, 36px 36px',
                    transform: 'perspective(600px) rotateX(48deg) scale(1.4)',
                  }}
                />

                {/* 3D Futuristic Buildings Mesh Representation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-90">
                  <svg className="w-full h-full max-w-2xl" viewBox="0 0 800 500" fill="none">
                    {/* River / Transit Channel */}
                    <path
                      d="M 50 260 C 220 280, 360 210, 750 300"
                      stroke={isDark ? '#38BDF8' : '#0284C7'}
                      strokeWidth="24"
                      strokeOpacity={isDark ? '0.45' : '0.65'}
                      strokeLinecap="round"
                    />

                    {/* Central 3D Highrises */}
                    <g transform="translate(360, 180)">
                      <polygon points="0,0 40,-20 80,0 40,20" fill={isDark ? '#2A385E' : '#FFFFFF'} />
                      <polygon points="0,0 40,20 40,140 0,120" fill={isDark ? '#1E2846' : '#E2E8F0'} />
                      <polygon points="40,20 80,0 80,120 40,140" fill={isDark ? '#18223B' : '#CBD5E1'} />
                    </g>

                    <g transform="translate(440, 140)">
                      <polygon points="0,0 35,-18 70,0 35,18" fill={isDark ? '#3D5084' : '#F8FAFC'} />
                      <polygon points="0,0 35,18 35,180 0,162" fill={isDark ? '#2A385E' : '#E2E8F0'} />
                      <polygon points="35,18 70,0 70,162 35,180" fill={isDark ? '#1E2846' : '#CBD5E1'} />
                    </g>

                    <g transform="translate(280, 200)">
                      <polygon points="0,0 30,-15 60,0 30,15" fill={isDark ? '#3D5084' : '#FFFFFF'} />
                      <polygon points="0,0 30,15 30,120 0,105" fill={isDark ? '#2A385E' : '#E2E8F0'} />
                      <polygon points="30,15 60,0 60,105 30,120" fill={isDark ? '#1E2846' : '#CBD5E1'} />
                    </g>

                    <g transform="translate(220, 240)">
                      <polygon points="0,0 45,-22 90,0 45,22" fill={isDark ? '#2A385E' : '#F8FAFC'} />
                      <polygon points="0,0 45,22 45,90 0,68" fill={isDark ? '#1E2846' : '#E2E8F0'} />
                      <polygon points="45,22 90,0 90,68 45,90" fill={isDark ? '#18223B' : '#CBD5E1'} />
                    </g>

                    <g transform="translate(520, 220)">
                      <polygon points="0,0 40,-20 80,0 40,20" fill={isDark ? '#2A385E' : '#FFFFFF'} />
                      <polygon points="0,0 40,20 40,110 0,90" fill={isDark ? '#1E2846' : '#E2E8F0'} />
                      <polygon points="40,20 80,0 80,90 40,110" fill={isDark ? '#18223B' : '#CBD5E1'} />
                    </g>
                  </svg>
                </div>

                {/* Interactive Floating Glowing Pins (Matching image pins) */}
                <div className="absolute inset-0 pointer-events-auto">
                  {/* Electricity Pin */}
                  <div
                    onClick={() => setSelectedZoneId('z4')}
                    className="absolute top-[38%] left-[26%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/50 border-2 border-white transition-transform duration-200 group-hover:scale-115">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <div className="w-1.5 h-3 bg-amber-500 -mt-0.5 rounded-b-full" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text font-mono whitespace-nowrap shadow-md">
                        Power Grid: Nominal
                      </span>
                    </div>
                  </div>

                  {/* Water Pin */}
                  <div
                    onClick={() => setSelectedZoneId('z2')}
                    className="absolute top-[28%] left-[54%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/50 border-2 border-white transition-transform duration-200 group-hover:scale-115">
                        <Droplets className="w-4 h-4 fill-white" />
                      </div>
                      <div className="w-1.5 h-3 bg-cyan-500 -mt-0.5 rounded-b-full" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text font-mono whitespace-nowrap shadow-md">
                        Water Network: 92%
                      </span>
                    </div>
                  </div>

                  {/* Roads / Transit Pin */}
                  <div
                    onClick={() => setSelectedZoneId('z5')}
                    className="absolute top-[58%] left-[44%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/50 border-2 border-white transition-transform duration-200 group-hover:scale-115">
                        <Navigation className="w-4 h-4 fill-white" />
                      </div>
                      <div className="w-1.5 h-3 bg-blue-600 -mt-0.5 rounded-b-full" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text font-mono whitespace-nowrap shadow-md">
                        Transit: Central Station
                      </span>
                    </div>
                  </div>

                  {/* Emergency 311 Pin */}
                  <div
                    onClick={() => setSelectedZoneId('z6')}
                    className="absolute top-[48%] left-[64%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/50 border-2 border-white transition-transform duration-200 group-hover:scale-115">
                        <Siren className="w-4 h-4 fill-white" />
                      </div>
                      <div className="w-1.5 h-3 bg-rose-500 -mt-0.5 rounded-b-full" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text font-mono whitespace-nowrap shadow-md">
                        Emergency Response: Ready
                      </span>
                    </div>
                  </div>

                  {/* Drones Pin */}
                  <div
                    onClick={() => setSelectedZoneId('z8')}
                    className="absolute top-[68%] left-[58%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/50 border-2 border-white transition-transform duration-200 group-hover:scale-115">
                        <Plane className="w-4 h-4 fill-white" />
                      </div>
                      <div className="w-1.5 h-3 bg-purple-600 -mt-0.5 rounded-b-full" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text font-mono whitespace-nowrap shadow-md">
                        Drone Patrol: Sector 4
                      </span>
                    </div>
                  </div>

                  {/* Air Taxis / AQI Pin */}
                  <div
                    onClick={() => setSelectedZoneId('z9')}
                    className="absolute top-[72%] left-[72%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/50 border-2 border-white transition-transform duration-200 group-hover:scale-115">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div className="w-1.5 h-3 bg-teal-500 -mt-0.5 rounded-b-full" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text font-mono whitespace-nowrap shadow-md">
                        AQI: 78 (Good)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom-Left Zoom & Location Controls */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
                  <button
                    onClick={() => setMapMode('2D')}
                    className="p-2 rounded-xl bg-surface/90 hover:bg-surface text-text border border-border shadow-md cursor-pointer transition-colors"
                    title="Zoom in (Switch to 2D Detailed Map)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMapMode('2D')}
                    className="p-2 rounded-xl bg-surface/90 hover:bg-surface text-text border border-border shadow-md cursor-pointer transition-colors"
                    title="Zoom out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedZoneId('z5')}
                    className="p-2 rounded-xl bg-surface/90 hover:bg-surface text-text border border-border shadow-md cursor-pointer transition-colors"
                    title="Target City Center"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stats Ribbon under Map (Matching Image ribbon) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-bold text-base text-text">2.4M</span>
                  <span className="text-[10px] text-status-calm font-medium">↑ 2.5%</span>
                </div>
                <div className="text-[11px] text-muted">Population</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-bold text-base text-text">1,429</span>
                  <span className="text-[10px] text-status-calm font-medium">↑ 4.1%</span>
                </div>
                <div className="text-[11px] text-muted">City Assets</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-bold text-base text-text">98.2%</span>
                  <span className="text-[10px] text-status-calm font-medium">↑ 1.2%</span>
                </div>
                <div className="text-[11px] text-muted">Service Uptime</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 flex-shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-bold text-base text-text">78</span>
                  <span className="text-[10px] text-status-calm font-medium">Good</span>
                </div>
                <div className="text-[11px] text-muted">Air Quality (AQI)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Overview & Recent Alerts (4 Columns) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. System Overview (Radial Score Gauge) Card */}
          <div className="bg-surface border border-border/80 rounded-3xl p-5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-text">System Overview</h3>
              <Link
                to="/about"
                className="p-1 rounded-lg text-muted hover:text-text transition-colors"
                title="View Scoring Breakdown"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Gauge & Category Breakdown */}
            <div className="flex items-center justify-around gap-4 py-2">
              {/* Radial Progress Ring */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="var(--surface-2)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="var(--accent)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(2 * Math.PI * 40) * (1 - pulse.score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-heading font-bold text-2xl text-text leading-none">
                    {pulse.score.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-muted font-sans mt-0.5">Overall Score</span>
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-muted">
                    <span className="w-2 h-2 rounded-full bg-status-calm" />
                    <span>Operational</span>
                  </div>
                  <span className="font-mono font-bold text-text">{operationalCount}</span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-muted">
                    <span className="w-2 h-2 rounded-full bg-status-watch" />
                    <span>Moderate</span>
                  </div>
                  <span className="font-mono font-bold text-text">{moderateCount}</span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-muted">
                    <span className="w-2 h-2 rounded-full bg-status-strained" />
                    <span>Attention</span>
                  </div>
                  <span className="font-mono font-bold text-text">{attentionCount}</span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-muted">
                    <span className="w-2 h-2 rounded-full bg-status-critical" />
                    <span>Critical</span>
                  </div>
                  <span className="font-mono font-bold text-text">{criticalCount}</span>
                </div>
              </div>
            </div>

            {/* City Heartbeat Waveform integration */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-[10px] text-muted uppercase font-heading tracking-wider mb-1">
                <span>Living City Pulse</span>
                <span className="font-mono">{pulse.bpm} BPM</span>
              </div>
              <HeartbeatECG
                bpm={pulse.bpm}
                irregularity={pulse.irregularity}
                status={pulse.status}
                confidence={pulse.confidence}
                height={48}
              />
            </div>
          </div>

          {/* 2. Recent Alerts & Signals Card */}
          <div className="bg-surface border border-border/80 rounded-3xl p-5 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-heading font-bold text-base text-text">Recent Alerts</h3>
              <Link
                to="/alerts"
                className="text-xs text-accent hover:text-accent-hover font-heading font-medium"
              >
                View All
              </Link>
            </div>

            {/* Alerts List */}
            <div className="space-y-2.5">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-surface-2/40 hover:bg-surface-2 border border-border/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-semibold text-xs text-text truncate">
                          {alt.title}
                        </div>
                        <div className="text-[11px] text-muted truncate">
                          {alt.zone_id ? `Sector ${alt.zone_id.toUpperCase()}` : 'Central Corridor'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted font-mono">
                        {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alt.level === 'critical' ? 'bg-status-critical' : 'bg-status-watch'
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                /* Nominal live samples matching screenshot */
                <>
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-surface-2/40 border border-border/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-semibold text-xs text-text truncate">
                          Traffic flow monitored
                        </div>
                        <div className="text-[11px] text-muted truncate">
                          Central Station Corridor
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted font-mono">2m ago</span>
                      <span className="w-2 h-2 rounded-full bg-status-calm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-surface-2/40 border border-border/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-semibold text-xs text-text truncate">
                          Substation peak telemetry
                        </div>
                        <div className="text-[11px] text-muted truncate">
                          Sector 18, Industrial
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted font-mono">12m ago</span>
                      <span className="w-2 h-2 rounded-full bg-status-watch" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-surface-2/40 border border-border/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 flex-shrink-0">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-semibold text-xs text-text truncate">
                          Water pressure nominal
                        </div>
                        <div className="text-[11px] text-muted truncate">
                          Riverside District
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted font-mono">25m ago</span>
                      <span className="w-2 h-2 rounded-full bg-status-calm" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Grounded Assessment Summary Card */}
          <SummaryCard summary={pulse.summary} status={pulse.status} />
        </div>
      </div>
    </div>
  );
};
