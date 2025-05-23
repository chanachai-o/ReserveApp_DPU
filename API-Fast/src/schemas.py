# schemas.py
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Literal
from datetime import time, datetime
from decimal import Decimal
import enum
from src.models import TableStatus, ReservationStatus, OrderStatus, RoomStatus,\
    OrderItemStatus

# Enum definitions (สามารถอ้างอิงจาก models ได้เหมือนกัน)
class UserRole(str, enum.Enum):
    customer = "customer"
    staff = "staff"
    chef = "chef"
    manager = "manager"

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
    name: str
    phone: str
    role: UserRole
    is_active: bool
    picture: Optional[str]
    
    class Config:
        from_attributes = True

# Table schemas
class TableBase(BaseModel):
    table_number: str
    capacity: int
    picture: Optional[str] = None
    status: str  # available, reserved, unavailable

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    table_number: Optional[str]
    capacity: Optional[int]
    status: Optional[str]
    picture: Optional[str] = None

class TableOut(TableBase):
    id: int
    table_number: str
    capacity: int
    status: TableStatus
    picture: Optional[str]
    class Config:
        from_attributes = True

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
    name: Optional[str]
    capacity: Optional[int]
    equipment: Optional[str]
    status: Optional[str]
    picture: Optional[str] = None

class RoomOut(RoomBase):
    id: int
    name: str
    capacity: int
    equipment: Optional[str]
    status: RoomStatus
    picture: Optional[str]
    
    class Config:
        from_attributes = True

# Reservation schemas
class ReservationBase(BaseModel):
    start_time: datetime
    end_time: datetime
    num_people: int

class ReservationCreate(ReservationBase):
    user_id: Optional[int] = None
    phone: Optional[str] = None
    table_id: Optional[int] = None
    room_id: Optional[int] = None
    status: ReservationStatus = None

class ReservationUpdate(ReservationBase):
    table_id: Optional[int]
    room_id: Optional[int]
    status: Optional[Literal["pending", "checked_in", "completed", "cancelled", "checked_out", "no_show"]]


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
    name: str
    description: Optional[str]
    category: Optional[str]
    price: Decimal
    picture: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

# Order schemas
class OrderItemSchema(BaseModel):
    menu_id: int
    quantity: int
    
class OrderItemCreate(BaseModel):
    menu_id: int
    quantity: int
    
class OrderItemOut(BaseModel):
    id: int
    menu_id: int
    quantity: int
    status: OrderItemStatus
    menu: Optional[MenuOut] = None
    note: Optional[str] = None
    class Config:
        from_attributes = True  # <-- สำคัญสำหรับ Pydantic v2

class OrderBase(BaseModel):
    status: str

class OrderCreate(OrderBase):
    user_id: Optional[int] = None
    reservation_id: Optional[int] = None
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str]

class OrderOut(BaseModel):
    id: int
    user_id: int
    reservation_id: Optional[int]
    status: OrderStatus
    total_amount: Decimal
    order_items: List[OrderItemOut]

    class Config:
        from_attributes = True  # ✅ สำคัญสำหรับ .from_orm

# Payment schemas
class PaymentBase(BaseModel):
    amount: Decimal
    slip_url: str

class PaymentCreate(PaymentBase):
    pass

class PaymentOut(PaymentBase):
    id: int
    order_id: int
    amount: Decimal
    slip_url: Optional[str]
    status: PaymentStatus

    class Config:
        from_attributes = True

class PaymentVerify(BaseModel):
    status: PaymentStatus  # completed หรือ declined

class StoreProfileBase(BaseModel):
    name: str            = Field(..., example="My Bistro")
    address: Optional[str]
    phone:   Optional[str] = Field(None, example="02-123-4567")
    email:   Optional[EmailStr]
    open_time:  Optional[time]
    close_time: Optional[time]
    tax_id: Optional[str]
    service_charge_pct: Optional[Decimal]
    vat_pct: Optional[Decimal]
    logo_url: Optional[str]
    layout_picture: Optional[str]

class StoreProfileCreate(StoreProfileBase):
    pass                       # ทุก field เหมือน Base

class StoreProfileUpdate(BaseModel):
    """ ทุกฟิลด์ optional – PUT เพื่อแก้บางค่า """
    name: Optional[str]
    address: Optional[str]
    phone:   Optional[str]
    email:   Optional[EmailStr]
    open_time:  Optional[time]
    close_time: Optional[time]
    tax_id: Optional[str]
    service_charge_pct: Optional[Decimal]
    vat_pct: Optional[Decimal]
    logo_url: Optional[str]
    layout_picture: Optional[str]

class StoreProfileOut(StoreProfileBase):
    id: int
    class Config:
        from_attributes = True
        
class ReservationBrief(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    status: str
    class Config: from_attributes = True

class OrderBrief(BaseModel):
    id: int
    created_at: datetime
    status: str
    total_amount: float
    class Config: from_attributes = True

class CustomerHistoryOut(BaseModel):
    customer_id: int
    name: str
    phone: str
    reservations: List[ReservationBrief]
    orders: List[OrderBrief]

class CustomerBanUpdate(BaseModel):
    is_active: bool  # false = ban, true = unban
    
AllowedStatus  = Literal["available", "reserved", "occupied",
                        "cleaning", "maintenance"]

class TableQuickStatus(BaseModel):
    status: AllowedStatus

    # เผื่อ backend enum ไม่ sync กับข้อความ – ตรวจอีกชั้น
    @validator("status")
    def check_status(cls, v):
        if v not in TableStatus.__members__:
            raise ValueError("Invalid table status")
        return v
    
class KitchenOrderItem(BaseModel):
    menu_id: int
    name: str        # ชื่อเมนู (join จาก Menu)
    quantity: int
    class Config:
        from_attributes = True

class KitchenOrderOut(BaseModel):
    id: int
    reservation_id: Optional[int]
    created_at: datetime
    status: str
    items: List[KitchenOrderItem]

    class Config:
        from_attributes = True

AllowedItemStatus = Literal["PREPARING", "COOKED", "REJECTED"]

class OrderItemStatusUpdate(BaseModel):
    status: AllowedItemStatus
    
class DeliverItem(BaseModel):
    """ไม่ต้องส่งอะไร – แค่ตี PATCH ก็พอ"""
    pass

class DeliverOrder(BaseModel):
    pass

class CheckoutRequest(BaseModel):
    discount_type: Optional[Literal["percent", "fixed"]] = None   # "percent" 10%  | "fixed"  50฿
    discount_value: Optional[Decimal] = 0                         # 10  | 50

class CheckoutResponse(BaseModel):
    order_id: int
    sub_total: Decimal
    service_charge: Decimal
    discount: Decimal
    vat: Decimal
    grand_total: Decimal
    qr_code_url: str               # path หรือ S3 URL
    status: str
    
class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: Optional[str] = None  # เช่น reservation, payment

class NotificationOut(NotificationCreate):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ReservationOut(BaseModel):
    id: int
    user_id: int
    table_id: Optional[int]
    room_id: Optional[int]
    start_time: datetime
    end_time: datetime
    num_people: int
    status: ReservationStatus
    note: Optional[str] = None

    user: Optional[UserOut]
    table: Optional[TableOut]
    room: Optional[RoomOut]
    orders: Optional[List[OrderOut]] = None
    payments: Optional[List[PaymentOut]] = None
    class Config:
        from_attributes = True  # ✅ สำหรับ Pydantic v2
