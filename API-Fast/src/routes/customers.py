# src/routes/customers_router.py (ฉบับปรับปรุงตาม Schemas ล่าสุด)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from decimal import Decimal

# --- Local Imports ---
from ..config.database import get_db
from ..models import Reservation, Order, OrderItem, Menu, User, Table, Room, OrderStatus
from ..schemas import ReservationCreate, ReservationOut, OrderCreate, OrderOut
# from ..middlewares.auth_middleware import get_current_user # หากต้องการใช้ auth

customers_router = APIRouter()

# ================================================================
#                       Reservations Endpoint
# ================================================================

@customers_router.post("/reservations", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    reservation_in: ReservationCreate, 
    db: AsyncSession = Depends(get_db)
    # current_user: User = Depends(get_current_user) # สามารถใช้ user ที่ login อยู่ได้
):
    """
    สร้างการจองโต๊ะหรือห้อง (Dine-in Reservation).
    - ต้องระบุ user_id ของลูกค้า
    - ต้องระบุ table_id หรือ room_id อย่างน้อยหนึ่งอย่าง
    """
    # ตรวจสอบว่ามี user อยู่จริงหรือไม่
    user = await db.get(User, reservation_in.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # ตรวจสอบว่ามีการเลือกโต๊ะหรือห้อง
    if not reservation_in.table_id and not reservation_in.room_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a table_id or a room_id must be provided for a reservation."
        )

    # TODO: ควรเพิ่ม Logic ตรวจสอบว่าโต๊ะหรือห้องว่างในช่วงเวลาที่จองหรือไม่

    db_reservation = Reservation(**reservation_in.model_dump())
    db.add(db_reservation)
    await db.commit()
    
    # Eager load relationships เพื่อให้ response สมบูรณ์
    await db.refresh(db_reservation, ["customer", "table", "room"])
    
    return db_reservation

# ================================================================
#                       Orders Endpoint
# ================================================================

@customers_router.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างออเดอร์ใหม่ (สำหรับสั่งอาหาร)
    - สามารถผูกกับ reservation_id ที่มีอยู่ (สำหรับลูกค้าที่จองโต๊ะ)
    - หรือสร้างเป็นออเดอร์ลอยๆ (สำหรับ Takeaway หรือ Walk-in)
    """
    # ตรวจสอบว่า user_id มีอยู่จริง
    user = await db.get(User, order_in.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # ถ้ามี reservation_id, ตรวจสอบว่ามีอยู่จริง
    if order_in.reservation_id:
        reservation = await db.get(Reservation, order_in.reservation_id)
        if not reservation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")

    # สร้าง Order หลัก
    db_order = Order(
        user_id=order_in.user_id,
        reservation_id=order_in.reservation_id,
        status=OrderStatus.PENDING
    )
    db.add(db_order)
    await db.flush() # เพื่อให้ได้ db_order.id

    total_amount = Decimal("0.0")
    
    # วนลูปสร้าง OrderItem
    for item_in in order_in.order_items:
        menu_item = await db.get(Menu, item_in.menu_id)
        if not menu_item or not menu_item.is_available:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Menu item with ID {item_in.menu_id} is not available.")
        
        # ราคาของรายการ = ราคาต่อหน่วย * จำนวน
        item_total_price = menu_item.price * item_in.quantity
        total_amount += item_total_price

        # สร้าง OrderItem และผูกกับ Order
        db_order_item = OrderItem(
            order_id=db_order.id,
            menu_id=item_in.menu_id,
            quantity=item_in.quantity,
            price=item_total_price, # บันทึกราคารวมของรายการนี้
            status=OrderStatus.PENDING # ใช้ OrderStatus จาก models
        )
        db.add(db_order_item)

    # อัปเดตราคารวมใน Order หลัก
    db_order.total_amount = total_amount
    
    await db.commit()
    
    # Query ข้อมูลทั้งหมดกลับมาเพื่อ return response ที่สมบูรณ์
    stmt = (
        select(Order)
        .where(Order.id == db_order.id)
        .options(
            selectinload(Order.user),
            selectinload(Order.order_items).selectinload(OrderItem.menu),
            selectinload(Order.payments)
        )
    )
    result = await db.execute(stmt)
    final_order = result.scalars().first()

    return final_order
