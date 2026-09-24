import uuid
import math
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from dateutil import parser as date_parser
from app.models import NormalizedEvent, FeedType
from app.zones import zone_manager

logger = logging.getLogger("citypulse.normalize")

# Severity mapping tables for 311 incident categories
INCIDENT_SEVERITY_MAP = {
    "tree_hazard": 0.75,
    "fallen_tree": 0.85,
    "flooding": 0.85,
    "road_flooding": 0.90,
    "traffic_signal_out": 0.80,
    "water_main_break": 0.90,
    "pothole": 0.35,
    "street_light_out": 0.40,
    "illegal_dumping": 0.30,
    "noise_complaint": 0.25,
    "blocked_driveway": 0.30,
    "gas_leak_report": 0.95,
    "power_line_down": 0.95,
    "sidewalk_damage": 0.25,
    "general": 0.30
}

def normalize_weather_raw(raw: Dict[str, Any]) -> Optional[NormalizedEvent]:
    """
    Weather raw shape:
    {
      "dt": 1720000000 (epoch seconds),
      "zone_id": "z1" (optional),
      "condition": {"code": 65, "main": "Heavy Rain", "precipitation_mm": 18.5, "wind_speed_kmh": 45.0, "temp_c": 19.2},
      "source": "open-meteo" | "simulated"
    }
    """
    try:
        # Epoch seconds to UTC datetime
        epoch = raw.get("dt") or raw.get("time") or raw.get("epoch")
        if isinstance(epoch, (int, float)):
            ts = datetime.fromtimestamp(epoch, tz=timezone.utc)
        elif isinstance(epoch, str):
            ts = date_parser.parse(epoch).astimezone(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        cond = raw.get("condition", {})
        precip = float(cond.get("precipitation_mm", 0.0))
        wind = float(cond.get("wind_speed_kmh", 10.0))
        temp = float(cond.get("temp_c", 20.0))
        main = cond.get("main", "Clear")

        # Compute severity: normal rain 0..5mm is low, 15mm+ is high, severe wind 60+ kmh is high
        precip_sev = min(1.0, precip / 25.0)
        wind_sev = min(1.0, max(0.0, (wind - 20.0) / 60.0))
        temp_sev = 0.0
        if temp > 35.0:
            temp_sev = min(1.0, (temp - 35.0) / 10.0)
        elif temp < -5.0:
            temp_sev = min(1.0, (-5.0 - temp) / 15.0)

        severity = max(0.05, max(precip_sev, wind_sev, temp_sev))
        zone_id = raw.get("zone_id", "z5")
        lat, lng = raw.get("lat"), raw.get("lng")
        if lat is None or lng is None:
            lat, lng = zone_manager.get_random_point_in_zone(zone_id)

        title = f"Weather: {main}"
        desc_parts = []
        if precip > 0:
            desc_parts.append(f"{precip:.1f} mm rain")
        if wind > 25:
            desc_parts.append(f"{wind:.0f} km/h wind")
        if temp > 32 or temp < 0:
            desc_parts.append(f"{temp:.1f}°C")
        desc = ", ".join(desc_parts) if desc_parts else f"{temp:.1f}°C, calm conditions"

        return NormalizedEvent(
            id=raw.get("id") or f"w_{uuid.uuid4().hex[:10]}",
            source=raw.get("source", "simulated"),
            feed="weather",
            zone_id=zone_id,
            lat=lat,
            lng=lng,
            severity=min(1.0, max(0.0, severity)),
            value=precip if precip > 0 else temp,
            unit="mm/h" if precip > 0 else "°C",
            title=title,
            description=desc,
            timestamp=ts,
            received_at=datetime.now(timezone.utc),
            confidence=float(raw.get("confidence", 0.90 if raw.get("source") == "real" else 0.75)),
            status="active"
        )
    except Exception as e:
        logger.warning(f"Error normalizing weather feed: {e}, raw: {raw}")
        return None

def normalize_transit_raw(raw: Dict[str, Any]) -> Optional[NormalizedEvent]:
    """
    Transit raw shape:
    {
      "route_id": "Line-4",
      "zone_id": "z4",
      "scheduled_time": "14:32", # local time HH:MM
      "delay_minutes": 14.2,
      "stop_id": "ST-108",
      "cause": "congestion" | "signal_issue" | "weather"
    }
    """
    try:
        delay = float(raw.get("delay_minutes", 0.0))
        # Convert local HH:MM to UTC timestamp today
        sched = raw.get("scheduled_time", "12:00")
        now = datetime.now(timezone.utc)
        if ":" in str(sched):
            parts = str(sched).split(":")
            h, m = int(parts[0]), int(parts[1])
            ts = now.replace(hour=h, minute=m, second=0, microsecond=0)
        else:
            ts = now

        # Severity mapping: 0-3 min (0.1), 5-10 min (0.4), 15-20 min (0.75), 30+ min (1.0)
        if delay <= 2.0:
            severity = 0.05
        elif delay <= 7.0:
            severity = 0.1 + (delay - 2.0) * 0.06
        elif delay <= 15.0:
            severity = 0.4 + (delay - 7.0) * 0.045
        else:
            severity = min(1.0, 0.75 + (delay - 15.0) * 0.015)

        zone_id = raw.get("zone_id", "z5")
        lat, lng = raw.get("lat"), raw.get("lng")
        if lat is None or lng is None:
            lat, lng = zone_manager.get_random_point_in_zone(zone_id)

        route = raw.get("route_id", "Route")
        title = f"Transit Delay: {route} (+{delay:.0f}m)"
        desc = f"{route} running {delay:.1f} min late near {raw.get('stop_id', 'station')}. Cause: {raw.get('cause', 'congestion')}."

        return NormalizedEvent(
            id=raw.get("id") or f"tr_{uuid.uuid4().hex[:10]}",
            source=raw.get("source", "simulated"),
            feed="transit",
            zone_id=zone_id,
            lat=lat,
            lng=lng,
            severity=min(1.0, max(0.0, severity)),
            value=delay,
            unit="min",
            title=title,
            description=desc,
            timestamp=ts,
            received_at=datetime.now(timezone.utc),
            confidence=float(raw.get("confidence", 0.80)),
            status="active"
        )
    except Exception as e:
        logger.warning(f"Error normalizing transit raw: {e}, raw: {raw}")
        return None

def normalize_incident_raw(raw: Dict[str, Any]) -> Optional[NormalizedEvent]:
    """
    311 incident raw shape:
    {
      "created_date": "09/24/2026 14:15", # MM/DD/YYYY HH:mm
      "complaint_type": "Road Flooding" | "traffic_signal_out" | "Tree Hazard",
      "zone_id": "z4",
      "descriptor": "Catch basin blocked, water ponding across 2 lanes",
      "agency": "DOT" | "DEP"
    }
    """
    try:
        created_str = raw.get("created_date") or raw.get("timestamp")
        if created_str:
            ts = date_parser.parse(str(created_str)).astimezone(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        cat = str(raw.get("complaint_type", "general")).lower().replace(" ", "_")
        severity = INCIDENT_SEVERITY_MAP.get(cat, 0.40)
        # Check if severity explicitly provided
        if "severity" in raw:
            severity = float(raw["severity"])

        zone_id = raw.get("zone_id", "z5")
        lat, lng = raw.get("lat"), raw.get("lng")
        if lat is None or lng is None:
            lat, lng = zone_manager.get_random_point_in_zone(zone_id)

        title = f"311: {raw.get('complaint_type', 'Incident').title()}"
        desc = raw.get("descriptor") or f"Reported {raw.get('complaint_type', 'incident')} by civic observer."

        return NormalizedEvent(
            id=raw.get("id") or f"inc_{uuid.uuid4().hex[:10]}",
            source=raw.get("source", "simulated"),
            feed="incident",
            zone_id=zone_id,
            lat=lat,
            lng=lng,
            severity=min(1.0, max(0.0, severity)),
            value=1.0,
            unit="report",
            title=title,
            description=desc,
            timestamp=ts,
            received_at=datetime.now(timezone.utc),
            confidence=float(raw.get("confidence", 0.75)),
            status="active"
        )
    except Exception as e:
        logger.warning(f"Error normalizing incident raw: {e}, raw: {raw}")
        return None

def normalize_power_raw(raw: Dict[str, Any]) -> Optional[NormalizedEvent]:
    """
    Power raw shape:
    {
      "recorded_at": "2026-09-24T14:20:00-04:00", # ISO with offset
      "zone_id": "z5",
      "customers_affected": 840,
      "substation_id": "SUB-NORTH-04",
      "status": "outage" | "restored" | "flicker"
    }
    """
    try:
        rec_str = raw.get("recorded_at") or raw.get("timestamp")
        if rec_str:
            ts = date_parser.parse(str(rec_str)).astimezone(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        cust = int(raw.get("customers_affected", 0))
        p_status = raw.get("status", "outage")
        
        # Severity calculation based on affected customers: 50 -> 0.3, 500 -> 0.7, 2000+ -> 0.95
        if cust == 0 or p_status == "restored":
            severity = 0.05
        else:
            severity = min(0.98, 0.25 + math.log10(max(1, cust)) * 0.22)

        zone_id = raw.get("zone_id", "z5")
        lat, lng = raw.get("lat"), raw.get("lng")
        if lat is None or lng is None:
            lat, lng = zone_manager.get_random_point_in_zone(zone_id)

        title = f"Power Outage: {cust} customers" if cust > 0 else "Power Restored"
        desc = f"{cust} customers affected in zone near substation {raw.get('substation_id', 'GRID-1')}."

        return NormalizedEvent(
            id=raw.get("id") or f"pwr_{uuid.uuid4().hex[:10]}",
            source=raw.get("source", "simulated"),
            feed="power",
            zone_id=zone_id,
            lat=lat,
            lng=lng,
            severity=min(1.0, max(0.0, severity)),
            value=float(cust),
            unit="customers",
            title=title,
            description=desc,
            timestamp=ts,
            received_at=datetime.now(timezone.utc),
            confidence=float(raw.get("confidence", 0.90)),
            status="active" if cust > 0 else "resolved"
        )
    except Exception as e:
        logger.warning(f"Error normalizing power raw: {e}, raw: {raw}")
        return None

def normalize_noise_raw(raw: Dict[str, Any]) -> Optional[NormalizedEvent]:
    """
    Noise sensor raw shape:
    {
      "sensor_id": "ACOUSTIC-Z4-09",
      "zone_id": "z4",
      "decibels_dba": 84.5,
      "peak_hz": 120,
      "timestamp_utc": "2026-09-24 14:28:10"
    }
    """
    try:
        ts_str = raw.get("timestamp_utc") or raw.get("timestamp")
        if ts_str:
            ts = date_parser.parse(str(ts_str)).astimezone(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        db_val = float(raw.get("decibels_dba", 55.0))
        # 45-60 dB normal (0.05-0.2), 70-80 dB elevated (0.5-0.75), 85+ dB critical (0.85-1.0)
        if db_val <= 55.0:
            severity = 0.05
        elif db_val <= 70.0:
            severity = 0.1 + (db_val - 55.0) * 0.02
        elif db_val <= 85.0:
            severity = 0.4 + (db_val - 70.0) * 0.03
        else:
            severity = min(1.0, 0.85 + (db_val - 85.0) * 0.01)

        zone_id = raw.get("zone_id", "z5")
        lat, lng = raw.get("lat"), raw.get("lng")
        if lat is None or lng is None:
            lat, lng = zone_manager.get_random_point_in_zone(zone_id)

        title = f"Noise Spike: {db_val:.1f} dBA"
        desc = f"Sensor {raw.get('sensor_id', 'SEN')} logged {db_val:.1f} dBA (acoustic stress peak)."

        return NormalizedEvent(
            id=raw.get("id") or f"nse_{uuid.uuid4().hex[:10]}",
            source=raw.get("source", "simulated"),
            feed="noise",
            zone_id=zone_id,
            lat=lat,
            lng=lng,
            severity=min(1.0, max(0.0, severity)),
            value=db_val,
            unit="dBA",
            title=title,
            description=desc,
            timestamp=ts,
            received_at=datetime.now(timezone.utc),
            confidence=float(raw.get("confidence", 0.85)),
            status="active"
        )
    except Exception as e:
        logger.warning(f"Error normalizing noise raw: {e}, raw: {raw}")
        return None

def normalize_air_quality_raw(raw: Dict[str, Any]) -> Optional[NormalizedEvent]:
    """
    Air quality raw shape:
    {
      "pm2_5": 38.4,
      "us_aqi": 108,
      "zone_id": "z9",
      "pollutant": "PM2.5",
      "epoch": 1720000100
    }
    """
    try:
        epoch = raw.get("epoch") or raw.get("time") or raw.get("timestamp")
        if isinstance(epoch, (int, float)):
            ts = datetime.fromtimestamp(epoch, tz=timezone.utc)
        elif isinstance(epoch, str):
            ts = date_parser.parse(epoch).astimezone(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        aqi = float(raw.get("us_aqi", 45.0))
        pm25 = float(raw.get("pm2_5", 10.0))
        
        # AQI 0-50 Good (0.05), 51-100 Moderate (0.25), 101-150 Unhealthy Sensitive (0.55), 151-200 Unhealthy (0.8), 200+ (0.95)
        if aqi <= 50:
            severity = 0.05
        elif aqi <= 100:
            severity = 0.15 + (aqi - 50.0) * 0.005
        elif aqi <= 150:
            severity = 0.40 + (aqi - 100.0) * 0.006
        elif aqi <= 200:
            severity = 0.70 + (aqi - 150.0) * 0.004
        else:
            severity = min(1.0, 0.90 + (aqi - 200.0) * 0.001)

        zone_id = raw.get("zone_id", "z5")
        lat, lng = raw.get("lat"), raw.get("lng")
        if lat is None or lng is None:
            lat, lng = zone_manager.get_random_point_in_zone(zone_id)

        title = f"Air Quality: AQI {aqi:.0f}"
        desc = f"AQI index {aqi:.0f} (PM2.5: {pm25:.1f} µg/m³). Clean air deviation."

        return NormalizedEvent(
            id=raw.get("id") or f"aq_{uuid.uuid4().hex[:10]}",
            source=raw.get("source", "simulated"),
            feed="air_quality",
            zone_id=zone_id,
            lat=lat,
            lng=lng,
            severity=min(1.0, max(0.0, severity)),
            value=aqi,
            unit="AQI",
            title=title,
            description=desc,
            timestamp=ts,
            received_at=datetime.now(timezone.utc),
            confidence=float(raw.get("confidence", 0.90 if raw.get("source") == "real" else 0.75)),
            status="active"
        )
    except Exception as e:
        logger.warning(f"Error normalizing air quality raw: {e}, raw: {raw}")
        return None

def normalize_event(feed_type: FeedType, raw_data: Dict[str, Any]) -> Optional[NormalizedEvent]:
    if feed_type == "weather":
        return normalize_weather_raw(raw_data)
    elif feed_type == "transit":
        return normalize_transit_raw(raw_data)
    elif feed_type == "incident":
        return normalize_incident_raw(raw_data)
    elif feed_type == "power":
        return normalize_power_raw(raw_data)
    elif feed_type == "noise":
        return normalize_noise_raw(raw_data)
    elif feed_type == "air_quality":
        return normalize_air_quality_raw(raw_data)
    else:
        logger.warning(f"Unknown feed type for normalization: {feed_type}")
        return None
