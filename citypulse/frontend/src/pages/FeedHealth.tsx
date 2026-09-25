import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Sliders,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { apiClient } from '../api/client';
import { FeedType } from '../api/types';
import {
  FeedDiagnostic,
  FeedHealthStatus,
  TimeRangeOption,
  FeedSortOption,
  FeedAlertItem,
  LiveStreamEventItem,
  AiAnomalyItem,
  CrossFeedCorrelationItem,
  ThroughputPoint,
} from '../types/feedHealth';
import {
  INITIAL_FEED_DIAGNOSTICS,
  INITIAL_FEED_ALERTS,
  INITIAL_LIVE_EVENTS,
  INITIAL_ANOMALIES,
  INITIAL_CORRELATIONS,
  GENERATE_THROUGHPUT_SERIES,
} from '../data/mockFeedDiagnostics';

// Subcomponents
import { FeedKpiRow } from '../components/feeds/FeedKpiRow';
import { ThroughputChart } from '../components/feeds/ThroughputChart';
import { FeedHealthDonut } from '../components/feeds/FeedHealthDonut';
import { FeedAlertsPanel } from '../components/feeds/FeedAlertsPanel';
import { FeedCard } from '../components/feeds/FeedCard';
import { LiveEventStream } from '../components/feeds/LiveEventStream';
import { NearbyCivicIssuesCard } from '../components/feeds/NearbyCivicIssuesCard';
import { AiAnomalyDetectionCard } from '../components/feeds/AiAnomalyDetectionCard';
import { CrossFeedCorrelationCard } from '../components/feeds/CrossFeedCorrelationCard';
import { NormalizationPipelineCard } from '../components/feeds/NormalizationPipelineCard';
import { FeedDetailDrawer } from '../components/feeds/FeedDetailDrawer';
import { FusionEngineModal } from '../components/feeds/FusionEngineModal';
import { FeedsExportModal } from '../components/feeds/FeedsExportModal';
import { FeedDemoControls } from '../components/feeds/FeedDemoControls';

