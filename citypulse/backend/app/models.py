from __future__ import annotations
from typing import Literal, Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

FeedType = Literal["weather", "transit", "incident", "air_quality", "power", "noise"]
Status = Literal["calm", "watch", "strained", "critical"]
Trend = Literal["improving", "steady", "worsening"]
FeedHealthState = Literal["live", "delayed", "down", "disabled"]
FeedDataSource = Literal["real", "simulated"]
InsightConfidence = Literal["low", "medium", "high"]
AlertLevel = Literal["info", "warning", "critical"]
AppMode = Literal["live", "replay"]

class NormalizedEvent(BaseModel):
    id: str
    source: str
    feed: FeedType
    zone_id: str
    lat: float
    lng: float
    severity: float = Field(ge=0.0, le=1.0)
    value: Optional[float] = None
    unit: Optional[str] = None
    title: str
    description: Optional[str] = None
    timestamp: datetime
    received_at: datetime
    confidence: float = Field(ge=0.0, le=1.0)
    status: Literal["active", "resolved"] = "active"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "source": self.source,
            "feed": self.feed,
            "zone_id": self.zone_id,
            "lat": self.lat,
            "lng": self.lng,
            "severity": round(self.severity, 3),
            "value": round(self.value, 2) if self.value is not None else None,
            "unit": self.unit,
            "title": self.title,
            "description": self.description,
            "timestamp": self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp,
            "received_at": self.received_at.isoformat() if isinstance(self.received_at, datetime) else self.received_at,
            "confidence": round(self.confidence, 2),
            "status": self.status,
        }

class Summary(BaseModel):
    headline: str
    body: str
    generated_by: Literal["template", "llm"]
    grounded_on: List[str]
    updated_at: str

class ZoneRiskItem(BaseModel):
    zone_id: str
    name: str
    score: float
    status: Status

class Pulse(BaseModel):
    city_name: str
    score: float
    status: Status
    bpm: int
    irregularity: float
    trend: Trend
    confidence: float
    degraded: bool
    summary: Summary
    active_anomalies: int
    feeds_online: int
    feeds_total: int
    zones_at_risk: List[ZoneRiskItem]
    updated_at: str
    mode: AppMode

class ZoneProps(BaseModel):
    id: str
    name: str
    pulse_score: float
    status: Status
    trend: str
    confidence: float
    bpm: int
    top_issue: Optional[str] = None
    sub_scores: Dict[FeedType, Optional[float]]

class SparklinePoint(BaseModel):
    t: str
    pulse: float

class EvidenceItem(BaseModel):
    feed: FeedType
    metric: str
    value: float
    baseline: float
    zscore: float

class Insight(BaseModel):
    id: str
    kind: Literal["anomaly", "correlation"]
    zone_ids: List[str]
    feed_types: List[FeedType]
    severity: float
    confidence: InsightConfidence
    title: str
    plain_text: str
    caveat: Optional[str] = None
    evidence: List[EvidenceItem]
    event_ids: List[str]
    window_start: str
    window_end: str
    first_seen: str
    status: Literal["active", "resolved"]

class ZoneDetail(BaseModel):
    zone: ZoneProps
    summary: Summary
    recent_events: List[NormalizedEvent]
    insights: List[Insight]
    sparkline: List[SparklinePoint]

class FeedStatus(BaseModel):
    feed: FeedType
    label: str
    status: FeedHealthState
    source: FeedDataSource
    enabled: bool
    last_update: Optional[str] = None
    expected_interval_s: float
    events_last_hour: int

class HistoryPoint(BaseModel):
    t: str
    pulse: float
    weather: Optional[float] = None
    transit: Optional[float] = None
    incident: Optional[float] = None
    air_quality: Optional[float] = None
    power: Optional[float] = None
    noise: Optional[float] = None

class ZoneHistory(BaseModel):
    zone_id: str
    points: List[HistoryPoint]

class Alert(BaseModel):
    id: str
    rule_id: str
    level: AlertLevel
    zone_id: Optional[str] = None
    title: str
    message: str
    created_at: str
    acknowledged: bool

class AlertRule(BaseModel):
    id: str
    name: str
    metric: Literal["pulse_score", "anomaly_severity", "feed_down"]
    zone_id: Optional[str] = None
    operator: Literal["<", ">"]
    threshold: float
    enabled: bool
    cooldown_s: int

class ReplayState(BaseModel):
    active: bool
    dataset: Optional[str] = None
    speed: float = 1.0
    sim_time: Optional[str] = None
    progress: float = 0.0
    started_at: Optional[str] = None

class ScenarioItem(BaseModel):
    name: str
    label: str
    description: str

class ActiveScenario(BaseModel):
    name: str
    zone_id: Optional[str] = None
    started_at: str
    ends_at: str

class ScenarioListResponse(BaseModel):
    available: List[ScenarioItem]
    active: List[ActiveScenario]

class ScenarioRequest(BaseModel):
    name: str
    zone_id: Optional[str] = None
    duration_min: Optional[int] = 5

class FeedToggleRequest(BaseModel):
    enabled: bool

class AlertAckResponse(BaseModel):
    id: str
    acknowledged: bool

class ReplayStartRequest(BaseModel):
    dataset: str = "storm_day"
    speed: float = 10.0

class ReplaySeekRequest(BaseModel):
    progress: float = Field(ge=0.0, le=1.0)
