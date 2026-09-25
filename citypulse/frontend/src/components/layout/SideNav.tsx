import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  BarChart3,
  ShieldAlert,
  History,
  Radio,
  Info,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

interface NavGroup {
  groupName: string;
  items: {
    path: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[];
}

export const SideNav: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const alerts = useCityStore((s) => s.alerts);
  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  const navGroups: NavGroup[] = [
    {
      groupName: 'MAIN',
      items: [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/map', label: 'City Overview', icon: LayoutGrid },
        { path: '/insights', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      groupName: 'OPERATIONS',
      items: [
        { path: '/alerts', label: 'Alerts & Incidents', icon: ShieldAlert, badge: unreadAlerts },
        { path: '/reports', label: 'Civic Reports', icon: ClipboardList },
        { path: '/replay', label: 'Activity History', icon: History },
        { path: '/feeds', label: 'Live Data Feeds', icon: Radio },
      ],
    },
    {
      groupName: 'INFORMATION',
      items: [
        { path: '/about', label: 'About CityPulse', icon: Info },
      ],
    },
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`hidden md:flex flex-col py-5 border-r border-border bg-surface/85 backdrop-blur-xl z-30 flex-shrink-0 h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-60 px-3' : 'w-20 px-2.5 items-center'
      }`}
    >
      {/* Top: City Logo & Brand */}
      <div className="space-y-5">
        <NavLink
          to="/"
          className={`flex items-center gap-3 p-1.5 rounded-2xl group transition-colors ${
            isExpanded ? 'hover:bg-surface-2' : 'justify-center'
          }`}
          title={!isExpanded ? 'CityPulse Home' : undefined}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent to-blue-400 flex items-center justify-center text-white shadow-md shadow-accent/25 transition-transform group-hover:scale-105 shrink-0">
            <Activity className="w-6 h-6" />
          </div>

          {isExpanded && (
            <div className="min-w-0 animate-in fade-in duration-200">
              <h2 className="font-bold text-sm text-text font-heading tracking-tight truncate leading-tight">
                CityPulse
              </h2>
              <p className="text-[10px] text-muted font-mono uppercase tracking-wider truncate">
                Smart City OS
              </p>
            </div>
          )}
        </NavLink>

        {/* Navigation Rail with Logical Groups */}
        <nav className="space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {/* Group Header or Divider */}
              {isExpanded ? (
                <div className="px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-muted/70 animate-in fade-in duration-150">
                  {group.groupName}
                </div>
              ) : gIdx > 0 ? (
                <div className="w-8 h-px bg-border/50 my-2 mx-auto" />
              ) : null}

              {/* Items in Group */}
              <div className="space-y-1">
                {group.items.map(({ path, label, icon: Icon, badge }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `relative transition-all duration-200 group flex items-center ${
                        isExpanded
                          ? 'px-3 py-2.5 rounded-xl justify-between gap-3'
                          : 'p-3 rounded-2xl justify-center'
                      } ${
                        isActive
                          ? 'bg-surface-solid text-accent shadow-sm border border-border font-semibold'
                          : 'text-muted hover:text-text hover:bg-surface-2 border border-transparent'
                      }`
                    }
                    title={!isExpanded ? label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                      {isExpanded && (
                        <span className="text-xs font-heading truncate animate-in fade-in duration-150">
                          {label}
                        </span>
                      )}
                    </div>

                    {/* Alert / Notification Badge */}
                    {badge && badge > 0 ? (
                      isExpanded ? (
                        <span className="px-2 py-0.5 rounded-full bg-status-critical text-white text-[9px] font-bold font-mono shrink-0 animate-in fade-in duration-150">
                          {badge}
                        </span>
                      ) : (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-critical text-white text-[9px] font-bold font-mono flex items-center justify-center">
                          {badge}
                        </span>
                      )
                    ) : null}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};
