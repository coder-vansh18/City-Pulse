from typing import Dict, List, Any, Optional, Deque
from collections import deque
from datetime import datetime, timezone, timedelta
from app.models import (
    NormalizedEvent, Pulse, ZoneProps, Insight, FeedStatus,
    Alert, AlertRule, ReplayState, Summary, ZoneRiskItem, HistoryPoint, FeedType
)
from app.zones import zone_manager

class AppStateManager:
    def __init__(self):
        self.mode: str = "live"  # "live" | "replay"
        self.start_time: datetime = datetime.now(timezone.utc)
        
        # Ring buffers
        self.max_events = 2000
        self.events: Deque[NormalizedEvent] = deque(maxlen=self.max_events)
        
        # Insights: map id -> Insight
        self.insights: Dict[str, Insight] = {}
        
        # Feed instances registry: feed_name -> BaseFeed
        self.feeds: Dict[str, Any] = {}
        
        # Zone properties cache: zone_id -> ZoneProps
        self.zone_props: Dict[str, ZoneProps] = {}
        
        # Zone history cache: zone_id -> Deque[HistoryPoint] (last 6 hours @ 5 min buckets)
        self.zone_history: Dict[str, Deque[Dict[str, Any]]] = {
            z["id"]: deque(maxlen=288) for z in zone_manager.zones
        }
        self.city_history: Deque[Dict[str, Any]] = deque(maxlen=288)
        
        # Latest computed Pulse
        self.latest_pulse: Optional[Pulse] = None
        
        # Active scenario: name, started_at, ends_at, zone_id
        self.active_scenario: Optional[Dict[str, Any]] = None
        
        # Replay state
        self.replay_state: ReplayState = ReplayState(
            active=False,
            dataset=None,
            speed=1.0,
            sim_time=None,
            progress=0.0,
            started_at=None
        )
        
        # Connected WebSocket clients
        self.ws_clients: set = set()
        
        # Rule trigger timestamps: rule_id -> last_triggered_datetime
        self.rule_cooldowns: Dict[str, datetime] = {}
        
        # Pre-initialize zone properties with calm baselines
        now_iso = datetime.now(timezone.utc).isoformat()
        for z in zone_manager.zones:
            self.zone_props[z["id"]] = ZoneProps(
                id=z["id"],
                name=z["name"],
                pulse_score=92.0,
                status="calm",
                trend="steady",
                confidence=0.95,
                bpm=68,
                top_issue=None,
                sub_scores={
                    "weather": 95.0,
                    "transit": 92.0,
                    "incident": 90.0,
                    "air_quality": 95.0,
                    "power": 100.0,
                    "noise": 94.0
                }
            )

    def add_event(self, event: NormalizedEvent):
        self.events.append(event)

    def get_recent_events(self, minutes: int = 15, feed: Optional[str] = None, zone_id: Optional[str] = None) -> List[NormalizedEvent]:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        results = []
        for e in reversed(self.events):
            if e.timestamp >= cutoff:
                if (feed is None or e.feed == feed) and (zone_id is None or e.zone_id == zone_id):
                    results.append(e)
            else:
                # deque is chronological, but can break early if all events are sorted
                pass
        return results

    def upsert_insight(self, insight: Insight):
        self.insights[insight.id] = insight

    def get_active_insights(self) -> List[Insight]:
        return [ins for ins in self.insights.values() if ins.status == "active"]

    def record_history_point(self, timestamp_iso: str, city_pulse: float, zone_scores: Dict[str, float], zone_sub_scores: Dict[str, Dict[str, Optional[float]]]):
        # Record city point
        self.city_history.append({
            "t": timestamp_iso,
            "pulse": round(city_pulse, 1)
        })
        # Record each zone point
        for zid, score in zone_scores.items():
            subs = zone_sub_scores.get(zid, {})
            point = {
                "t": timestamp_iso,
                "pulse": round(score, 1),
                "weather": subs.get("weather"),
                "transit": subs.get("transit"),
                "incident": subs.get("incident"),
                "air_quality": subs.get("air_quality"),
                "power": subs.get("power"),
                "noise": subs.get("noise")
            }
            self.zone_history[zid].append(point)

state = AppStateManager()
