import {
  Pulse,
  ZoneDetail,
  NormalizedEvent,
  Insight,
  FeedStatus,
  ZoneHistory,
  Summary,
  Alert,
  AlertRule,
  ReplayState,
  CityConfig,
  ScenarioItem,
  ActiveScenario,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('citypulse_auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/register') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('citypulse_auth_token');
      }
    }

    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.error || errorDetail;
    } catch {
      // ignore json parse error
    }
    throw new Error(`API Error [${res.status}] ${endpoint}: ${errorDetail}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  getHealth: () => fetchJson<{ ok: boolean; mode: 'live' | 'replay'; uptime_s: number }>('/api/health'),
  
  getConfig: () => fetchJson<CityConfig>('/api/config'),
  
  getPulse: () => fetchJson<Pulse>('/api/pulse'),
  
  getZonesGeoJSON: () => fetchJson<GeoJSON.FeatureCollection>('/api/zones'),
  
  getZoneDetail: (zoneId: string) => fetchJson<ZoneDetail>(`/api/zones/${zoneId}`),
  
  getEvents: (params?: { feed?: string; zone_id?: string; since?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.feed) searchParams.set('feed', params.feed);
    if (params?.zone_id) searchParams.set('zone_id', params.zone_id);
    if (params?.since) searchParams.set('since', params.since);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return fetchJson<NormalizedEvent[]>(`/api/events${qs ? `?${qs}` : ''}`);
  },
  
  getInsights: (status: 'active' | 'resolved' | 'all' = 'active') =>
    fetchJson<Insight[]>(`/api/insights?status=${status}`),
  
  getFeedsStatus: () => fetchJson<FeedStatus[]>('/api/feeds/status'),
  
  toggleFeed: (feed: string, enabled: boolean) =>
    fetchJson<FeedStatus>(`/api/feeds/${feed}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),
  
  getHistory: (zoneId: string = 'all', hours: number = 6, bucketMin: number = 5) =>
    fetchJson<ZoneHistory>(`/api/history?zone_id=${zoneId}&hours=${hours}&bucket_min=${bucketMin}`),
  
  getSummary: (zoneId?: string) =>
    fetchJson<Summary>(`/api/summary${zoneId ? `?zone_id=${zoneId}` : ''}`),
  
  getScenarios: () =>
    fetchJson<{ available: ScenarioItem[]; active: ActiveScenario[] }>('/api/sim/scenarios'),
  
  triggerScenario: (name: string, zoneId?: string, durationMin: number = 5) =>
    fetchJson<{ ok: boolean }>('/api/sim/scenario', {
      method: 'POST',
      body: JSON.stringify({ name, zone_id: zoneId, duration_min: durationMin }),
    }),
  
  getAlerts: (acknowledged?: boolean) => {
    const qs = acknowledged !== undefined ? `?acknowledged=${acknowledged}` : '';
    return fetchJson<Alert[]>(`/api/alerts${qs}`);
  },
  
  acknowledgeAlert: (alertId: string) =>
    fetchJson<Alert>(`/api/alerts/${alertId}/ack`, { method: 'POST' }),
  
  getAlertRules: () => fetchJson<AlertRule[]>('/api/alerts/rules'),
  
  createAlertRule: (rule: Partial<AlertRule>) =>
    fetchJson<AlertRule>('/api/alerts/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    }),
  
  updateAlertRule: (ruleId: string, updates: Partial<AlertRule>) =>
    fetchJson<AlertRule>(`/api/alerts/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  deleteAlertRule: (ruleId: string) =>
    fetchJson<{ ok: boolean }>(`/api/alerts/rules/${ruleId}`, { method: 'DELETE' }),
  
  startReplay: (dataset: string = 'storm_day', speed: number = 10) =>
    fetchJson<ReplayState>('/api/replay/start', {
      method: 'POST',
      body: JSON.stringify({ dataset, speed }),
    }),
  
  stopReplay: () => fetchJson<ReplayState>('/api/replay/stop', { method: 'POST' }),
  
  seekReplay: (progress: number) =>
    fetchJson<ReplayState>('/api/replay/seek', {
      method: 'POST',
      body: JSON.stringify({ progress }),
    }),
  
  getReplayState: () => fetchJson<ReplayState>('/api/replay/state'),
};
