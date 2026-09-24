import random
import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from app.config import settings
from app.models import NormalizedEvent
from app.zones import zone_manager
from app.normalize import normalize_weather_raw
from app.feeds.base import BaseFeed

logger = logging.getLogger("citypulse.feeds.weather")

class WeatherFeed(BaseFeed):
    def __init__(self):
        super().__init__(
            feed_type="weather",
            label="Open-Meteo Weather / Sim",
            expected_interval_s=5.0, # 5s simulated tick / live sync
            source="real" if settings.USE_REAL_WEATHER else "simulated"
        )
        self.last_live_fetch: Optional[datetime] = None
        self.live_cache_s: float = 300.0 # 5 min live poll
        self.cached_weather: dict = {
            "temp_c": 21.0,
            "precip_mm": 0.0,
            "wind_kmh": 14.0,
            "condition": "Partly Cloudy"
        }

    async def _fetch_open_meteo(self) -> bool:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={settings.CITY_LAT}&longitude={settings.CITY_LON}&"
            f"current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
        )
        try:
            async with httpx.AsyncClient(timeout=4.5) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    curr = data.get("current", {})
                    temp = curr.get("temperature_2m", 20.0)
                    precip = curr.get("precipitation", 0.0)
                    wind = curr.get("wind_speed_10m", 10.0)
                    code = curr.get("weather_code", 0)

                    # Simple WMO code description
                    wmo_map = {
                        0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
                        45: "Fog", 48: "Depositing Rime Fog",
                        51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
                        61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
                        71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
                        80: "Rain Showers", 81: "Moderate Showers", 82: "Violent Showers",
                        95: "Thunderstorm", 96: "Thunderstorm with Hail"
                    }
                    cond = wmo_map.get(code, "Clear")

                    self.cached_weather = {
                        "temp_c": float(temp),
                        "precip_mm": float(precip),
                        "wind_kmh": float(wind),
                        "condition": cond
                    }
                    self.source = "real"
                    self.last_live_fetch = datetime.now(timezone.utc)
                    return True
        except Exception as e:
            logger.info(f"Open-Meteo live weather unavailable ({e}), falling back to simulation.")
            self.source = "simulated"
        return False

    async def poll_or_generate(self):
        now = datetime.now(timezone.utc)
        if settings.USE_REAL_WEATHER:
            if not self.last_live_fetch or (now - self.last_live_fetch).total_seconds() > self.live_cache_s:
                await self._fetch_open_meteo()

        # Check for scenario modifiers (e.g., storm or heatwave)
        from app.state import state
        scenario = state.active_scenario
        temp = self.cached_weather["temp_c"]
        precip = self.cached_weather["precip_mm"]
        wind = self.cached_weather["wind_kmh"]
        cond = self.cached_weather["condition"]

        if scenario and scenario["name"] == "storm":
            precip = max(precip, random.uniform(18.0, 32.0))
            wind = max(wind, random.uniform(48.0, 75.0))
            cond = "Severe Thunderstorm"
        elif scenario and scenario["name"] == "heatwave":
            temp = max(temp, random.uniform(36.0, 42.0))
            cond = "Extreme Heat Warning"
        elif self.source == "simulated":
            # Diurnal cycle: colder at night (4am), warmer at 2pm
            hour = (now.hour + (now.minute / 60.0))
            import math
            diurnal = 5.0 * math.sin((hour - 8.0) * math.pi / 12.0)
            temp = 20.0 + diurnal + random.gauss(0, 0.4)
            wind = max(5.0, 15.0 + random.gauss(0, 2.5))
            # 5% chance of light passing rain
            if random.random() < 0.05:
                precip = random.uniform(1.0, 4.0)
                cond = "Light Showers"
            else:
                precip = 0.0
                cond = "Clear" if diurnal > 0 else "Partly Cloudy"

        # Emit for a random zone or targeted zone
        target_zone = scenario["zone_id"] if (scenario and scenario.get("zone_id")) else random.choice(zone_manager.zones)["id"]
        raw_event = {
            "dt": int(now.timestamp()),
            "zone_id": target_zone,
            "source": self.source,
            "condition": {
                "main": cond,
                "precipitation_mm": precip,
                "wind_speed_kmh": wind,
                "temp_c": temp
            }
        }
        event = normalize_weather_raw(raw_event)
        if event:
            self.record_emitted_event(event)

    def generate_historical_events(self, start_time: datetime, end_time: datetime) -> List[NormalizedEvent]:
        events = []
        cur = start_time
        while cur <= end_time:
            hour = cur.hour + cur.minute / 60.0
            import math
            diurnal = 5.0 * math.sin((hour - 8.0) * math.pi / 12.0)
            temp = 20.0 + diurnal + random.gauss(0, 0.4)
            wind = max(5.0, 14.0 + random.gauss(0, 2.0))
            precip = 0.0
            cond = "Partly Cloudy"
            
            for z in zone_manager.zones:
                if random.random() < 0.35:
                    raw = {
                        "dt": int(cur.timestamp()),
                        "zone_id": z["id"],
                        "source": "simulated",
                        "condition": {
                            "main": cond,
                            "precipitation_mm": precip,
                            "wind_speed_kmh": wind,
                            "temp_c": temp
                        }
                    }
                    ev = normalize_weather_raw(raw)
                    if ev:
                        events.append(ev)
            cur += timedelta(minutes=5)
        return events
