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
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { mode, alerts, replay, clearAllAlerts, acknowledgeAlert } = useCityStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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

  const [topSearch, setTopSearch] = useState('');

  const handleTopSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topSearch.trim()) {
      navigate(`/reports?q=${encodeURIComponent(topSearch.trim())}`);
    }
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
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            onKeyDown={handleTopSearchSubmit}
            placeholder="Search zones, reports, feeds..."
            className="w-full bg-surface-2/70 hover:bg-surface-2 focus:bg-surface-solid border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text placeholder:text-muted/70 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Theme Toggle Button */}
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

        {/* Notification Bell with Dropdown Popover */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 rounded-xl bg-surface-2/80 hover:bg-surface-2 text-muted hover:text-text border border-border transition-colors cursor-pointer"
            title="Incident Notifications & Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-status-critical text-white font-mono text-[9px] font-bold animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-accent" />
                  <h4 className="font-bold text-sm text-text font-heading">
                    Incident Notifications
                  </h4>
                  {unreadAlerts.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold border border-rose-500/30">
                      {unreadAlerts.length} New
                    </span>
                  )}
                </div>

                {/* Clear All Notifications Button */}
                {alerts.length > 0 && (
                  <button
                    onClick={() => clearAllAlerts()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                    title="Clear and acknowledge all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                        alt.acknowledged
                          ? 'bg-surface-2/30 border-border/60 text-muted opacity-70'
                          : alt.level === 'critical'
                          ? 'bg-rose-500/10 border-rose-500/30 text-text'
                          : 'bg-amber-500/10 border-amber-500/30 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertTriangle
                            className={`w-3.5 h-3.5 shrink-0 ${
                              alt.level === 'critical' ? 'text-rose-500' : 'text-amber-500'
                            }`}
                          />
                          <span className="font-bold font-heading truncate text-text text-xs">
                            {alt.title}
                          </span>
                        </div>

                        {!alt.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alt.id)}
                            className="text-[10px] text-muted hover:text-text px-1.5 py-0.5 rounded bg-surface border border-border/80 cursor-pointer shrink-0"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-text/80 line-clamp-2 leading-relaxed">
                        {alt.message}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-muted font-mono pt-1">
                        <span>Zone: {alt.zone_id ? alt.zone_id.toUpperCase() : 'CITYWIDE'}</span>
                        <span>{new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="text-xs font-heading font-medium text-text">
                      All caught up
                    </p>
                    <p className="text-[11px] mt-0.5">
                      No active incident warnings or unread alerts.
                    </p>
                  </div>
                )}
              </div>

              {/* View Full Alerts Link */}
              <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
                <Link
                  to="/alerts"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                >
                  <span>Open Security & Alerts Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <span className="text-[10px] font-mono text-muted">
                  Total: {alerts.length}
                </span>
              </div>
            </div>
          )}
        </div>

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

              <div className="space-y-1 text-xs font-heading">
                <Link
                  to="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text hover:bg-surface-2 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted" />
                  <span>Operator & System Settings</span>
                </Link>

                <Link
                  to="/alerts"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text hover:bg-surface-2 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-muted" />
                  <span>Security & Incident Alerts</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text hover:bg-surface-2 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-muted" />
                  <span>About CityPulse System</span>
                </Link>
              </div>

              <div className="my-2 border-t border-border" />

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
