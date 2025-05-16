# src/routers/waiter.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.models import (
    User, UserRole,
    Order, OrderStatus,
    OrderItem, OrderItemStatus
)
from src.schemas import DeliverItem, DeliverOrder

waiter_router = APIRouter(prefix="/waiter", tags=["Waiter"])

# ────────────────────────────── จานเดี่ยว
@waiter_router.patch(
    "/orders/{order_id}/item/{item_id}/deliver",
    response_model=dict,
    summary="พนักงานกดรับ–เสิร์ฟจานเดี่ยว"
)
async def deliver_order_item(
    order_id: int,
    item_id: int,
    _payload: DeliverItem,                    # เผื่ออนาคตส่ง note
    db: AsyncSession = Depends(get_db)
):

    stmt = select(OrderItem).where(
        OrderItem.id == item_id,
        OrderItem.order_id == order_id
    )
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(404, "Item not found")

    if item.status != OrderItemStatus.cooked:
        raise HTTPException(400, "Item not ready to serve")

    item.status = OrderItemStatus.served
    await db.commit()

    # ถ้าต้องการ push-notify → ส่ง event WebSocket ตรงนี้
    return {"detail": "served", "item_id": item.id}


# ────────────────────────────── ทั้งบิล
@waiter_router.patch(
    "/orders/{order_id}/deliver",
    response_model=dict,
    summary="พนักงานกด เสิร์ฟครบทั้งบิล"
)
async def deliver_whole_order(
    order_id: int,
    _payload: DeliverOrder,
    db: AsyncSession = Depends(get_db)
):

    # ดึงบิล + item
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.order_items))
    )
    order = (await db.execute(stmt)).scalars().first()
    if not order:
        raise HTTPException(404, "Order not found")

    # เงื่อนไข: ทุกเมนูต้อง status=COOKED หรือ SERVED
    unready = [
        it for it in order.order_items
        if it.status not in {OrderItemStatus.cooked,
                             OrderItemStatus.served}
    ]
    if unready:
        raise HTTPException(
            400,
            "Some items are not ready: "
            + ", ".join(str(u.id) for u in unready)
        )

    # เปลี่ยนทุก item ที่ยัง COOKED → SERVED
    for it in order.order_items:
        if it.status == OrderItemStatus.cooked:
            it.status = OrderItemStatus.served

    order.status = OrderStatus.served
    await db.commit()
    return {"detail": "order served", "order_id": order.id}
