import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  Filter,
  Search,
  CheckCircle2,
  RefreshCw,
  GitMerge,
  Activity,
  Layers,
  ShieldCheck,
  MapPin,
  X,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import {
  MOCK_CROSS_FEED_RELATIONSHIPS,
  MOCK_SINGLE_FEED_ANOMALIES,
  MOCK_AFFECTED_ZONES,
} from '../data/mockIntelligence';
import {
  CrossFeedRelationship,
  SingleFeedAnomaly,
  IntelligenceSeverity,
  IntelligenceLifecycleStatus,
} from '../types/intelligence';
import { FeedType, InsightConfidence } from '../api/types';
import { IntelligenceKpiRow } from '../components/insights/IntelligenceKpiRow';
import { CrossFeedRelationshipCard } from '../components/insights/CrossFeedRelationshipCard';
import { ActiveAnomalyCard } from '../components/insights/ActiveAnomalyCard';
import { CrossFeedEvidenceDrawer } from '../components/insights/CrossFeedEvidenceDrawer';
import { AffectedZonesGrid } from '../components/insights/AffectedZonesGrid';
import { RelatedReportsSection } from '../components/insights/RelatedReportsSection';
import { WhyIntelligenceMattersCard } from '../components/insights/WhyIntelligenceMattersCard';
import { EmptyState } from '../components/common/EmptyState';

