from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from datetime import datetime
import os
import logging
from .routes import file_upload_router
from .routes.store_router import store_router
from .routes.customers import customers_router
from .routes.payments_router import payments_router
from .routes.reservations_router import reservations_router
from .routes.menu_routes import menu_router
from .routes.orders_router import orders_router

# Import AsyncSession จาก sqlalchemy.ext.asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi.middleware.cors import CORSMiddleware
from .utils.notifier import trigger_notification
from sqlalchemy import select, delete
# สมมติว่าใน config.database มีการสร้าง engine และ get_db แบบ async
from src.config.database import engine, get_db

from .models import Base, User, Table, Room, TableStatus
from .schemas import (
    UserCreate, UserUpdate, UserOut,
    TableCreate, TableUpdate, TableOut,
    RoomCreate, RoomUpdate, RoomOut, TableQuickStatus
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
# ## Authentication Endpoints
auth_router = APIRouter()


@auth_router.post("/login")
async def login(phone: str, password: str, db: AsyncSession=Depends(get_db)):
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


# ## User Endpoints
users_router = APIRouter()


@users_router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User=Depends(get_current_active_user)):
    return current_user


@users_router.get("/", response_model=List[UserOut])
async def get_users(role: Optional[str]=None, db: AsyncSession=Depends(get_db)):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    result = await db.execute(stmt)
    return result.scalars().all()


@users_router.post("/", response_model=UserOut)
async def create_user(user: UserCreate, db: AsyncSession=Depends(get_db)):
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
async def update_user(id: int, user: UserUpdate, db: AsyncSession=Depends(get_db)):
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
async def delete_user(id: int, db: AsyncSession=Depends(get_db)):
    stmt = select(User).where(User.id == id)
    result = await db.execute(stmt)
    db_user = result.scalars().first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(db_user)
    await db.commit()
    return {"detail": "User deleted"}


# ## Tables Endpoints
tables_router = APIRouter()


@tables_router.get("/tables", response_model=List[TableOut])
async def get_tables(status: Optional[str]=None, db: AsyncSession=Depends(get_db)):
    stmt = select(Table)
    if status:
        stmt = stmt.where(Table.status == status)
    result = await db.execute(stmt)
    return result.scalars().all()


@tables_router.post("/tables", response_model=TableOut)
async def create_table(table: TableCreate, db: AsyncSession=Depends(get_db)):
    new_table = Table(**table.dict())
    db.add(new_table)
    await db.commit()
    await db.refresh(new_table)
    return new_table


@tables_router.put("/tables/{id}", response_model=TableOut)
async def update_table(id: int, table: TableUpdate, db: AsyncSession=Depends(get_db)):
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


@tables_router.delete("/tables/{id}")
async def delete_table(id: int, db: AsyncSession=Depends(get_db)):
    stmt = select(Table).where(Table.id == id)
    result = await db.execute(stmt)
    db_table = result.scalars().first()

    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")

    await db.delete(db_table)
    await db.commit()
    return {"detail": "Table deleted"}


@tables_router.patch("/tables/{table_id}/status", response_model=TableOut)
async def quick_change_table_status(
    table_id: int,
    payload: TableQuickStatus,
    db: AsyncSession=Depends(get_db)
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


# ## Rooms Endpoints
rooms_router = APIRouter()


@rooms_router.get("/rooms", response_model=List[RoomOut])
async def get_rooms(status: Optional[str]=None, db: AsyncSession=Depends(get_db)):
    stmt = select(Room)
    if status:
        stmt = stmt.where(Room.status == status)
    result = await db.execute(stmt)
    return result.scalars().all()


@rooms_router.post("/rooms", response_model=RoomOut)
async def create_room(room: RoomCreate, db: AsyncSession=Depends(get_db)):
    new_room = Room(**room.dict())
    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)
    return new_room


@rooms_router.put("/rooms/{id}", response_model=RoomOut)
async def update_room(id: int, room: RoomUpdate, db: AsyncSession=Depends(get_db)):
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


@rooms_router.delete("/rooms/{id}")
async def delete_room(id: int, db: AsyncSession=Depends(get_db)):
    stmt = select(Room).where(Room.id == id)
    result = await db.execute(stmt)
    db_room = result.scalars().first()

    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    await db.delete(db_room)
    await db.commit()
    return {"detail": "Room deleted"}


@rooms_router.patch("/rooms/{room_id}/status", response_model=RoomOut)
async def quick_change_room_status(
    room_id: int,
    payload: RoomQuickStatus,
    db: AsyncSession=Depends(get_db)
):
    """เปลี่ยนสถานะห้องรวดเร็ว (cleaning / maintenance / occupied / available)"""

    stmt = select(Room).where(Room.id == room_id)
    result = await db.execute(stmt)
    room = result.scalars().first()
    if not room:
        raise HTTPException(404, "Room not found")
    
    print("เปลี่ยนสถานะห้อง: ", room.id, "->", payload.status)
    # ลอง print ค่าเดิมและใหม่
    print("ค่าเดิม:", room.status)
    print("ค่าใหม่:", payload.status)

    # อัปเดต (validate ด้วย Enum)
    try:
        room.status = RoomStatus(payload.status)
    except ValueError as e:
        raise HTTPException(400, f"Invalid status: {payload.status}") from e

    await db.commit()
    await db.refresh(room)
    print("บันทึกสำเร็จ:", room.status)
    return room


# รวม routers ทั้งหมดเข้ากับ app
app.include_router(auth_router , prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router , prefix="/api/users", tags=["Users"])
app.include_router(tables_router , prefix="/api", tags=["Tables"])
app.include_router(rooms_router , prefix="/api", tags=["Rooms"])
app.include_router(reservations_router , prefix="/api", tags=["Reservations"])
app.include_router(menu_router , prefix="/api", tags=["Menus"])
app.include_router(orders_router , prefix="/api", tags=["Orders"])
app.include_router(payments_router , prefix="/api", tags=["Payments"])
app.include_router(store_router, prefix="/api", tags=["Store"])
app.include_router(customers_router, prefix="/api/customers", tags=["Customers"])
app.include_router(file_upload_router.router, prefix="/api/files", tags=["File Upload"])


@app.get("/")
async def root():
    logging.debug("This is a debug message")
    return {"message": "Welcome to the API"}
