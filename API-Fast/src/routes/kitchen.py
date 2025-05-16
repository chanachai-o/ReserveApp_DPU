# src/routers/kitchen.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..config.database import get_db
from ..models import User, UserRole, Order, OrderItem, Menu ,OrderItemStatus
from ..schemas import KitchenOrderOut
from src.schemas import OrderItemStatusUpdate

kitchen_router = APIRouter(prefix="/kitchen", tags=["Kitchen"])

@kitchen_router.get(
    "/orders",
    response_model=List[KitchenOrderOut],
    summary="ดึงคิวออเดอร์สำหรับห้องครัว"
)
async def get_kitchen_orders(
    status: Optional[str] = None,                     # ?status=pending
    db: AsyncSession = Depends(get_db)
):

    # อนุญาต filter เฉพาะสถานะที่ครัวสนใจ
    allowed = {"pending", "preparing"}
    status_filter = {status.lower()} if status else allowed

    if not status_filter.issubset(allowed):
        raise HTTPException(status_code=400, detail="Invalid status filter")

    # JOIN order_items + menu เพื่อดึงชื่อเมนูครั้งเดียว
    stmt = (
        select(Order)
        .where(Order.status.in_(status_filter))
        .options(
            selectinload(Order.order_items)
            .selectinload(OrderItem.menu)           # join Menu
        )
        .order_by(Order.created_at)                 # คิวตามเวลา
    )

    result = await db.execute(stmt)
    orders = result.unique().scalars().all()        # unique() กันซ้ำจาก join
    return orders

@kitchen_router.patch(
    "/orders/{order_id}/item/{item_id}",
    response_model=dict,
    summary="เชฟอัปเดตสถานะจานอาหารย่อย"
)
async def update_item_status(
    order_id: int,
    item_id: int,
    payload: OrderItemStatusUpdate,
    db: AsyncSession = Depends(get_db)
):

    # ➊ ตรวจว่า order กับ item สัมพันธ์กันจริง
    stmt_item = (
        select(OrderItem)
        .where(OrderItem.id == item_id, OrderItem.order_id == order_id)
        .options(selectinload(OrderItem.menu))
    )
    result = await db.execute(stmt_item)
    item = result.scalars().first()
    if not item:
        raise HTTPException(404, "Order item not found")

    # ➋ อัปเดตสถานะ
    item.status = OrderItemStatus(payload.status)
    await db.commit()
    await db.refresh(item)

    # ➌ (ทางเลือก) — เช็กถ้าออเดอร์ทั้งก้อน cooked หมดแล้ว → เปลี่ยน order.status เป็น COOKED
    stmt_all = select(OrderItem).where(
        OrderItem.order_id == order_id,
        OrderItem.status.in_([OrderItemStatus.pending, OrderItemStatus.preparing])
    )
    if (await db.execute(stmt_all)).scalars().first() is None:
        order = await db.get(Order, order_id)
        order.status = "cooked"   # หรือ Enum OrderStatus.cooked
        await db.commit()

    return {"detail": "item status updated", "item_id": item.id, "status": item.status.value}