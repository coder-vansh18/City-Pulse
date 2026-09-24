import pytest
from datetime import datetime, timezone, timedelta
from app.models import Insight, EvidenceItem
from app.correlation import correlation_engine
from app.state import state

def test_epistemic_correlation_hedging():
    now = datetime.now(timezone.utc)
    # Inject two active anomalies in adjacent zones z4 and z5
    a1 = Insight(
        id="test_anom_weather",
        kind="anomaly",
        zone_ids=["z4"],
        feed_types=["weather"],
        severity=0.85,
        confidence="high",
        title="Severe Rain Spike in Riverside",
        plain_text="Heavy downpour detected.",
        caveat=None,
        evidence=[EvidenceItem(feed="weather", metric="precip", value=24.0, baseline=0.0, zscore=3.5)],
        event_ids=["w1", "w2", "w3"],
        window_start=(now - timedelta(minutes=10)).isoformat(),
        window_end=now.isoformat(),
        first_seen=now.isoformat(),
        status="active"
    )
    a2 = Insight(
        id="test_anom_transit",
        kind="anomaly",
        zone_ids=["z5"],
        feed_types=["transit"],
        severity=0.80,
        confidence="high",
        title="Transit Delays in Central Station",
        plain_text="Route slowdowns detected.",
        caveat=None,
        evidence=[EvidenceItem(feed="transit", metric="delay", value=18.0, baseline=2.0, zscore=3.2)],
        event_ids=["t1", "t2", "t3"],
        window_start=(now - timedelta(minutes=10)).isoformat(),
        window_end=now.isoformat(),
        first_seen=now.isoformat(),
        status="active"
    )
    state.upsert_insight(a1)
    state.upsert_insight(a2)

    correlations = correlation_engine.run_correlation()
    assert len(correlations) >= 1
    corr = correlations[0]
    assert corr.kind == "correlation"
    # Verify non-causal epistemic wording
    assert "caused by" not in corr.plain_text.lower()
    assert corr.caveat is not None
    assert "co-occurrence" in corr.caveat.lower() or "statistical" in corr.caveat.lower()
