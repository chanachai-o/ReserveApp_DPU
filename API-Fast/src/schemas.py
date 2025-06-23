# schemas.py (ฉบับปรับปรุงตาม models.py ล่าสุด)

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, time
from decimal import Decimal

# Import Enums จากไฟล์ models เพื่อให้เป็นแหล่งข้อมูลเดียว
from .models import (
    UserRole,
    TableStatus,
    RoomStatus,
    ReservationStatus,
    OrderStatus,
    PaymentStatus,
    OrderType  # สมมติว่ามี OrderType ใน models
)

# ================================================================
#                       Authentication Schemas
# ================================================================
class LoginRequest(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

# ================================================================
#                       User Schemas
# ================================================================
class UserBase(BaseModel):
    name: str
    phone: str
    role: UserRole
    picture: Optional[str] = None
    is_active: bool

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    picture: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

Token.model_rebuild() # แก้ปัญหา Forward Reference

# ================================================================
#                       Table & Room Schemas
# ================================================================
class TableBase(BaseModel):
    table_number: str
    capacity: int = Field(..., gt=0)
    status: Optional[TableStatus] = TableStatus.available

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    capacity: Optional[int] = Field(None, gt=0)
    status: Optional[TableStatus] = None

class TableOut(TableBase):
    id: int
    
    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    room_name: str
    capacity: int = Field(..., gt=0)
    status: Optional[RoomStatus] = RoomStatus.available

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    room_name: Optional[str] = None
    capacity: Optional[int] = Field(None, gt=0)
    status: Optional[RoomStatus] = None

class RoomOut(RoomBase):
    id: int
    
    class Config:
        from_attributes = True

# ================================================================
#                       Menu & Category Schemas
# ================================================================
class MenuCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class MenuCategoryCreate(MenuCategoryBase):
    pass

class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class MenuCategoryOut(MenuCategoryBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class MenuBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    image_url: Optional[str] = None
    category_id: int
    is_active: bool = True

class MenuCreate(MenuBase):
    pass

class MenuUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class MenuOut(MenuBase):
    id: int
    category: MenuCategoryOut # แสดงข้อมูล Category ที่เชื่อมกัน

    class Config:
        from_attributes = True

# ================================================================
#                   OrderItem, Order, Payment Schemas
# ================================================================
class OrderItemBase(BaseModel):
    menu_id: int
    quantity: int = Field(..., gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    status: Optional[OrderStatus] = None

class OrderItemOut(OrderItemBase):
    id: int
    price: Decimal
    status: OrderStatus
    menu: MenuOut # แสดงข้อมูลเมนูที่เชื่อมกัน

    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    amount: Decimal
    payment_method: str
    slip_url: str
    status: Optional[PaymentStatus] = PaymentStatus.PENDING

class PaymentCreate(PaymentBase):
    order_id: int

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None

class PaymentOut(PaymentBase):
    id: int
    order_id: int
    created_at: datetime
    transaction_id: Optional[str] = None

    class Config:
        from_attributes = True
        
class PaymentVerify(BaseModel):
    payment_id: int
    transaction_id: str
    status: PaymentStatus

class TableQuickStatus(BaseModel):
    status: TableStatus

class RoomQuickStatus(BaseModel):
    status: RoomStatus

class OrderBase(BaseModel):
    user_id: int
    reservation_id: Optional[int] = None
    status: Optional[OrderStatus] = OrderStatus.PENDING

class OrderCreate(OrderBase):
    order_items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None

class OrderOut(OrderBase):
    id: int
    total_amount: Decimal
    created_at: datetime
    user: UserOut # แสดงข้อมูลผู้ใช้
    order_items: List[OrderItemOut] = []
    payments: List[PaymentOut] = []
    
    class Config:
        from_attributes = True

# ================================================================
#                       Reservation Schemas
# ================================================================
class ReservationBase(BaseModel):
    user_id: int
    table_id: Optional[int] = None
    room_id: Optional[int] = None
    num_people: int = Field(..., gt=0)
    start_time: datetime
    end_time: datetime
    note: Optional[str] = None
    status: Optional[ReservationStatus] = ReservationStatus.PENDING

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(BaseModel):
    num_people: Optional[int] = Field(None, gt=0)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    note: Optional[str] = None
    status: Optional[ReservationStatus] = None

class ReservationOut(ReservationBase):
    id: int
    customer: UserOut # เปลี่ยนชื่อให้สื่อความหมาย
    table: Optional[TableOut] = None
    room: Optional[RoomOut] = None
    orders: List[OrderOut] = [] # การจองหนึ่งครั้งอาจมีหลายออเดอร์
    
    class Config:
        from_attributes = True

# ================================================================
#                       Store Profile Schemas
# ================================================================
class StoreProfileBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    tax_id: Optional[str] = None
    service_charge_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    vat_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    logo_url: Optional[str] = None
    layout_picture: Optional[str] = None

class StoreProfileCreate(StoreProfileBase):
    pass

class StoreProfileUpdate(StoreProfileBase):
    name: Optional[str] = None
    # ทำให้ทุก Field เป็น Optional สำหรับการ Update
    
class StoreProfileOut(StoreProfileBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ================================================================
#                       Notification Schemas
# ================================================================
class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: Optional[str] = None

class NotificationOut(NotificationCreate):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TakeawayOrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    order_items: List[OrderItemCreate]
    expected_pickup_time: Optional[datetime] = None