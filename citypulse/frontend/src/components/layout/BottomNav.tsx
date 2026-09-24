import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  BarChart3,
  ShieldAlert,
  History,
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/map', label: 'Map', icon: LayoutGrid },
  { path: '/insights', label: 'Signals', icon: BarChart3 },
  { path: '/alerts', label: 'Alerts', icon: ShieldAlert },
  { path: '/replay', label: 'Replay', icon: History },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface/95 backdrop-blur-xl px-2 flex items-center justify-around z-40">
      {MOBILE_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-heading font-medium transition-colors ${
              isActive ? 'text-accent font-bold' : 'text-muted hover:text-text'
            }`
          }
        >
          <Icon className="w-5 h-5 mb-0.5" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
