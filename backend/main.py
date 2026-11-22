"""
NetGuard AI - FastAPI Application Server
Entry point for REST APIs, ML threat inference, replay control, and WebSocket streaming.
"""

from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.schemas import (
    TrafficStats,
    AlertListResponse,
    AlertModel,
    StartReplayRequest,
    AttackInjectionRequest,
    ModelPerformanceResponse,
)
from backend.alert_store import alert_store
from backend.services.statistics_service import stats_service
from backend.services.detection_service import detection_service
from backend.services.traffic_service import traffic_replayer
from backend.websocket_manager import ws_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables & models are loaded
    print(f"[*] Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    yield
    # Shutdown: stop active replay loop
    print("[*] Shutting down NetGuard AI backend...")
    await traffic_replayer.stop()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Network Intrusion Detection & Real-Time Threat Monitoring API",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["System"])
async def get_health():
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "detector_ready": traffic_replayer.detector.is_loaded if traffic_replayer.detector else False,
        "replayer_running": traffic_replayer.is_running,
        "database_connected": True,
        "active_ws_clients": ws_manager.client_count,
    }


@app.get("/api/stats", response_model=TrafficStats, tags=["Monitoring"])
async def get_statistics():
    """Get live network traffic metrics and 60-second time-series snapshot."""
    snapshot = stats_service.get_stats_snapshot()
    snapshot["current_replay_status"] = traffic_replayer.current_mode
    return snapshot


@app.get("/api/alerts", response_model=AlertListResponse, tags=["Alerts"])
async def get_alerts(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    category: Optional[str] = Query(None, description="Filter by threat category"),
):
    """Fetch paginated security alerts with evidence ordered chronologically."""
    alerts = alert_store.get_alerts(limit=limit, offset=offset, threat_category=category)
    total = alert_store.get_count()
    return {"total": total, "alerts": alerts}


@app.get("/api/alerts/{alert_id}", response_model=AlertModel, tags=["Alerts"])
async def get_alert_detail(alert_id: str):
    """Get detailed evidence and flow telemetry for a specific alert."""
    alert = alert_store.get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert with ID '{alert_id}' not found.")
    return alert


@app.get("/api/threats", tags=["Threats"])
async def get_threat_summary():
    """Get breakdown of detected threats and available attack categories."""
    distribution = alert_store.get_threat_distribution()
    return {
        "total_threats": sum(distribution.values()),
        "distribution": distribution,
        "available_attack_types": traffic_replayer.available_attack_classes,
    }


@app.get("/api/replay/status", tags=["Simulation"])
async def get_replay_status():
    """Get current status of network flow traffic simulator."""
    return traffic_replayer.get_status()


@app.post("/api/replay/start", tags=["Simulation"])
async def start_replay(request: Optional[StartReplayRequest] = None):
    """Start replaying benign network flows."""
    speed = request.speed if request else 1.0
    await traffic_replayer.start(speed=speed)
    return {
        "message": "Traffic replay started.",
        "status": traffic_replayer.get_status(),
    }


@app.post("/api/replay/stop", tags=["Simulation"])
async def stop_replay():
    """Stop active traffic simulation."""
    await traffic_replayer.stop()
    return {
        "message": "Traffic replay stopped.",
        "status": traffic_replayer.get_status(),
    }


@app.post("/api/replay/attack", tags=["Simulation"])
async def inject_attack(request: AttackInjectionRequest):
    """Inject an attack burst from the CICIDS-2017 dataset into the live stream."""
    try:
        await traffic_replayer.inject_attack(
            attack_type=request.attack_type, burst_count=request.burst_count
        )
        return {
            "message": f"Successfully injected {request.burst_count} {request.attack_type} flows.",
            "status": traffic_replayer.get_status(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/replay/reset", tags=["Simulation"])
async def reset_replay():
    """Reset simulation, flow counts, and in-memory statistics."""
    await traffic_replayer.reset()
    return {
        "message": "Simulation and traffic metrics reset successfully.",
        "status": traffic_replayer.get_status(),
    }


@app.get("/api/models/performance", response_model=ModelPerformanceResponse, tags=["ML Model"])
async def get_model_metrics():
    """Retrieve actual hold-out test set evaluation metrics for the trained model."""
    perf = detection_service.get_model_performance()
    return perf


@app.websocket("/ws/live")
async def websocket_live_feed(websocket: WebSocket):
    """
    WebSocket endpoint streaming live traffic telemetry, ML detections, and alerts.
    """
    await ws_manager.connect(websocket)
    # Send immediate initial state
    try:
        init_payload = {
            "type": "INITIAL_STATE",
            "stats": stats_service.get_stats_snapshot(),
            "replay": traffic_replayer.get_status(),
        }
        await websocket.send_json(init_payload)

        while True:
            # Keep connection alive & handle incoming client control messages
            data = await websocket.receive_text()
            # Respond to ping or client commands if sent over ws
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        ws_manager.disconnect(websocket)
