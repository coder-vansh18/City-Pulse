import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './SideNav';

export const BottomNav: React.FC = () => {
  // Take top 5 primary routes for mobile tab bar
  const mobileNav = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface/95 backdrop-blur-md px-2 flex items-center justify-around z-40">
      {mobileNav.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-heading font-medium transition-colors ${
              isActive ? 'text-accent' : 'text-muted hover:text-text'
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
