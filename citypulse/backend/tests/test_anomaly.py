import pytest
from datetime import datetime, timezone, timedelta
from app.anomaly import calculate_robust_z_score, anomaly_detector
from app.models import NormalizedEvent
from app.state import state

def test_robust_z_score_calculation():
    # Normal distribution values
    values = [1.0, 1.0, 1.2, 0.9, 1.1, 1.0, 1.0, 0.8, 1.3, 1.0]
    z_normal, median = calculate_robust_z_score(values, 1.05)
    assert abs(z_normal) < 1.5

    # Outlier spike
    z_outlier, _ = calculate_robust_z_score(values, 6.5)
    assert z_outlier > 3.0

def test_anomaly_detection_cycle():
    now = datetime.now(timezone.utc)
    # Inject rapid spike events in zone z4
    for i in range(10):
        ev = NormalizedEvent(
            id=f"test_tr_{i}",
            source="simulated",
            feed="transit",
            zone_id="z4",
            lat=40.71,
            lng=-74.00,
            severity=0.85,
            value=25.0,
            unit="min",
            title="Heavy Bus Delay",
            description="Signal failure delay",
            timestamp=now - timedelta(minutes=i),
            received_at=now,
            confidence=0.9
        )
        state.add_event(ev)

    insights = anomaly_detector.run_detection()
    assert len(insights) >= 1
    assert insights[0].kind == "anomaly"
    assert "z4" in insights[0].zone_ids
    assert "transit" in insights[0].feed_types
