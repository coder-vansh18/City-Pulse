import numpy as np
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Tuple, Optional
import uuid
import logging
from app.models import Insight, EvidenceItem, FeedType
from app.zones import zone_manager
from app.state import state
from app.db import db

logger = logging.getLogger("citypulse.anomaly")

def calculate_robust_z_score(values: List[float], current_val: float) -> Tuple[float, float]:
    """
    Computes robust z-score using median and Median Absolute Deviation (MAD).
    Returns (z_score, baseline_median).
    """
    if not values:
        return 0.0, current_val
    arr = np.array(values, dtype=float)
    med = float(np.median(arr))
    abs_dev = np.abs(arr - med)
    mad = float(np.median(abs_dev))
    if mad < 1e-4:
        # Standard deviation fallback if MAD is zero
        std = float(np.std(arr))
        if std < 1e-4:
            return 0.0, med
        z = (current_val - med) / (std * 1.4826)
    else:
        z = (current_val - med) / (mad * 1.4826)
    return float(z), med

class AnomalyDetector:
    def __init__(self):
        # Sustained bucket counts: key (zone_id, feed) -> list of recent z-scores
        self.bucket_history: Dict[Tuple[str, FeedType], List[float]] = {}
        # Active anomalies mapping: key (zone_id, feed) -> insight_id
        self.active_anomaly_keys: Dict[Tuple[str, FeedType], str] = {}

    def run_detection(self) -> List[Insight]:
        now = datetime.now(timezone.utc)
        one_hour_ago = now - timedelta(minutes=60)
        ten_mins_ago = now - timedelta(minutes=10)

        events = list(state.events)
        hour_events = [e for e in events if e.timestamp >= one_hour_ago]

        new_or_updated_insights: List[Insight] = []
        all_zone_ids = [z["id"] for z in zone_manager.zones]
        all_feeds: List[FeedType] = ["weather", "transit", "incident", "air_quality", "power", "noise"]

        for zone_id in all_zone_ids:
            for feed in all_feeds:
                key = (zone_id, feed)
                z_events = [e for e in hour_events if e.zone_id == zone_id and e.feed == feed]
                
                # Metric calculation over 1-minute buckets in the last 60 minutes
                bucket_counts = [0] * 60
                for e in z_events:
                    age_m = int((now - e.timestamp).total_seconds() // 60)
                    if 0 <= age_m < 60:
                        bucket_counts[59 - age_m] += 1

                # Current value: sum of counts or severity in latest 5-min window
                recent_5m_events = [e for e in z_events if e.timestamp >= (now - timedelta(minutes=5))]
                current_rate = float(len(recent_5m_events)) / 5.0 # events per min
                current_sev = np.mean([e.severity for e in recent_5m_events]) if recent_5m_events else 0.0

                # Metric values for historical 1-min buckets
                history_rates = [c for c in bucket_counts[:-5]] if len(bucket_counts) > 10 else bucket_counts

                z_rate, base_rate = calculate_robust_z_score(history_rates, current_rate)

                # Flag condition: robust z-score >= 2.5 sustained >= 2 buckets or strong severity spike
                is_anomaly = (z_rate >= 2.5 and len(recent_5m_events) >= 2) or (current_sev >= 0.75 and len(recent_5m_events) >= 2)

                existing_insight_id = self.active_anomaly_keys.get(key)

                if is_anomaly:
                    # Severity calculation: scale 0.4..0.98 based on z-score
                    sev = min(0.98, max(0.40, 0.40 + (z_rate / 6.0) * 0.5))
                    conf = "high" if z_rate >= 3.5 else "medium"
                    
                    z_name = zone_manager.zones_by_id.get(zone_id, {}).get("name", zone_id)
                    ratio_str = f"{max(1.5, z_rate):.1f}× normal" if z_rate > 1.0 else "unusual surge"
                    title = f"Unusual {feed.replace('_', ' ').title()} Spike in {z_name}"
                    plain_text = f"Detected {ratio_str} {feed.replace('_', ' ')} activity over the last 10 minutes."
                    
                    ev_items = [
                        EvidenceItem(
                            feed=feed,
                            metric="event_rate",
                            value=round(current_rate, 2),
                            baseline=round(base_rate, 2),
                            zscore=round(z_rate, 2)
                        )
                    ]
                    event_ids = [e.id for e in recent_5m_events]

                    if existing_insight_id and existing_insight_id in state.insights:
                        # Debounce / update existing insight
                        ins = state.insights[existing_insight_id]
                        ins.severity = round(sev, 2)
                        ins.confidence = conf
                        ins.plain_text = plain_text
                        ins.evidence = ev_items
                        ins.event_ids = event_ids
                        ins.window_end = now.isoformat()
                        ins.status = "active"
                        state.upsert_insight(ins)
                        db.upsert_insight(ins.model_dump())
                        new_or_updated_insights.append(ins)
                    else:
                        # Create new insight
                        ins_id = f"anom_{uuid.uuid4().hex[:10]}"
                        ins = Insight(
                            id=ins_id,
                            kind="anomaly",
                            zone_ids=[zone_id],
                            feed_types=[feed],
                            severity=round(sev, 2),
                            confidence=conf,
                            title=title,
                            plain_text=plain_text,
                            caveat=None,
                            evidence=ev_items,
                            event_ids=event_ids,
                            window_start=ten_mins_ago.isoformat(),
                            window_end=now.isoformat(),
                            first_seen=now.isoformat(),
                            status="active"
                        )
                        self.active_anomaly_keys[key] = ins_id
                        state.upsert_insight(ins)
                        db.upsert_insight(ins.model_dump())
                        new_or_updated_insights.append(ins)

                elif existing_insight_id and existing_insight_id in state.insights:
                    # Auto-resolve if z < 1.5
                    if z_rate < 1.5:
                        ins = state.insights[existing_insight_id]
                        ins.status = "resolved"
                        ins.window_end = now.isoformat()
                        state.upsert_insight(ins)
                        db.upsert_insight(ins.model_dump())
                        del self.active_anomaly_keys[key]

        return new_or_updated_insights

anomaly_detector = AnomalyDetector()
