# CityPulse — The Live Civic Health Dashboard
> **AmiHacks Track B: Industry / Open Innovation**  
> *"One glance should tell a resident what's really happening in their neighborhood — and why it matters."*

---

## 1. Project Overview
**CityPulse** breaks civic telemetry silos by ingesting 6 heterogeneous data streams (Open-Meteo Weather, Open-Meteo Air Quality, GTFS-RT Transit, 311 Civic Complaints, Power Grid Telemetry, and Acoustic Sensors) into a unified real-time pipeline.

### Core Architecture & Judging Highlights:
1. **10-Second Rule:** Residents instantly understand the city’s pulse from one big score (0–100), one status badge, an animated PQRST Heartbeat (ECG), a plain-language grounded summary, and a 9-zone interactive choropleth map.
2. **Quality of Fusion Over Quantity:** Detects spatial-temporal co-occurrence across zones within rolling time windows.
3. **Epistemic Honesty:** All correlations are phrased as **possible links** with confidence chips and explicit caveats—*never* unverified causal claims.
4. **Graceful Degradation:** When feeds are interrupted or delayed, weights are dynamically renormalized over remaining signals, degraded banners activate, and unavailable sub-scores show `"n/a"` without crashing.
5. **Privacy-by-Design:** Zero PII is stored; location coordinates are snapped/jittered to block-level zone centroids.
6. **Replay Studio & Scenario Engine:** Includes a 3-day historical simulation dataset and instant live scenario injections (Storm, Grid Outage, Gas Leak, Strike, Heatwave).

---

## 2. Monorepo Folder Tree
```
citypulse/
  README.md                     # Documentation & 2-Minute Judge Demo Script
  package.json                  # Root concurrent script runner
  backend/
    app/
      main.py                   # FastAPI app with lifespan & background pipeline loop
      config.py                 # Pydantic Settings & environment variables
      models.py                 # Unified NormalizedEvent, Pulse, Zone, Insight schemas
      zones.py                  # 9 named 3x3 grid zones, centroids, GeoJSON polygons
      db.py                     # SQLite persistence engine & query helpers
      state.py                  # In-memory fast ring-buffer snapshot
      normalize.py              # Heterogeneous raw feed normalization to UTC schema
      scoring.py                # Sub-score calculator & dynamic weight renormalizer
      anomaly.py                # Robust Z-score (median/MAD) anomaly detector
      correlation.py            # Spatial-temporal co-occurrence & epistemic hedging
      summary.py                # Grounded template & LLM summary generator + validator
      agent.py                  # Autonomous 5s agentic safety monitor & alerts
      scenarios.py              # Multi-feed scenario injection engine
      replay.py                 # Historical timeline streamer (1x to 600x speed)
      feeds/                    # 6 Feed modules (Base, Weather, AQI, Transit, 311, Power, Noise)
      routes/                   # REST router (rest.py) & WebSocket streamer (ws.py)
    data/
      replay_storm_day.json     # Pre-generated 3-day civic timeline
    scripts/
      gen_replay.py             # Script to regenerate replay dataset
    tests/                      # Pytest suite (scoring, anomaly, correlation, grounding)
    requirements.txt
    .env.example
  frontend/
    src/
      api/                      # API client, WebSocket auto-reconnect, types, mock fixtures
      store/                    # Zustand useCityStore
      hooks/                    # useLiveData, useReducedMotion, useTheme, useReplay
      components/
        layout/                 # AppShell, TopBar, SideNav, BottomNav, DegradedBanner, DemoPanel
        pulse/                  # HeartbeatECG, PulseGauge, StatusBadge, SummaryCard, TrendArrow, BpmCounter
        map/                    # CityMap, ZoneLayer, EventMarkers, AnomalyRings, CorrelationLinks, MapLegend, LayerToggles, ZoneDrawer
        insights/               # InsightCard, ConfidenceChip, EvidenceList, CaveatNote
        timeline/               # NarrativeTicker, TimeScrubber, HeatTimeline
      pages/                    # LivePulse (/), MapView (/map), ZoneDetail (/zone/:id), Insights (/insights), Replay (/replay), FeedHealth (/feeds), Alerts (/alerts), About (/about)
    index.html tailwind.config.ts vite.config.ts package.json
```

---

## 3. Quickstart & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### One-Command Setup & Launch

#### 1. Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend dashboard will be live at `http://localhost:5173` and the backend API at `http://localhost:8000`.

---

## 4. Frozen API Contract Table

