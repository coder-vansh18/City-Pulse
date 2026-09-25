import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Activity } from 'lucide-react';

interface PublicRouteProps {
  children?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-surface border border-border shadow-lg animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-text">
              Checking CityPulse Session...
            </div>
            <div className="text-xs text-muted font-mono">
              Loading security context
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
