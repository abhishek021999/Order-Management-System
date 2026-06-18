"""
WebSocket endpoint for real-time notifications.
"""

import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Tracks all active WebSocket connections and broadcasts messages."""

    def __init__(self):
        self._connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._connections.append(ws)
        logger.info("WS client connected. Total: %d", len(self._connections))

    def disconnect(self, ws: WebSocket) -> None:
        self.discard_if_present(ws)
        logger.info("WS client disconnected. Total: %d", len(self._connections))

    def discard_if_present(self, ws: WebSocket) -> None:
        try:
            self._connections.remove(ws)
        except ValueError:
            pass

    async def broadcast(self, message: str) -> None:
        dead = []
        for ws in self._connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.discard_if_present(ws)

    @property
    def count(self) -> int:
        return len(self._connections)


# Singleton shared across the app
manager = ConnectionManager()


@router.websocket("/ws/notifications")
async def notifications_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive; client may send pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.discard_if_present(websocket)
