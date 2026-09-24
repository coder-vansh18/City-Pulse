from typing import List, Dict, Any, Tuple
import math
import random
from app.config import settings

# 3x3 Grid zone names
ZONE_DEFINITIONS = [
    ("z1", "Hillcrest", (-1, 1)),
    ("z2", "Green Park", (0, 1)),
    ("z3", "University Quarter", (1, 1)),
    ("z4", "Riverside", (-1, 0)),
    ("z5", "Central Station", (0, 0)),
    ("z6", "Market District", (1, 0)),
    ("z7", "Old Town", (-1, -1)),
    ("z8", "Lakeside", (0, -1)),
    ("z9", "Industrial Belt", (1, -1)),
]

# Approx 1.2 km grid cell delta in degrees lat/lng
# 1 deg lat ~= 111 km -> 1.2 km ~= 0.0108 deg
# 1 deg lng ~= 111 * cos(lat) km -> 1.2 km ~= 0.0145 deg (at lat ~40)
CELL_SIZE_KM = 1.2
KM_PER_LAT = 111.0

def get_deg_deltas(center_lat: float) -> Tuple[float, float]:
    d_lat = CELL_SIZE_KM / KM_PER_LAT
    cos_lat = math.cos(math.radians(center_lat))
    cos_lat = max(cos_lat, 0.2)
    d_lng = CELL_SIZE_KM / (KM_PER_LAT * cos_lat)
    return d_lat, d_lng

class ZoneManager:
    def __init__(self, city_name: str = settings.CITY_NAME, center_lat: float = settings.CITY_LAT, center_lon: float = settings.CITY_LON):
        self.city_name = city_name
        self.center_lat = center_lat
        self.center_lon = center_lon
        self.d_lat, self.d_lng = get_deg_deltas(center_lat)
        self.zones: List[Dict[str, Any]] = []
        self.zones_by_id: Dict[str, Dict[str, Any]] = {}
        self.adjacency: Dict[str, List[str]] = {}
        self._build_zones()
        self._build_adjacency()

    def _build_zones(self):
        half_lat = self.d_lat / 2.0
        half_lng = self.d_lng / 2.0

        for zone_id, name, (gx, gy) in ZONE_DEFINITIONS:
            c_lat = self.center_lat + (gy * self.d_lat)
            c_lng = self.center_lon + (gx * self.d_lng)
            
            # 4 polygon corners (clockwise from NW)
            # GeoJSON uses [lng, lat]
            polygon = [
                [c_lng - half_lng, c_lat + half_lat],
                [c_lng + half_lng, c_lat + half_lat],
                [c_lng + half_lng, c_lat - half_lat],
                [c_lng - half_lng, c_lat - half_lat],
                [c_lng - half_lng, c_lat + half_lat], # close polygon
            ]
            
            zone_obj = {
                "id": zone_id,
                "name": name,
                "grid_pos": (gx, gy),
                "centroid": {"lat": round(c_lat, 6), "lng": round(c_lng, 6)},
                "bbox": {
                    "min_lat": round(c_lat - half_lat, 6),
                    "max_lat": round(c_lat + half_lat, 6),
                    "min_lng": round(c_lng - half_lng, 6),
                    "max_lng": round(c_lng + half_lng, 6),
                },
                "polygon": polygon
            }
            self.zones.append(zone_obj)
            self.zones_by_id[zone_id] = zone_obj

    def _build_adjacency(self):
        for z1 in self.zones:
            adj = []
            gx1, gy1 = z1["grid_pos"]
            for z2 in self.zones:
                if z1["id"] == z2["id"]:
                    continue
                gx2, gy2 = z2["grid_pos"]
                # Chebyshev distance <= 1 for 8-connectivity (sharing edge or corner)
                if max(abs(gx1 - gx2), abs(gy1 - gy2)) <= 1:
                    adj.append(z2["id"])
            self.adjacency[z1["id"]] = adj

    def get_zone_list(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": z["id"],
                "name": z["name"],
                "centroid": z["centroid"]
            }
            for z in self.zones
        ]

    def get_geojson(self, zone_props_map: Dict[str, Any] = None) -> Dict[str, Any]:
        features = []
        for z in self.zones:
            props = {
                "id": z["id"],
                "name": z["name"],
                "centroid": z["centroid"],
            }
            if zone_props_map and z["id"] in zone_props_map:
                props.update(zone_props_map[z["id"]])

            feature = {
                "type": "Feature",
                "id": z["id"],
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [z["polygon"]]
                },
                "properties": props
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features
        }

    def get_random_point_in_zone(self, zone_id: str) -> Tuple[float, float]:
        """Privacy-preserving block-level location jitter within zone boundaries."""
        z = self.zones_by_id.get(zone_id, self.zones[0])
        bbox = z["bbox"]
        # Add 15% inner margin so points don't sit on boundaries
        margin_lat = (bbox["max_lat"] - bbox["min_lat"]) * 0.15
        margin_lng = (bbox["max_lng"] - bbox["min_lng"]) * 0.15
        lat = random.uniform(bbox["min_lat"] + margin_lat, bbox["max_lat"] - margin_lat)
        lng = random.uniform(bbox["min_lng"] + margin_lng, bbox["max_lng"] - margin_lng)
        return round(lat, 6), round(lng, 6)

    def find_zone_by_coords(self, lat: float, lng: float) -> str:
        for z in self.zones:
            bbox = z["bbox"]
            if bbox["min_lat"] <= lat <= bbox["max_lat"] and bbox["min_lng"] <= lng <= bbox["max_lng"]:
                return z["id"]
        # Fallback to nearest centroid
        best_id = "z5"
        min_d = float("inf")
        for z in self.zones:
            c = z["centroid"]
            d = (lat - c["lat"])**2 + (lng - c["lng"])**2
            if d < min_d:
                min_d = d
                best_id = z["id"]
        return best_id

zone_manager = ZoneManager()
