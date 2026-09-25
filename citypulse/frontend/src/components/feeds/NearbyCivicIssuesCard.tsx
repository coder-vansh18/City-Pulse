import React from 'react';
import { MapPin, ArrowRight, AlertTriangle, Trash2, Lightbulb, Construction } from 'lucide-react';
import { Card } from '../common/Card';
import { useNavigate } from 'react-router-dom';

export const NearbyCivicIssuesCard: React.FC = () => {
  const navigate = useNavigate();

  const issues = [
    {
      id: 'rep-01',
      title: 'Deep Asphalt Pothole & Water Pooling',
      category: 'Roads & Pavements',
      distance: '320m away',
      zone: 'Sector 4',
      status: 'In Progress',
      icon: Construction,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      id: 'rep-02',
      title: 'Overflowing Commercial Waste Bins',
      category: 'Sanitation',
      distance: '540m away',
      zone: 'Sector 2',
      status: 'Acknowledged',
      icon: Trash2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'rep-03',
      title: 'High-Density Streetlight Block Outage',
      category: 'Street Lighting',
      distance: '870m away',
      zone: 'Sector 5',
      status: 'Dispatched',
      icon: Lightbulb,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-surface border-border">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-text font-heading uppercase tracking-wider">
              Nearby Civic Issues
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
            Spatial Proximity
          </span>
        </div>

        <p className="text-xs text-muted mb-4">
          Verified citizen reports and IoT sensor triggers within the active municipal grid zone
        </p>

        <div className="space-y-2.5">
          {issues.map((iss) => {
            const Icon = iss.icon;

            return (
              <div
                key={iss.id}
                onClick={() => navigate('/reports')}
                className="p-3 rounded-xl bg-surface-2/40 hover:bg-surface-2 border border-border/50 hover:border-accent/40 cursor-pointer transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded-md ${iss.bg} ${iss.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-heading font-semibold text-text">
                      {iss.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-accent font-bold flex-shrink-0 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    {iss.distance}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted pl-6">
                  <span>Category: {iss.category}</span>
                  <span className="text-text font-medium">{iss.zone} • {iss.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
        <button
          onClick={() => navigate('/map')}
          className="text-accent hover:underline flex items-center gap-1 cursor-pointer font-bold"
        >
          <span>View All on Interactive Map</span>
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="text-muted hover:text-text cursor-pointer"
        >
          Reports Hub →
        </button>
      </div>
    </Card>
  );
};
