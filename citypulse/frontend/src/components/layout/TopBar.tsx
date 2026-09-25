import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { mode, alerts, replay } = useCityStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  // Compute initials from user.name or fallback to 'OP'
  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user?.name);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

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

        {/* Theme Toggle Button (Left of Notification Bell) */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-surface-2/80 hover:bg-surface-2 text-muted hover:text-text border border-border transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

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

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-2 transition-all cursor-pointer border border-transparent hover:border-border"
            aria-label="User profile menu"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-indigo-500 text-white font-heading font-bold text-xs flex items-center justify-center shadow-md border border-white/20">
              {initials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Identity Header */}
              <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border/60 mb-2">
                <div className="font-heading font-bold text-xs text-text truncate">
                  {user?.name || 'CityPulse Operator'}
                </div>
                <div className="text-[11px] text-muted truncate font-mono">
                  {user?.email || 'operator@citypulse.gov'}
                </div>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20 text-[9px] font-mono font-bold uppercase">
                  {user?.role || 'Operator'} Active
                </span>
              </div>

              {/* Menu Links */}
              <div className="space-y-1 text-xs font-heading">
                <Link
                  to="/about"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text hover:bg-surface-2 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-muted" />
                  <span>System Profile & Docs</span>
                </Link>

                <Link
                  to="/alerts"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text hover:bg-surface-2 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted" />
                  <span>Alert Preferences</span>
                </Link>
              </div>

              <div className="my-2 border-t border-border" />

              {/* Logout Action */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 font-heading font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
