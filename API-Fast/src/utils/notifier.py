# utils/notifier.py
from src.models import Notification
from datetime import datetime

async def trigger_notification(db, user_id: int, title: str, message: str, type: str = None):
    noti = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(noti)
    await db.commit()
    await db.refresh(noti)
    return noti
