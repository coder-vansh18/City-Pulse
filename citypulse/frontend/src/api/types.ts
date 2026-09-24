export type FeedType = 'weather' | 'transit' | 'incident' | 'air_quality' | 'power' | 'noise';

export type Status = 'calm' | 'watch' | 'strained' | 'critical';

export type Trend = 'improving' | 'steady' | 'worsening';

export type InsightConfidence = 'low' | 'medium' | 'high';

export type Summary = {
  headline: string;
  body: string;
  generated_by: 'template' | 'llm';
  grounded_on: string[];
  updated_at: string;
};

export type ZoneRiskItem = {
  zone_id: string;
  name: string;
  score: number;
  status: Status;
};

export type Pulse = {
  city_name: string;
  score: number;
  status: Status;
  bpm: number;
  irregularity: number;
  trend: Trend;
  confidence: number;
  degraded: boolean;
  summary: Summary;
  active_anomalies: number;
  feeds_online: number;
  feeds_total: number;
  zones_at_risk: ZoneRiskItem[];
  updated_at: string;
  mode: 'live' | 'replay';
};

export type ZoneProps = {
  id: string;
  name: string;
  pulse_score: number;
  status: Status;
  trend: string;
  confidence: number;
  bpm: number;
  top_issue: string | null;
  sub_scores: Record<FeedType, number | null>;
};

export type NormalizedEvent = {
  id: string;
  source: string;
  feed: FeedType;
  zone_id: string;
  lat: number;
  lng: number;
  severity: number;
  value: number | null;
  unit: string | null;
  title: string;
  description: string | null;
  timestamp: string;
  received_at: string;
  confidence: number;
  status: 'active' | 'resolved';
};

export type EvidenceItem = {
  feed: FeedType;
  metric: string;
  value: number;
  baseline: number;
  zscore: number;
};

export type Insight = {
  id: string;
  kind: 'anomaly' | 'correlation';
  zone_ids: string[];
  feed_types: FeedType[];
  severity: number;
  confidence: 'low' | 'medium' | 'high';
  title: string;
  plain_text: string;
  caveat: string | null;
  evidence: EvidenceItem[];
  event_ids: string[];
  window_start: string;
  window_end: string;
  first_seen: string;
  status: 'active' | 'resolved';
};

export type ZoneDetail = {
  zone: ZoneProps;
  summary: Summary;
  recent_events: NormalizedEvent[];
  insights: Insight[];
  sparkline: { t: string; pulse: number }[];
};

export type FeedStatus = {
  feed: FeedType;
  label: string;
  status: 'live' | 'delayed' | 'down' | 'disabled';
  source: 'real' | 'simulated';
  enabled: boolean;
  last_update: string | null;
  expected_interval_s: number;
  events_last_hour: number;
};

export type HistoryPoint = {
  t: string;
  pulse: number;
  weather?: number | null;
  transit?: number | null;
  incident?: number | null;
  air_quality?: number | null;
  power?: number | null;
  noise?: number | null;
};

export type ZoneHistory = {
  zone_id: string;
  points: HistoryPoint[];
};

export type Alert = {
  id: string;
  rule_id: string;
  level: 'info' | 'warning' | 'critical';
  zone_id: string | null;
  title: string;
  message: string;
  created_at: string;
  acknowledged: boolean;
};

export type AlertRule = {
  id: string;
  name: string;
  metric: 'pulse_score' | 'anomaly_severity' | 'feed_down';
  zone_id: string | null;
  operator: '<' | '>';
  threshold: number;
  enabled: boolean;
  cooldown_s: number;
};

export type ReplayState = {
  active: boolean;
  dataset: string | null;
  speed: number;
  sim_time: string | null;
  progress: number;
  started_at: string | null;
};

export type CityConfig = {
  city_name: string;
  center: { lat: number; lng: number };
  zoom: number;
  feeds: FeedType[];
  zones: { id: string; name: string; centroid: { lat: number; lng: number } }[];
};

export type ScenarioItem = {
  name: string;
  label: string;
  description: string;
};

export type ActiveScenario = {
  name: string;
  zone_id?: string | null;
  started_at: string;
  ends_at: string;
};

export type WSEnvelope<T = any> = {
  type: 'pulse' | 'zones' | 'event' | 'insight' | 'alert' | 'feed_status' | 'replay_state' | 'ping';
  mode: 'live' | 'replay';
  ts: string;
  payload: T;
};
