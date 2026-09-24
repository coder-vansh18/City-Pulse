import os
import json
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from dateutil import parser as date_parser

from app.models import ReplayState, NormalizedEvent
from app.state import state
from app.normalize import normalize_event
from app.scoring import compute_pulse_and_zones
from app.anomaly import anomaly_detector
from app.correlation import correlation_engine
from app.summary import build_template_summary

logger = logging.getLogger("citypulse.replay")

REPLAY_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "replay_storm_day.json")

class ReplayEngine:
    def __init__(self):
        self.dataset_data: Optional[Dict[str, Any]] = None
        self.task: Optional[asyncio.Task] = None
        self.cursor_index: int = 0
        self.start_dt: Optional[datetime] = None
        self.end_dt: Optional[datetime] = None
        self.current_sim_dt: Optional[datetime] = None

    def _ensure_dataset_loaded(self):
        if self.dataset_data is not None:
            return
        if not os.path.exists(REPLAY_FILE_PATH):
            logger.info("Replay dataset not found. Generating...")
            from scripts.gen_replay import generate_3day_dataset
            generate_3day_dataset()
            
        with open(REPLAY_FILE_PATH, "r", encoding="utf-8") as f:
            self.dataset_data = json.load(f)
            
        self.start_dt = date_parser.parse(self.dataset_data["start_time"])
        self.end_dt = date_parser.parse(self.dataset_data["end_time"])
        self.current_sim_dt = self.start_dt

    def get_state(self) -> ReplayState:
        return state.replay_state

    async def start_replay(self, dataset_name: str = "storm_day", speed: float = 10.0) -> ReplayState:
        self._ensure_dataset_loaded()
        await self.stop_replay()

        state.mode = "replay"
        now = datetime.now(timezone.utc)
        self.cursor_index = 0
        self.current_sim_dt = self.start_dt

        state.replay_state = ReplayState(
            active=True,
            dataset=dataset_name,
            speed=speed,
            sim_time=self.current_sim_dt.isoformat() if self.current_sim_dt else None,
            progress=0.0,
            started_at=now.isoformat()
        )

        self.task = asyncio.create_task(self._replay_loop())
        logger.info(f"Replay started with speed x{speed}")
        return state.replay_state

    async def stop_replay(self) -> ReplayState:
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
            self.task = None

        state.mode = "live"
        state.replay_state = ReplayState(
            active=False,
            dataset=None,
            speed=1.0,
            sim_time=None,
            progress=0.0,
            started_at=None
        )
        logger.info("Replay stopped. Back to live mode.")
        return state.replay_state

    async def seek_replay(self, progress: float) -> ReplayState:
        self._ensure_dataset_loaded()
        progress = max(0.0, min(1.0, progress))
        
        total_seconds = (self.end_dt - self.start_dt).total_seconds()
        target_sim_dt = self.start_dt + timedelta(seconds=total_seconds * progress)
        self.current_sim_dt = target_sim_dt

        # Find matching cursor index
        events = self.dataset_data.get("events", [])
        self.cursor_index = int(progress * len(events))
        if self.cursor_index >= len(events):
            self.cursor_index = len(events) - 1

        state.replay_state.progress = round(progress, 4)
        state.replay_state.sim_time = self.current_sim_dt.isoformat()

        # Step processing
        await self._process_step(step_minutes=15)
        return state.replay_state

    async def _process_step(self, step_minutes: float):
        if not self.dataset_data:
            return
        events = self.dataset_data.get("events", [])
        if self.cursor_index >= len(events):
            return

        # Advance events
        target_time = self.current_sim_dt + timedelta(minutes=step_minutes)
        batch = []
        while self.cursor_index < len(events):
            ev_spec = events[self.cursor_index]
            f_type = ev_spec["feed"]
            raw = ev_spec["raw"]
            norm_ev = normalize_event(f_type, raw)
            if norm_ev:
                norm_ev.timestamp = self.current_sim_dt
                state.add_event(norm_ev)
                batch.append(norm_ev)
            self.cursor_index += 1
            if len(batch) >= 15:
                break

        self.current_sim_dt = target_time
        if self.end_dt and self.start_dt:
            total_s = (self.end_dt - self.start_dt).total_seconds()
            curr_s = (self.current_sim_dt - self.start_dt).total_seconds()
            state.replay_state.progress = round(min(1.0, max(0.0, curr_s / total_s)), 4)
            state.replay_state.sim_time = self.current_sim_dt.isoformat()

        # Execute scoring & intelligence
        anomaly_detector.run_detection()
        correlation_engine.run_correlation()
        summary = build_template_summary()
        compute_pulse_and_zones(summary)

    async def _replay_loop(self):
        while state.mode == "replay" and state.replay_state.active:
            try:
                # 1 real second = speed sim seconds
                speed = state.replay_state.speed
                sim_step_min = (1.0 * speed) / 60.0 # sim minutes per tick (1 tick/sec)
                await self._process_step(sim_step_min)
                
                if state.replay_state.progress >= 0.999:
                    logger.info("Replay completed 100%.")
                    await self.stop_replay()
                    break
            except Exception as e:
                logger.error(f"Error in replay loop: {e}", exc_info=True)
            await asyncio.sleep(1.0)

replay_engine = ReplayEngine()
