import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Siren,
  X,
  ExternalLink,
  ShieldAlert,
  Trash2,
  Clock,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const IncidentNotificationToast: React.FC = () => {
  const navigate = useNavigate();
  const { activeToasts, dismissToast, clearAllToasts, acknowledgeAlert } = useCityStore();

  // Auto-dismiss the oldest toast after 8 seconds
  useEffect(() => {
    if (activeToasts.length === 0) return;

    const timer = setTimeout(() => {
      dismissToast(activeToasts[activeToasts.length - 1].id);
    }, 8000);

    return () => clearTimeout(timer);
  }, [activeToasts, dismissToast]);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none animate-in slide-in-from-top-4 duration-200">
      {activeToasts.length > 1 && (
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={clearAllToasts}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface/90 backdrop-blur-md border border-border text-[11px] font-semibold text-muted hover:text-rose-500 hover:border-rose-500/30 transition-colors shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear All Notifications ({activeToasts.length})</span>
          </button>
        </div>
      )}

      {activeToasts.map((toast) => {
        const isCritical = toast.level === 'critical';
        const isWarning = toast.level === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl bg-surface/95 dark:bg-surface-solid/95 backdrop-blur-xl border shadow-2xl flex flex-col gap-2.5 transition-all animate-in zoom-in-95 duration-150 ${
              isCritical
                ? 'border-rose-500/50 shadow-rose-500/10'
                : isWarning
                ? 'border-amber-500/50 shadow-amber-500/10'
                : 'border-blue-500/40 shadow-blue-500/10'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isCritical
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : isWarning
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                        isCritical
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : isWarning
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {toast.level} Incident Warning
                    </span>

                    {toast.zone_id && (
                      <span className="text-[9px] font-mono text-muted uppercase bg-surface px-1 py-0.2 rounded border border-border">
                        {toast.zone_id}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-text font-heading mt-0.5 line-clamp-1">
                    {toast.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-[11px] text-text/85 line-clamp-2 leading-relaxed font-sans">
              {toast.message}
            </p>

            {/* Footer Actions */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-muted text-[10px] font-mono">
                <Clock className="w-3 h-3" />
                <span>Just now</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    acknowledgeAlert(toast.id);
                    dismissToast(toast.id);
                  }}
                  className="text-muted hover:text-text text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Clear
                </button>

                <button
                  onClick={() => {
                    dismissToast(toast.id);
                    navigate('/alerts');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-semibold border border-accent/25 text-[11px] transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
