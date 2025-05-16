# notifications.py (routes/notifications.py)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.config.database import get_db
from src.models import Notification
from src.schemas import NotificationOut, NotificationCreate
from typing import List
from datetime import datetime

notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@notifications_router.get("/", response_model=List[NotificationOut])
async def get_notifications(user_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@notifications_router.get("/unread/count")
async def count_unread(user_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    result = await db.execute(stmt)
    count = len(result.scalars().all())
    return {"unread_count": count}

@notifications_router.post("/mark-read")
async def mark_all_read(user_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    result = await db.execute(stmt)
    notis = result.scalars().all()
    for noti in notis:
        noti.is_read = True
    await db.commit()
    return {"marked_as_read": len(notis)}

@notifications_router.post("/")
async def create_notification(data: NotificationCreate, db: AsyncSession = Depends(get_db)):
    noti = Notification(**data.dict(), created_at=datetime.utcnow())
    db.add(noti)
    await db.commit()
    await db.refresh(noti)
    return noti
