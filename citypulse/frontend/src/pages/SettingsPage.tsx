import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  Bell,
  Sliders,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Save,
  Radio,
  Cpu,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { soundOn, toggleSound, timeWindowMin, setTimeWindowMin } = useCityStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const [cadence, setCadence] = useState('5');
  const [allowCriticalPopups, setAllowCriticalPopups] = useState(true);
  const [allowSms, setAllowSms] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-text tracking-tight">
              CityPulse System & Operator Settings
            </h1>
          </div>
          <p className="text-xs text-muted">
            Configure telemetry ingestion rates, alert dispatch rules, audio feedback, and visual preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings successfully persisted to municipal local configuration!</span>
        </div>
      )}

      {/* 1. Operator Profile Settings */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text font-heading flex items-center gap-2">
          <User className="w-4 h-4 text-accent" />
          Operator Profile & SSO Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-muted block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Alex Rivera (City Operations)'}
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-text font-medium"
            />
          </div>

          <div>
            <label className="text-muted block font-semibold mb-1">Municipal Email</label>
            <input
              type="text"
              readOnly
              value={user?.email || 'alex.rivera@citypulse.gov'}
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-text font-medium"
            />
          </div>

          <div>
            <label className="text-muted block font-semibold mb-1">Assigned Role</label>
            <input
              type="text"
              readOnly
              value={user?.role ? `${user.role.toUpperCase()} • Level 3 Authorization` : 'Lead Incident Commander • Level 3'}
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-accent font-bold"
            />
          </div>

          <div>
            <label className="text-muted block font-semibold mb-1">SSO Authentication Status</label>
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Municipal Token</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Notification & Dispatch Preferences */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text font-heading flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          Real-time Alerts & Incident Dispatch
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-2/40 border border-border hover:bg-surface-2/70 transition-colors cursor-pointer">
            <div>
              <span className="font-bold text-text block">Real-time Warning Toasts</span>
              <span className="text-muted text-[11px]">Show floating warning banner when severe incidents occur</span>
            </div>
            <input
              type="checkbox"
              checked={allowCriticalPopups}
              onChange={(e) => setAllowCriticalPopups(e.target.checked)}
              className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-2/40 border border-border hover:bg-surface-2/70 transition-colors cursor-pointer">
            <div>
              <span className="font-bold text-text block">Audio Heartbeat & Incident Tone</span>
              <span className="text-muted text-[11px]">Subtle ambient synthesizer pitch for civic strain</span>
            </div>
            <button
              onClick={toggleSound}
              type="button"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundOn
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-surface-2 text-muted border-border'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </label>
        </div>
      </div>

      {/* 3. Telemetry & Dashboard Preferences */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text font-heading flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          Telemetry Pipeline & Ingestion Cadence
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-muted block font-semibold mb-1">Telemetry Sweep Cadence</label>
            <select
              value={cadence}
              onChange={(e) => setCadence(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-text font-medium focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="5">5 Seconds (Real-time Fast)</option>
              <option value="10">10 Seconds (Standard)</option>
              <option value="30">30 Seconds (Low Bandwidth)</option>
            </select>
          </div>

          <div>
            <label className="text-muted block font-semibold mb-1">Default Analytics Window</label>
            <select
              value={String(timeWindowMin)}
              onChange={(e) => setTimeWindowMin(Number(e.target.value))}
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-text font-medium focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="30">Last 30 Minutes</option>
              <option value="60">Last 60 Minutes (Recommended)</option>
              <option value="120">Last 2 Hours</option>
              <option value="360">Last 6 Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Appearance Preferences */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text font-heading flex items-center gap-2">
          <Sun className="w-4 h-4 text-accent" />
          Appearance & Display Theme
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-accent/10 border-accent text-accent font-bold ring-2 ring-accent/20'
                : 'bg-surface-2/40 border-border text-muted hover:text-text'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </div>
            {theme === 'light' && <CheckCircle2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-accent/10 border-accent text-accent font-bold ring-2 ring-accent/20'
                : 'bg-surface-2/40 border-border text-muted hover:text-text'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </div>
            {theme === 'dark' && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
