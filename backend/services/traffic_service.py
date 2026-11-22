"""
Traffic Service unifying Replayer, Detector, Storage, and WebSockets.
"""

from backend.detector import detector
from backend.alert_store import alert_store
from backend.services.statistics_service import stats_service
from backend.websocket_manager import ws_manager
from backend.replayer import TrafficReplayer

# Global shared traffic replayer instance
traffic_replayer = TrafficReplayer(
    detector=detector,
    alert_store=alert_store,
    stats_service=stats_service,
    ws_manager=ws_manager,
)
