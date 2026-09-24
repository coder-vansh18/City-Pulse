import asyncio
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from app.models import Alert, AlertLevel
from app.state import state
from app.db import db
from app.zones import zone_manager

logger = logging.getLogger("citypulse.agent")

class AgenticMonitor:
    def __init__(self):
        self._running: bool = False
        self.task: Optional[asyncio.Task] = None

    async def start(self):
        if self._running:
            return
        self._running = True
        self.task = asyncio.create_task(self._monitor_loop())

    async def stop(self):
        self._running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass

    async def _monitor_loop(self):
        while self._running:
            try:
                await self.evaluate_rules()
            except Exception as e:
                logger.error(f"Error in agentic monitor loop: {e}", exc_info=True)
            await asyncio.sleep(5.0)

    async def evaluate_rules(self) -> List[Alert]:
        if state.mode != "live":
            return []

        now = datetime.now(timezone.utc)
        rules = db.get_alert_rules()
        emitted_alerts: List[Alert] = []

        for rule in rules:
            if not rule["enabled"]:
                continue

            rule_id = rule["id"]
            cooldown_s = rule.get("cooldown_s", 120)
            last_trig = state.rule_cooldowns.get(rule_id)
            if last_trig and (now - last_trig).total_seconds() < cooldown_s:
                continue

            metric = rule["metric"]
            operator = rule["operator"]
            threshold = float(rule["threshold"])
            target_zone = rule.get("zone_id")

            # 1. Pulse score evaluation
            if metric == "pulse_score":
                zones_to_check = [target_zone] if target_zone else list(state.zone_props.keys())
                for zid in zones_to_check:
                    zp = state.zone_props.get(zid)
                    if not zp:
                        continue
                    score = zp.pulse_score
                    triggered = (score < threshold) if operator == "<" else (score > threshold)
                    if triggered:
                        z_name = zone_manager.zones_by_id.get(zid, {}).get("name", zid)
                        level: AlertLevel = "critical" if score < 40.0 else "warning"
                        alert_id = f"alt_{uuid.uuid4().hex[:10]}"
                        title = f"Low Pulse Score Alert in {z_name}"
                        msg = (
                            f"Pulse Score in {z_name} has dropped to {score:.1f}/100 "
                            f"(threshold: {threshold:.0f}). Multiple civic telemetry feeds indicate elevated strain."
                        )
                        alert = Alert(
                            id=alert_id,
                            rule_id=rule_id,
                            level=level,
                            zone_id=zid,
                            title=title,
                            message=msg,
                            created_at=now.isoformat(),
                            acknowledged=False
                        )
                        db.insert_alert(alert.model_dump())
                        state.rule_cooldowns[rule_id] = now
                        emitted_alerts.append(alert)
                        logger.info(f"Agent raised alert: {title}")
                        break

            # 2. Anomaly severity evaluation
            elif metric == "anomaly_severity":
                active_anoms = [
                    ins for ins in state.insights.values()
                    if ins.status == "active" and (not target_zone or target_zone in ins.zone_ids)
                ]
                for anom in active_anoms:
                    sev = anom.severity
                    triggered = (sev > threshold) if operator == ">" else (sev < threshold)
                    if triggered:
                        zid = anom.zone_ids[0] if anom.zone_ids else None
                        z_name = zone_manager.zones_by_id.get(zid, {}).get("name", "City") if zid else "City"
                        alert_id = f"alt_{uuid.uuid4().hex[:10]}"
                        title = f"High Severity Anomaly: {anom.title}"
                        msg = f"{anom.plain_text} (Severity: {sev:.2f} vs threshold {threshold:.2f})."
                        alert = Alert(
                            id=alert_id,
                            rule_id=rule_id,
                            level="warning" if sev < 0.85 else "critical",
                            zone_id=zid,
                            title=title,
                            message=msg,
                            created_at=now.isoformat(),
                            acknowledged=False
                        )
                        db.insert_alert(alert.model_dump())
                        state.rule_cooldowns[rule_id] = now
                        emitted_alerts.append(alert)
                        logger.info(f"Agent raised anomaly alert: {title}")
                        break

            # 3. Feed down evaluation
            elif metric == "feed_down":
                for f_name, f_inst in state.feeds.items():
                    f_stat = f_inst.get_status()
                    if not f_stat.enabled or f_stat.status in ["down"]:
                        alert_id = f"alt_{uuid.uuid4().hex[:10]}"
                        title = f"Feed Interruption: {f_stat.label}"
                        msg = f"Telemetry stream for {f_stat.label} has experienced a disruption. Degraded mode active."
                        alert = Alert(
                            id=alert_id,
                            rule_id=rule_id,
                            level="warning",
                            zone_id=None,
                            title=title,
                            message=msg,
                            created_at=now.isoformat(),
                            acknowledged=False
                        )
                        db.insert_alert(alert.model_dump())
                        state.rule_cooldowns[rule_id] = now
                        emitted_alerts.append(alert)
                        break

        return emitted_alerts

agent_monitor = AgenticMonitor()
