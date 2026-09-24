import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from app.state import state
from app.models import ScenarioItem, ActiveScenario

logger = logging.getLogger("citypulse.scenarios")

AVAILABLE_SCENARIOS = [
    ScenarioItem(
        name="storm",
        label="Severe Rain & Storm Surge",
        description="Heavy precipitation triggering transit delays, street flooding, and localized power flickers."
    ),
    ScenarioItem(
        name="power_outage",
        label="Substation Power Grid Failure",
        description="Grid blackout affecting traffic signals and causing adjacent transit gridlock."
    ),
    ScenarioItem(
        name="gas_leak",
        label="Subsurface Gas Leak Alert",
        description="Hazardous gas odor report leading to emergency response, acoustic spikes, and bus reroutes."
    ),
    ScenarioItem(
        name="transit_strike",
        label="City-Wide Transit Strike",
        description="Major transit shutdown with severe delays and crowd congestion around terminals."
    ),
    ScenarioItem(
        name="heatwave",
        label="Extreme Heatwave & Ozone Alert",
        description="High ambient temperatures (40°C+), deteriorated AQI, and power transformer strain."
    ),
    ScenarioItem(
        name="clear",
        label="Nominal Baseline (Clear)",
        description="Clears all active scenario modifiers and returns feeds to normal calm conditions."
    ),
]

class ScenarioEngine:
    def __init__(self):
        self.active_timer_task: Optional[asyncio.Task] = None

    def get_available_scenarios(self) -> List[ScenarioItem]:
        return AVAILABLE_SCENARIOS

    def get_active_scenarios(self) -> List[ActiveScenario]:
        if not state.active_scenario:
            return []
        sc = state.active_scenario
        return [
            ActiveScenario(
                name=sc["name"],
                zone_id=sc.get("zone_id"),
                started_at=sc["started_at"],
                ends_at=sc["ends_at"]
            )
        ]

    async def trigger_scenario(self, name: str, zone_id: Optional[str] = None, duration_min: int = 5) -> bool:
        if name == "clear":
            self.clear_scenario()
            return True

        valid_names = [s.name for s in AVAILABLE_SCENARIOS if s.name != "clear"]
        if name not in valid_names:
            logger.warning(f"Unknown scenario name: {name}")
            return False

        if self.active_timer_task:
            self.active_timer_task.cancel()

        now = datetime.now(timezone.utc)
        ends_at = now + timedelta(minutes=duration_min)

        state.active_scenario = {
            "name": name,
            "zone_id": zone_id,
            "started_at": now.isoformat(),
            "ends_at": ends_at.isoformat()
        }
        logger.info(f"Triggered scenario '{name}' on zone {zone_id} for {duration_min} minutes.")

        # Launch auto-expire task
        async def expire_later():
            await asyncio.sleep(duration_min * 60)
            if state.active_scenario and state.active_scenario.get("name") == name:
                logger.info(f"Scenario '{name}' naturally completed.")
                state.active_scenario = None

        self.active_timer_task = asyncio.create_task(expire_later())
        return True

    def clear_scenario(self):
        if self.active_timer_task:
            self.active_timer_task.cancel()
            self.active_timer_task = None
        state.active_scenario = None
        logger.info("Cleared active scenario.")

scenario_engine = ScenarioEngine()
