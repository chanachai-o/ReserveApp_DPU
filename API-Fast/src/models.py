# src/models.py (ฉบับแก้ไขและปรับโครงสร้างให้ตรงกับ Schemas)

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Numeric,
    func, Time, Text
)
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import datetime

Base = declarative_base()

# --- Enum Definitions ---
class UserRole(str, enum.Enum):
    customer = "customer"
    staff = "staff"
    chef = "chef"
    manager = "manager"

class TableStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    occupied = "occupied"
    cleaning = "cleaning"

class RoomStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    occupied = "occupied"

class ReservationStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PREPARING = "PREPARING"
    READY = "READY"
    SERVED = "SERVED"
    CANCELLED = "CANCELLED"

class OrderType(str, enum.Enum):
    DINE_IN = "DINE_IN"
    TAKEAWAY = "TAKEAWAY"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

# --- Main Tables ---

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    picture = Column(String, nullable=True)

    reservations = relationship("Reservation", back_populates="customer")
    orders = relationship("Order", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class MenuCategory(Base):
    __tablename__ = 'menu_categories'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    menus = relationship("Menu", back_populates="category")

class Menu(Base):
    __tablename__ = 'menus'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String)
    category_id = Column(Integer, ForeignKey('menu_categories.id'))
    is_active = Column(Boolean, default=True)
    category = relationship("MenuCategory", back_populates="menus")

class Table(Base):
    __tablename__ = 'tables'
    id = Column(Integer, primary_key=True)
    table_number = Column(String, nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    status = Column(Enum(TableStatus), default=TableStatus.available)
    picture = Column(String)
    reservations = relationship("Reservation", back_populates="table")

class Room(Base):
    __tablename__ = 'rooms'
    id = Column(Integer, primary_key=True)
    room_name = Column(String, nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    status = Column(Enum(RoomStatus), default=RoomStatus.available)
    picture = Column(String)
    reservations = relationship("Reservation", back_populates="room")

# --- Reservation, Order, and OrderItem (โครงสร้างเก่าที่สอดคล้องกับ Schemas) ---

class Reservation(Base):
    __tablename__ = 'reservations'
    id = Column(Integer, primary_key=True)
    
    # เปลี่ยนกลับมาใช้ user_id ตามโครงสร้างเดิม
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    table_id = Column(Integer, ForeignKey('tables.id'), nullable=True)
    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=True)
    
    # ใช้ field names ตาม schemas เดิม
    num_people = Column(Integer, nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), server_default=func.now())
    
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING, nullable=False)
    note = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    customer = relationship("User", back_populates="reservations")
    table = relationship("Table", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")
    orders = relationship("Order", back_populates="reservation") # Reservation มีได้หลาย Order

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    total_amount = Column(Numeric(10,2), default=0)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="orders")
    reservation = relationship("Reservation", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = 'order_items'
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False) # เชื่อมกับ Order
    menu_id = Column(Integer, ForeignKey('menus.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING) # ใช้ OrderStatus

    # Relationships
    order = relationship("Order", back_populates="order_items")
    menu = relationship("Menu")

# --- Other Tables ---
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False) # เชื่อมกับ Order
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String, default="cash")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    slip_url = Column(String, nullable=False)  # URL สำหรับสลิปการโอน
    
    order = relationship("Order", back_populates="payments")

class StoreProfile(Base):
    __tablename__ = "store_profile"
    id = Column(Integer, primary_key=True, default=1)
    name = Column(String, nullable=False)
    address = Column(String)
    phone = Column(String)
    email = Column(String)
    open_time = Column(Time)
    close_time = Column(Time)
    tax_id = Column(String)
    service_charge_pct = Column(Numeric(5, 2), default=0)
    vat_pct = Column(Numeric(5, 2), default=0)
    logo_url = Column(String)
    layout_picture = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    type = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="notifications")
