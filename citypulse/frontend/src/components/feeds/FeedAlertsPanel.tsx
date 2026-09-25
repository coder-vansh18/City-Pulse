import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { Card } from '../common/Card';
import { FeedAlertItem } from '../../types/feedHealth';
import { FeedType } from '../../api/types';

interface FeedAlertsPanelProps {
  alerts: FeedAlertItem[];
  onSelectFeed: (feedId: FeedType) => void;
}

export const FeedAlertsPanel: React.FC<FeedAlertsPanelProps> = ({ alerts, onSelectFeed }) => {
  const getLevelConfig = (level: FeedAlertItem['level']) => {
    switch (level) {
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-rose-500',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          badge: 'Critical',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badge: 'Warning',
        };
      case 'resolved':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          badge: 'Resolved',
        };
      case 'info':
      default:
        return {
          icon: Info,
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          badge: 'Info',
        };
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-500" />
            Feed Alerts
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
            {alerts.length} Active Events
          </span>
        </div>
        <p className="text-xs text-muted mb-4">
          Real-time anomaly warnings, cadence slips and endpoint events
        </p>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {alerts.map((alt) => {
            const cfg = getLevelConfig(alt.level);
            const Icon = cfg.icon;

            return (
              <div
                key={alt.id}
                onClick={() => onSelectFeed(alt.feedId)}
                className="group p-3 rounded-xl bg-surface-2/40 hover:bg-surface-2 border border-border/50 hover:border-accent/40 cursor-pointer transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-heading font-semibold text-text group-hover:text-accent transition-colors">
                      {alt.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted flex-shrink-0">
                    {alt.timeAgo}
                  </span>
                </div>

                <p className="text-[11px] text-muted line-clamp-2 leading-relaxed pl-7">
                  {alt.message}
                </p>

                <div className="flex items-center justify-between pl-7 mt-2 pt-1.5 border-t border-border/30 text-[10px] font-mono text-muted">
                  <span className="uppercase text-text font-bold">
                    Feed: {alt.feedId}
                  </span>
                  <span className="flex items-center text-accent group-hover:translate-x-0.5 transition-transform font-bold">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>Webhook Stream: Active</span>
        <span className="text-accent hover:underline cursor-pointer">
          Configure Rules →
        </span>
      </div>
    </Card>
  );
};