| Method | Endpoint | Description | Response / Payload |
|---|---|---|---|
| `GET` | `/api/health` | Service health & uptime | `{ok: true, mode: "live"\|"replay", uptime_s}` |
| `GET` | `/api/config` | City metadata & 9 zone centroids | `{city_name, center, zoom, feeds, zones}` |
| `GET` | `/api/pulse` | Global Pulse score & vital metrics | `Pulse` (score, bpm, status, summary, at-risk) |
| `GET` | `/api/zones` | GeoJSON FeatureCollection | Polygons with live `ZoneProps` |
| `GET` | `/api/zones/{id}` | Deep analytics for zone | `ZoneDetail` (sub-scores, events, sparkline) |
| `GET` | `/api/events` | Filterable event ring buffer | `NormalizedEvent[]` |
| `GET` | `/api/insights` | Active / resolved insights | `Insight[]` (anomalies + correlations) |
| `GET` | `/api/feeds/status` | Ingestion health for 6 feeds | `FeedStatus[]` (cadence, events/hr, state) |
| `POST`| `/api/feeds/{f}/toggle`| Enable/disable feed (degraded test)| Body: `{enabled: boolean}` |
| `GET` | `/api/history` | Historical pulse trajectory | `{zone_id, points: HistoryPoint[]}` |
| `GET` | `/api/summary` | Grounded summary sentence | `Summary` (headline, body, grounded_on) |
| `GET` | `/api/sim/scenarios`| List scenarios | `{available, active}` |
| `POST`| `/api/sim/scenario` | Trigger scenario injection | Body: `{name, zone_id?, duration_min?}` |
| `GET` | `/api/alerts` | Triggered autonomous alerts | `Alert[]` |
| `POST`| `/api/alerts/{id}/ack`| Acknowledge alert | `Alert` |
| `GET/POST`| `/api/alerts/rules` | Manage agentic safety rules | `AlertRule[]` |
| `POST`| `/api/replay/start` | Start historical playback | Body: `{dataset: "storm_day", speed: 10}` |
| `POST`| `/api/replay/stop` | Stop replay & return to live | `ReplayState` |
| `POST`| `/api/replay/seek` | Jump to progress 0..1 | Body: `{progress: 0.45}` |
| `WS`  | `/ws/stream` | Pushed multi-client WebSocket | Envelope: `{type, mode, ts, payload}` |

---

## 5. Application Pages & Routes

- `/` **Live Pulse:** 10-second rule home screen featuring PQRST HeartbeatECG, PulseGauge, Grounded Summary, compact 9-zone map, worst 3 zones at risk, and narrative ticker.
- `/map` **Civic Map:** Full-viewport interactive Leaflet map with CartoDB tiles, zone choropleths, clustered markers, pulsing anomaly rings, animated dashed correlation links, and slide-in zone drawer.
- `/zone/:id` **Zone Detail:** Deep-dive analytics with 6 sub-score bars (`n/a` for missing), 6-hour sparkline trajectory area chart, recent events, and "Why this score?" calculation breakdown.
- `/insights` **Intelligence:** Tabbed browser for Cross-Feed Correlations and Anomalies with plain-language evidence metrics (e.g., "2.8× normal") and epistemic caveat chips.
- `/replay` **Time Replay:** Playback studio with speed multipliers (1x–300x), TimeScrubber, and a 2D Heat Matrix of 9 zones across the 3-day timeline.
- `/feeds` **Feed Health:** Health metrics for all 6 feeds with toggle switches to demo graceful degradation and a 3-step normalization visual diagram.
- `/alerts` **Agent Alerts:** Autonomous safety monitor feed with one-click acknowledgment and an interactive rule builder.
- `/about` **Methodology:** Complete documentation on scoring weights, non-causal correlation ethics, and zero-PII privacy stance.

---

## 6. 2-Minute Judge Demo Script

1. **Step 1: Baseline Calm (0:00 – 0:30)**
   - Open `http://localhost:5173`.
   - Point out the **Pulse Score (~85–92)**, the steady green **Heartbeat ECG**, the **Grounded Summary Card**, and the nominal **9-Zone Map**.
   - Hover over the summary popover: *"Based on 6 live signals"*.

2. **Step 2: Inject Storm Surge Scenario (0:30 – 1:00)**
   - Press **Key 1** (or open the **Judge Demo Panel** at bottom-right and click **Storm Surge**).
   - Within seconds, watch the **ECG BPM jump from 72 to 105+**, the waveform turn **orange/strained** with elevated QRS stress peaks, and **Riverside / Central Station** turn yellow/red on the map.
   - Navigate to `/insights` to show the hedged correlation:  
     *"Heavy precipitation coincides with 14-min transit delays and 4 flooding reports in Riverside. This may be related — causality unconfirmed."*

3. **Step 3: Test Graceful Degradation (1:00 – 1:30)**
   - Open `/feeds` (or use the Demo Panel) and click **Kill Transit Feed**.
   - Immediately observe the yellow **Degraded Banner** appear across the top.
   - Open any zone page (`/zone/z5`) to see the transit sub-score display **"n/a"** while weights are transparently renormalized over remaining feeds without errors or crashes.

4. **Step 4: Reset & Time Replay (1:30 – 2:00)**
   - Press **Key 6** to reset baseline.
   - Navigate to `/replay` (or press **Key R**) and click **Start Storm Day Replay (10x)**.
   - Scrub through the **3-Day Heat Matrix** and observe the live map and ECG synchronize with the historical timeline.
