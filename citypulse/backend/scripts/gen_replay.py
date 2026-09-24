import json
import os
import math
import random
from datetime import datetime, timezone, timedelta

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "replay_storm_day.json")

def generate_3day_dataset():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # Base start: 3 days ago from now (rounded to midnight)
    now = datetime.now(timezone.utc)
    start_time = (now - timedelta(days=3)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_minutes = 3 * 24 * 60 # 4320 minutes
    events = []
    
    zones = ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8", "z9"]
    
    for m in range(0, total_minutes, 2): # every 2 minutes
        curr_time = start_time + timedelta(minutes=m)
        ts_iso = curr_time.isoformat()
        
        day = m // (24 * 60) + 1 # Day 1, 2, or 3
        hour_of_day = (m % (24 * 60)) / 60.0
        
        # Diurnal base delay & noise
        is_rush_hour = (7.5 <= hour_of_day <= 9.5) or (16.5 <= hour_of_day <= 18.5)
        
        # --- Planted Patterns ---
        # Pattern 1: Day 2 Afternoon Severe Storm (Day 2, 14:00 to 17:00 -> minute 2280 to 2460)
        is_storm_time = (day == 2 and 14.0 <= hour_of_day <= 17.5)
        
        # Pattern 2: Day 2 Evening Grid Outage in Central Station & Riverside (Day 2, 18:30 to 20:30)
        is_outage_time = (day == 2 and 18.5 <= hour_of_day <= 20.5)
        
        # Pattern 3: Day 3 Morning Transit Strike (Day 3, 07:00 to 11:00)
        is_strike_time = (day == 3 and 7.0 <= hour_of_day <= 11.0)
        
        # Emit Weather Event
        if is_storm_time:
            events.append({
                "feed": "weather",
                "raw": {
                    "epoch": int(curr_time.timestamp()),
                    "zone_id": random.choice(["z4", "z5", "z7", "z8"]),
                    "condition": {
                        "main": "Severe Thunderstorm",
                        "precipitation_mm": random.uniform(18.0, 35.0),
                        "wind_speed_kmh": random.uniform(55.0, 80.0),
                        "temp_c": 17.5
                    },
                    "source": "simulated"
                }
            })
        elif random.random() < 0.20:
            events.append({
                "feed": "weather",
                "raw": {
                    "epoch": int(curr_time.timestamp()),
                    "zone_id": random.choice(zones),
                    "condition": {
                        "main": "Clear" if (7 <= hour_of_day <= 19) else "Partly Cloudy",
                        "precipitation_mm": 0.0,
                        "wind_speed_kmh": 12.0,
                        "temp_c": 21.0
                    },
                    "source": "simulated"
                }
            })
            
        # Emit Transit Event
        if is_strike_time:
            events.append({
                "feed": "transit",
                "raw": {
                    "route_id": f"Line-{random.randint(1, 5)}",
                    "zone_id": random.choice(zones),
                    "scheduled_time": curr_time.strftime("%H:%M"),
                    "delay_minutes": random.uniform(25.0, 48.0),
                    "cause": "strike_action",
                    "source": "simulated"
                }
            })
        elif is_storm_time:
            if random.random() < 0.85:
                events.append({
                    "feed": "transit",
                    "raw": {
                        "route_id": f"Line-{random.randint(1, 4)}",
                        "zone_id": random.choice(["z4", "z5", "z7", "z8"]),
                        "scheduled_time": curr_time.strftime("%H:%M"),
                        "delay_minutes": random.uniform(15.0, 28.0),
                        "cause": "weather_slowdown",
                        "source": "simulated"
                    }
                })
        elif random.random() < 0.40:
            base_d = 4.5 if is_rush_hour else 1.5
            events.append({
                "feed": "transit",
                "raw": {
                    "route_id": f"Line-{random.randint(1, 5)}",
                    "zone_id": random.choice(zones),
                    "scheduled_time": curr_time.strftime("%H:%M"),
                    "delay_minutes": max(0.5, round(base_d + random.gauss(0, 1.0), 1)),
                    "cause": "congestion" if is_rush_hour else "normal",
                    "source": "simulated"
                }
            })
            
        # Emit 311 Incident Event
        if is_storm_time:
            if random.random() < 0.75:
                cat = random.choice(["road_flooding", "flooding", "fallen_tree", "tree_hazard"])
                events.append({
                    "feed": "incident",
                    "raw": {
                        "created_date": curr_time.strftime("%m/%d/%Y %H:%M"),
                        "complaint_type": cat,
                        "descriptor": f"Emergency report: {cat.replace('_', ' ')} obstructing route",
                        "zone_id": random.choice(["z4", "z5", "z8"]),
                        "agency": "DEP",
                        "source": "simulated"
                    }
                })
        elif is_outage_time and random.random() < 0.60:
            events.append({
                "feed": "incident",
                "raw": {
                    "created_date": curr_time.strftime("%m/%d/%Y %H:%M"),
                    "complaint_type": "traffic_signal_out",
                    "descriptor": "Dark traffic lights at major corridor intersection",
                    "zone_id": "z5",
                    "agency": "DOT",
                    "source": "simulated"
                }
            })
        elif random.random() < 0.15:
            events.append({
                "feed": "incident",
                "raw": {
                    "created_date": curr_time.strftime("%m/%d/%Y %H:%M"),
                    "complaint_type": "pothole",
                    "descriptor": "Pavement irregularity reported",
                    "zone_id": random.choice(zones),
                    "agency": "DOT",
                    "source": "simulated"
                }
            })
            
        # Emit Power Event
        if is_outage_time:
            events.append({
                "feed": "power",
                "raw": {
                    "recorded_at": ts_iso,
                    "zone_id": "z5",
                    "customers_affected": random.randint(1200, 2400),
                    "substation_id": "SUB-CENTRAL-01",
                    "status": "outage",
                    "source": "simulated"
                }
            })
        elif is_storm_time and random.random() < 0.35:
            events.append({
                "feed": "power",
                "raw": {
                    "recorded_at": ts_iso,
                    "zone_id": random.choice(["z4", "z8"]),
                    "customers_affected": random.randint(250, 600),
                    "substation_id": "SUB-RIVERSIDE-02",
                    "status": "outage",
                    "source": "simulated"
                }
            })

    dataset = {
        "dataset_name": "storm_day",
        "description": "3-Day CityPulse civic timeline with planted storm surge, power grid collapse, and transit strike.",
        "start_time": start_time.isoformat(),
        "end_time": (start_time + timedelta(minutes=total_minutes)).isoformat(),
        "total_events": len(events),
        "events": events
    }
    
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"Generated replay dataset with {len(events)} events at {OUTPUT_PATH}")

if __name__ == "__main__":
    generate_3day_dataset()
