# src/routes/customers_router.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

# --- Local Imports ---
from ..config.database import get_db
from ..models import Reservation, User, Menu, OrderItem, OrderType, ReservationStatus
from ..schemas import (
    ReservationCreate, 
    ReservationUpdate, 
    ReservationOut, 
    TakeawayOrderCreate
)
# from ..middlewares.auth_middleware import require_role, get_current_user # หากต้องการใช้ auth

customers_router = APIRouter()

# ================================================================
#                       Reservations
# ================================================================

@customers_router.post("/reservations", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def create_dine_in_reservation(
    reservation_in: ReservationCreate, 
    db: AsyncSession = Depends(get_db)
    # current_user: User = Depends(get_current_user) # ดึง user ที่ login อยู่
):
    """
    สร้างการจองโต๊ะ/ห้องสำหรับทานที่ร้าน (Dine-in)
    """
    if not reservation_in.table_id and not reservation_in.room_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a table_id or a room_id must be provided for a dine-in reservation."
        )

    # หากไม่ได้ส่ง customer_id มา, สามารถใช้ id ของ user ที่ login อยู่ได้
    # customer_id = reservation_in.customer_id or current_user.id
    
    new_reservation = Reservation(
        **reservation_in.model_dump(),
        order_type=OrderType.DINE_IN,
        status=ReservationStatus.CONFIRMED # หรือ PENDING หากต้องการการยืนยัน
    )
    
    db.add(new_reservation)
    await db.commit()
    await db.refresh(new_reservation)
    
    # ดึงข้อมูลที่เกี่ยวข้องมาแสดงผลใน response
    stmt = (
        select(Reservation)
        .where(Reservation.id == new_reservation.id)
        .options(
            selectinload(Reservation.customer),
            selectinload(Reservation.table),
            selectinload(Reservation.room)
        )
    )
    result = await db.execute(stmt)
    created_reservation = result.scalars().first()
    
    return created_reservation


# ================================================================
#                       Takeaway Orders
# ================================================================

@customers_router.post("/orders/takeaway", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def create_takeaway_order(
    order_details: TakeawayOrderCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างออเดอร์สำหรับสั่งกลับบ้าน (Takeaway).
    ระบบจะสร้าง Reservation ที่มี order_type เป็น 'TAKEAWAY' โดยอัตโนมัติ
    """
    # สร้าง Reservation object สำหรับ Takeaway
    new_reservation = Reservation(
        guest_name=order_details.customer_name,
        guest_phone=order_details.customer_phone,
        reservation_time=datetime.now(),
        number_of_guests=0,
        status=ReservationStatus.CONFIRMED,
        order_type=OrderType.TAKEAWAY,
        pickup_time=order_details.expected_pickup_time,
        total_price=0
    )
    db.add(new_reservation)
    await db.flush() # เพื่อให้ได้ new_reservation.id ก่อนนำไปใช้

    total_price = 0
    for item_data in order_details.order_items:
        # ดึงข้อมูลเมนูเพื่อหาราคา
        menu_item = await db.get(Menu, item_data.menu_id)
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item with id {item_data.menu_id} not found")
        
        order_item_price = menu_item.price * item_data.quantity
        total_price += order_item_price

        new_order_item = OrderItem(
            reservation_id=new_reservation.id,
            menu_id=item_data.menu_id,
            quantity=item_data.quantity,
            price=order_item_price
        )
        db.add(new_order_item)

    new_reservation.total_price = total_price
    await db.commit()
    
    # ดึงข้อมูลทั้งหมดอีกครั้งเพื่อ return response ที่สมบูรณ์
    await db.refresh(new_reservation, ["order_items"])
    
    return new_reservation

# ================================================================
#                Get Reservation History / Status
# ================================================================

@customers_router.get("/reservations", response_model=List[ReservationOut])
async def get_all_reservations(
    status: Optional[ReservationStatus] = None,
    order_type: Optional[OrderType] = None,
    date: Optional[datetime] = Query(None, description="Filter by date e.g., 2025-06-22"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลการจองทั้งหมด สามารถกรองตามสถานะ, ประเภท, และวันที่ได้
    """
    stmt = (
        select(Reservation)
        .options(
            selectinload(Reservation.customer),
            selectinload(Reservation.table),
            selectinload(Reservation.room),
            selectinload(Reservation.order_items)
        )
        .order_by(Reservation.reservation_time.desc())
        .offset(skip).limit(limit)
    )

    if status:
        stmt = stmt.where(Reservation.status == status)
    if order_type:
        stmt = stmt.where(Reservation.order_type == order_type)
    if date:
        # กรองข้อมูลเฉพาะวันที่ที่ระบุ โดยไม่สนใจเวลา
        stmt = stmt.where(func.date(Reservation.reservation_time) == date.date())
        
    result = await db.execute(stmt)
    reservations = result.scalars().all()
    return reservations


@customers_router.get("/reservations/{reservation_id}", response_model=ReservationOut)
async def get_reservation_by_id(reservation_id: int, db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลการจองตาม ID พร้อมรายละเอียดทั้งหมด
    """
    stmt = (
        select(Reservation)
        .where(Reservation.id == reservation_id)
        .options(
            selectinload(Reservation.customer),
            selectinload(Reservation.table),
            selectinload(Reservation.room),
            selectinload(Reservation.order_items)
        )
    )
    result = await db.execute(stmt)
    reservation = result.scalars().first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@customers_router.patch("/reservations/{reservation_id}/cancel", response_model=ReservationOut)
async def cancel_reservation(reservation_id: int, db: AsyncSession = Depends(get_db)):
    """
    ยกเลิกการจอง
    """
    reservation = await db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.status not in [ReservationStatus.pending, ReservationStatus.checked_in]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel reservation with status '{reservation.status.value}'")
    
    reservation.status = ReservationStatus.cancelled
    await db.commit()
    await db.refresh(reservation)
    
    return reservation
