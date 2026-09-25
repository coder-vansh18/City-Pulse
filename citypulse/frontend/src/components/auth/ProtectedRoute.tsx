import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Activity } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Perform initial session check if needed
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-surface border border-border shadow-lg animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-text">
              Authenticating CityPulse Session...
            </div>
            <div className="text-xs text-muted font-mono">
              Verifying operator credentials
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