export const FeedHealth: React.FC = () => {
  const feeds = useCityStore((s) => s.feeds);
  const setFeeds = useCityStore((s) => s.setFeeds);

  // Local state for diagnostics, alerts, throughput & controls
  const [feedDiagnostics, setFeedDiagnostics] = useState<Record<FeedType, FeedDiagnostic>>(INITIAL_FEED_DIAGNOSTICS);
  const [alerts, setAlerts] = useState<FeedAlertItem[]>(INITIAL_FEED_ALERTS);
  const [liveEvents] = useState<LiveStreamEventItem[]>(INITIAL_LIVE_EVENTS);
  const [anomalies] = useState<AiAnomalyItem[]>(INITIAL_ANOMALIES);
  const [correlations] = useState<CrossFeedCorrelationItem[]>(INITIAL_CORRELATIONS);

  // Time range & filter controls
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'real' | 'simulated' | 'healthy' | 'degraded' | 'offline'>('all');
  const [sortBy, setSortBy] = useState<FeedSortOption>('health');

  // Active drawer & modals
  const [selectedFeed, setSelectedFeed] = useState<FeedDiagnostic | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeDemoScenario, setActiveDemoScenario] = useState<string | null>(null);

  // Throughput series data
  const [throughputData, setThroughputData] = useState<ThroughputPoint[]>(() =>
    GENERATE_THROUGHPUT_SERIES(timeRange === 'live' ? '1m' : timeRange)
  );

  // Synchronize store enabled status with feedDiagnostics
  const feedEnabledMap = useMemo(() => {
    const map: Record<FeedType, boolean> = {
      weather: true,
      transit: true,
      incident: true,
      air_quality: true,
      power: true,
      noise: true,
    };
    feeds.forEach((f) => {
      map[f.feed] = f.enabled;
    });
    return map;
  }, [feeds]);

  // Handle feed toggle switch
  const handleToggleFeed = async (feedType: FeedType, currentEnabled: boolean) => {
    try {
      const updated = await apiClient.toggleFeed(feedType, !currentEnabled);
      setFeeds(feeds.map((f) => (f.feed === feedType ? updated : f)));

      // Update diagnostic health state
      setFeedDiagnostics((prev) => {
        const target = prev[feedType];
        if (!target) return prev;
        return {
          ...prev,
          [feedType]: {
            ...target,
            healthStatus: !currentEnabled ? 'healthy' : 'offline',
          },
        };
      });
    } catch (err) {
      console.warn('Failed to toggle feed:', err);
    }
  };

  // Handle time range selection
  const handleTimeRangeChange = (range: TimeRangeOption) => {
    setTimeRange(range);
    setThroughputData(GENERATE_THROUGHPUT_SERIES(range === 'live' ? '1m' : range));
  };

  // Calculate dynamic KPIs
  const kpiMetrics = useMemo(() => {
    const all = Object.values(feedDiagnostics);
    let active = 0;
    let healthy = 0;
    let degraded = 0;
    let offline = 0;
    let totalReliability = 0;
    let totalRate = 0;

    all.forEach((f) => {
      const isEnabled = feedEnabledMap[f.feedId];
      if (isEnabled && f.healthStatus !== 'offline') {
        active++;
      }
      if (!isEnabled || f.healthStatus === 'offline') {
        offline++;
      } else if (f.healthStatus === 'degraded') {
        degraded++;
      } else {
        healthy++;
      }

      if (isEnabled) {
        totalReliability += f.reliability;
        totalRate += f.eventsLastHour;
      }
    });

    const avgReliability = all.length > 0 ? totalReliability / all.length : 0;
    const eventsPerMin = Math.round(totalRate / 60) + 380; // normalized baseline rate

    return {
      active,
      healthy,
      degraded,
      offline,
      reliability: avgReliability,
      eventsPerMin,
    };
  }, [feedDiagnostics, feedEnabledMap]);

  // Filter and Sort feeds
  const filteredFeeds = useMemo(() => {
    return Object.values(feedDiagnostics)
      .filter((f) => {
        const isEnabled = feedEnabledMap[f.feedId];

        // Search match across display name, technical source, feed ID, and protocol
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDisplayName = (f.displayName || '').toLowerCase().includes(q);
          const matchLabel = (f.label || '').toLowerCase().includes(q);
          const matchSource = (f.technicalSource || '').toLowerCase().includes(q);
          const matchId = f.feedId.toLowerCase().includes(q);
          const matchProto = f.protocol.toLowerCase().includes(q);
          if (!matchDisplayName && !matchLabel && !matchSource && !matchId && !matchProto) return false;
        }

        // Status filter
        if (statusFilter === 'real') return f.sourceType === 'real';
        if (statusFilter === 'simulated') return f.sourceType === 'simulated';
        if (statusFilter === 'healthy') return isEnabled && f.healthStatus === 'healthy';
        if (statusFilter === 'degraded') return isEnabled && f.healthStatus === 'degraded';
        if (statusFilter === 'offline') return !isEnabled || f.healthStatus === 'offline';

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'health') {
          const rank = { healthy: 1, degraded: 2, offline: 3 };
          return rank[a.healthStatus] - rank[b.healthStatus];
        }
        if (sortBy === 'rate') return b.eventRatePerSec - a.eventRatePerSec;
        if (sortBy === 'latency') return a.currentLatencyMs - b.currentLatencyMs;
        if (sortBy === 'reliability') return b.reliability - a.reliability;
        return 0;
      });
  }, [feedDiagnostics, feedEnabledMap, searchQuery, statusFilter, sortBy]);

  // Open feed drawer
  const handleOpenFeedDetails = (feed: FeedDiagnostic) => {
    setSelectedFeed(feed);
    setIsDrawerOpen(true);
  };

  const handleSelectFeedById = (feedId: FeedType) => {
    const target = feedDiagnostics[feedId];
    if (target) {
      setSelectedFeed(target);
      setIsDrawerOpen(true);
    }
  };

  // Demo actions for Hackathon Judges
  const handleSimulateFailure = () => {
    setActiveDemoScenario('Feed Failure Chaos Mode');
    setFeedDiagnostics((prev) => ({
      ...prev,
      power: { ...prev.power, healthStatus: 'offline', reliability: 0, currentLatencyMs: 0 },
      transit: { ...prev.transit, healthStatus: 'degraded', currentLatencyMs: 1420 },
    }));
    setAlerts((prev) => [
      {
        id: `alt-${Date.now()}`,
        feedId: 'power',
        level: 'critical',
        title: 'Power SCADA ingestion drop detected',
        message: 'Telemetry lost on Substation North-08 breaker ring.',
        timeAgo: 'Just now',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const handleSimulateLatency = () => {
    setActiveDemoScenario('High Latency Spike');
    setFeedDiagnostics((prev) => ({
      ...prev,
      weather: { ...prev.weather, currentLatencyMs: 1280, healthStatus: 'degraded' },
      transit: { ...prev.transit, currentLatencyMs: 1650, healthStatus: 'degraded' },
      air_quality: { ...prev.air_quality, currentLatencyMs: 1100, healthStatus: 'degraded' },
    }));
  };

  const handleSimulateSpike = () => {
    setActiveDemoScenario('Ingestion Surge (1,450 evt/min)');
    setThroughputData((prev) =>
      prev.map((p) => ({
        ...p,
        total: Math.round(p.total * 3.4),
      }))
    );
  };

  const handleRestoreAll = () => {
    setActiveDemoScenario(null);
    setFeedDiagnostics(INITIAL_FEED_DIAGNOSTICS);
    setAlerts(INITIAL_FEED_ALERTS);
    setThroughputData(GENERATE_THROUGHPUT_SERIES(timeRange === 'live' ? '1m' : timeRange));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-text font-heading">
              Civic Telemetry Feeds & Ingestion Health
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold">
              6 STREAMS LIVE
            </span>
          </div>
          <p className="text-xs text-muted">
            Real-time status of 6 heterogeneous civic data streams. Monitor ingestion, normalization, quality and system health.
          </p>
        </div>

        {/* Header Right-Side Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center bg-surface-2 p-0.5 rounded-xl border border-border">
            {(['live', '15m', '1h', '6h', '24h'] as TimeRangeOption[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTimeRangeChange(t)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded-lg transition-all ${
                  timeRange === t
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export Data Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface text-text hover:text-accent border border-border text-xs font-heading font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export Data</span>
          </button>

          {/* More / Demo Actions Button */}
          <button
            onClick={() => {
              const el = document.getElementById('demo-controls-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface text-muted hover:text-text border border-border text-xs font-heading font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-muted" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Summary */}
      <FeedKpiRow
        activeFeedsCount={kpiMetrics.active}
        healthyFeedsCount={kpiMetrics.healthy}
        delayedFeedsCount={kpiMetrics.degraded}
        offlineFeedsCount={kpiMetrics.offline}
        overallReliability={kpiMetrics.reliability}
        eventsPerMin={kpiMetrics.eventsPerMin}
        onFilterStatus={(status) => setStatusFilter(status as any)}
        activeFilter={statusFilter}
      />

      {/* 3, 4, 5. Main Monitoring Triple Row: Throughput + Health Donut + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Live Event Throughput Chart (6 Cols) */}
        <div className="lg:col-span-6">
          <ThroughputChart
            data={throughputData}
            currentEventRate={kpiMetrics.eventsPerMin}
            timeRange={timeRange === 'live' ? '1m' : timeRange}
            onTimeRangeChange={(r) => handleTimeRangeChange(r as TimeRangeOption)}
          />
        </div>

        {/* Feed Health Score Donut (3 Cols) */}
        <div className="lg:col-span-3">
          <FeedHealthDonut
            overallHealthPercent={kpiMetrics.reliability}
            healthyCount={kpiMetrics.healthy}
            degradedCount={kpiMetrics.degraded}
            offlineCount={kpiMetrics.offline}
            onSelectFilter={(st) => setStatusFilter(st as any)}
            activeFilter={statusFilter}
          />
        </div>

        {/* Feed Alerts Panel (3 Cols) */}
        <div className="lg:col-span-3">
          <FeedAlertsPanel
            alerts={alerts}
            onSelectFeed={handleSelectFeedById}
          />
        </div>
      </div>

      {/* 7. Search, Filter & Sort Controls */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feeds by name, ID, protocol..."
            className="w-full bg-surface-2/60 focus:bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Feeds' },
            { id: 'real', label: 'Live API' },
            { id: 'simulated', label: 'Simulation' },
            { id: 'healthy', label: 'Healthy' },
            { id: 'degraded', label: 'Degraded' },
            { id: 'offline', label: 'Offline' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold border transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-surface-2 text-muted border-border hover:text-text'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
          <span className="text-xs font-mono text-muted uppercase">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as FeedSortOption)}
            className="bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs font-mono text-text focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="health">Health Status</option>
            <option value="rate">Event Rate</option>
            <option value="latency">Lowest Latency</option>
            <option value="reliability">Reliability</option>
          </select>
        </div>
      </div>

      {/* 8. 6 Enhanced Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeeds.map((feed) => (
          <FeedCard
            key={feed.feedId}
            feed={feed}
            enabled={feedEnabledMap[feed.feedId]}
            onToggle={handleToggleFeed}
            onViewDetails={handleOpenFeedDetails}
          />
        ))}
      </div>

      {/* 6 & 16. Live Event Stream + Nearby Civic Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveEventStream
          initialEvents={liveEvents}
          onSelectFeed={handleSelectFeedById}
        />
        <NearbyCivicIssuesCard />
      </div>

      {/* 14 & 15. AI Anomaly Detection + Cross-Feed Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AiAnomalyDetectionCard
          anomalies={anomalies}
          onInvestigate={handleSelectFeedById}
        />
        <CrossFeedCorrelationCard
          correlations={correlations}
          onInvestigate={(c) => setIsArchitectureModalOpen(true)}
        />
      </div>

      {/* 17, 18, 19. Normalization Pipeline & Data Pipeline Health */}
      <NormalizationPipelineCard
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
      />

      {/* 20. Judge Demo Controls */}
      <div id="demo-controls-panel">
        <FeedDemoControls
          onSimulateFailure={handleSimulateFailure}
          onSimulateLatency={handleSimulateLatency}
          onSimulateSpike={handleSimulateSpike}
          onRestoreAll={handleRestoreAll}
          activeScenarioName={activeDemoScenario}
        />
      </div>

      {/* Slide-over Diagnostic Drawer */}
      <FeedDetailDrawer
        feed={selectedFeed}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        enabled={selectedFeed ? feedEnabledMap[selectedFeed.feedId] : true}
        onToggle={handleToggleFeed}
      />

      {/* Architecture Modal */}
      <FusionEngineModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Export Modal */}
      <FeedsExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        feedDiagnostics={feedDiagnostics}
        eventsPerMin={kpiMetrics.eventsPerMin}
      />
    </div>
  );
};
