import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Filter, CheckCircle2 } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { InsightCard } from '../components/insights/InsightCard';
import { EmptyState } from '../components/common/EmptyState';
import { Insight, FeedType, InsightConfidence } from '../api/types';

export const Insights: React.FC = () => {
  const insightsMap = useCityStore((s) => s.insights);
  const insights = Object.values(insightsMap);

  const [tab, setTab] = useState<'all' | 'correlation' | 'anomaly'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [confFilter, setConfFilter] = useState<InsightConfidence | 'all'>('all');
  const [feedFilter, setFeedFilter] = useState<FeedType | 'all'>('all');

  const filteredInsights = insights.filter((ins) => {
    if (tab !== 'all' && ins.kind !== tab) return false;
    if (statusFilter !== 'all' && ins.status !== statusFilter) return false;
    if (confFilter !== 'all' && ins.confidence !== confFilter) return false;
    if (feedFilter !== 'all' && !ins.feed_types.includes(feedFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-text font-heading">
              Civic Intelligence & Epistemic Correlations
            </h2>
          </div>
          <p className="text-xs text-muted">
            Spatial-temporal fusion across civic telemetry feeds. Statistical co-occurrences are hedged as possible links.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
          {[
            { key: 'all', label: 'All Signals' },
            { key: 'correlation', label: 'Cross-Feed Links' },
            { key: 'anomaly', label: 'Anomalies' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors cursor-pointer ${
                tab === t.key ? 'bg-accent text-white shadow' : 'text-muted hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-2/40 border border-border/60 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-muted font-heading font-semibold uppercase tracking-wider text-[11px] mr-1">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <span>Filters:</span>
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-surface border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent"
          >
            <option value="active">Active Only</option>
            <option value="resolved">Resolved</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Confidence */}
          <select
            value={confFilter}
            onChange={(e) => setConfFilter(e.target.value as any)}
            className="bg-surface border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent"
          >
            <option value="all">Any Confidence</option>
            <option value="high">High Confidence</option>
            <option value="medium">Medium Confidence</option>
            <option value="low">Low Confidence</option>
          </select>

          {/* Feed */}
          <select
            value={feedFilter}
            onChange={(e) => setFeedFilter(e.target.value as any)}
            className="bg-surface border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent"
          >
            <option value="all">All Feeds</option>
            <option value="weather">Weather</option>
            <option value="transit">Transit</option>
            <option value="incident">311 Incidents</option>
            <option value="air_quality">Air Quality</option>
            <option value="power">Power Grid</option>
            <option value="noise">Noise Sensors</option>
          </select>
        </div>

        <span className="text-muted font-mono text-[11px]">
          Showing {filteredInsights.length} signal{filteredInsights.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Insight List */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="All quiet — no unusual patterns detected"
          description="Civic telemetry across all 9 zones is within nominal baseline bounds. Use the Judge Demo Panel at bottom-right to inject a scenario."
        />
      )}
    </div>
  );
};
