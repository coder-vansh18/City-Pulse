import asyncio
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from app.models import FeedType, FeedHealthState, FeedDataSource, FeedStatus, NormalizedEvent
from app.state import state
from app.db import db

logger = logging.getLogger("citypulse.feeds")

class BaseFeed(ABC):
    def __init__(
        self,
        feed_type: FeedType,
        label: str,
        expected_interval_s: float,
        source: FeedDataSource = "simulated"
    ):
        self.feed_type: FeedType = feed_type
        self.label: str = label
        self.expected_interval_s: float = expected_interval_s
        self.source: FeedDataSource = source
        self.enabled: bool = True
        self.status: FeedHealthState = "live"
        self.last_update: Optional[datetime] = None
        self.task: Optional[asyncio.Task] = None
        self.events_last_hour_count: int = 0
        self._running: bool = False

    def get_status(self) -> FeedStatus:
        # Check if delayed or down based on elapsed time since last update
        current_status = self.status
        if not self.enabled:
            current_status = "disabled"
        elif self.last_update is not None:
            elapsed = (datetime.now(timezone.utc) - self.last_update).total_seconds()
            if elapsed > self.expected_interval_s * 3.5:
                current_status = "down"
            elif elapsed > self.expected_interval_s * 2.0:
                current_status = "delayed"
            else:
                current_status = "live"
        elif self.enabled:
            current_status = "live"

        return FeedStatus(
            feed=self.feed_type,
            label=self.label,
            status=current_status,
            source=self.source,
            enabled=self.enabled,
            last_update=self.last_update.isoformat() if self.last_update else None,
            expected_interval_s=self.expected_interval_s,
            events_last_hour=self.events_last_hour_count
        )

    def set_enabled(self, enabled: bool) -> FeedStatus:
        self.enabled = enabled
        if not enabled:
            self.status = "disabled"
        else:
            self.status = "live"
            self.last_update = datetime.now(timezone.utc)
        return self.get_status()

    def record_emitted_event(self, event: NormalizedEvent):
        self.last_update = datetime.now(timezone.utc)
        self.events_last_hour_count += 1
        state.add_event(event)
        db.insert_event(event.to_dict())

    async def start(self):
        if self._running:
            return
        self._running = True
        self.task = asyncio.create_task(self._run_loop())

    async def stop(self):
        self._running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass

    async def _run_loop(self):
        while self._running:
            try:
                if self.enabled and state.mode == "live":
                    await self.poll_or_generate()
            except Exception as e:
                logger.error(f"Error in feed loop {self.feed_type}: {e}", exc_info=True)
                self.status = "down"
            await asyncio.sleep(self.expected_interval_s)

    @abstractmethod
    async def poll_or_generate(self):
        """Poll upstream or generate synthetic pulse."""
        pass

    @abstractmethod
    def generate_historical_events(self, start_time: datetime, end_time: datetime) -> List[NormalizedEvent]:
        """Pre-warm historical data for instant realistic dashboard state."""
        pass
