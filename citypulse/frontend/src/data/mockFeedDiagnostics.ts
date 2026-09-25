import { FeedType } from '../api/types';
import {
  FeedDiagnostic,
  FeedAlertItem,
  LiveStreamEventItem,
  AiAnomalyItem,
  CrossFeedCorrelationItem,
  ThroughputPoint,
} from '../types/feedHealth';

export const INITIAL_FEED_DIAGNOSTICS: Record<FeedType, FeedDiagnostic> = {
  weather: {
    feedId: 'weather',
    displayName: 'Weather Monitoring',
    label: 'Weather Monitoring',
    technicalSource: 'Open-Meteo',
    sourceType: 'simulated',
    healthStatus: 'healthy',
    reliability: 99.8,
    currentLatencyMs: 183,
    avgLatencyMs: 165,
    peakLatencyMs: 290,
    p95LatencyMs: 210,
    cadenceSeconds: 5,
    eventRatePerSec: 5.2,
    eventsLastHour: 312,
    lastReceivedTimestamp: new Date().toISOString(),
    protocol: 'REST / HTTPS',
    endpoint: 'https://api.open-meteo.com/v1/forecast?latitude=1.3521&longitude=103.8198&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
    lastHttpStatus: '200 OK',
    qualityMetrics: {
      completeness: 99,
      freshness: 98,
      consistency: 99,
      validity: 100,
      overall: 99,
    },
    rawSampleJson: {
      latitude: 1.3521,
      longitude: 103.8198,
      generationtime_ms: 0.128,
      utc_offset_seconds: 28800,
      current: {
        time: '2026-09-25T02:04:41',
        interval: 900,
        temperature_2m: 28.4,
        relative_humidity_2m: 64,
        precipitation: 0.0,
        wind_speed_10m: 12.6,
        surface_pressure: 1012.4
      }
    },
    normalizedSampleJson: {
      eventType: 'weather.temperature',
      value: 28.4,
      unit: '°C',
      timestamp: '2026-09-25T02:04:41.000Z',
      zone: 'ZONE-04',
      severity: 0.12,
      confidence: 0.98,
      provenance: {
        source: 'open-meteo-v1',
        ingestLatencyMs: 183,
        schemaVersion: '1.4.0'
      }
    },
    recentEvents: [
      { time: '02:04:41', description: 'Ambient temperature recorded', value: '28.4°C', severity: 'calm' },
      { time: '02:04:36', description: 'Relative humidity nominal', value: '64%', severity: 'calm' },
      { time: '02:04:31', description: 'Wind velocity update', value: '12.6 km/h', severity: 'calm' },
      { time: '02:04:26', description: 'Precipitation sensor zero-flow', value: '0.0 mm', severity: 'calm' },
    ],
  },
  transit: {
    feedId: 'transit',
    displayName: 'Public Transit',
    label: 'Public Transit',
    technicalSource: 'GTFS-RT',
    sourceType: 'real',
    healthStatus: 'degraded',
    reliability: 94.2,
    currentLatencyMs: 840,
    avgLatencyMs: 620,
    peakLatencyMs: 1450,
    p95LatencyMs: 980,
    cadenceSeconds: 8,
    eventRatePerSec: 14.8,
    eventsLastHour: 890,
    lastReceivedTimestamp: new Date(Date.now() - 8000).toISOString(),
    protocol: 'GTFS-RT / Protobuf',
    endpoint: 'https://api.transit.citypulse.io/gtfs-rt/vehicle-positions.pb',
    lastHttpStatus: '200 OK (840ms)',
    qualityMetrics: {
      completeness: 92,
      freshness: 86,
      consistency: 94,
      validity: 95,
      overall: 94,
    },
    rawSampleJson: {
      header: {
        gtfs_realtime_version: '2.0',
        incrementality: 'FULL_DATASET',
        timestamp: 1790294680
      },
      entity: [
        {
          id: 'BUS-4209',
          vehicle: {
            trip: { trip_id: 'TRIP-8821', route_id: 'RT-14' },
            position: { latitude: 1.3642, longitude: 103.8314, bearing: 184.2, speed: 8.4 },
            current_stop_sequence: 14,
            congestion_level: 'RUNNING_SMOOTHLY',
            timestamp: 1790294672
          }
        }
      ]
    },
    normalizedSampleJson: {
      eventType: 'transit.vehicle_position',
      vehicleId: 'BUS-4209',
      routeId: 'RT-14',
      value: 8.4,
      unit: 'm/s',
      timestamp: '2026-09-25T02:04:32.000Z',
      zone: 'ZONE-02',
      severity: 0.38,
      confidence: 0.94,
      provenance: {
        source: 'gtfs-rt-ingestor',
        ingestLatencyMs: 840,
        schemaVersion: '1.4.0'
      }
    },
    recentEvents: [
      { time: '02:04:32', description: 'Bus #4209 position updated', value: 'Route 14 (3 min delay)', severity: 'watch' },
      { time: '02:04:24', description: 'Express Metro #81 signal sync', value: 'On schedule', severity: 'calm' },
      { time: '02:04:16', description: 'Bus #1102 headway warning', value: '+4.5 min gap', severity: 'watch' },
      { time: '02:04:08', description: 'Fleet telemetry ingestion batch', value: '42 units updated', severity: 'calm' },
    ],
  },
  incident: {
    feedId: 'incident',
    displayName: 'Civic Incidents',
    label: 'Civic Incidents',
    technicalSource: '311',
    sourceType: 'real',
    healthStatus: 'healthy',
    reliability: 98.6,
    currentLatencyMs: 240,
    avgLatencyMs: 210,
    peakLatencyMs: 410,
    p95LatencyMs: 280,
    cadenceSeconds: 15,
    eventRatePerSec: 2.1,
    eventsLastHour: 126,
    lastReceivedTimestamp: new Date(Date.now() - 4000).toISOString(),
    protocol: 'Socrata Open Data / JSON',
    endpoint: 'https://data.citypulse.gov/resource/311-service-requests.json?$limit=50&$order=created_date%20DESC',
    lastHttpStatus: '200 OK',
    qualityMetrics: {
      completeness: 98,
      freshness: 97,
      consistency: 96,
      validity: 98,
      overall: 97,
    },
    rawSampleJson: {
      service_request_id: 'SR-2026-98124',
      agency: 'DOT_MUNICIPAL',
      complaint_type: 'Street Light Failure',
      descriptor: 'Entire block unlit fixture 4B',
      incident_address: '42 ORCHARD BLVD',
      city: 'DEMO CITY',
      incident_zip: '238865',
      latitude: '1.3048',
      longitude: '103.8318',
      created_date: '09/25/2026 02:02:11 AM',
      status: 'Open'
    },
    normalizedSampleJson: {
      eventType: 'civic.incident_report',
      id: 'SR-2026-98124',
      category: 'street_lighting',
      value: 1,
      unit: 'ticket',
      timestamp: '2026-09-25T02:02:11.000Z',
      zone: 'ZONE-05',
      severity: 0.65,
      confidence: 0.99,
      provenance: {
        source: 'socrata-311-sync',
        ingestLatencyMs: 240,
        schemaVersion: '1.4.0'
      }
    },
    recentEvents: [
      { time: '02:02:11', description: 'Street Light outage reported', value: 'Orchard Blvd', severity: 'watch' },
      { time: '01:58:40', description: 'Pothole complaint verified', value: 'High St Sector 3', severity: 'watch' },
      { time: '01:54:15', description: 'Water main pressure inquiry', value: 'Zone 1 Central', severity: 'calm' },
    ],
  },
  air_quality: {
    feedId: 'air_quality',
    displayName: 'Air Quality',
    label: 'Air Quality',
    technicalSource: 'Open-Meteo',
    sourceType: 'simulated',
    healthStatus: 'healthy',
    reliability: 99.1,
    currentLatencyMs: 195,
    avgLatencyMs: 180,
    peakLatencyMs: 340,
    p95LatencyMs: 230,
    cadenceSeconds: 10,
    eventRatePerSec: 3.4,
    eventsLastHour: 204,
    lastReceivedTimestamp: new Date().toISOString(),
    protocol: 'REST / HTTPS',
    endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=1.3521&longitude=103.8198&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone',
    lastHttpStatus: '200 OK',
    qualityMetrics: {
      completeness: 99,
      freshness: 96,
      consistency: 98,
      validity: 99,
      overall: 98,
    },
    rawSampleJson: {
      latitude: 1.3521,
      longitude: 103.8198,
      generationtime_ms: 0.21,
      utc_offset_seconds: 28800,
      current: {
        time: '2026-09-25T02:05:00',
        interval: 3600,
        pm10: 18.2,
        pm2_5: 9.4,
        carbon_monoxide: 210.5,
        nitrogen_dioxide: 14.8,
        us_aqi: 38
      }
    },
    normalizedSampleJson: {
      eventType: 'environment.air_quality',
      value: 38,
      unit: 'AQI',
      timestamp: '2026-09-25T02:05:00.000Z',
      zone: 'ZONE-03',
      severity: 0.18,
      confidence: 0.97,
      provenance: {
        source: 'open-meteo-air-v1',
        ingestLatencyMs: 195,
        schemaVersion: '1.4.0'
      }
    },
    recentEvents: [
      { time: '02:05:00', description: 'AQI reading updated', value: '38 (Good)', severity: 'calm' },
      { time: '02:04:50', description: 'PM2.5 fine particulate level', value: '9.4 µg/m³', severity: 'calm' },
      { time: '02:04:40', description: 'NO2 sensor reading', value: '14.8 µg/m³', severity: 'calm' },
    ],
  },
  power: {
    feedId: 'power',
    displayName: 'Power & Grid Monitoring',
    label: 'Power & Grid Monitoring',
    technicalSource: 'Grid Telemetry',
    sourceType: 'simulated',
    healthStatus: 'healthy',
    reliability: 98.9,
    currentLatencyMs: 210,
    avgLatencyMs: 195,
    peakLatencyMs: 380,
    p95LatencyMs: 260,
    cadenceSeconds: 5,
    eventRatePerSec: 6.8,
    eventsLastHour: 410,
    lastReceivedTimestamp: new Date().toISOString(),
    protocol: 'MQTT / WSS',
    endpoint: 'wss://telemetry.gridpower.citypulse.io/v2/substations/stream',
    lastHttpStatus: '101 Switching Protocols',
    qualityMetrics: {
      completeness: 97,
      freshness: 99,
      consistency: 98,
      validity: 98,
      overall: 98,
    },
    rawSampleJson: {
      substation_id: 'SUB-NORTH-08',
      phase_a_voltage_kv: 22.4,
      phase_b_voltage_kv: 22.3,
      phase_c_voltage_kv: 22.4,
      active_load_mw: 418.6,
      frequency_hz: 50.02,
      ambient_temp_c: 34.2,
      sample_ts: '2026-09-25T02:05:12+08:00'
    },
    normalizedSampleJson: {
      eventType: 'grid.power_load',
      substation: 'SUB-NORTH-08',
      value: 418.6,
      unit: 'MW',
      timestamp: '2026-09-25T02:05:12.000Z',
      zone: 'ZONE-07',
      severity: 0.22,
      confidence: 0.99,
      provenance: {
        source: 'scada-mqtt-bridge',
        ingestLatencyMs: 210,
        schemaVersion: '1.4.0'
      }
    },
    recentEvents: [
      { time: '02:05:12', description: 'Substation North-08 load stream', value: '418.6 MW', severity: 'calm' },
      { time: '02:05:07', description: 'Grid frequency stabilization', value: '50.02 Hz', severity: 'calm' },
      { time: '02:05:02', description: 'Transformer temperature nominal', value: '34.2°C', severity: 'calm' },
    ],
  },
  noise: {
    feedId: 'noise',
    displayName: 'Noise Monitoring',
    label: 'Noise Monitoring',
    technicalSource: 'Acoustic Sensors',
    sourceType: 'simulated',
    healthStatus: 'healthy',
    reliability: 97.4,
    currentLatencyMs: 160,
    avgLatencyMs: 145,
    peakLatencyMs: 310,
    p95LatencyMs: 190,
    cadenceSeconds: 3,
    eventRatePerSec: 8.5,
    eventsLastHour: 510,
    lastReceivedTimestamp: new Date().toISOString(),
    protocol: 'MQTT / WSS',
    endpoint: 'wss://sensors.iot.citypulse.io/v1/acoustic/live',
    lastHttpStatus: '101 Switching Protocols',
    qualityMetrics: {
      completeness: 96,
      freshness: 99,
      consistency: 95,
      validity: 97,
      overall: 97,
    },
    rawSampleJson: {
      sensor_node: 'MIC-NODE-881',
      db_spl_a_weight: 54.2,
      peak_freq_hz: 420.0,
      transient_spike: false,
      device_battery_pct: 94,
      epoch_ms: 1790294715000
    },
    normalizedSampleJson: {
      eventType: 'sensor.acoustic_level',
      nodeId: 'MIC-NODE-881',
      value: 54.2,
      unit: 'dBA',
      timestamp: '2026-09-25T02:05:15.000Z',
      zone: 'ZONE-01',
      severity: 0.15,
      confidence: 0.96,
      provenance: {
        source: 'iot-edge-acoustic',
        ingestLatencyMs: 160,
        schemaVersion: '1.4.0'
      }
    },
    recentEvents: [
      { time: '02:05:15', description: 'Decibel level baseline check', value: '54.2 dBA', severity: 'calm' },
      { time: '02:05:12', description: 'Spectrum analysis check', value: 'No siren detected', severity: 'calm' },
      { time: '02:05:09', description: 'Node battery health telemetry', value: '94% (Good)', severity: 'calm' },
    ],
  },
};

