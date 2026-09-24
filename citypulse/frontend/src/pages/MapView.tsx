import React, { useState } from 'react';
import { CityMap } from '../components/map/CityMap';
import { useCityStore } from '../store/useCityStore';
import { FeedType } from '../api/types';
import {
  Search,
  Filter,
  Bell,
  Settings,
  Leaf,
  Compass,
  TrendingUp,
  Activity,
  Wind,
  CloudRain,
  Zap,
  Info,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const MapView: React.FC = () => {
  const {
    activeFeedFilter,
    setActiveFeedFilter,
    timeWindowMin,
    setTimeWindowMin,
    replay,
    pulse,
  } = useCityStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'disputed' | 'action_plan' | 'documents'>('dashboard');
  const [timePeriod, setTimePeriod] = useState<'realtime' | 'weekly' | 'monthly' | 'yearly'>('realtime');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-200">
      {/* Top Header Bar matching WeatherSwim UI */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-3.5 px-5 shadow-lg">
        {/* Left: Tab Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('disputed')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all cursor-pointer ${
              activeTab === 'disputed'
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Disputed Items
          </button>
          <button
            onClick={() => setActiveTab('action_plan')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all cursor-pointer ${
              activeTab === 'action_plan'
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Action Plan
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Documents
          </button>
        </div>

        {/* Right: Search, Filter, Notification, Settings & Agency Profile */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative w-48 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          {/* Filter button */}
          <button
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-black/5 dark:border-white/5"
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Bell notification */}
          <button
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-black/5 dark:border-white/5 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* Settings button */}
          <button
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-black/5 dark:border-white/5"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Agency Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-heading font-bold text-xs flex items-center justify-center shadow-md">
              <Leaf className="w-4 h-4 fill-current" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                Cansaas Agency
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                cansaas.weather.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="w-full relative h-[520px] rounded-3xl overflow-hidden shadow-2xl">
        <CityMap height="100%" showControls={true} />
      </div>

      {/* Bottom Floating Glassmorphic Analytics Dashboard (WeatherSwim Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Pollution Trend Analysis (Col 5) */}
        <div className="lg:col-span-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Pollution Trend Analysis
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['realtime', 'weekly', 'monthly', 'yearly'] as const).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setTimePeriod(tp)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    timePeriod === tp
                      ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tp === 'realtime' ? 'REAL TIME' : tp}
                </button>
              ))}
            </div>
          </div>

          {/* Smooth Spline Waveform SVG Chart */}
          <div className="relative pt-2">
            <svg className="w-full h-32 overflow-visible" viewBox="0 0 500 120">
              <defs>
                <linearGradient id="pollutionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#facc15" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f87171" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1="0" y1="110" x2="500" y2="110" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />

              {/* Filled Area */}
              <path
                d="M 0,90 C 40,30 80,100 120,60 C 160,20 200,90 240,75 C 280,60 300,85 320,85 L 320,110 L 0,110 Z"
                fill="url(#pollutionGradient)"
              />

              {/* Solid Green-Gold Sine Waveform */}
              <path
                d="M 0,90 C 40,30 80,100 120,60 C 160,20 200,90 240,75 C 280,60 300,85 320,85"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Projected Dashed Orange Waveform */}
              <path
                d="M 320,85 C 340,85 360,50 400,65 C 440,80 470,60 500,90"
                fill="none"
                stroke="#fb923c"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Golden Marker Pin at 14:00 (x=320, y=85) */}
              <line x1="320" y1="30" x2="320" y2="110" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="320" cy="85" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Floating Interactive Tooltip */}
            <div
              className="absolute left-[54%] top-0 -translate-x-1/2 bg-white dark:bg-slate-800 shadow-xl border border-black/5 dark:border-white/10 rounded-xl p-2 px-3 text-left pointer-events-none z-10 animate-in fade-in duration-200"
            >
              <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between gap-2">
                <span>March 24, 2026</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">14:00PM</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-white font-heading">
                  Moderate Pollution AQI 42
                </span>
              </div>
            </div>
          </div>

          {/* Time X-Axis */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>06:00</span>
            <span>08:00</span>
            <span>10:00</span>
            <span>12:00</span>
            <span className="font-bold text-amber-500">14:00</span>
            <span>16:00</span>
            <span>18:00</span>
            <span>20:00</span>
          </div>
        </div>

        {/* Card 2: Air Flow Status (Col 3) */}
        <div className="lg:col-span-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
            Air Flow Status
          </h3>

          <div className="flex items-center justify-between gap-4">
            {/* Giant Speed Reading */}
            <div>
              <div className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                7.5
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                km/hours
              </div>
            </div>

            {/* Circular Compass Radar Dial */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer compass ring with markers */}
              <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 dark:border-emerald-400/20" />
              <div className="absolute inset-2 rounded-full bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-center">
                {/* Cardinal Points */}
                <span className="absolute top-1 text-[8px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">N</span>
                <span className="absolute bottom-1 text-[8px] font-bold text-slate-400 font-mono">S</span>
                <span className="absolute right-1 text-[8px] font-bold text-slate-400 font-mono">E</span>
                <span className="absolute left-1 text-[8px] font-bold text-slate-400 font-mono">W</span>

                {/* Rotating Wind Needle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-1000"
                  style={{ transform: 'rotate(45deg)' }}
                >
                  <div className="w-0.5 h-10 bg-gradient-to-t from-transparent via-emerald-500 to-emerald-600 rounded-full" />
                </div>

                {/* Center Badge */}
                <div className="absolute px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-black/5 dark:border-white/10 text-[9px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  1.0 m/s
                </div>
              </div>
            </div>
          </div>

          {/* Status Capsule at Bottom */}
          <div className="p-2.5 px-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-2 text-left">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 font-heading">
                Fresh Air Movement!
              </div>
              <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                Wind circulation is helping reduce pollutant
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Carbon Monitoring (Col 4) */}
        <div className="lg:col-span-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Carbon Monitoring
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Current
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Baseline
              </span>
            </div>
          </div>

          {/* Comparative Dual Sine Curves */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
              <span>200k</span>
              <span>100k</span>
              <span>0</span>
            </div>
            <svg className="w-full h-16 overflow-visible" viewBox="0 0 300 60">
              {/* Baseline Curve (Amber) */}
              <path
                d="M 0,25 C 40,25 60,48 100,48 C 140,48 160,18 200,18 C 240,18 260,25 300,25"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Current Dynamic Curve (Green) */}
              <path
                d="M 0,20 C 40,5 60,35 100,35 C 140,35 160,5 200,5 C 240,5 260,20 300,20"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Dark Glass Summary Capsule */}
          <div className="p-3 px-4 rounded-2xl bg-slate-950 text-white shadow-xl flex items-center justify-between gap-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Leaf className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Net Carbon Offset
                </div>
                <div className="text-sm font-extrabold font-mono text-emerald-400 tracking-tight">
                  101,850,000 <span className="text-[10px] text-slate-400 font-normal">Ton Co2e</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
