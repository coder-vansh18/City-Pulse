import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Set, Tuple
import numpy as np
from app.models import Insight, EvidenceItem, FeedType, InsightConfidence
from app.zones import zone_manager
from app.state import state
from app.db import db

logger = logging.getLogger("citypulse.correlation")

CAVEAT_MESSAGE = "Statistical co-occurrence observed across feeds; does not confirm direct causation."

class CorrelationEngine:
    def __init__(self):
        self.active_correlations: Dict[str, str] = {} # signature -> insight_id

    def run_correlation(self) -> List[Insight]:
        now = datetime.now(timezone.utc)
        cutoff_15m = now - timedelta(minutes=15)

        # Get active anomalies
        active_anomalies = [
            ins for ins in state.insights.values()
            if ins.status == "active" and ins.kind == "anomaly"
        ]

        if len(active_anomalies) < 2:
            return []

        correlations_found: List[Insight] = []

        # Group anomalies by connected spatial cluster (zone or adjacent zones)
        # Check all pairs of anomalies
        n = len(active_anomalies)
        processed_pairs = set()

        for i in range(n):
            for j in range(i + 1, n):
                a1 = active_anomalies[i]
                a2 = active_anomalies[j]

                # Feeds must be different
                feeds_union = list(set(a1.feed_types + a2.feed_types))
                if len(feeds_union) < 2:
                    continue

                z1 = a1.zone_ids[0]
                z2 = a2.zone_ids[0]

                # Check if same zone or adjacent zones
                is_connected = (z1 == z2) or (z2 in zone_manager.adjacency.get(z1, []))
                if not is_connected:
                    continue

                sig = f"{min(z1, z2)}_{max(z1, z2)}_{min(feeds_union)}_{max(feeds_union)}"
                if sig in processed_pairs:
                    continue
                processed_pairs.add(sig)

                # Combined zones
                combined_zones = list(set(a1.zone_ids + a2.zone_ids))
                
                # Combined evidence items
                combined_evidence = a1.evidence + a2.evidence
                combined_events = list(set(a1.event_ids + a2.event_ids))
                
                # Max severity
                sev = min(0.98, max(a1.severity, a2.severity) * 1.05)

                # Confidence calculation
                # If only 2 events total -> max low; if high zscores and multiple feeds -> medium/high
                if len(combined_events) <= 2:
                    conf: InsightConfidence = "low"
                elif len(feeds_union) >= 3 or (a1.confidence == "high" and a2.confidence == "high"):
                    conf = "high"
                else:
                    conf = "medium"

                # Generate hedged plain text
                z_names = [zone_manager.zones_by_id.get(zid, {}).get("name", zid) for zid in combined_zones]
                z_label = " & ".join(z_names)
                f1_label = a1.feed_types[0].replace("_", " ")
                f2_label = a2.feed_types[0].replace("_", " ")

                # Epistemic hedging phrasing templates
                title = f"Possible Link: {f1_label.title()} and {f2_label.title()} in {z_label}"
                
                # Check specifics for richer grounded text
                if "weather" in feeds_union and "transit" in feeds_union:
                    plain_text = (
                        f"Heavy precipitation coincides with elevated transit delays in {z_label}. "
                        f"This may be related to weather-induced traffic conditions."
                    )
                elif "power" in feeds_union and "incident" in feeds_union:
                    plain_text = (
                        f"Power grid interruptions coincide with an uptick in 311 traffic signal reports in {z_label}. "
                        f"These signals suggest a possible shared infrastructure link."
                    )
                elif "power" in feeds_union and "transit" in feeds_union:
                    plain_text = (
                        f"A grid outage coincides with transit route slowdowns across {z_label}. "
                        f"Substation power loss may be affecting electrified transit signals."
                    )
                elif "weather" in feeds_union and "incident" in feeds_union:
                    plain_text = (
                        f"Storm precipitation coincides with a cluster of flooding and tree reports in {z_label}. "
                        f"Local drainage stress may be linked to the rain event."
                    )
                else:
                    plain_text = (
                        f"Anomalous {f1_label} spikes coincide with elevated {f2_label} readings in {z_label}. "
                        f"The concurrent timing suggests these events may be connected."
                    )

                existing_id = self.active_correlations.get(sig)
                if existing_id and existing_id in state.insights:
                    ins = state.insights[existing_id]
                    ins.severity = round(sev, 2)
                    ins.confidence = conf
                    ins.plain_text = plain_text
                    ins.evidence = combined_evidence
                    ins.event_ids = combined_events
                    ins.window_end = now.isoformat()
                    ins.status = "active"
                    state.upsert_insight(ins)
                    db.upsert_insight(ins.model_dump())
                    correlations_found.append(ins)
                else:
                    ins_id = f"corr_{uuid.uuid4().hex[:10]}"
                    ins = Insight(
                        id=ins_id,
                        kind="correlation",
                        zone_ids=combined_zones,
                        feed_types=feeds_union,
                        severity=round(sev, 2),
                        confidence=conf,
                        title=title,
                        plain_text=plain_text,
                        caveat=CAVEAT_MESSAGE,
                        evidence=combined_evidence,
                        event_ids=combined_events,
                        window_start=cutoff_15m.isoformat(),
                        window_end=now.isoformat(),
                        first_seen=now.isoformat(),
                        status="active"
                    )
                    self.active_correlations[sig] = ins_id
                    state.upsert_insight(ins)
                    db.upsert_insight(ins.model_dump())
                    correlations_found.append(ins)

        return correlations_found

correlation_engine = CorrelationEngine()