export const Insights: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedZoneId, setHighlightedInsightId } = useCityStore();

  // Primary Tab
  const [tab, setTab] = useState<'all' | 'correlation' | 'anomaly'>('all');

  // Multi-Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<FeedType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<IntelligenceSeverity | 'all'>('all');
  const [confFilter, setConfFilter] = useState<InsightConfidence | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IntelligenceLifecycleStatus | 'all'>('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string | 'all'>('all');

  // Selected item for the Evidence Drawer
  const [drawerItem, setDrawerItem] = useState<CrossFeedRelationship | SingleFeedAnomaly | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter cross-feed relationships
  const filteredRelationships = useMemo(() => {
    return MOCK_CROSS_FEED_RELATIONSHIPS.filter((rel) => {
      if (tab === 'anomaly') return false;
      if (feedFilter !== 'all' && rel.feedA !== feedFilter && rel.feedB !== feedFilter && !rel.additionalFeeds?.includes(feedFilter)) {
        return false;
      }
      if (severityFilter !== 'all' && rel.severity !== severityFilter) return false;
      if (confFilter !== 'all' && rel.confidence !== confFilter) return false;
      if (statusFilter !== 'all' && rel.lifecycleStatus !== statusFilter) return false;
      if (selectedZoneFilter !== 'all' && rel.zoneId !== selectedZoneFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = rel.title.toLowerCase().includes(query);
        const matchesHypothesis = rel.hypothesis.toLowerCase().includes(query);
        const matchesZone = rel.zoneName.toLowerCase().includes(query);
        const matchesFeeds = rel.feedAName.toLowerCase().includes(query) || rel.feedBName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesHypothesis && !matchesZone && !matchesFeeds) return false;
      }
      return true;
    });
  }, [tab, feedFilter, severityFilter, confFilter, statusFilter, selectedZoneFilter, searchQuery]);

  // Filter single-feed anomalies
  const filteredAnomalies = useMemo(() => {
    return MOCK_SINGLE_FEED_ANOMALIES.filter((anom) => {
      if (tab === 'correlation') return false;
      if (feedFilter !== 'all' && anom.feedId !== feedFilter) return false;
      if (severityFilter !== 'all' && anom.severity !== severityFilter) return false;
      if (confFilter !== 'all' && anom.confidence !== confFilter) return false;
      if (statusFilter !== 'all' && anom.lifecycleStatus !== statusFilter) return false;
      if (selectedZoneFilter !== 'all' && anom.zoneId !== selectedZoneFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = anom.title.toLowerCase().includes(query);
        const matchesDesc = anom.description.toLowerCase().includes(query);
        const matchesZone = anom.zoneName.toLowerCase().includes(query);
        const matchesFeed = anom.feedName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesZone && !matchesFeed) return false;
      }
      return true;
    });
  }, [tab, feedFilter, severityFilter, confFilter, statusFilter, selectedZoneFilter, searchQuery]);

  const totalVisibleSignals = filteredRelationships.length + filteredAnomalies.length;
  const isAnyFilterActive =
    feedFilter !== 'all' ||
    severityFilter !== 'all' ||
    confFilter !== 'all' ||
    statusFilter !== 'all' ||
    selectedZoneFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const resetAllFilters = () => {
    setSearchQuery('');
    setFeedFilter('all');
    setSeverityFilter('all');
    setConfFilter('all');
    setStatusFilter('all');
    setSelectedZoneFilter('all');
  };

  const handleOpenEvidence = (item: CrossFeedRelationship | SingleFeedAnomaly) => {
    setDrawerItem(item);
    setIsDrawerOpen(true);
  };

  const handleShowOnMap = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    navigate('/map');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-text font-heading">
              Civic Intelligence & Cross-Feed Correlations
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Intelligence Engine Operational</span>
            </div>
          </div>
          <p className="text-xs text-muted">
            Spatial-temporal fusion across 6 telemetry streams. Statistical co-occurrences are hedged as possible relationships with complete metric evidence.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
          {[
            {
              key: 'all',
              label: 'All Signals',
              count: MOCK_CROSS_FEED_RELATIONSHIPS.length + MOCK_SINGLE_FEED_ANOMALIES.length,
            },
            {
              key: 'correlation',
              label: 'Cross-Feed Links',
              count: MOCK_CROSS_FEED_RELATIONSHIPS.length,
            },
            {
              key: 'anomaly',
              label: 'Active Anomalies',
              count: MOCK_SINGLE_FEED_ANOMALIES.length,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === t.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface-2/80'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-surface text-muted'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 KPI Summary Row */}
      <IntelligenceKpiRow
        activeAnomaliesCount={MOCK_SINGLE_FEED_ANOMALIES.length}
        crossFeedLinksCount={MOCK_CROSS_FEED_RELATIONSHIPS.length}
        highConfidenceCount={
          MOCK_CROSS_FEED_RELATIONSHIPS.filter((r) => r.confidence === 'high').length +
          MOCK_SINGLE_FEED_ANOMALIES.filter((a) => a.confidence === 'high').length
        }
        investigatingCount={
          MOCK_CROSS_FEED_RELATIONSHIPS.filter((r) => r.lifecycleStatus === 'investigating').length +
          MOCK_SINGLE_FEED_ANOMALIES.filter((a) => a.lifecycleStatus === 'investigating').length
        }
      />

      {/* Why Intelligence Matters Architecture Explainer */}
      <WhyIntelligenceMattersCard />

      {/* Search & Multi-Filter Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anomalies, cross-feed hypotheses, zones, or sensor keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-2/50 border border-border rounded-xl text-text placeholder:text-muted focus:outline-none focus:border-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Button */}
          {isAnyFilterActive && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdown Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-1 text-muted font-heading font-semibold uppercase tracking-wider text-[11px] mr-1">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <span>Refine Signals:</span>
          </div>

          {/* Feed Filter */}
          <select
            value={feedFilter}
            onChange={(e) => setFeedFilter(e.target.value as any)}
            className="bg-surface-2/60 border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Telemetry Feeds</option>
            <option value="weather">Weather & Hydrology</option>
            <option value="transit">GTFS Transit</option>
            <option value="incident">311 Incidents</option>
            <option value="air_quality">Air Quality (PM2.5)</option>
            <option value="power">Power Grid Feeder</option>
            <option value="noise">Civic Acoustic Sensors</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-surface-2/60 border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">Any Severity</option>
            <option value="critical">Critical Impact</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>

          {/* Confidence Filter */}
          <select
            value={confFilter}
            onChange={(e) => setConfFilter(e.target.value as any)}
            className="bg-surface-2/60 border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">Any Confidence</option>
            <option value="high">High Confidence (≥85%)</option>
            <option value="medium">Medium Confidence (60-84%)</option>
            <option value="low">Low Confidence (&lt;60%)</option>
          </select>

          {/* Lifecycle Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-surface-2/60 border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Triage Statuses</option>
            <option value="new">New</option>
            <option value="investigating">Under Investigation</option>
            <option value="correlated">Correlated</option>
            <option value="confirmed">Confirmed</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Zone Filter */}
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="bg-surface-2/60 border border-border rounded-lg px-2.5 py-1 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Municipal Zones</option>
            {MOCK_AFFECTED_ZONES.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>
                {z.zoneName} ({z.zoneId.toUpperCase()})
              </option>
            ))}
          </select>

          <span className="ml-auto text-muted font-mono text-[11px]">
            Showing {totalVisibleSignals} active signal{totalVisibleSignals !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Main Signal Listings */}
      {totalVisibleSignals > 0 ? (
        <div className="space-y-8">
          {/* Section 1: Cross-Feed Relationships */}
          {(tab === 'all' || tab === 'correlation') && filteredRelationships.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300">
                    <GitMerge className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-text font-heading">
                    Multi-Signal Cross-Feed Relationships
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                    {filteredRelationships.length} Links
                  </span>
                </div>
                <span className="text-xs text-muted">
                  Spatial-temporal co-occurrence matrix
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRelationships.map((rel) => (
                  <CrossFeedRelationshipCard
                    key={rel.id}
                    relationship={rel}
                    onViewEvidence={handleOpenEvidence}
                    onShowOnMap={handleShowOnMap}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Single-Feed Deviations */}
          {(tab === 'all' || tab === 'anomaly') && filteredAnomalies.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-text font-heading">
                    Single-Feed Telemetry Deviations & Anomalies
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {filteredAnomalies.length} Deviations
                  </span>
                </div>
                <span className="text-xs text-muted">
                  Z-Score threshold &gt; 2.5σ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAnomalies.map((anom) => (
                  <ActiveAnomalyCard
                    key={anom.id}
                    anomaly={anom}
                    onViewEvidence={handleOpenEvidence}
                    onShowOnMap={handleShowOnMap}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No signals match the selected filters"
          description="Try relaxing your feed, severity, or zone filters, or clear the search query to view active civic intelligence signals."
        />
      )}

      {/* Affected Zones Spatial Distribution Grid */}
      <AffectedZonesGrid
        zones={MOCK_AFFECTED_ZONES}
        selectedZoneId={selectedZoneFilter === 'all' ? null : selectedZoneFilter}
        onSelectZone={(zid) => setSelectedZoneFilter(selectedZoneFilter === zid ? 'all' : zid)}
      />

      {/* Corroborating Citizen Reports Section */}
      <RelatedReportsSection />

      {/* Quantitative Evidence & Timeline Drawer Modal */}
      <CrossFeedEvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={drawerItem}
        onShowOnMap={handleShowOnMap}
      />
    </div>
  );
};