export const INITIAL_FEED_ALERTS: FeedAlertItem[] = [
  {
    id: 'alt-01',
    feedId: 'transit',
    level: 'warning',
    title: 'Transit feed delayed by 8s',
    message: 'GTFS-RT protobuf payload batch ingestion experienced 840ms latency delta over expected interval.',
    timeAgo: '2 min ago',
    timestamp: '02:03:10 AM',
  },
  {
    id: 'alt-02',
    feedId: 'power',
    level: 'critical',
    title: 'Power telemetry missing events',
    message: 'Substation South-04 intermittent telemetry drop detected (2 packets lost in 60s window).',
    timeAgo: '7 min ago',
    timestamp: '01:58:12 AM',
  },
  {
    id: 'alt-03',
    feedId: 'air_quality',
    level: 'warning',
    title: 'Air Quality API rate approaching limit',
    message: 'Hourly quota consumption reached 82% of allocated tier. Auto-throttle caching engaged.',
    timeAgo: '12 min ago',
    timestamp: '01:53:45 AM',
  },
  {
    id: 'alt-04',
    feedId: 'weather',
    level: 'resolved',
    title: 'Weather feed operating normally',
    message: 'All 9 micro-climate grid endpoints responding within 183ms SLA. Cache refreshed.',
    timeAgo: '15 min ago',
    timestamp: '01:50:00 AM',
  },
];

