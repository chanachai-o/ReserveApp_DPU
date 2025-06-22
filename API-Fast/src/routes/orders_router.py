# src/routes/orders_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from decimal import Decimal

# --- Local Imports ---
from ..config.database import get_db
# เพิ่ม Notification model เข้ามา
from ..models import Order, OrderItem, Reservation, Menu, User, OrderStatus, MenuCategory, Notification
from ..schemas import OrderCreate, OrderUpdate, OrderOut
# from ..middlewares.auth_middleware import require_role

orders_router = APIRouter()

# ================================================================
#                       Helper Function
# ================================================================

async def get_full_order(order_id: int, db: AsyncSession) -> Optional[Order]:
    """
    Helper function to query an order with all its relationships eagerly loaded.
    """
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.user),
            selectinload(Order.reservation),
            selectinload(Order.order_items).options(
                selectinload(OrderItem.menu).selectinload(Menu.category)
            ),
            selectinload(Order.payments)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().unique().first()

# ================================================================
#                       Order Endpoints
# ================================================================

@orders_router.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_new_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างออเดอร์ใหม่ สามารถผูกกับ reservation ที่มีอยู่หรือสร้างเป็นออเดอร์ลอยๆ ก็ได้
    """
    user = await db.get(User, order_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {order_in.user_id} not found")

    if order_in.reservation_id:
        reservation = await db.get(Reservation, order_in.reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail=f"Reservation with id {order_in.reservation_id} not found")

    db_order = Order(
        user_id=order_in.user_id,
        reservation_id=order_in.reservation_id,
        status=order_in.status or OrderStatus.PENDING
    )
    db.add(db_order)
    await db.flush()

    total_amount = Decimal("0.0")
    order_item_objects = []

    for item_in in order_in.order_items:
        menu_item = await db.get(Menu, item_in.menu_id)
        if not menu_item or not menu_item.is_active:
            raise HTTPException(status_code=400, detail=f"Menu with ID {item_in.menu_id} is not available.")
        
        item_total_price = menu_item.price * item_in.quantity
        total_amount += item_total_price

        db_order_item = OrderItem(
            order_id=db_order.id,
            menu_id=item_in.menu_id,
            quantity=item_in.quantity,
            price=item_total_price,
            status=OrderStatus.PENDING
        )
        order_item_objects.append(db_order_item)

    db.add_all(order_item_objects)
    db_order.total_amount = total_amount
    
    # --- เพิ่มการสร้าง Notification ---
    notification_for_customer = Notification(
        user_id=db_order.user_id,
        title="รับออเดอร์แล้ว",
        message=f"เราได้รับออเดอร์ #{db_order.id} ของคุณแล้ว และกำลังส่งรายการอาหารไปที่ครัว",
        type="order_created"
    )
    db.add(notification_for_customer)
    # --- สิ้นสุดการสร้าง Notification ---
    
    await db.commit()
    
    return await get_full_order(db_order.id, db)


@orders_router.get("/orders", response_model=List[OrderOut])
async def get_all_orders(
    user_id: Optional[int] = None,
    status: Optional[OrderStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลออเดอร์ทั้งหมด สามารถกรองตาม user_id หรือ status
    """
    stmt = (
        select(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.reservation),
            selectinload(Order.order_items).options(
                selectinload(OrderItem.menu).selectinload(Menu.category)
            ),
            selectinload(Order.payments)
        )
        .order_by(Order.created_at.desc())
    )
    if user_id:
        stmt = stmt.where(Order.user_id == user_id)
    if status:
        stmt = stmt.where(Order.status == status)

    result = await db.execute(stmt)
    orders = result.scalars().unique().all()
    return orders


@orders_router.get("/orders/{order_id}", response_model=OrderOut)
async def get_order_by_id(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลออเดอร์ตาม ID
    """
    order = await get_full_order(order_id, db)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@orders_router.post("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    order_in: OrderUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    อัปเดตสถานะของออเดอร์ (เช่น จาก PENDING เป็น PREPARING)
    """
    db_order = await db.get(Order, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order_in.status is not None:
        db_order.status = order_in.status
        
        # --- เพิ่มการสร้าง Notification ตามสถานะ ---
        title = ""
        message = ""
        if order_in.status == OrderStatus.PREPARING:
            title = "กำลังเตรียมออเดอร์"
            message = f"ครัวกำลังเริ่มทำออเดอร์ #{db_order.id} ของคุณ"
        elif order_in.status == OrderStatus.READY:
            title = "อาหารพร้อมเสิร์ฟ"
            message = f"อาหารสำหรับออเดอร์ #{db_order.id} ของคุณพร้อมเสิร์ฟแล้ว"
        elif order_in.status == OrderStatus.CANCELLED:
            title = "ออเดอร์ถูกยกเลิก"
            message = f"ออเดอร์ #{db_order.id} ของคุณถูกยกเลิกแล้ว"

        if title and message:
            notification = Notification(
                user_id=db_order.user_id,
                title=title,
                message=message,
                type="order_status_update"
            )
            db.add(notification)
        # --- สิ้นสุดการสร้าง Notification ---

    await db.commit()
    return await get_full_order(order_id, db)


@orders_router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    ลบออเดอร์ (สำหรับ Admin/Manager)
    """
    db_order = await db.get(Order, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.delete(db_order)
    await db.commit()
    return None
