import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.state import state
from app.zones import zone_manager
from app.scoring import compute_pulse_and_zones

logger = logging.getLogger("citypulse.ws")

router = APIRouter()

def make_ws_envelope(msg_type: str, payload: Any) -> Dict[str, Any]:
    return {
        "type": msg_type,
        "mode": "replay" if state.mode == "replay" else "live",
        "ts": datetime.now(timezone.utc).isoformat(),
        "payload": payload
    }

async def broadcast_ws_message(msg_type: str, payload: Any):
    if not state.ws_clients:
        return
    msg = json.dumps(make_ws_envelope(msg_type, payload))
    dead_clients = set()
    for ws in list(state.ws_clients):
        try:
            await ws.send_text(msg)
        except Exception:
            dead_clients.add(ws)
    for ws in dead_clients:
        state.ws_clients.discard(ws)

@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    state.ws_clients.add(websocket)
    logger.info(f"WebSocket client connected. Total clients: {len(state.ws_clients)}")

    try:
        # 1. On connect send initial snapshot: pulse, zones, feed_status
        pulse, zone_props = compute_pulse_and_zones()
        props_dict = {zid: zp.model_dump() for zid, zp in zone_props.items()}
        zones_geojson = zone_manager.get_geojson(props_dict)

        feeds_list = [f.get_status().model_dump() for f in state.feeds.values()]

        await websocket.send_text(json.dumps(make_ws_envelope("pulse", pulse.model_dump())))
        await websocket.send_text(json.dumps(make_ws_envelope("zones", zones_geojson)))
        await websocket.send_text(json.dumps(make_ws_envelope("feed_status", feeds_list)))

        # Keep client connection open while listening for incoming pings or client messages
        while True:
            data = await websocket.receive_text()
            # If client sends a ping or custom action
            if data == "ping":
                await websocket.send_text(json.dumps(make_ws_envelope("ping", {})))

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected normally.")
    except Exception as e:
        logger.warning(f"WebSocket connection exception: {e}")
    finally:
        state.ws_clients.discard(websocket)
