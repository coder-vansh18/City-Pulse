import math
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Tuple, Optional, Any
from app.models import Status, Trend, FeedType, ZoneProps, Pulse, ZoneRiskItem, Summary
from app.zones import zone_manager
from app.state import state

FEED_BASE_WEIGHTS: Dict[FeedType, float] = {
    "transit": 0.25,
    "incident": 0.25,
    "weather": 0.15,
    "air_quality": 0.15,
    "power": 0.15,
    "noise": 0.05,
}

def get_status_from_score(score: float) -> Status:
    if score >= 80.0:
        return "calm"
    elif score >= 60.0:
        return "watch"
    elif score >= 40.0:
        return "strained"
    else:
        return "critical"

def get_bpm_from_score(score: float) -> int:
    return int(round(60.0 + (100.0 - score) * 0.9))

def compute_zone_feed_subscores(
    zone_id: str,
    recent_events: List[Any],
    now: datetime,
    feed_statuses: Dict[FeedType, Any]
) -> Tuple[Dict[FeedType, Optional[float]], Dict[FeedType, float], bool]:
    """
    Computes per-feed subscore (0..100) for a zone over last 15 min.
    Returns (sub_scores, normalized_weights, is_degraded).
    """
    sub_scores: Dict[FeedType, Optional[float]] = {}
    active_weights: Dict[FeedType, float] = {}
    is_degraded = False

    # Filter events for this zone in the last 15 minutes
    cutoff_15m = now - timedelta(minutes=15)
    zone_events = [e for e in recent_events if e.zone_id == zone_id and e.timestamp >= cutoff_15m]

    for feed_type, base_weight in FEED_BASE_WEIGHTS.items():
        f_status = feed_statuses.get(feed_type)
        if not f_status or not f_status.enabled or f_status.status in ["down", "disabled"]:
            # Degraded feed -> sub-score is None (null in json)
            sub_scores[feed_type] = None
            is_degraded = True
        else:
            # Gather events for this feed
            f_events = [e for e in zone_events if e.feed == feed_type]
            
            if not f_events:
                sub_scores[feed_type] = 100.0
            else:
                # Exponential decay impact calculation (half-life = 5 min)
                total_impact = 0.0
                for ev in f_events:
                    age_s = max(0.0, (now - ev.timestamp).total_seconds())
                    decay = math.exp(-age_s / 300.0)
                    # severity 0..1 scale -> direct impact scaling
                    impact = (ev.severity ** 1.3) * 35.0 * decay
                    total_impact += impact

                score = max(0.0, min(100.0, 100.0 - total_impact))
                sub_scores[feed_type] = round(score, 1)

            active_weights[feed_type] = base_weight

    # Renormalize weights
    total_active_w = sum(active_weights.values())
    normalized_weights: Dict[FeedType, float] = {}
    if total_active_w > 0:
        for f, w in active_weights.items():
            normalized_weights[f] = w / total_active_w
    else:
        # Fallback if all feeds down
        normalized_weights = {f: 1.0 / len(FEED_BASE_WEIGHTS) for f in FEED_BASE_WEIGHTS}

    return sub_scores, normalized_weights, is_degraded

