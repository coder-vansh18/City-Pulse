import pytest
from datetime import datetime, timezone, timedelta
from app.models import NormalizedEvent
from app.scoring import (
    get_status_from_score, get_bpm_from_score, compute_pulse_and_zones
)
from app.state import state
from app.feeds import WeatherFeed, TransitFeed, IncidentFeed, AirQualityFeed, PowerFeed, NoiseFeed

def test_status_thresholds():
    assert get_status_from_score(95.0) == "calm"
    assert get_status_from_score(80.0) == "calm"
    assert get_status_from_score(79.9) == "watch"
    assert get_status_from_score(60.0) == "watch"
    assert get_status_from_score(59.9) == "strained"
    assert get_status_from_score(40.0) == "strained"
    assert get_status_from_score(39.9) == "critical"
    assert get_status_from_score(15.0) == "critical"

def test_bpm_formula():
    assert get_bpm_from_score(100.0) == 60
    assert get_bpm_from_score(0.0) == 150
    assert get_bpm_from_score(80.0) == 78

def test_pulse_computation_and_degradation():
    # Setup feed instances
    state.feeds["weather"] = WeatherFeed()
    state.feeds["transit"] = TransitFeed()
    state.feeds["incident"] = IncidentFeed()
    state.feeds["air_quality"] = AirQualityFeed()
    state.feeds["power"] = PowerFeed()
    state.feeds["noise"] = NoiseFeed()

    pulse, zone_props = compute_pulse_and_zones()
    assert pulse.score >= 0 and pulse.score <= 100
    assert pulse.bpm >= 60 and pulse.bpm <= 150
    assert len(zone_props) == 9
    assert pulse.degraded is False

    # Simulate disabling a feed
    state.feeds["transit"].set_enabled(False)
    pulse_deg, _ = compute_pulse_and_zones()
    assert pulse_deg.degraded is True
    assert pulse_deg.feeds_online == 5
    # Subscore for transit should be None
    assert state.zone_props["z5"].sub_scores["transit"] is None
    
    # Restore feed
    state.feeds["transit"].set_enabled(True)
