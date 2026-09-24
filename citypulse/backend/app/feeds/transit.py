import random
import math
import logging
from datetime import datetime, timezone, timedelta
from typing import List
from app.models import NormalizedEvent
from app.zones import zone_manager
from app.normalize import normalize_transit_raw
from app.feeds.base import BaseFeed

logger = logging.getLogger("citypulse.feeds.transit")

ROUTES = [
    ("Line-1 Red", ["z7", "z4", "z1"]),
    ("Line-2 Blue", ["z8", "z5", "z2"]),
    ("Line-3 Green", ["z9", "z6", "z3"]),
    ("Line-4 Crosstown", ["z4", "z5", "z6"]),
    ("Line-5 Ring", ["z1", "z2", "z3", "z6", "z9", "z8", "z7", "z4"]),
    ("Bus 42 Express", ["z5", "z3"]),
    ("Bus 88 Metro", ["z5", "z8"]),
]

class TransitFeed(BaseFeed):
    def __init__(self):
        super().__init__(
            feed_type="transit",
            label="GTFS-RT Transit Stream",
            expected_interval_s=4.0, # 4s cadence
            source="simulated"
        )

    def _get_diurnal_delay(self, dt: datetime) -> float:
        # Rush hour curves (8am peak, 18pm peak)
        hour = dt.hour + dt.minute / 60.0
        # Morning peak (7:30 to 9:30)
        m_peak = math.exp(-((hour - 8.5)**2) / 1.5) * 4.5
        # Evening peak (16:30 to 19:00)
        e_peak = math.exp(-((hour - 17.5)**2) / 2.0) * 6.0
        # Quiet night reduction
        night_factor = 0.2 if (hour < 5.0 or hour > 23.0) else 1.0
        base = (1.5 + m_peak + e_peak) * night_factor
        return max(0.0, base + random.gauss(0, 0.8))

    async def poll_or_generate(self):
        now = datetime.now(timezone.utc)
        from app.state import state
        scenario = state.active_scenario

        route_name, route_zones = random.choice(ROUTES)
        zone_id = random.choice(route_zones)
        base_delay = self._get_diurnal_delay(now)
        cause = "congestion"

        if scenario:
            s_name = scenario["name"]
            if s_name == "transit_strike":
                base_delay = random.uniform(28.0, 52.0)
                cause = "strike_action"
            elif s_name == "storm":
                # High delays in multiple zones
                if zone_id in ["z4", "z5", "z7", "z8"]:
                    base_delay = random.uniform(14.0, 28.0)
                    cause = "weather_slowdown"
            elif s_name == "power_outage":
                affected_zone = scenario.get("zone_id", "z5")
                adj = zone_manager.adjacency.get(affected_zone, [])
                if zone_id == affected_zone or zone_id in adj:
                    base_delay = random.uniform(16.0, 30.0)
                    cause = "signal_power_loss"
            elif s_name == "gas_leak":
                target_zone = scenario.get("zone_id", "z4")
                if zone_id == target_zone:
                    base_delay = random.uniform(18.0, 35.0)
                    cause = "emergency_reroute"

        raw = {
            "route_id": route_name,
            "zone_id": zone_id,
            "scheduled_time": now.strftime("%H:%M"),
            "delay_minutes": round(base_delay, 1),
            "stop_id": f"ST-{random.randint(101, 399)}",
            "cause": cause,
            "source": self.source
        }
        event = normalize_transit_raw(raw)
        if event:
            self.record_emitted_event(event)

    def generate_historical_events(self, start_time: datetime, end_time: datetime) -> List[NormalizedEvent]:
        events = []
        cur = start_time
        while cur <= end_time:
            for _ in range(random.randint(2, 4)):
                route_name, route_zones = random.choice(ROUTES)
                zone_id = random.choice(route_zones)
                delay = self._get_diurnal_delay(cur)
                raw = {
                    "route_id": route_name,
                    "zone_id": zone_id,
                    "scheduled_time": cur.strftime("%H:%M"),
                    "delay_minutes": round(delay, 1),
                    "stop_id": f"ST-{random.randint(101, 399)}",
                    "cause": "normal_operations",
                    "source": "simulated"
                }
                ev = normalize_transit_raw(raw)
                if ev:
                    # set specific timestamp
                    ev.timestamp = cur
                    events.append(ev)
            cur += timedelta(seconds=12)
        return events
