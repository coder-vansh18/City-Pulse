import { FeedType, InsightConfidence, Status } from '../api/types';

export type IntelligenceLifecycleStatus = 'new' | 'investigating' | 'correlated' | 'confirmed' | 'resolved';

export type IntelligenceSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface IntelligenceEvidenceMetrics {
  temporalOverlapPercent: number; // e.g. 94%
  spatialOverlapPercent: number;  // e.g. 87%
  anomalyStrengthMultiple: number; // e.g. 3.6x
  historicalSimilarityPercent: number; // e.g. 78%
  observationCount: number;       // e.g. 42
}

export interface IntelligenceTimelineEvent {
  time: string;
  label: string;
  description: string;
  status: 'normal' | 'anomaly' | 'correlation' | 'active';
  feedId?: FeedType;
}

export interface RelatedCivicReportPreview {
  id: string;
  title: string;
  category: string;
  zone: string;
  timeAgo: string;
  severity: 'critical' | 'watch' | 'calm';
}

export interface CrossFeedRelationship {
  id: string;
  feedA: FeedType;
  feedAName: string;
  feedB: FeedType;
  feedBName: string;
  additionalFeeds?: FeedType[];
  title: string;
  hypothesis: string;
  zoneId: string;
  zoneName: string;
  detectedTimeAgo: string;
  timeWindow: string;
  severity: IntelligenceSeverity;
  confidence: InsightConfidence;
  lifecycleStatus: IntelligenceLifecycleStatus;
  metrics: IntelligenceEvidenceMetrics;
  timeline: IntelligenceTimelineEvent[];
  relatedReportIds?: string[];
}

export interface SingleFeedAnomaly {
  id: string;
  feedId: FeedType;
  feedName: string;
  title: string;
  description: string;
  zoneId: string;
  zoneName: string;
  detectedTimeAgo: string;
  deviationMultiple: number; // e.g. 3.6x
  baselineValue: string;
  observedValue: string;
  severity: IntelligenceSeverity;
  confidence: InsightConfidence;
  lifecycleStatus: IntelligenceLifecycleStatus;
  metrics: IntelligenceEvidenceMetrics;
  timeline: IntelligenceTimelineEvent[];
}

export interface AffectedZoneSummary {
  zoneId: string;
  zoneName: string;
  anomalyCount: number;
  correlationCount: number;
  highestSeverity: IntelligenceSeverity;
  latestDetectedTime: string;
  pulseScore: number;
}
