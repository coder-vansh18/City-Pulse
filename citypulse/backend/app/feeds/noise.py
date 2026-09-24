import random
import math
import logging
from datetime import datetime, timezone, timedelta
from typing import List
from app.models import NormalizedEvent
from app.zones import zone_manager
from app.normalize import normalize_noise_raw
from app.feeds.base import BaseFeed

logger = logging.getLogger("citypulse.feeds.noise")

class NoiseFeed(BaseFeed):
    def __init__(self):
        super().__init__(
            feed_type="noise",
            label="Civic Acoustic Sensors",
            expected_interval_s=6.0, # 6s interval
            source="simulated"
        )

    def _get_ambient_dba(self, dt: datetime, zone_id: str) -> float:
        hour = dt.hour + dt.minute / 60.0
        # Daytime higher noise curve
        diurnal = 8.0 * math.sin((hour - 6.0) * math.pi / 14.0) if (6.0 <= hour <= 22.0) else -4.0
        # Zone bias: Industrial and Central higher, Green park lower
        zone_bias = 6.0 if zone_id in ["z5", "z9"] else (-6.0 if zone_id == "z2" else 0.0)
        base = 52.0 + diurnal + zone_bias + random.gauss(0, 2.0)
        return max(35.0, base)

    async def poll_or_generate(self):
        now = datetime.now(timezone.utc)
        from app.state import state
        scenario = state.active_scenario

        zone_id = random.choice(zone_manager.zones)["id"]
        dba = self._get_ambient_dba(now, zone_id)

        if scenario:
            s_name = scenario["name"]
            if s_name == "transit_strike" and zone_id in ["z5", "z6"]:
                dba = random.uniform(80.0, 93.0)
            elif s_name == "gas_leak" and (not scenario.get("zone_id") or zone_id == scenario.get("zone_id")):
                dba = random.uniform(82.0, 96.0) # Sirens & response
            elif s_name == "storm":
                dba = max(dba, random.uniform(70.0, 84.0)) # Wind / thunder

        raw = {
            "sensor_id": f"ACOUSTIC-{zone_id.upper()}-{random.randint(10, 99)}",
            "zone_id": zone_id,
            "decibels_dba": round(dba, 1),
            "peak_hz": random.choice([60, 120, 250, 1000, 2500]),
            "timestamp_utc": now.strftime("%Y-%m-%d %H:%M:%S"),
            "source": self.source
        }
        event = normalize_noise_raw(raw)
        if event:
            self.record_emitted_event(event)

    def generate_historical_events(self, start_time: datetime, end_time: datetime) -> List[NormalizedEvent]:
        events = []
        cur = start_time
        while cur <= end_time:
            for z in zone_manager.zones:
                if random.random() < 0.25:
                    dba = self._get_ambient_dba(cur, z["id"])
                    raw = {
                        "sensor_id": f"ACOUSTIC-{z['id'].upper()}-01",
                        "zone_id": z["id"],
                        "decibels_dba": round(dba, 1),
                        "peak_hz": 120,
                        "timestamp_utc": cur.strftime("%Y-%m-%d %H:%M:%S"),
                        "source": "simulated"
                    }
                    ev = normalize_noise_raw(raw)
                    if ev:
                        ev.timestamp = cur
                        events.append(ev)
            cur += timedelta(minutes=4)
        return events
