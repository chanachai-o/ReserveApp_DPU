# src/routes/notifications_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

# --- Local Imports ---
from ..config.database import get_db
from ..models import Notification, User
from ..schemas import NotificationCreate, NotificationOut
# from ..middlewares.auth_middleware import get_current_user # หากต้องการใช้ auth

notifications_router = APIRouter()

# ================================================================
#                       Notification Endpoints
# ================================================================

@notifications_router.get("/users/{user_id}/notifications", response_model=List[NotificationOut])
async def get_user_notifications(
    user_id: int, 
    db: AsyncSession = Depends(get_db)
    # current_user: User = Depends(get_current_user) # ควรตรวจสอบว่าผู้ที่ขอดูเป็นเจ้าของหรือ admin
):
    """
    ดึงการแจ้งเตือนทั้งหมดของผู้ใช้ที่ระบุ
    """
    # if current_user.id != user_id and current_user.role != "manager":
    #     raise HTTPException(status_code=403, detail="Not authorized to view these notifications")

    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    result = await db.execute(stmt)
    notifications = result.scalars().all()
    return notifications


@notifications_router.post("/notifications", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_in: NotificationCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างการแจ้งเตือนใหม่ (สำหรับให้ระบบภายในเรียกใช้)
    """
    # ตรวจสอบว่า user_id ที่จะส่งไปให้มีอยู่จริงหรือไม่
    user = await db.get(User, notification_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {notification_in.user_id} not found")

    new_notification = Notification(**notification_in.model_dump())
    db.add(new_notification)
    await db.commit()
    await db.refresh(new_notification)
    return new_notification


@notifications_router.patch("/notifications/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_as_read(
    notification_id: int, 
    db: AsyncSession = Depends(get_db)
    # current_user: User = Depends(get_current_user)
):
    """
    อัปเดตสถานะการแจ้งเตือนว่าอ่านแล้ว
    """
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # ควรตรวจสอบสิทธิ์ว่าเป็นเจ้าของการแจ้งเตือนหรือไม่
    # if notification.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not authorized to update this notification")

    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification


@notifications_router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int, 
    db: AsyncSession = Depends(get_db)
    # current_user: User = Depends(get_current_user)
):
    """
    ลบการแจ้งเตือน
    """
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # ควรตรวจสอบสิทธิ์ว่าเป็นเจ้าของการแจ้งเตือนหรือไม่
    # if notification.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not authorized to delete this notification")

    await db.delete(notification)
    await db.commit()
    return None

