import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Literal
from fastapi import APIRouter, HTTPException, Query, Path, Body

from app.config import settings
from app.models import (
    Pulse, ZoneDetail, ZoneProps, NormalizedEvent, Insight, FeedStatus,
    FeedToggleRequest, HistoryPoint, ZoneHistory, Summary,
    ScenarioListResponse, ScenarioRequest, Alert, AlertRule, AlertAckResponse,
    ReplayState, ReplayStartRequest, ReplaySeekRequest, FeedType
)
from app.zones import zone_manager
from app.state import state
from app.db import db
from app.scoring import compute_pulse_and_zones
from app.summary import build_template_summary, generate_grounded_summary
from app.scenarios import scenario_engine
from app.replay import replay_engine

router = APIRouter(prefix="/api")

@router.get("/health")
def get_health():
    uptime = (datetime.now(timezone.utc) - state.start_time).total_seconds()
    return {
        "ok": True,
        "mode": state.mode,
        "uptime_s": round(uptime, 1)
    }

@router.get("/config")
def get_config():
    return {
        "city_name": settings.CITY_NAME,
        "center": {
            "lat": settings.CITY_LAT,
            "lng": settings.CITY_LON
        },
        "zoom": 13,
        "feeds": ["weather", "transit", "incident", "air_quality", "power", "noise"],
        "zones": zone_manager.get_zone_list()
    }

@router.get("/pulse", response_model=Pulse)
def get_pulse():
    if not state.latest_pulse:
        pulse, _ = compute_pulse_and_zones()
        return pulse
    return state.latest_pulse

@router.get("/zones")
def get_zones():
    # Make sure props are up to date
    if not state.latest_pulse:
        compute_pulse_and_zones()
    
    props_dict = {zid: zp.model_dump() for zid, zp in state.zone_props.items()}
    return zone_manager.get_geojson(props_dict)

@router.get("/zones/{zone_id}", response_model=ZoneDetail)
def get_zone_detail(zone_id: str = Path(...)):
    if zone_id not in zone_manager.zones_by_id:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found")
    
    if not state.latest_pulse:
        compute_pulse_and_zones()

    zp = state.zone_props.get(zone_id)
    if not zp:
        raise HTTPException(status_code=404, detail=f"Zone props for '{zone_id}' not found")

    summary = build_template_summary(zone_id)
    events = state.get_recent_events(minutes=60, zone_id=zone_id)[:20]
    
    # Active & resolved insights involving this zone
    insights = [
        ins for ins in state.insights.values()
        if zone_id in ins.zone_ids
    ][:10]

    # Sparkline from zone history
    history_pts = list(state.zone_history.get(zone_id, []))
    sparkline = [{"t": pt["t"], "pulse": pt["pulse"]} for pt in history_pts[-24:]] if history_pts else []

    return ZoneDetail(
        zone=zp,
        summary=summary,
        recent_events=events,
        insights=insights,
        sparkline=sparkline
    )

@router.get("/events", response_model=List[NormalizedEvent])
def get_events(
    feed: Optional[FeedType] = Query(None),
    zone_id: Optional[str] = Query(None),
    since: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500)
):
    # Retrieve from DB / memory
    raw_events = db.get_events(feed=feed, zone_id=zone_id, since=since, limit=limit)
    return [NormalizedEvent(**e) for e in raw_events]

@router.get("/insights", response_model=List[Insight])
def get_insights(
    status: Optional[Literal["active", "resolved", "all"]] = Query("active"),
    limit: int = Query(50, ge=1, le=200)
):
    insights = db.get_insights(status=status, limit=limit)
    return [Insight(**i) for i in insights]

@router.get("/feeds/status", response_model=List[FeedStatus])
def get_feeds_status():
    result = []
    for f_type in ["weather", "transit", "incident", "air_quality", "power", "noise"]:
        feed_inst = state.feeds.get(f_type)
        if feed_inst:
            result.append(feed_inst.get_status())
    return result

