import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Map,
  Sparkles,
  History,
  Radio,
  Bell,
  Info,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const NAV_ITEMS = [
  { path: '/', label: 'Live Pulse', icon: Activity },
  { path: '/map', label: 'Civic Map', icon: Map },
  { path: '/insights', label: 'Intelligence', icon: Sparkles },
  { path: '/replay', label: 'Time Replay', icon: History },
  { path: '/feeds', label: 'Feed Health', icon: Radio },
  { path: '/alerts', label: 'Agent Alerts', icon: Bell },
  { path: '/about', label: 'Methodology', icon: Info },
];

export const SideNav: React.FC = () => {
  const alerts = useCityStore((s) => s.alerts);
  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface/50 p-4 space-y-1">
      <div className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted px-3 py-2">
        Navigation
      </div>

      {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-heading text-sm font-medium transition-all ${
              isActive
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'text-muted hover:text-text hover:bg-surface-2/60'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </div>

          {path === '/alerts' && unreadAlerts > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-status-critical text-white font-mono text-[10px] font-bold">
              {unreadAlerts}
            </span>
          )}
        </NavLink>
      ))}

      <div className="pt-6 mt-auto border-t border-border/60">
        <div className="bg-surface-2/40 p-3 rounded-xl border border-border/40 text-xs">
          <div className="font-heading font-semibold text-text mb-1">AmiHacks Track B</div>
          <div className="text-[11px] text-muted leading-relaxed">
            Open Innovation & Multi-Feed Civic Fusion Core.
          </div>
        </div>
      </div>
    </aside>
  );
};
