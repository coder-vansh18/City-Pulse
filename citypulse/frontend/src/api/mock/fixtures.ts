import { CityConfig, Pulse, FeedStatus, Alert, AlertRule, Insight, NormalizedEvent } from '../types';

export const MOCK_CONFIG: CityConfig = {
  city_name: 'Demo City',
  center: { lat: 40.7128, lng: -74.006 },
  zoom: 13,
  feeds: ['weather', 'transit', 'incident', 'air_quality', 'power', 'noise'],
  zones: [
    { id: 'z1', name: 'Hillcrest', centroid: { lat: 40.7236, lng: -74.0205 } },
    { id: 'z2', name: 'Green Park', centroid: { lat: 40.7236, lng: -74.006 } },
    { id: 'z3', name: 'University Quarter', centroid: { lat: 40.7236, lng: -73.9915 } },
    { id: 'z4', name: 'Riverside', centroid: { lat: 40.7128, lng: -74.0205 } },
    { id: 'z5', name: 'Central Station', centroid: { lat: 40.7128, lng: -74.006 } },
    { id: 'z6', name: 'Market District', centroid: { lat: 40.7128, lng: -73.9915 } },
    { id: 'z7', name: 'Old Town', centroid: { lat: 40.702, lng: -74.0205 } },
    { id: 'z8', name: 'Lakeside', centroid: { lat: 40.702, lng: -74.006 } },
    { id: 'z9', name: 'Industrial Belt', centroid: { lat: 40.702, lng: -73.9915 } },
  ],
};

export const MOCK_FEEDS: FeedStatus[] = [
  { feed: 'weather', label: 'Open-Meteo Weather / Sim', status: 'live', source: 'real', enabled: true, last_update: new Date().toISOString(), expected_interval_s: 5.0, events_last_hour: 42 },
  { feed: 'transit', label: 'GTFS-RT Transit Stream', status: 'live', source: 'simulated', enabled: true, last_update: new Date().toISOString(), expected_interval_s: 4.0, events_last_hour: 120 },
  { feed: 'incident', label: '311 Civic Incident Stream', status: 'live', source: 'simulated', enabled: true, last_update: new Date().toISOString(), expected_interval_s: 5.0, events_last_hour: 88 },
  { feed: 'air_quality', label: 'Open-Meteo Air Quality / Sim', status: 'live', source: 'real', enabled: true, last_update: new Date().toISOString(), expected_interval_s: 5.0, events_last_hour: 35 },
  { feed: 'power', label: 'Grid Power & Telemetry', status: 'live', source: 'simulated', enabled: true, last_update: new Date().toISOString(), expected_interval_s: 10.0, events_last_hour: 18 },
  { feed: 'noise', label: 'Civic Acoustic Sensors', status: 'live', source: 'simulated', enabled: true, last_update: new Date().toISOString(), expected_interval_s: 6.0, events_last_hour: 74 },
];

export const MOCK_PULSE: Pulse = {
  city_name: 'Demo City',
  score: 86.4,
  status: 'calm',
  bpm: 72,
  irregularity: 0.08,
  trend: 'steady',
  confidence: 0.95,
  degraded: false,
  summary: {
    headline: 'City Pulse is CALM (86/100).',
    body: 'All primary civic infrastructure feeds are operating within normal baseline bounds across all 9 zones.',
    generated_by: 'template',
    grounded_on: ['6 live civic telemetry feeds'],
    updated_at: new Date().toISOString(),
  },
  active_anomalies: 0,
  feeds_online: 6,
  feeds_total: 6,
  zones_at_risk: [
    { zone_id: 'z4', name: 'Riverside', score: 81.2, status: 'calm' },
    { zone_id: 'z9', name: 'Industrial Belt', score: 83.5, status: 'calm' },
    { zone_id: 'z5', name: 'Central Station', score: 85.0, status: 'calm' },
  ],
  updated_at: new Date().toISOString(),
  mode: 'live',
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alt_init_01',
    rule_id: 'rule_anomaly_high',
    level: 'info',
    zone_id: 'z5',
    title: 'Baseline Civic Monitoring Active',
    message: 'CityPulse monitoring active across 9 zones with 6 telemetry feeds enabled.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    acknowledged: true,
  },
];

export const MOCK_ALERT_RULES: AlertRule[] = [
  { id: 'rule_pulse_critical', name: 'Critical Zone Pulse Score', metric: 'pulse_score', zone_id: null, operator: '<', threshold: 45.0, enabled: true, cooldown_s: 120 },
  { id: 'rule_anomaly_high', name: 'High Severity Anomaly Detected', metric: 'anomaly_severity', zone_id: null, operator: '>', threshold: 0.70, enabled: true, cooldown_s: 90 },
  { id: 'rule_feed_offline', name: 'Civic Feed Ingestion Disruption', metric: 'feed_down', zone_id: null, operator: '>', threshold: 60.0, enabled: true, cooldown_s: 180 },
];
