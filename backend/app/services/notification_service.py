"""
Notification service — sync Redis publish used by the service layer,
async listener used by the WebSocket background task.
"""

import json
import logging
import redis
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger(__name__)

CHANNEL = "notifications"

# Sync client — used inside synchronous service functions
_sync_client: redis.Redis | None = None


def get_sync_redis() -> redis.Redis:
    global _sync_client
    if _sync_client is None:
        _sync_client = redis.from_url(settings.redis_url, decode_responses=True)
    return _sync_client


def publish(event_type: str, data: dict) -> None:
    """Publish a notification event. Never raises — notification failure must
    not break the main database operation."""
    try:
        payload = json.dumps({"type": event_type, **data})
        get_sync_redis().publish(CHANNEL, payload)
        logger.info("Published notification: %s", event_type)
    except Exception as exc:
        logger.warning("Failed to publish notification %s: %s", event_type, exc)


# ---------------------------------------------------------------------------
# Async listener — run as a background task from main.py startup
# ---------------------------------------------------------------------------

async def redis_listener(broadcast_fn) -> None:
    """Subscribe to the notifications channel and call broadcast_fn for each
    message. Reconnects automatically on connection loss."""
    while True:
        try:
            client = aioredis.from_url(settings.redis_url, decode_responses=True)
            pubsub = client.pubsub()
            await pubsub.subscribe(CHANNEL)
            logger.info("Redis listener connected and subscribed to '%s'", CHANNEL)

            async for message in pubsub.listen():
                if message["type"] == "message":
                    await broadcast_fn(message["data"])

        except Exception as exc:
            logger.warning("Redis listener error: %s — reconnecting in 3s", exc)
            import asyncio
            await asyncio.sleep(3)