export const INITIAL_LIVE_EVENTS: LiveStreamEventItem[] = [
  {
    id: 'evt-01',
    feedId: 'weather',
    feedLabel: 'WEATHER',
    title: 'Temperature updated',
    description: 'Ambient reading 28.4°C in Sector 4',
    time: '02:05:14',
    zone: 'Zone 4',
    severity: 0.12,
  },
  {
    id: 'evt-02',
    feedId: 'transit',
    feedLabel: 'TRANSIT',
    title: 'Bus #4209 location updated',
    description: 'Vehicle GPS speed 8.4 m/s (Rt 14)',
    time: '02:05:13',
    zone: 'Zone 2',
    severity: 0.38,
  },
  {
    id: 'evt-03',
    feedId: 'power',
    feedLabel: 'POWER',
    title: 'Grid load increased',
    description: 'Substation North active load 418.6 MW',
    time: '02:05:12',
    zone: 'Zone 7',
    severity: 0.22,
  },
  {
    id: 'evt-04',
    feedId: 'incident',
    feedLabel: 'INCIDENT',
    title: 'New 311 incident detected',
    description: 'Street light failure on Orchard Blvd',
    time: '02:05:11',
    zone: 'Zone 5',
    severity: 0.65,
  },
  {
    id: 'evt-05',
    feedId: 'air_quality',
    feedLabel: 'AIR QUALITY',
    title: 'AQI updated',
    description: 'Index 38 (Good) / PM2.5 at 9.4 µg/m³',
    time: '02:05:10',
    zone: 'Zone 3',
    severity: 0.18,
  },
  {
    id: 'evt-06',
    feedId: 'noise',
    feedLabel: 'ACOUSTIC',
    title: 'Sound baseline check',
    description: 'Node 881 recorded 54.2 dBA (Nominal)',
    time: '02:05:08',
    zone: 'Zone 1',
    severity: 0.15,
  },
];

