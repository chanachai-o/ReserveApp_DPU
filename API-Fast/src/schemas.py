# schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import enum

# Enum definitions (สามารถอ้างอิงจาก models ได้เหมือนกัน)
class UserRole(str, enum.Enum):
    customer = "customer"
    staff = "staff"
    chef = "chef"
    manager = "manager"

class ReservationStatus(str, enum.Enum):
    pending = "pending"
    checked_in = "checked_in"
    completed = "completed"
    cancelled = "cancelled"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    declined = "declined"

# User schemas
class UserBase(BaseModel):
    phone: str
    name: str
    picture: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str]
    role: Optional[UserRole]
    picture: Optional[str] = None
    is_active: Optional[bool]

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

# Table schemas
class TableBase(BaseModel):
    table_number: str
    capacity: int
    picture: Optional[str] = None
    status: str  # available, reserved, unavailable

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    capacity: Optional[int]
    status: Optional[str]
    picture: Optional[str] = None

class TableOut(TableBase):
    id: int

    class Config:
        orm_mode = True

# Room schemas
class RoomBase(BaseModel):
    name: str
    picture: Optional[str] = None
    capacity: int
    equipment: Optional[str]
    status: str

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    capacity: Optional[int]
    equipment: Optional[str]
    status: Optional[str]
    picture: Optional[str] = None

class RoomOut(RoomBase):
    id: int

    class Config:
        orm_mode = True

# Reservation schemas
class ReservationBase(BaseModel):
    start_time: datetime
    end_time: datetime
    num_people: int

class ReservationCreate(ReservationBase):
    table_id: Optional[int] = None
    room_id: Optional[int] = None

class ReservationUpdate(ReservationBase):
    table_id: Optional[int]
    room_id: Optional[int]
    status: Optional[ReservationStatus]

class ReservationOut(ReservationBase):
    id: int
    status: ReservationStatus
    user: UserOut
    table: Optional[TableOut] = None
    room: Optional[RoomOut] = None

    class Config:
        orm_mode = True

# Menu schemas
class MenuBase(BaseModel):
    name: str
    description: Optional[str]
    category: Optional[str]
    price: Decimal
    picture: Optional[str] = None

class MenuCreate(MenuBase):
    pass

class MenuUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    category: Optional[str]
    price: Optional[Decimal]
    is_active: Optional[bool]
    picture: Optional[str] = None

class MenuOut(MenuBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

# Order schemas
class OrderItemSchema(BaseModel):
    menu_id: int
    quantity: int

class OrderBase(BaseModel):
    status: str

class OrderCreate(OrderBase):
    reservation_id: Optional[int] = None
    items: List[OrderItemSchema]

class OrderUpdate(BaseModel):
    status: Optional[str]

class OrderOut(OrderBase):
    id: int
    user: UserOut
    reservation: Optional[ReservationOut] = None
    total_amount: Decimal
    order_items: List[OrderItemSchema]

    class Config:
        orm_mode = True

# Payment schemas
class PaymentBase(BaseModel):
    amount: Decimal
    slip_url: str

class PaymentCreate(PaymentBase):
    pass

class PaymentOut(PaymentBase):
    id: int
    status: PaymentStatus

    class Config:
        orm_mode = True

class PaymentVerify(BaseModel):
    status: PaymentStatus  # completed หรือ declined
