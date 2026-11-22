"""
WebSocket connection manager for real-time live feed and statistics broadcasting.
Handles client connection/disconnection gracefully.
"""

from typing import List
from fastapi import WebSocket
import json


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast payload to all active clients, automatically removing disconnected ones."""
        disconnected = []
        payload_str = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload_str)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    @property
    def client_count(self) -> int:
        return len(self.active_connections)


ws_manager = WebSocketManager()
