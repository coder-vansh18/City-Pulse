import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  BarChart3,
  ShieldAlert,
  History,
  Radio,
  Settings,
  Info,
  Activity,
  Sun,
  Moon,
  LogOut,
  Sliders,
  ClipboardList,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { useTheme } from '../../hooks/useTheme';

export const SideNav: React.FC = () => {
  const alerts = useCityStore((s) => s.alerts);
  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/map', label: 'City Map', icon: LayoutGrid },
    { path: '/insights', label: 'Intelligence', icon: BarChart3 },
    { path: '/alerts', label: 'Security & Alerts', icon: ShieldAlert, badge: unreadAlerts },
    { path: '/reports', label: 'Civic Reports', icon: ClipboardList },
    { path: '/replay', label: 'Time Replay', icon: History },
    { path: '/feeds', label: 'Feeds Health', icon: Radio },
    { path: '/about', label: 'Settings & Info', icon: Info },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-20 py-6 border-r border-border bg-surface/70 backdrop-blur-xl z-30 flex-shrink-0 h-full overflow-y-auto">
      {/* Top: City Logo */}
      <div className="flex flex-col items-center gap-6">
        <NavLink to="/" className="group relative" title="CityPulse Operating System">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent to-blue-400 flex items-center justify-center text-white shadow-lg shadow-accent/30 transition-transform group-hover:scale-105">
            <Activity className="w-6 h-6" />
          </div>
        </NavLink>

        {/* Navigation Rail */}
        <nav className="flex flex-col items-center gap-3">
          {navLinks.map(({ path, label, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative p-3 rounded-2xl transition-all duration-200 group flex items-center justify-center ${
                  isActive
                    ? 'bg-surface-solid text-accent shadow-md shadow-black/5 border border-border'
                    : 'text-muted hover:text-text hover:bg-surface-2'
                }`
              }
              title={label}
            >
              <Icon className="w-5 h-5" />
              {badge && badge > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-critical text-white text-[9px] font-bold font-mono flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Actions: Theme Toggle & Info */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer border border-transparent hover:border-border"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};