def compute_pulse_and_zones(summary_obj: Optional[Summary] = None) -> Tuple[Pulse, Dict[str, ZoneProps]]:
    now = datetime.now(timezone.utc)
    
    # Check feed statuses
    feed_statuses: Dict[FeedType, Any] = {}
    online_count = 0
    total_count = len(FEED_BASE_WEIGHTS)
    for f_type in FEED_BASE_WEIGHTS:
        f_instance = state.feeds.get(f_type)
        if f_instance:
            st = f_instance.get_status()
            feed_statuses[f_type] = st
            if st.enabled and st.status in ["live", "delayed"]:
                online_count += 1
        else:
            # Default placeholder status
            pass

    recent_events = list(state.events)
    zone_props_map: Dict[str, ZoneProps] = {}
    zone_scores: Dict[str, float] = {}
    zone_sub_scores_map: Dict[str, Dict[str, Optional[float]]] = {}
    city_degraded = (online_count < total_count)

    for z in zone_manager.zones:
        zid = z["id"]
        sub_scores, norm_weights, z_degraded = compute_zone_feed_subscores(zid, recent_events, now, feed_statuses)
        zone_sub_scores_map[zid] = sub_scores

        # Compute zone weighted pulse score
        weighted_score = 0.0
        for f, w in norm_weights.items():
            s = sub_scores.get(f)
            if s is not None:
                weighted_score += s * w
            else:
                weighted_score += 100.0 * w # neutral fallback

        weighted_score = max(0.0, min(100.0, weighted_score))
        zone_scores[zid] = round(weighted_score, 1)

        # Determine trend vs 10 min ago from zone history
        history = state.zone_history.get(zid, [])
        trend_str = "steady"
        if len(history) >= 2:
            past_score = history[0]["pulse"] if len(history) > 0 else weighted_score
            delta = weighted_score - past_score
            if delta >= 4.0:
                trend_str = "improving"
            elif delta <= -4.0:
                trend_str = "worsening"

        # Determine top issue
        top_issue = None
        min_sub_score = 100.0
        for f, s in sub_scores.items():
            if s is not None and s < min_sub_score and s < 75.0:
                min_sub_score = s
                top_issue = f"Elevated {f.replace('_', ' ')} stress ({s:.0f}/100)"

        # Zone confidence
        zone_conf = 0.95
        if online_count < total_count:
            zone_conf -= (total_count - online_count) * 0.12
        zone_conf = max(0.35, min(0.99, zone_conf))

        status_word = get_status_from_score(weighted_score)
        bpm_val = get_bpm_from_score(weighted_score)

        z_props = ZoneProps(
            id=zid,
            name=z["name"],
            pulse_score=round(weighted_score, 1),
            status=status_word,
            trend=trend_str,
            confidence=round(zone_conf, 2),
            bpm=bpm_val,
            top_issue=top_issue,
            sub_scores=sub_scores
        )
        zone_props_map[zid] = z_props
        state.zone_props[zid] = z_props

    # Compute City Pulse Score: 0.7 * mean(zone scores) + 0.3 * min(zone scores)
    scores_list = list(zone_scores.values())
    mean_score = sum(scores_list) / len(scores_list) if scores_list else 100.0
    min_score = min(scores_list) if scores_list else 100.0
    city_score = round((0.7 * mean_score) + (0.3 * min_score), 1)

    # City trend vs 10 min ago
    city_trend: Trend = "steady"
    if len(state.city_history) >= 2:
        past_city = state.city_history[0]["pulse"]
        city_delta = city_score - past_city
        if city_delta >= 4.0:
            city_trend = "improving"
        elif city_delta <= -4.0:
            city_trend = "worsening"

    city_status = get_status_from_score(city_score)
    city_bpm = get_bpm_from_score(city_score)

    # Active anomalies & irregularity
    active_anomalies = len([ins for ins in state.insights.values() if ins.status == "active" and ins.kind == "anomaly"])
    # Irregularity 0..1 scale
    irregularity = min(1.0, active_anomalies * 0.22)

    # City confidence
    city_conf = 0.95
    if online_count < total_count:
        city_conf -= (total_count - online_count) * 0.12
    city_conf = max(0.30, min(0.98, city_conf))

    # Zones at risk: worst 3
    sorted_zones = sorted(zone_props_map.values(), key=lambda z: z.pulse_score)
    zones_at_risk = [
        ZoneRiskItem(
            zone_id=z.id,
            name=z.name,
            score=z.pulse_score,
            status=z.status
        )
        for z in sorted_zones[:3]
    ]

    # Grounded summary fallback if None provided
    if not summary_obj:
        summary_obj = Summary(
            headline=f"City Pulse is {city_status.upper()}.",
            body="All primary civic infrastructure feeds are operating within normal baseline bounds.",
            generated_by="template",
            grounded_on=["6 live feeds"],
            updated_at=now.isoformat()
        )

    pulse = Pulse(
        city_name="Demo City",
        score=city_score,
        status=city_status,
        bpm=city_bpm,
        irregularity=round(irregularity, 2),
        trend=city_trend,
        confidence=round(city_conf, 2),
        degraded=city_degraded,
        summary=summary_obj,
        active_anomalies=active_anomalies,
        feeds_online=online_count,
        feeds_total=total_count,
        zones_at_risk=zones_at_risk,
        updated_at=now.isoformat(),
        mode="replay" if state.mode == "replay" else "live"
    )

    state.latest_pulse = pulse
    state.record_history_point(now.isoformat(), city_score, zone_scores, zone_sub_scores_map)

    return pulse, zone_props_map
