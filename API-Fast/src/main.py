from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
import os
import logging
from .routes import file_upload_router
from .routes.store_router import store_router
from .routes.customers import customers_router
from .routes.kitchen import kitchen_router
from .routes.waiter import waiter_router
# Import AsyncSession จาก sqlalchemy.ext.asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi.middleware.cors import CORSMiddleware
from .utils.notifier import trigger_notification
from sqlalchemy import select, delete
# สมมติว่าใน config.database มีการสร้าง engine และ get_db แบบ async
from src.config.database import engine, get_db

from .models import Base, User, Table, Room, Reservation, Menu, Order, OrderItem, Payment,TableStatus
from .schemas import (
    UserCreate, UserUpdate, UserOut,
    TableCreate, TableUpdate, TableOut,
    RoomCreate, RoomUpdate, RoomOut,
    ReservationCreate, ReservationUpdate, ReservationOut,
    MenuCreate, MenuUpdate, MenuOut,
    OrderCreate, OrderUpdate, OrderOut,
    PaymentCreate, PaymentOut, PaymentVerify ,TableQuickStatus
)
from src.schemas import RoomQuickStatus
from src.models import RoomStatus


logging.basicConfig(level=logging.DEBUG)
app = FastAPI()

# เพิ่ม CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:4201",
        "https://61a8-49-228-101-141.ngrok-free.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# สร้างตารางในฐานข้อมูลแบบ async เมื่อแอปเริ่มทำงาน
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

UPLOAD_DIR = "./uploaded_images"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def get_current_active_user():
    # ตัวอย่าง placeholder – ควร implement JWT หรือวิธีการ auth ที่ปลอดภัย
    pass
app.mount("/images", StaticFiles(directory=UPLOAD_DIR), name="images")
### Authentication Endpoints
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/login")
async def login(phone: str, password: str, db: AsyncSession = Depends(get_db)):
    # ตัวอย่าง: ใช้ select(...) แทน db.query
    stmt = select(User).where(User.phone == phone)
    result = await db.execute(stmt)
    user = result.scalars().first()

    # ตรวจสอบ user / password
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # เปรียบเทียบ password (ควรใช้ hashing จริงจัง)
    # ...

    return user

@auth_router.post("/logout")
async def logout(token: str):
    # logic สำหรับ logout (เช่น ลบ token จาก blacklist)
    return {"detail": "Logged out successfully"}

