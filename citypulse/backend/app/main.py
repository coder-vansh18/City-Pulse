import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.state import state
from app.zones import zone_manager
from app.db import db
from app.feeds import (
    WeatherFeed, AirQualityFeed, TransitFeed, IncidentFeed, PowerFeed, NoiseFeed
)
from app.scoring import compute_pulse_and_zones
from app.anomaly import anomaly_detector
from app.correlation import correlation_engine
from app.summary import build_template_summary
from app.agent import agent_monitor
from app.routes import rest_router, ws_router
from app.routes.ws import broadcast_ws_message

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("citypulse.main")

async def background_pipeline_loop():
    """Background engine: computes pulse every 2s and broadcasts to all connected WS clients."""
    ping_counter = 0
    while True:
        try:
            if state.mode == "live":
                # 1. Run anomaly detection
                anomaly_detector.run_detection()
                
                # 2. Run correlation engine
                correlation_engine.run_correlation()
                
                # 3. Generate summary
                summary = build_template_summary()
                
                # 4. Compute city & zone pulse
                pulse, zone_props = compute_pulse_and_zones(summary)
                
                # 5. Broadcast to WebSocket clients
                props_dict = {zid: zp.model_dump() for zid, zp in zone_props.items()}
                zones_geojson = zone_manager.get_geojson(props_dict)
                
                await broadcast_ws_message("pulse", pulse.model_dump())
                await broadcast_ws_message("zones", zones_geojson)

                # Periodic feed status & ping
                ping_counter += 1
                if ping_counter % 5 == 0:
                    feeds_list = [f.get_status().model_dump() for f in state.feeds.values()]
                    await broadcast_ws_message("feed_status", feeds_list)
                if ping_counter % 8 == 0:
                    await broadcast_ws_message("ping", {})

        except Exception as e:
            logger.error(f"Error in background pipeline: {e}", exc_info=True)
            
        await asyncio.sleep(2.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CityPulse civic health engine...")
    
    # Register feeds
    state.feeds["weather"] = WeatherFeed()
    state.feeds["air_quality"] = AirQualityFeed()
    state.feeds["transit"] = TransitFeed()
    state.feeds["incident"] = IncidentFeed()
    state.feeds["power"] = PowerFeed()
    state.feeds["noise"] = NoiseFeed()

    # Pre-warm 30 minutes of historical data so UI is never empty on start
    now = datetime.now(timezone.utc)
    start_30m = now - timedelta(minutes=30)
    logger.info("Pre-warming 30 minutes of feed history...")
    
    for feed in state.feeds.values():
        historical_events = feed.generate_historical_events(start_30m, now)
        for ev in historical_events:
            state.add_event(ev)
        db.insert_events_batch([ev.to_dict() for ev in historical_events])

    # Initial scoring
    compute_pulse_and_zones()
    logger.info("History pre-warmed. Starting feed loops and agentic monitor...")

    # Start feeds
    for feed in state.feeds.values():
        await feed.start()

    # Start agent monitor
    await agent_monitor.start()

    # Start pipeline broadcast loop
    pipeline_task = asyncio.create_task(background_pipeline_loop())

    yield

    logger.info("Shutting down CityPulse engine...")
    pipeline_task.cancel()
    await agent_monitor.stop()
    for feed in state.feeds.values():
        await feed.stop()

app = FastAPI(
    title="CityPulse API",
    description="Live Civic Health Dashboard & Fusion Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rest_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {"name": "CityPulse API", "version": "1.0.0", "docs": "/docs"}
