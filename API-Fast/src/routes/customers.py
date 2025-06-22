# src/routes/customers_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from decimal import Decimal

# --- Local Imports ---
from ..config.database import get_db
from ..models import Reservation, Order, OrderItem, Menu, User, Table, Room, OrderStatus, UserRole
from ..schemas import ReservationCreate, ReservationOut, TakeawayOrderCreate, OrderOut
# from ..middlewares.auth_middleware import get_current_user
# from passlib.context import CryptContext # หากต้องการสร้าง user on-the-fly

customers_router = APIRouter()
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ================================================================
#           Helper Function to get or create a guest user
# ================================================================
async def get_or_create_guest_user(phone: str, name: str, db: AsyncSession) -> User:
    """
    Finds a user by phone number. If not found, creates a new guest user.
    """
    stmt = select(User).where(User.phone == phone)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        # หากไม่เจอ user, สร้าง user ใหม่สำหรับ guest
        # หมายเหตุ: ในระบบจริง อาจจะต้องมีการจัดการรหัสผ่านที่ดีกว่านี้
        # hashed_password = pwd_context.hash("default_password_for_guest")
        # new_guest_user = User(
        #     name=name,
        #     phone=phone,
        #     role=UserRole.customer,
        #     hashed_password=hashed_password,
        #     is_active=True
        # )
        # db.add(new_guest_user)
        # await db.commit()
        # await db.refresh(new_guest_user)
        # return new_guest_user
        
        # สำหรับตอนนี้ หากไม่เจอ user ให้โยน error เพื่อให้ลงทะเบียนก่อน
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with phone number {phone} not found. Please register first."
        )
    return user

# ================================================================
#                       Dine-in Reservation
# ================================================================
@customers_router.post("/reservations", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def create_dine_in_reservation(
    reservation_in: ReservationCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างการจองโต๊ะหรือห้องสำหรับทานที่ร้าน (Dine-in Reservation).
    """
    # ตรวจสอบความถูกต้องของข้อมูล
    user = await db.get(User, reservation_in.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not reservation_in.table_id and not reservation_in.room_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Either a table_id or a room_id must be provided.")

    # TODO: เพิ่ม Logic ตรวจสอบว่าโต๊ะหรือห้องว่างในช่วงเวลาที่จองหรือไม่

    db_reservation = Reservation(**reservation_in.model_dump())
    db.add(db_reservation)
    await db.commit()
    await db.refresh(db_reservation, ["customer", "table", "room"])
    return db_reservation

# ================================================================
#                       Takeaway Order (เพิ่มใหม่)
# ================================================================
@customers_router.post("/orders/takeaway", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_takeaway_order(
    order_in: TakeawayOrderCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างออเดอร์สำหรับสั่งกลับบ้าน (Takeaway)
    - ระบบจะค้นหาลูกค้าจากเบอร์โทรศัพท์
    - หากไม่เจอ จะแจ้งให้ลงทะเบียนก่อน
    - ออเดอร์ประเภทนี้จะไม่มี reservation_id
    """
    # 1. ค้นหาหรือสร้าง User สำหรับ Guest
    guest_user = await get_or_create_guest_user(phone=order_in.customer_phone, name=order_in.customer_name, db=db)

    # 2. สร้าง Order หลักโดยไม่ผูกกับ Reservation
    db_order = Order(
        user_id=guest_user.id,
        reservation_id=None, # ไม่มี reservation
        status=OrderStatus.PENDING
    )
    db.add(db_order)
    await db.flush()

    total_amount = Decimal("0.0")
    
    # 3. วนลูปสร้าง OrderItem
    for item_data in order_in.order_items:
        menu_item = await db.get(Menu, item_data.menu_id)
        if not menu_item or not menu_item.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Menu with ID {item_data.menu_id} is not available.")
        
        item_total_price = menu_item.price * item_data.quantity
        total_amount += item_total_price

        db_order_item = OrderItem(
            order_id=db_order.id,
            menu_id=item_data.menu_id,
            quantity=item_data.quantity,
            price=item_total_price,
            status=OrderStatus.PENDING
        )
        db.add(db_order_item)

    # 4. อัปเดตราคารวมและบันทึก
    db_order.total_amount = total_amount
    await db.commit()

    # 5. Query ข้อมูลทั้งหมดกลับมาเพื่อ return response ที่สมบูรณ์
    stmt = (
        select(Order)
        .where(Order.id == db_order.id)
        .options(
            selectinload(Order.user),
            selectinload(Order.order_items).selectinload(OrderItem.menu).selectinload(Menu.category),
            # --- แก้ไขจุดนี้: เพิ่มการโหลด payments ---
            selectinload(Order.payments) 
        )
    )
    result = await db.execute(stmt)
    final_order = result.scalars().first()
    
    return final_order