### User Endpoints
users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@users_router.get("/", response_model=List[UserOut])
async def get_users(role: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    result = await db.execute(stmt)
    return result.scalars().all()

@users_router.post("/", response_model=UserOut)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    fake_hashed_password = "fakehashed" + user.password
    db_user = User(
        phone=user.phone,
        name=user.name,
        role=user.role,
        hashed_password=fake_hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@users_router.put("/{id}", response_model=UserOut)
async def update_user(id: int, user: UserUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == id)
    result = await db.execute(stmt)
    db_user = result.scalars().first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user

@users_router.delete("/{id}")
async def delete_user(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == id)
    result = await db.execute(stmt)
    db_user = result.scalars().first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(db_user)
    await db.commit()
    return {"detail": "User deleted"}

### Tables Endpoints
tables_router = APIRouter(prefix="/tables", tags=["Tables"])

@tables_router.get("/", response_model=List[TableOut])
async def get_tables(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Table)
    if status:
        stmt = stmt.where(Table.status == status)
    result = await db.execute(stmt)
    return result.scalars().all()

@tables_router.post("/", response_model=TableOut)
async def create_table(table: TableCreate, db: AsyncSession = Depends(get_db)):
    new_table = Table(**table.dict())
    db.add(new_table)
    await db.commit()
    await db.refresh(new_table)
    return new_table

@tables_router.put("/{id}", response_model=TableOut)
async def update_table(id: int, table: TableUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(Table).where(Table.id == id)
    result = await db.execute(stmt)
    db_table = result.scalars().first()

    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")

    for key, value in table.dict(exclude_unset=True).items():
        setattr(db_table, key, value)

    await db.commit()
    await db.refresh(db_table)
    return db_table

@tables_router.delete("/{id}")
async def delete_table(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Table).where(Table.id == id)
    result = await db.execute(stmt)
    db_table = result.scalars().first()

    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")

    await db.delete(db_table)
    await db.commit()
    return {"detail": "Table deleted"}

@tables_router.patch("/{table_id}/status", response_model=TableOut)
async def quick_change_table_status(
    table_id: int,
    payload: TableQuickStatus,
    db: AsyncSession = Depends(get_db)
):
    """เปลี่ยนสถานะโต๊ะรวดเร็ว (cleaning / maintenance / occupied …)"""

    stmt = select(Table).where(Table.id == table_id)
    result = await db.execute(stmt)
    table = result.scalars().first()
    if not table:
        raise HTTPException(404, "Table not found")

    table.status = TableStatus(payload.status)
    await db.commit()
    await db.refresh(table)
    return table

### Rooms Endpoints
rooms_router = APIRouter(prefix="/rooms", tags=["Rooms"])

@rooms_router.get("/", response_model=List[RoomOut])
async def get_rooms(db: AsyncSession = Depends(get_db)):
    stmt = select(Room)
    result = await db.execute(stmt)
    return result.scalars().all()

@rooms_router.post("/", response_model=RoomOut)
async def create_room(room: RoomCreate, db: AsyncSession = Depends(get_db)):
    new_room = Room(**room.dict())
    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)
    return new_room

@rooms_router.put("/{id}", response_model=RoomOut)
async def update_room(id: int, room: RoomUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(Room).where(Room.id == id)
    result = await db.execute(stmt)
    db_room = result.scalars().first()

    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    for key, value in room.dict(exclude_unset=True).items():
        setattr(db_room, key, value)

    await db.commit()
    await db.refresh(db_room)
    return db_room

@rooms_router.delete("/{id}")
async def delete_room(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Room).where(Room.id == id)
    result = await db.execute(stmt)
    db_room = result.scalars().first()

    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    await db.delete(db_room)
    await db.commit()
    return {"detail": "Room deleted"}

@rooms_router.patch("/{room_id}/status", response_model=RoomOut)
async def quick_change_room_status(
    room_id: int,
    payload: RoomQuickStatus,
    db: AsyncSession = Depends(get_db)
):
    """เปลี่ยนสถานะห้องรวดเร็ว (cleaning / maintenance / occupied …)"""

    stmt = select(Room).where(Room.id == room_id)
    result = await db.execute(stmt)
    room = result.scalars().first()
    if not room:
        raise HTTPException(404, "Room not found")

    room.status = RoomStatus(payload.status)
    await db.commit()
    await db.refresh(room)
    return room


### Reservations Endpoints
reservations_router = APIRouter(prefix="/reservations", tags=["Reservations"])

@reservations_router.get("/", response_model=List[ReservationOut])
async def get_reservations(user: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Reservation)
        .options(
            selectinload(Reservation.user),
            selectinload(Reservation.table),
            selectinload(Reservation.room),
            selectinload(Reservation.orders).selectinload(Order.order_items).selectinload(OrderItem.menu),
            selectinload(Reservation.orders).selectinload(Order.payments),
        )
    )
    result = await db.execute(stmt)
    reservations = result.scalars().all()

    reservation_out_list = []
    for r in reservations:
        # รวม payments ของ order ทั้งหมดใน reservation นี้
        payments = []
        for o in r.orders:
            if o.payments:
                payments.extend(o.payments)
        # แปลง reservation เป็น dict แล้วแปะ payments
        r_dict = ReservationOut.from_orm(r).dict()
        r_dict['payments'] = [PaymentOut.from_orm(p) for p in payments] if payments else None
        reservation_out_list.append(r_dict)
    return reservation_out_list

@reservations_router.post("/", response_model=ReservationOut)
async def create_reservation(
    reservation: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 1. หา user_id
    if not reservation.table_id and not reservation.room_id:
        raise HTTPException(400, detail="ต้องเลือกอย่างน้อย 1 ระหว่างโต๊ะหรือห้อง")
    if reservation.phone:
        result = await db.execute(select(User).where(User.phone == reservation.phone))
        user = result.scalars().first()
        if not user:
            raise HTTPException(404, detail="No user found for this phone number")
        user_id = user.id
    elif reservation.user_id:
        user_id = reservation.user_id
    else:
        user_id = current_user.id

    # 2. สร้าง reservation
    new_reservation = Reservation(
        **reservation.dict(exclude={"user_id", "phone"}),
        user_id=user_id
    )
    db.add(new_reservation)
    await db.commit()
    await db.refresh(new_reservation)

    # 3. ส่ง noti (ดึงชื่อ)
    manager_or_staff_id = 1  # หรือ logic หา staff จริง
    table_no = f"{new_reservation.table_id or new_reservation.room_id or '-'}"
    if reservation.phone:
        result = await db.execute(select(User).where(User.phone == reservation.phone))
        user = result.scalars().first()
        customer_name = user.name if user else "ลูกค้า"
    elif reservation.user_id:
        user_id = reservation.user_id
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        customer_name = user.name if user else "ลูกค้า"
    else:
        customer_name = current_user.name

    await trigger_notification(
        db,
        user_id=manager_or_staff_id,
        title="มีการจองใหม่",
        message=f"ลูกค้า {customer_name} จองโต๊ะ/ห้องหมายเลข {table_no} เวลา {reservation.start_time}",
        type="reservation"
    )

    # 4. 🔥 Query preload relation (user, table, room, orders) ก่อน return
    stmt = (
        select(Reservation)
        .where(Reservation.id == new_reservation.id)
        .options(
            selectinload(Reservation.user),
            selectinload(Reservation.table),
            selectinload(Reservation.room),
            selectinload(Reservation.orders).selectinload(Order.order_items).selectinload(OrderItem.menu),
        )
    )
    result = await db.execute(stmt)
    reservation_with_rel = result.scalars().first()
    return ReservationOut.from_orm(reservation_with_rel)


@reservations_router.put("/{id}", response_model=ReservationOut)
async def update_reservation(id: int, reservation: ReservationUpdate, db: AsyncSession = Depends(get_db)):
    # หา reservation เดิม
    stmt = select(Reservation).where(Reservation.id == id)
    result = await db.execute(stmt)
    db_reservation = result.scalars().first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    for key, value in reservation.dict(exclude_unset=True).items():
        setattr(db_reservation, key, value)
    await db.commit()
    await db.refresh(db_reservation)

    # QUERY ใหม่ preload relation
    stmt = (
        select(Reservation)
        .where(Reservation.id == id)
        .options(
            selectinload(Reservation.user),
            selectinload(Reservation.table),
            selectinload(Reservation.room),
            selectinload(Reservation.orders).selectinload(Order.order_items).selectinload(OrderItem.menu)
        )
    )
    result = await db.execute(stmt)
    updated_reservation = result.scalars().first()
    return ReservationOut.from_orm(updated_reservation)


@reservations_router.delete("/{id}")
async def delete_reservation(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Reservation).where(Reservation.id == id)
    result = await db.execute(stmt)
    db_reservation = result.scalars().first()

    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    await db.delete(db_reservation)
    await db.commit()
    return {"detail": "Reservation deleted"}

@reservations_router.post("/{id}/checkin")
async def checkin_reservation(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Reservation).where(Reservation.id == id)
    result = await db.execute(stmt)
    db_reservation = result.scalars().first()

    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    db_reservation.status = "checked_in"
    await db.commit()
    return {"detail": "Checked in successfully"}

@reservations_router.post("/{id}/checkout")
async def checkout_reservation(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Reservation).where(Reservation.id == id)
    result = await db.execute(stmt)
    db_reservation = result.scalars().first()

    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    db_reservation.status = "completed"
    await db.commit()
    return {"detail": "Checked out successfully"}

### Menus Endpoints
menus_router = APIRouter(prefix="/menus", tags=["Menus"])

@menus_router.get("/", response_model=List[MenuOut])
async def get_menus(db: AsyncSession = Depends(get_db)):
    stmt = select(Menu)
    result = await db.execute(stmt)
    return result.scalars().all()

@menus_router.post("/", response_model=MenuOut)
async def create_menu(menu: MenuCreate, db: AsyncSession = Depends(get_db)):
    new_menu = Menu(**menu.dict())
    db.add(new_menu)
    await db.commit()
    await db.refresh(new_menu)
    return new_menu

@menus_router.put("/{id}", response_model=MenuOut)
async def update_menu(id: int, menu: MenuUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(Menu).where(Menu.id == id)
    result = await db.execute(stmt)
    db_menu = result.scalars().first()

    if not db_menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    for key, value in menu.dict(exclude_unset=True).items():
        setattr(db_menu, key, value)

    await db.commit()
    await db.refresh(db_menu)
    return db_menu

@menus_router.delete("/{id}")
async def delete_menu(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Menu).where(Menu.id == id)
    result = await db.execute(stmt)
    db_menu = result.scalars().first()

    if not db_menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    await db.delete(db_menu)
    await db.commit()
    return {"detail": "Menu deleted"}

### Orders Endpoints
orders_router = APIRouter(prefix="/orders", tags=["Orders"])

@orders_router.get("/", response_model=List[OrderOut])
async def get_orders(user: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Order)
        .options(selectinload(Order.order_items))  # ✅ preload order_items
    )
    if user:
        stmt = stmt.where(Order.user_id == user)

    result = await db.execute(stmt)
    orders = result.scalars().all()

    return [OrderOut.from_orm(order) for order in orders]  # ✅ convert to Pydantic safely

@orders_router.get("/{id}", response_model=OrderOut)
async def get_order(id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Order)
        .where(Order.id == id)
        .options(selectinload(Order.order_items))  # ✅ preload relationship
    )
    result = await db.execute(stmt)
    order = result.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return OrderOut.from_orm(order)  # ✅ ปลอดภัยสำหรับ Pydantic

@orders_router.post("/", response_model=OrderOut)
async def create_or_update_order(
    order: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    target_user_id = order.user_id or current_user.id

    # 1. หา Order เดิมใน reservation_id นี้ (ยังไม่จบ หรือสถานะ 'pending', 'preparing' อะไรก็ว่าไป)
    stmt = (
        select(Order)
        .where(Order.reservation_id == order.reservation_id)
        .options(selectinload(Order.order_items))
    )
    result = await db.execute(stmt)
    existing_order = result.scalars().first()

    total_amount = 0
    order_items_data = []

    # 2. คำนวณยอดรวมใหม่จาก order.items
    for item in order.items:
        menu = (await db.execute(select(Menu).where(Menu.id == item.menu_id))).scalars().first()
        if not menu:
            raise HTTPException(status_code=404, detail=f"Menu ID {item.menu_id} not found")
        total_amount += menu.price * item.quantity
        order_items_data.append((item.menu_id, item.quantity, getattr(item, "status", "pending")))

    if existing_order:
        await db.execute(delete(OrderItem).where(OrderItem.order_id == existing_order.id))
        for menu_id, quantity, status in order_items_data:
            db.add(OrderItem(
                order_id=existing_order.id,
                menu_id=menu_id,
                quantity=quantity,
                status=status  # เพิ่ม status
            ))
        existing_order.total_amount = total_amount
        existing_order.status = order.status if hasattr(order, "status") else "pending"
        await db.commit()
        await db.refresh(existing_order)
        order_obj = existing_order
    else:
        new_order = Order(
            user_id=target_user_id,
            reservation_id=order.reservation_id,
            status="pending",
            total_amount=total_amount
        )
        db.add(new_order)
        await db.commit()
        await db.refresh(new_order)
        for menu_id, quantity, status in order_items_data:
            db.add(OrderItem(
                order_id=new_order.id,
                menu_id=menu_id,
                quantity=quantity,
                status=status  # เพิ่ม status
            ))
        await db.commit()
        order_obj = new_order

    # 4. preload order_items สำหรับ response
    stmt = (
        select(Order)
        .where(Order.id == order_obj.id)
        .options(selectinload(Order.order_items).selectinload(OrderItem.menu))
    )
    result = await db.execute(stmt)
    order_with_items = result.scalars().first()
    return OrderOut.from_orm(order_with_items)


@orders_router.put("/{id}", response_model=OrderOut)
async def update_order(id: int, order: OrderUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(Order).where(Order.id == id)
    result = await db.execute(stmt)
    db_order = result.scalars().first()

    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    for key, value in order.dict(exclude_unset=True).items():
        setattr(db_order, key, value)

    await db.commit()
    await db.refresh(db_order)
    return db_order

@orders_router.delete("/{id}")
async def delete_order(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Order).where(Order.id == id)
    result = await db.execute(stmt)
    db_order = result.scalars().first()

    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.delete(db_order)
    await db.commit()
    return {"detail": "Order deleted"}

@orders_router.post("/{id}/status")
async def update_order_status(id: int, status: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Order).where(Order.id == id)
    result = await db.execute(stmt)
    db_order = result.scalars().first()

    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    db_order.status = status
    await db.commit()
    return {"detail": "Order status updated"}

### Payments Endpoints
payments_router = APIRouter(prefix="/payments", tags=["Payments"])

@payments_router.post("/orders/{order_id}/payment", response_model=PaymentOut)
async def create_payment(order_id: int, payment: PaymentCreate, db: AsyncSession = Depends(get_db)):
    new_payment = Payment(
        order_id=order_id,
        **payment.dict(),
        status="pending"
    )
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)
    return new_payment

@payments_router.put("/orders/{order_id}/payment", response_model=PaymentOut)
async def update_payment_by_order(
    order_id: int,
    payment_update: PaymentCreate,   # หรือสร้าง schema ใหม่สำหรับ update เช่น PaymentUpdate
    db: AsyncSession = Depends(get_db)
):
    # ดึง payment แรกที่เจอของ order_id นี้
    stmt = select(Payment).where(Payment.order_id == order_id)
    result = await db.execute(stmt)
    db_payment = result.scalars().first()

    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found for this order.")

    # อัปเดตข้อมูล (แก้ไขเฉพาะฟิลด์ที่ต้องการ)
    for attr, value in payment_update.dict(exclude_unset=True).items():
        setattr(db_payment, attr, value)

    await db.commit()
    await db.refresh(db_payment)
    return db_payment

@payments_router.get("/", response_model=List[PaymentOut])
async def get_payments(order: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Payment)
    if order:
        stmt = stmt.where(Payment.order_id == order)
    result = await db.execute(stmt)
    return result.scalars().all()

@payments_router.post("/{id}/verify", response_model=PaymentOut)
async def verify_payment(id: int, verify: PaymentVerify, db: AsyncSession = Depends(get_db)):
    stmt = select(Payment).where(Payment.id == id)
    result = await db.execute(stmt)
    db_payment = result.scalars().first()

    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    db_payment.status = verify.status
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

# รวม routers ทั้งหมดเข้ากับ app
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tables_router)
app.include_router(rooms_router)
app.include_router(reservations_router)
app.include_router(menus_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(store_router, prefix="/api", tags=["Store"])
app.include_router(customers_router, prefix="/api", tags=["Customers"])
app.include_router(kitchen_router, prefix="/api", tags=["Kitchen"])
app.include_router(waiter_router, prefix="/api", tags=["Waiter"])
app.include_router(file_upload_router.router, prefix="/api", tags=["File Upload"])
@app.get("/")
async def root():
    logging.debug("This is a debug message")
    return {"message": "Welcome to the API"}
