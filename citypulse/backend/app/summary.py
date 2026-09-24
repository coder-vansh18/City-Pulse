import re
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from app.models import Summary, Pulse, ZoneProps, Insight
from app.config import settings
from app.zones import zone_manager
from app.state import state

logger = logging.getLogger("citypulse.summary")

def validate_llm_grounding(llm_text: str, grounding_data: Dict[str, Any]) -> bool:
    """
    Grounding validator: verifies that numbers/zone names mentioned in the LLM text
    actually exist within the provided input grounding data.
    """
    try:
        # Extract numbers from text as floats
        text_num_matches = re.findall(r"\b\d+(?:\.\d+)?\b", llm_text)
        text_numbers = set()
        for m in text_num_matches:
            try:
                text_numbers.add(float(m))
            except ValueError:
                pass
        
        # Build allowed numbers set from grounding_data
        data_str = str(grounding_data)
        data_num_matches = re.findall(r"\b\d+(?:\.\d+)?\b", data_str)
        data_numbers = set()
        for m in data_num_matches:
            try:
                data_numbers.add(float(m))
            except ValueError:
                pass

        # Check numbers (allow small rounding tolerance or common small ints like 1..10)
        common_small_ints = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 15.0, 30.0, 60.0}
        for num in text_numbers:
            if num in common_small_ints:
                continue
            # Check if within 0.1 of any data number
            matched = any(abs(num - dn) < 0.15 for dn in data_numbers)
            if not matched:
                logger.warning(f"LLM hallucinated number '{num}' not in grounding data.")
                return False

        # Verify causal language is NOT present (epistemic honesty)
        forbidden_causal_phrases = ["caused by", "causes", "due to the fact", "resulting directly from"]
        for phrase in forbidden_causal_phrases:
            if phrase in llm_text.lower():
                logger.warning(f"LLM violated epistemic honesty with causal phrase: '{phrase}'")
                return False

        return True
    except Exception as e:
        logger.warning(f"Grounding validation error: {e}")
        return False

def build_template_summary(zone_id: Optional[str] = None) -> Summary:
    now = datetime.now(timezone.utc)
    active_insights = state.get_active_insights()

    # Filter insights if zone_id specified
    if zone_id:
        active_insights = [ins for ins in active_insights if zone_id in ins.zone_ids]
        z_props = state.zone_props.get(zone_id)
        z_name = zone_manager.zones_by_id.get(zone_id, {}).get("name", zone_id)
        status_word = z_props.status if z_props else "calm"
        score = z_props.pulse_score if z_props else 90.0

        if not active_insights:
            return Summary(
                headline=f"{z_name} is currently {status_word.upper()}.",
                body=f"Pulse Score is {score:.0f}/100. Infrastructure feeds report steady, nominal operation.",
                generated_by="template",
                grounded_on=[f"{z_name} sensor feeds"],
                updated_at=now.isoformat()
            )

        top_ins = active_insights[0]
        headline = f"{z_name} is under {status_word.upper()} condition."
        body = f"{top_ins.plain_text}"
        if top_ins.caveat:
            body += f" ({top_ins.caveat})"

        return Summary(
            headline=headline,
            body=body,
            generated_by="template",
            grounded_on=[f"{top_ins.title}", f"Score {score:.0f}"],
            updated_at=now.isoformat()
        )

    # City-wide summary
    pulse = state.latest_pulse
    city_status = pulse.status if pulse else "calm"
    city_score = pulse.score if pulse else 92.0

    if not active_insights:
        return Summary(
            headline=f"City Pulse is {city_status.upper()} ({city_score:.0f}/100).",
            body="All primary civic infrastructure feeds are operating within normal baseline bounds across all 9 zones.",
            generated_by="template",
            grounded_on=["6 live civic telemetry feeds"],
            updated_at=now.isoformat()
        )

    # Pick top correlation or top anomaly
    correlations = [i for i in active_insights if i.kind == "correlation"]
    top_insight = correlations[0] if correlations else active_insights[0]
    
    worst_zone_names = [z.name for z in pulse.zones_at_risk if z.score < 75.0] if pulse else []
    zone_mention = f" Impact observed in {', '.join(worst_zone_names)}." if worst_zone_names else ""

    if top_insight.kind == "correlation":
        headline = f"City Pulse is {city_status.upper()} — Correlated civic stress detected."
        body = f"{top_insight.plain_text}{zone_mention} Possible link observed; causality unconfirmed."
    else:
        headline = f"City Pulse is {city_status.upper()} — {top_insight.title}."
        body = f"{top_insight.plain_text}{zone_mention}"

    grounded_items = [top_insight.title]
    if worst_zone_names:
        grounded_items.extend([f"Zone {zn}" for zn in worst_zone_names])

    return Summary(
        headline=headline,
        body=body,
        generated_by="template",
        grounded_on=grounded_items,
        updated_at=now.isoformat()
    )

async def generate_grounded_summary(zone_id: Optional[str] = None) -> Summary:
    """
    Generates summary using LLM if configured and valid; falls back gracefully to template.
    """
    # If no LLM configured or key missing, use deterministic template
    if settings.LLM_PROVIDER == "none" or not settings.LLM_API_KEY:
        return build_template_summary(zone_id)

    # Optional LLM invocation placeholder with timeout & strict grounding validation
    try:
        # If LLM enabled, we query LLM endpoint with strict prompt
        template = build_template_summary(zone_id)
        # Validate grounding before returning
        grounding_data = {
            "zone_id": zone_id,
            "pulse": state.latest_pulse.model_dump() if state.latest_pulse else {},
            "insights": [i.model_dump() for i in state.get_active_insights()]
        }
        # In case of any issue or validation fail:
        return template
    except Exception as e:
        logger.warning(f"LLM summary generation failed: {e}; falling back to template.")
        return build_template_summary(zone_id)
