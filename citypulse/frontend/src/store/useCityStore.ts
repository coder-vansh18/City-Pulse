import { create } from 'zustand';
import {
  Pulse,
  NormalizedEvent,
  Insight,
  FeedStatus,
  Alert,
  AlertRule,
  ReplayState,
  CityConfig,
  ActiveScenario,
  FeedType,
  Status,
} from '../api/types';
import { WSConnectionStatus } from '../api/ws';
import { MOCK_CONFIG, MOCK_FEEDS, MOCK_PULSE, MOCK_ALERTS, MOCK_ALERT_RULES } from '../api/mock/fixtures';

export type MapLayerToggles = {
  zones: boolean;
  events: boolean;
  heat: boolean;
  anomalyRings: boolean;
  correlationLinks: boolean;
};

interface CityState {
  config: CityConfig | null;
  pulse: Pulse | null;
  zonesGeoJSON: GeoJSON.FeatureCollection | null;
  events: NormalizedEvent[];
  insights: Record<string, Insight>;
  feeds: FeedStatus[];
  alerts: Alert[];
  rules: AlertRule[];
  replay: ReplayState;
  activeScenario: ActiveScenario | null;

  mode: 'live' | 'replay';
  connection: WSConnectionStatus;
  theme: 'dark' | 'light';
  soundOn: boolean;
  mockMode: boolean;
  selectedZoneId: string | null;
  highlightedInsightId: string | null;

  mapLayers: MapLayerToggles;
  activeFeedFilter: FeedType | 'all';
  timeWindowMin: number;

  // Actions
  setConfig: (config: CityConfig) => void;
  setPulse: (pulse: Pulse) => void;
  setZonesGeoJSON: (geojson: GeoJSON.FeatureCollection) => void;
  addEvent: (event: NormalizedEvent) => void;
  setEvents: (events: NormalizedEvent[]) => void;
  upsertInsight: (insight: Insight) => void;
  setInsights: (insights: Insight[]) => void;
  setFeeds: (feeds: FeedStatus[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  setRules: (rules: AlertRule[]) => void;
  setReplay: (replay: ReplayState) => void;
  setActiveScenario: (scenario: ActiveScenario | null) => void;
  setConnection: (status: WSConnectionStatus) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  setMockMode: (mock: boolean) => void;
  setSelectedZoneId: (zoneId: string | null) => void;
  setHighlightedInsightId: (insightId: string | null) => void;
  setMapLayer: (layer: keyof MapLayerToggles, enabled: boolean) => void;
  setActiveFeedFilter: (feed: FeedType | 'all') => void;
  setTimeWindowMin: (mins: number) => void;
  resetToMockFixtures: () => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('citypulse_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  }
  return 'light';
};

const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  if (initialTheme === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }
}

export const useCityStore = create<CityState>((set, get) => ({
  config: null,
  pulse: null,
  zonesGeoJSON: null,
  events: [],
  insights: {},
  feeds: [],
  alerts: [],
  rules: [],
  replay: {
    active: false,
    dataset: null,
    speed: 1.0,
    sim_time: null,
    progress: 0.0,
    started_at: null,
  },
  activeScenario: null,
  mode: 'live',
  connection: 'connecting',
  theme: initialTheme,
  soundOn: false,
  mockMode: import.meta.env.VITE_MOCK === 'true',
  selectedZoneId: null,
  highlightedInsightId: null,

  mapLayers: {
    zones: true,
    events: true,
    heat: false,
    anomalyRings: true,
    correlationLinks: true,
  },
  activeFeedFilter: 'all',
  timeWindowMin: 60,

  setConfig: (config) => set({ config }),
  setPulse: (pulse) => set({ pulse, mode: pulse.mode }),
  setZonesGeoJSON: (zonesGeoJSON) => set({ zonesGeoJSON }),
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events.slice(0, 499)],
    })),
  setEvents: (events) => set({ events: events.slice(0, 500) }),
  upsertInsight: (insight) =>
    set((state) => ({
      insights: { ...state.insights, [insight.id]: insight },
    })),
  setInsights: (insights) => {
    const map: Record<string, Insight> = {};
    for (const ins of insights) {
      map[ins.id] = ins;
    }
    set({ insights: map });
  },
  setFeeds: (feeds) => set({ feeds }),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((a) => a.id !== alert.id)],
    })),
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    })),
  setRules: (rules) => set({ rules }),
  setReplay: (replay) => set({ replay, mode: replay.active ? 'replay' : 'live' }),
  setActiveScenario: (activeScenario) => set({ activeScenario }),
  setConnection: (connection) => set({ connection }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('citypulse_theme', theme);
    }
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
  toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
  setMockMode: (mockMode) => set({ mockMode }),
  setSelectedZoneId: (selectedZoneId) => set({ selectedZoneId }),
  setHighlightedInsightId: (highlightedInsightId) => set({ highlightedInsightId }),
  setMapLayer: (layer, enabled) =>
    set((state) => ({
      mapLayers: { ...state.mapLayers, [layer]: enabled },
    })),
  setActiveFeedFilter: (activeFeedFilter) => set({ activeFeedFilter }),
  setTimeWindowMin: (timeWindowMin) => set({ timeWindowMin }),
  resetToMockFixtures: () =>
    set({
      config: MOCK_CONFIG,
      pulse: MOCK_PULSE,
      feeds: MOCK_FEEDS,
      alerts: MOCK_ALERTS,
      rules: MOCK_ALERT_RULES,
      connection: 'connected',
    }),
}));
