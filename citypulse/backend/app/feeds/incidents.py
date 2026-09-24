import random
import logging
from datetime import datetime, timezone, timedelta
from typing import List
from app.models import NormalizedEvent
from app.zones import zone_manager
from app.normalize import normalize_incident_raw
from app.feeds.base import BaseFeed

logger = logging.getLogger("citypulse.feeds.incidents")

INCIDENT_TEMPLATES = [
    ("pothole", "Pothole in left lane impacting vehicle flow", "DOT"),
    ("street_light_out", "Streetlight flickering and out on corner", "DEP"),
    ("illegal_dumping", "Debris blocking sidewalk near alleyway", "DSNY"),
    ("noise_complaint", "Loud construction noise past permitted hours", "DEP"),
    ("blocked_driveway", "Commercial vehicle blocking residential access", "NYPD"),
    ("sidewalk_damage", "Cracked concrete posing tripping hazard", "DOT"),
]

SCENARIO_INCIDENT_TEMPLATES = {
    "storm": [
        ("road_flooding", "Severe water pooling across 2 lanes near intersection", "DEP"),
        ("flooding", "Basement drain backup and street gutter overflow", "DEP"),
        ("fallen_tree", "Large tree branch collapsed across roadway", "Parks"),
        ("tree_hazard", "Split tree limb leaning onto utility pole", "Parks"),
    ],
    "power_outage": [
        ("traffic_signal_out", "Traffic light dark at main 4-way intersection", "DOT"),
        ("street_light_out", "Entire block streetlighting grid dark", "DOT"),
    ],
    "gas_leak": [
        ("gas_leak_report", "Strong sulfur/gas odor detected near main boulevard", "FDNY"),
        ("gas_leak_report", "Hissing noise and odor near excavation site", "FDNY"),
    ],
    "transit_strike": [
        ("noise_complaint", "Crowd congestion and shouting outside terminal", "NYPD"),
        ("blocked_driveway", "Rideshare gridlock blocking bus lane entrance", "DOT"),
    ]
}

class IncidentFeed(BaseFeed):
    def __init__(self):
        super().__init__(
            feed_type="incident",
            label="311 Civic Incident Stream",
            expected_interval_s=5.0, # ~5s interval
            source="simulated"
        )

    async def poll_or_generate(self):
        now = datetime.now(timezone.utc)
        from app.state import state
        scenario = state.active_scenario

        # Determine category and zone based on scenario
        if scenario and scenario["name"] in SCENARIO_INCIDENT_TEMPLATES:
            s_name = scenario["name"]
            cat, desc, agency = random.choice(SCENARIO_INCIDENT_TEMPLATES[s_name])
            if scenario.get("zone_id"):
                zone_id = scenario["zone_id"]
            elif s_name == "storm":
                # Storm affects low-lying / riverside / lakeside / central zones
                zone_id = random.choice(["z4", "z5", "z7", "z8"])
            else:
                zone_id = random.choice(zone_manager.zones)["id"]
        else:
            cat, desc, agency = random.choice(INCIDENT_TEMPLATES)
            zone_id = random.choice(zone_manager.zones)["id"]

        raw = {
            "created_date": now.strftime("%m/%d/%Y %H:%M"),
            "complaint_type": cat,
            "descriptor": desc,
            "zone_id": zone_id,
            "agency": agency,
            "source": self.source
        }
        event = normalize_incident_raw(raw)
        if event:
            self.record_emitted_event(event)

    def generate_historical_events(self, start_time: datetime, end_time: datetime) -> List[NormalizedEvent]:
        events = []
        cur = start_time
        while cur <= end_time:
            cat, desc, agency = random.choice(INCIDENT_TEMPLATES)
            zone_id = random.choice(zone_manager.zones)["id"]
            raw = {
                "created_date": cur.strftime("%m/%d/%Y %H:%M"),
                "complaint_type": cat,
                "descriptor": desc,
                "zone_id": zone_id,
                "agency": agency,
                "source": "simulated"
            }
            ev = normalize_incident_raw(raw)
            if ev:
                ev.timestamp = cur
                events.append(ev)
            cur += timedelta(seconds=random.randint(15, 30))
        return events
