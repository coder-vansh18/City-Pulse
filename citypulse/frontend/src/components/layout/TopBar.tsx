import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { useTheme } from '../../hooks/useTheme';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    config,
    connection,
    mode,
    soundOn,
    toggleSound,
    alerts,
    replay,
  } = useCityStore();

  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand & City */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white shadow-glow-calm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text font-heading tracking-tight leading-none">
              CityPulse
            </h1>
            <span className="text-[10px] text-muted font-mono leading-none">
              {config?.city_name || 'Civic Health Core'}
            </span>
          </div>
        </Link>

        {/* Live / Replay Mode Pill */}
        <div className="hidden sm:flex items-center ml-2">
          {mode === 'replay' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-semibold uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Replay {replay.speed ? `×${replay.speed}` : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-calm/15 border border-status-calm/30 text-status-calm font-mono text-[11px] font-semibold uppercase">
              <span className="w-2 h-2 rounded-full bg-status-calm animate-ping-slow" />
              Live Telemetry
            </span>
          )}
        </div>
      </div>

      {/* Right: Controls & Alerts */}
      <div className="flex items-center gap-2">
        {/* WS Connection Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2/60 border border-border/60 text-xs font-mono">
          {connection === 'connected' ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-status-calm" />
              <span className="text-status-calm text-[11px]">Synced</span>
            </>
          ) : connection === 'reconnecting' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-400 text-[11px]">Reconnecting...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-status-critical" />
              <span className="text-status-critical text-[11px]">Offline</span>
            </>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            soundOn
              ? 'bg-accent/15 text-accent border-accent/40'
              : 'bg-surface-2 hover:bg-surface-2/80 text-muted border-border'
          }`}
          title={soundOn ? 'Mute Heartbeat Audio' : 'Enable Lub-Dub Heartbeat Sound'}
          aria-label="Sound Toggle"
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-border transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Theme Toggle"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-border transition-colors cursor-pointer"
          title="Civic Alerts"
          aria-label="Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-status-critical text-white font-mono text-[10px] font-bold">
              {unreadAlerts.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