export const INITIAL_ANOMALIES: AiAnomalyItem[] = [
  {
    id: 'anom-01',
    feedId: 'transit',
    title: 'Unusual transit delay clustering',
    feedName: 'Public Transit (GTFS-RT)',
    expected: '~120 events/hour',
    observed: '287 events/hour',
    anomalyScore: 94,
    timestamp: '02:01 AM',
    severity: 'high',
  },
  {
    id: 'anom-02',
    feedId: 'power',
    title: 'Substation power consumption spike',
    feedName: 'Power & Grid Monitoring (Grid Telemetry)',
    expected: '420 MW baseline',
    observed: '610 MW peak load',
    anomalyScore: 91,
    timestamp: '01:54 AM',
    severity: 'high',
  },
  {
    id: 'anom-03',
    feedId: 'noise',
    title: 'Transient acoustic flare',
    feedName: 'Noise Monitoring (Acoustic Sensors)',
    expected: '48 dBA average',
    observed: '78 dBA spike',
    anomalyScore: 76,
    timestamp: '01:46 AM',
    severity: 'medium',
  },
];

export const INITIAL_CORRELATIONS: CrossFeedCorrelationItem[] = [
  {
    id: 'corr-01',
    title: 'Severe Thunderstorm + Grid Surge + Traffic Slowdown',
    hypothesis: 'Localized cloudburst in Zone 4 triggered surface drainage backup, slowing Route 14 buses by 12 mins and surging grid HVAC demand.',
    sources: ['weather', 'transit', 'power', 'incident'],
    confidenceScore: 87,
    impactZone: 'Sector 4 / University Quarter',
    severity: 'watch',
    actionRecommendation: 'Deploy traffic signal priority override on Corridor B and alert stormwater rapid-response crew.',
  },
  {
    id: 'corr-02',
    title: 'Acoustic Flare & 311 Street Light Inquiries',
    hypothesis: 'Concurrently timed acoustic transient and multiple dark block tickets indicate transformer fuse tripping.',
    sources: ['noise', 'incident', 'power'],
    confidenceScore: 92,
    impactZone: 'Sector 5 / Historic Market',
    severity: 'strained',
    actionRecommendation: 'Dispatch municipal grid engineering unit to Substation 08 breaker panel.',
  }
];

