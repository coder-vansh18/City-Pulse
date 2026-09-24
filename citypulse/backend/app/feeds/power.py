import random
import logging
from datetime import datetime, timezone, timedelta
from typing import List
from app.models import NormalizedEvent
from app.zones import zone_manager
from app.normalize import normalize_power_raw
from app.feeds.base import BaseFeed

logger = logging.getLogger("citypulse.feeds.power")

class PowerFeed(BaseFeed):
    def __init__(self):
        super().__init__(
            feed_type="power",
            label="Grid Power & Telemetry",
            expected_interval_s=10.0, # 10s interval
            source="simulated"
        )

    async def poll_or_generate(self):
        now = datetime.now(timezone.utc)
        from app.state import state
        scenario = state.active_scenario

        cust = 0
        p_status = "restored"
        zone_id = random.choice(zone_manager.zones)["id"]

        if scenario:
            s_name = scenario["name"]
            if s_name == "power_outage":
                zone_id = scenario.get("zone_id", "z5")
                cust = random.randint(750, 2400)
                p_status = "outage"
            elif s_name == "storm":
                if random.random() < 0.65:
                    zone_id = random.choice(["z4", "z5", "z8"])
                    cust = random.randint(180, 850)
                    p_status = "outage"
            elif s_name == "heatwave":
                # Transformer overload
                if random.random() < 0.40:
                    zone_id = random.choice(["z5", "z6", "z9"])
                    cust = random.randint(220, 950)
                    p_status = "outage"
        else:
            # 8% chance of small isolated flicker / 0 outage baseline
            if random.random() < 0.08:
                cust = random.randint(15, 65)
                p_status = "flicker"

        raw = {
            "recorded_at": now.isoformat(),
            "zone_id": zone_id,
            "customers_affected": cust,
            "substation_id": f"SUB-{zone_id.upper()}-GRID",
            "status": p_status,
            "source": self.source
        }
        event = normalize_power_raw(raw)
        if event:
            self.record_emitted_event(event)

    def generate_historical_events(self, start_time: datetime, end_time: datetime) -> List[NormalizedEvent]:
        events = []
        cur = start_time
        while cur <= end_time:
            # Baseline is calm
            if random.random() < 0.10:
                zone_id = random.choice(zone_manager.zones)["id"]
                raw = {
                    "recorded_at": cur.isoformat(),
                    "zone_id": zone_id,
                    "customers_affected": random.randint(10, 40),
                    "substation_id": f"SUB-{zone_id.upper()}-GRID",
                    "status": "flicker",
                    "source": "simulated"
                }
                ev = normalize_power_raw(raw)
                if ev:
                    ev.timestamp = cur
                    events.append(ev)
            cur += timedelta(minutes=2)
        return events
