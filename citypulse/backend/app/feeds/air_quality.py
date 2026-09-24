import random
import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from app.config import settings
from app.models import NormalizedEvent
from app.zones import zone_manager
from app.normalize import normalize_air_quality_raw
from app.feeds.base import BaseFeed

logger = logging.getLogger("citypulse.feeds.air_quality")

class AirQualityFeed(BaseFeed):
    def __init__(self):
        super().__init__(
            feed_type="air_quality",
            label="Open-Meteo Air Quality / Sim",
            expected_interval_s=5.0,
            source="real" if settings.USE_REAL_WEATHER else "simulated"
        )
        self.last_live_fetch: Optional[datetime] = None
        self.live_cache_s: float = 300.0
        self.cached_aqi: float = 38.0
        self.cached_pm25: float = 8.5

    async def _fetch_open_meteo(self) -> bool:
        url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality?"
            f"latitude={settings.CITY_LAT}&longitude={settings.CITY_LON}&"
            f"current=us_aqi,pm2_5"
        )
        try:
            async with httpx.AsyncClient(timeout=4.5) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    curr = data.get("current", {})
                    self.cached_aqi = float(curr.get("us_aqi", 38.0))
                    self.cached_pm25 = float(curr.get("pm2_5", 8.5))
                    self.source = "real"
                    self.last_live_fetch = datetime.now(timezone.utc)
                    return True
        except Exception as e:
            logger.info(f"Open-Meteo Air Quality API unavailable ({e}), falling back to simulation.")
            self.source = "simulated"
        return False

    async def poll_or_generate(self):
        now = datetime.now(timezone.utc)
        if settings.USE_REAL_WEATHER:
            if not self.last_live_fetch or (now - self.last_live_fetch).total_seconds() > self.live_cache_s:
                await self._fetch_open_meteo()

        from app.state import state
        scenario = state.active_scenario
        aqi = self.cached_aqi
        pm25 = self.cached_pm25

        target_zone = random.choice(zone_manager.zones)["id"]
        if scenario and scenario["name"] == "heatwave":
            aqi = random.uniform(140.0, 185.0)
            pm25 = random.uniform(55.0, 85.0)
        elif scenario and scenario["name"] == "gas_leak":
            if scenario.get("zone_id"):
                target_zone = scenario["zone_id"]
                aqi = random.uniform(115.0, 160.0)
                pm25 = random.uniform(40.0, 65.0)
        elif self.source == "simulated":
            # Baseline AQI: industrial zone higher, green park lower
            base_bias = 20.0 if target_zone == "z9" else (-10.0 if target_zone == "z2" else 0.0)
            aqi = max(15.0, 35.0 + base_bias + random.gauss(0, 4.0))
            pm25 = max(3.0, (aqi * 0.22) + random.gauss(0, 1.2))

        raw_event = {
            "epoch": int(now.timestamp()),
            "zone_id": target_zone,
            "us_aqi": aqi,
            "pm2_5": pm25,
            "source": self.source
        }
        event = normalize_air_quality_raw(raw_event)
        if event:
            self.record_emitted_event(event)

    def generate_historical_events(self, start_time: datetime, end_time: datetime) -> List[NormalizedEvent]:
        events = []
        cur = start_time
        while cur <= end_time:
            for z in zone_manager.zones:
                if random.random() < 0.30:
                    base_bias = 20.0 if z["id"] == "z9" else (-10.0 if z["id"] == "z2" else 0.0)
                    aqi = max(15.0, 35.0 + base_bias + random.gauss(0, 3.0))
                    raw = {
                        "epoch": int(cur.timestamp()),
                        "zone_id": z["id"],
                        "us_aqi": aqi,
                        "pm2_5": aqi * 0.22,
                        "source": "simulated"
                    }
                    ev = normalize_air_quality_raw(raw)
                    if ev:
                        events.append(ev)
            cur += timedelta(minutes=6)
        return events