export const GENERATE_THROUGHPUT_SERIES = (timeWindow: string): ThroughputPoint[] => {
  const points: ThroughputPoint[] = [];
  const count = timeWindow === '1m' ? 12 : timeWindow === '5m' ? 20 : timeWindow === '15m' ? 30 : 24;
  const now = Date.now();
  const stepMs = timeWindow === '1m' ? 5000 : timeWindow === '5m' ? 15000 : timeWindow === '15m' ? 30000 : 150000;

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: timeWindow === '1m' || timeWindow === '5m' ? '2-digit' : undefined });
    
    // Wave calculations with realistic jitter
    const sinOffset = Math.sin((count - i) * 0.4);
    const cosOffset = Math.cos((count - i) * 0.3);
    
    const weather = Math.round(52 + sinOffset * 8 + Math.random() * 6);
    const transit = Math.round(145 + cosOffset * 25 + Math.random() * 15);
    const incident = Math.round(22 + sinOffset * 4 + Math.random() * 4);
    const air_quality = Math.round(35 + cosOffset * 5 + Math.random() * 5);
    const power = Math.round(98 + sinOffset * 18 + Math.random() * 10);
    const noise = Math.round(71 + cosOffset * 10 + Math.random() * 8);
    const total = weather + transit + incident + air_quality + power + noise;

    points.push({
      t: timeStr,
      total,
      weather,
      transit,
      incident,
      air_quality,
      power,
      noise,
    });
  }

  return points;
};
