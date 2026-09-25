import { FeedType } from '../api/types';

export type FeedHealthStatus = 'healthy' | 'degraded' | 'offline';

export type TimeRangeOption = 'live' | '15m' | '1h' | '6h' | '24h';

export type FeedSortOption = 'health' | 'rate' | 'latency' | 'reliability' | 'updated';

export interface ThroughputPoint {
  t: string;
  total: number;
  weather: number;
  transit: number;
  incident: number;
  air_quality: number;
  power: number;
  noise: number;
}

export interface FeedQualityMetrics {
  completeness: number; // e.g. 98%
  freshness: number;    // e.g. 94%
  consistency: number;  // e.g. 97%
  validity: number;     // e.g. 96%
  overall: number;      // e.g. 98
}

export interface FeedDiagnostic {
  feedId: FeedType;
  label: string;
  displayName: string;
  technicalSource: string;
  sourceType: 'real' | 'simulated';
  healthStatus: FeedHealthStatus;
  reliability: number; // e.g. 99.8
  currentLatencyMs: number;
  avgLatencyMs: number;
  peakLatencyMs: number;
  p95LatencyMs: number;
  cadenceSeconds: number;
  eventRatePerSec: number;
  eventsLastHour: number;
  lastReceivedTimestamp: string;
  protocol: 'REST / HTTPS' | 'GTFS-RT / Protobuf' | 'MQTT / WSS' | 'Socrata Open Data / JSON';
  endpoint: string;
  lastHttpStatus: string;
  qualityMetrics: FeedQualityMetrics;
  rawSampleJson: Record<string, any>;
  normalizedSampleJson: Record<string, any>;
  recentEvents: {
    time: string;
    description: string;
    value: string;
    severity: 'calm' | 'watch' | 'strained';
  }[];
}

export interface FeedAlertItem {
  id: string;
  feedId: FeedType;
  level: 'warning' | 'critical' | 'info' | 'resolved';
  title: string;
  message: string;
  timeAgo: string;
  timestamp: string;
}

export interface LiveStreamEventItem {
  id: string;
  feedId: FeedType;
  feedLabel: string;
  title: string;
  description: string;
  time: string;
  zone: string;
  severity: number;
}

export interface AiAnomalyItem {
  id: string;
  feedId: FeedType;
  title: string;
  feedName: string;
  expected: string;
  observed: string;
  anomalyScore: number;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

export interface CrossFeedCorrelationItem {
  id: string;
  title: string;
  hypothesis: string;
  sources: FeedType[];
  confidenceScore: number;
  impactZone: string;
  severity: 'critical' | 'watch' | 'strained';
  actionRecommendation: string;
}

export interface NearbyIssueItem {
  id: string;
  title: string;
  category: string;
  distanceMeters: number;
  zone: string;
  severity: 'critical' | 'watch' | 'calm';
}
