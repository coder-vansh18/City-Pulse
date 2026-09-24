import pytest
from app.summary import validate_llm_grounding, build_template_summary

def test_grounding_validator_accepts_grounded_text():
    grounding_data = {
        "zone": "Riverside",
        "score": 64.0,
        "delays": 14.2,
        "reports": 3
    }
    valid_text = "Riverside is experiencing strain with 14.2 min delays and 3 reports. Score is 64."
    assert validate_llm_grounding(valid_text, grounding_data) is True

def test_grounding_validator_rejects_hallucinations_and_causality():
    grounding_data = {
        "zone": "Riverside",
        "score": 64.0
    }
    # Hallucinated number 99.99
    hallucinated_text = "Riverside has 99.99 fires."
    assert validate_llm_grounding(hallucinated_text, grounding_data) is False

    # Forbidden causal claim
    causal_text = "Riverside power loss was caused by heavy thunder."
    assert validate_llm_grounding(causal_text, grounding_data) is False

def test_template_summary_builds():
    summary = build_template_summary()
    assert summary.headline is not None
    assert summary.body is not None
    assert summary.generated_by == "template"
    assert len(summary.grounded_on) > 0
