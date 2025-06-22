# src/routes/reservations_router.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

# --- Local Imports ---
from ..config.database import get_db
# เพิ่ม Notification model เข้ามา
from ..models import Reservation, User, Table, Room, Order, OrderItem, Payment, ReservationStatus, TableStatus, RoomStatus, Notification
from ..schemas import ReservationCreate, ReservationUpdate, ReservationOut, OrderOut, PaymentOut
# from ..middlewares.auth_middleware import require_role # หากต้องการใช้ auth

reservations_router = APIRouter()

# ================================================================
#                       Helper Function
# ================================================================

async def get_full_reservation(reservation_id: int, db: AsyncSession) -> Optional[Reservation]:
    """
    Helper function to query a reservation with all its relationships eagerly loaded.
    """
    stmt = (
        select(Reservation)
        .where(Reservation.id == reservation_id)
        .options(
            selectinload(Reservation.customer),
            selectinload(Reservation.table),
            selectinload(Reservation.room),
            selectinload(Reservation.orders).options(
                selectinload(Order.order_items).selectinload(OrderItem.menu),
                selectinload(Order.payments)
            )
        )
    )
    result = await db.execute(stmt)
    return result.scalars().unique().first()


# ================================================================
#                       Reservation Endpoints
# ================================================================

@reservations_router.post("/reservations", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def create_new_reservation(
    reservation_in: ReservationCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างการจองโต๊ะหรือห้องใหม่ (Dine-in Reservation)
    """
    # --- เพิ่มการตรวจสอบ Foreign Key ---
    user = await db.get(User, reservation_in.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {reservation_in.user_id} not found")

    if not reservation_in.table_id and not reservation_in.room_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Either table_id or room_id must be provided.")

    if reservation_in.table_id:
        table = await db.get(Table, reservation_in.table_id)
        if not table:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Table with id {reservation_in.table_id} not found")

    if reservation_in.room_id:
        room = await db.get(Room, reservation_in.room_id)
        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Room with id {reservation_in.room_id} not found")
    
    # TODO: เพิ่ม Logic ตรวจสอบว่าโต๊ะ/ห้องว่างในช่วงเวลาที่ต้องการหรือไม่

    db_reservation = Reservation(**reservation_in.model_dump())
    db.add(db_reservation)
    
    # --- เพิ่มการสร้าง Notification ---
    reservation_time_str = db_reservation.start_time.strftime('%d %b %Y, %H:%M')
    notification_for_customer = Notification(
        user_id=db_reservation.user_id,
        title="การจองของคุณได้รับการยืนยัน",
        message=f"การจองสำหรับวันที่ {reservation_time_str} ได้รับการยืนยันเรียบร้อยแล้ว",
        type="reservation_confirmed"
    )
    db.add(notification_for_customer)
    # --- สิ้นสุดการสร้าง Notification ---

    await db.commit()
    
    # แก้ไข: re-query ข้อมูลทั้งหมดเพื่อป้องกัน MissingGreenlet error
    return await get_full_reservation(db_reservation.id, db)


@reservations_router.get("/reservations", response_model=List[ReservationOut])
async def get_all_reservations(
    user_id: Optional[int] = None,
    status: Optional[ReservationStatus] = None,
    table_id: Optional[int] = None,
    room_id: Optional[int] = None,
    start_time: Optional[datetime] = Query(None, description="Filter reservations starting after this time"),
    end_time: Optional[datetime] = Query(None, description="Filter reservations ending before this time"),
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลการจองทั้งหมด พร้อมความสามารถในการกรองข้อมูล
    """
    stmt = (
        select(Reservation)
        .options(
            selectinload(Reservation.customer),
            selectinload(Reservation.table),
            selectinload(Reservation.room),
            selectinload(Reservation.orders).options(
                selectinload(Order.order_items).selectinload(OrderItem.menu),
                selectinload(Order.payments)
            )
        )
        .order_by(Reservation.start_time.desc())
    )

    if user_id:
        stmt = stmt.where(Reservation.user_id == user_id)
    if status:
        stmt = stmt.where(Reservation.status == status)
    if table_id:
        stmt = stmt.where(Reservation.table_id == table_id)
    if room_id:
        stmt = stmt.where(Reservation.room_id == room_id)
    if start_time:
        stmt = stmt.where(Reservation.start_time >= start_time)
    if end_time:
        stmt = stmt.where(Reservation.end_time <= end_time)

    result = await db.execute(stmt)
    reservations = result.scalars().unique().all()
    
    return reservations


@reservations_router.get("/reservations/{reservation_id}", response_model=ReservationOut)
async def get_reservation_by_id(
    reservation_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลการจองตาม ID พร้อมรายละเอียดทั้งหมด
    """
    reservation = await get_full_reservation(reservation_id, db)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@reservations_router.put("/reservations/{reservation_id}", response_model=ReservationOut)
async def update_reservation_details(
    reservation_id: int,
    reservation_in: ReservationUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    อัปเดตรายละเอียดการจอง เช่น เวลา, จำนวนคน หรือสถานะ
    """
    db_reservation = await db.get(Reservation, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    update_data = reservation_in.model_dump(exclude_unset=True)
    
    if 'table_id' in update_data and update_data['table_id'] is not None:
        table = await db.get(Table, update_data['table_id'])
        if not table:
            raise HTTPException(status_code=404, detail=f"Table with id {update_data['table_id']} not found")
            
    if 'room_id' in update_data and update_data['room_id'] is not None:
        room = await db.get(Room, update_data['room_id'])
        if not room:
            raise HTTPException(status_code=404, detail=f"Room with id {update_data['room_id']} not found")

    for key, value in update_data.items():
        setattr(db_reservation, key, value)
    
    # --- เพิ่มการสร้าง Notification เมื่อสถานะเปลี่ยน ---
    if 'status' in update_data:
        new_status = update_data['status']
        notification = Notification(
            user_id=db_reservation.user_id,
            title=f"การจองของคุณอัปเดตแล้ว",
            message=f"สถานะการจอง #{db_reservation.id} ได้เปลี่ยนเป็น {new_status.value}",
            type="reservation_update"
        )
        db.add(notification)
    # --- สิ้นสุดการสร้าง Notification ---
        
    await db.commit()
    
    return await get_full_reservation(reservation_id, db)


@reservations_router.post("/{reservation_id}/checkin", response_model=ReservationOut)
async def checkin_reservation(reservation_id: int, db: AsyncSession = Depends(get_db)):
    """
    ทำการ Check-in สำหรับการจอง
    """
    reservation = await db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.status != ReservationStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Reservation must be PENDING to check-in. Current status: {reservation.status.value}")

    reservation.status = ReservationStatus.CHECKED_IN
    
    if reservation.table_id:
        table = await db.get(Table, reservation.table_id)
        if table:
            table.status = TableStatus.occupied
    elif reservation.room_id:
        room = await db.get(Room, reservation.room_id)
        if room:
            room.status = RoomStatus.occupied
    
    # --- เพิ่มการสร้าง Notification ---
    notification = Notification(
        user_id=reservation.user_id,
        title="เช็คอินสำเร็จ",
        message=f"คุณได้ทำการเช็คอินสำหรับการจอง #{reservation.id} เรียบร้อยแล้ว",
        type="check_in"
    )
    db.add(notification)
    # --- สิ้นสุดการสร้าง Notification ---
            
    await db.commit()
    
    return await get_full_reservation(reservation_id, db)


@reservations_router.post("/{reservation_id}/checkout", response_model=ReservationOut)
async def checkout_reservation(reservation_id: int, db: AsyncSession = Depends(get_db)):
    """
    ทำการ Check-out และเสร็จสิ้นการจอง
    """
    reservation = await db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.status != ReservationStatus.CHECKED_IN:
        raise HTTPException(status_code=400, detail=f"Reservation must be CHECKED_IN to check-out. Current status: {reservation.status.value}")

    # TODO: ควรเพิ่ม Logic ตรวจสอบว่าทุกรายการชำระเงิน (payments) เรียบร้อยแล้วหรือไม่

    reservation.status = ReservationStatus.COMPLETED
    
    if reservation.table_id:
        table = await db.get(Table, reservation.table_id)
        if table:
            table.status = TableStatus.available
    elif reservation.room_id:
        room = await db.get(Room, reservation.room_id)
        if room:
            room.status = RoomStatus.available

    # --- เพิ่มการสร้าง Notification ---
    notification = Notification(
        user_id=reservation.user_id,
        title="ขอบคุณที่ใช้บริการ",
        message=f"การเช็คเอาท์ของคุณเสร็จสมบูรณ์ ขอบคุณที่มาใช้บริการกับเรา",
        type="check_out"
    )
    db.add(notification)
    # --- สิ้นสุดการสร้าง Notification ---
            
    await db.commit()
    
    return await get_full_reservation(reservation_id, db)


@reservations_router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reservation(reservation_id: int, db: AsyncSession = Depends(get_db)):
    """
    ลบการจอง (สำหรับ Admin/Manager)
    """
    reservation = await db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # --- เพิ่มการสร้าง Notification ก่อนลบ ---
    # เราต้องสร้างและ commit notification ก่อนที่จะลบ reservation เพราะ user_id จะหายไป
    if reservation.user_id:
        notification = Notification(
            user_id=reservation.user_id,
            title="การจองถูกยกเลิก",
            message=f"การจอง #{reservation.id} ของคุณได้ถูกยกเลิกโดยผู้ดูแลระบบ",
            type="reservation_cancelled_by_admin"
        )
        db.add(notification)
        await db.commit()
    # --- สิ้นสุดการสร้าง Notification ---

    await db.delete(reservation)
    await db.commit()
    return None
