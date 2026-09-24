import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Bell,
  Wifi,
  WifiOff,
  CloudSun,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { config, connection, mode, pulse, alerts, replay } = useCityStore();

  const unreadAlerts = alerts.filter((a) => !a.acknowledged);
  const isOperational = pulse ? pulse.status === 'calm' : true;
  const isStrained = pulse && (pulse.status === 'strained' || pulse.status === 'critical');

  return (
    <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold font-heading text-text tracking-tight">
            Smart City Operating System
          </h1>
          {mode === 'replay' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase">
              Replay Active {replay.speed ? `(×${replay.speed})` : ''}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted font-sans mt-0.5">
          Real-time overview and management of city infrastructure and services.
        </p>
      </div>

      {/* Middle & Right Header Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search Bar */}
        <div className="relative hidden xl:block w-64">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search zones, sensors, feeds..."
            className="w-full bg-surface-2/70 hover:bg-surface-2 focus:bg-surface-solid border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text placeholder:text-muted/70 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Live Weather / Location Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2/60 border border-border text-xs text-text">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <span className="font-medium">{config?.city_name || 'Demo City'}</span>
          <span className="text-muted font-mono">22°C</span>
        </div>

        {/* Operational Status Pill */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-heading font-semibold transition-all ${
            isStrained
              ? 'bg-status-critical/15 text-status-critical border-status-critical/30 shadow-glow-critical'
              : pulse?.status === 'watch'
              ? 'bg-status-watch/15 text-status-watch border-status-watch/30'
              : 'bg-status-calm/15 text-status-calm border-status-calm/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isStrained
                ? 'bg-status-critical animate-ping'
                : isOperational
                ? 'bg-status-calm animate-pulse'
                : 'bg-status-watch'
            }`}
          />
          <span>
            {isStrained
              ? 'Elevated Civic Strain'
              : pulse?.status === 'watch'
              ? 'Systems Under Watch'
              : 'All Systems Operational'}
          </span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2.5 rounded-xl bg-surface-2/80 hover:bg-surface-2 text-muted hover:text-text border border-border transition-colors cursor-pointer"
          title="Security & System Alerts"
          aria-label="Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-status-critical text-white font-mono text-[9px] font-bold">
              {unreadAlerts.length}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-indigo-500 text-white font-heading font-bold text-xs flex items-center justify-center shadow-md cursor-pointer border border-white/20">
          AS
        </div>
      </div>
    </header>
  );
};