@router.post("/feeds/{feed}/toggle", response_model=FeedStatus)
def toggle_feed(
    feed: FeedType = Path(...),
    body: FeedToggleRequest = Body(...)
):
    feed_inst = state.feeds.get(feed)
    if not feed_inst:
        raise HTTPException(status_code=404, detail=f"Feed '{feed}' not found")
    
    stat = feed_inst.set_enabled(body.enabled)
    # Recalculate pulse after toggle to reflect degraded mode immediately
    compute_pulse_and_zones()
    return stat

@router.get("/history", response_model=ZoneHistory)
def get_history(
    zone_id: str = Query("all"),
    hours: int = Query(6, ge=1, le=24),
    bucket_min: int = Query(5, ge=1, le=60)
):
    if zone_id == "all":
        pts = list(state.city_history)
        return ZoneHistory(
            zone_id="all",
            points=[HistoryPoint(**p) for p in pts]
        )
    elif zone_id in zone_manager.zones_by_id:
        pts = list(state.zone_history.get(zone_id, []))
        return ZoneHistory(
            zone_id=zone_id,
            points=[HistoryPoint(**p) for p in pts]
        )
    else:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found")

@router.get("/summary", response_model=Summary)
def get_summary(zone_id: Optional[str] = Query(None)):
    if zone_id and zone_id not in zone_manager.zones_by_id:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found")
    return build_template_summary(zone_id)

@router.get("/sim/scenarios", response_model=ScenarioListResponse)
def get_scenarios():
    return ScenarioListResponse(
        available=scenario_engine.get_available_scenarios(),
        active=scenario_engine.get_active_scenarios()
    )

@router.post("/sim/scenario")
async def trigger_scenario(req: ScenarioRequest):
    ok = await scenario_engine.trigger_scenario(
        name=req.name,
        zone_id=req.zone_id,
        duration_min=req.duration_min or 5
    )
    if not ok:
        raise HTTPException(status_code=400, detail=f"Failed to trigger scenario '{req.name}'")
    return {"ok": True}

@router.get("/alerts", response_model=List[Alert])
def get_alerts(acknowledged: Optional[bool] = Query(None)):
    alerts = db.get_alerts(acknowledged=acknowledged)
    return [Alert(**a) for a in alerts]

@router.post("/alerts/{id}/ack", response_model=Alert)
def acknowledge_alert(id: str = Path(...)):
    ack = db.acknowledge_alert(id)
    if not ack:
        raise HTTPException(status_code=404, detail=f"Alert '{id}' not found")
    return Alert(**ack)

@router.get("/alerts/rules", response_model=List[AlertRule])
def get_alert_rules():
    rules = db.get_alert_rules()
    return [AlertRule(**r) for r in rules]

@router.post("/alerts/rules", response_model=AlertRule)
def create_alert_rule(rule: AlertRule):
    rule_dict = rule.model_dump()
    if not rule_dict.get("id"):
        rule_dict["id"] = f"rule_{uuid.uuid4().hex[:8]}"
    db.insert_alert_rule(rule_dict)
    return AlertRule(**rule_dict)

@router.put("/alerts/rules/{id}", response_model=AlertRule)
def update_alert_rule(id: str = Path(...), updates: Dict[str, Any] = Body(...)):
    res = db.update_alert_rule(id, updates)
    if not res:
        raise HTTPException(status_code=404, detail=f"Rule '{id}' not found")
    return AlertRule(**res)

@router.delete("/alerts/rules/{id}")
def delete_alert_rule(id: str = Path(...)):
    ok = db.delete_alert_rule(id)
    if not ok:
        raise HTTPException(status_code=404, detail=f"Rule '{id}' not found")
    return {"ok": True}

@router.post("/replay/start", response_model=ReplayState)
async def start_replay(req: ReplayStartRequest):
    return await replay_engine.start_replay(req.dataset, req.speed)

@router.post("/replay/stop", response_model=ReplayState)
async def stop_replay():
    return await replay_engine.stop_replay()

@router.post("/replay/seek", response_model=ReplayState)
async def seek_replay(req: ReplaySeekRequest):
    return await replay_engine.seek_replay(req.progress)

@router.get("/replay/state", response_model=ReplayState)
def get_replay_state():
    return replay_engine.get_state()
