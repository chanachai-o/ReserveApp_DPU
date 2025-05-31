# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Numeric, func, Time, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import time
Base = declarative_base()

# Enum definitions
class UserRole(enum.Enum):
    customer = "customer"
    staff = "staff"
    chef = "chef"
    manager = "manager"

class TableStatus(enum.Enum):
    available    = "available"     # ว่าง ลูกค้าจองได้
    reserved     = "reserved"      # มีการจองล่วงหน้า
    occupied     = "occupied"      # มีลูกค้านั่งแล้ว
    cleaning     = "cleaning"      # รอพนักงานเช็ดโต๊ะ
    maintenance  = "maintenance"   # ปิดปรับปรุง / ซ่อม
    
class RoomStatus(enum.Enum):
    available    = "available"     # ว่าง ลูกค้าจองได้
    reserved     = "reserved"      # มีการจองล่วงหน้า
    occupied     = "occupied"      # มีลูกค้านั่งแล้ว
    cleaning     = "cleaning"      # รอพนักงานเช็ดโต๊ะ
    maintenance  = "maintenance"   # ปิดปรับปรุง / ซ่อม   

class ReservationStatus(enum.Enum):
    pending = "pending"
    checked_in = "checked_in"
    completed = "completed"
    cancelled = "cancelled"
    checked_out = "checked_out"  # เพิ่ม
    no_show = "no_show"  # เพิ่มถ้ามี

class PaymentStatus(enum.Enum):
    pending = "pending"
    completed = "completed"
    declined = "declined"

# User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer)
    is_active = Column(Boolean, default=True)
    picture = Column(String)
    reservations = relationship("Reservation", back_populates="user")
    orders = relationship("Order", back_populates="user")

# Table model
class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(String, unique=True, index=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(Enum(TableStatus), default=TableStatus.available)
    picture = Column(String)
    reservations = relationship("Reservation", back_populates="table")

# Room model (ห้องประชุมหรือห้องพิเศษ)
class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    equipment = Column(String)  # รายการอุปกรณ์ (อาจเก็บเป็น comma-separated string)
    status = Column(Enum(RoomStatus), default=RoomStatus.available)
    picture = Column(String)

    reservations = relationship("Reservation", back_populates="room")

# Reservation model
class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), server_default=func.now())
    num_people = Column(Integer, nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.pending)
    note = Column(Text, nullable=True)  # หมายเหตุเพิ่มเติมจากลูกค้า
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="reservations")
    table = relationship("Table", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")
    orders = relationship("Order", back_populates="reservation")
# Menu model
class Menu(Base):
    __tablename__ = "menus"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    category = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    picture = Column(String)

# Order model
class OrderStatus(enum.Enum):
    pending = "pending"
    preparing = "preparing"
    cooked = "cooked"
    served = "served"
    rejected = "rejected"
    
class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    total_amount = Column(Numeric(10,2), default=0)

    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    reservation = relationship("Reservation", back_populates="orders")
    payments = relationship("Payment", back_populates="order")
    
# OrderItem model
class OrderItemStatus(enum.Enum):
    pending = "pending"
    preparing = "preparing"
    cooked = "cooked"
    served = "served"
    rejected = "rejected"

class OrderItem(Base):
    __tablename__ = "order_items"

    id        = Column(Integer, primary_key=True)
    order_id  = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_id   = Column(Integer, ForeignKey("menus.id"),  nullable=False)
    quantity  = Column(Integer, nullable=False)
    status    = Column(Enum(OrderItemStatus), default=OrderItemStatus.pending)

    order = relationship("Order", back_populates="order_items")
    menu  = relationship("Menu")

# Payment model
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Numeric(10,2), nullable=False)
    # picture = Column(String)
    slip_url = Column(String, nullable=False)  # URL สำหรับสลิปการโอน
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    order = relationship("Order", back_populates="payments")

class StoreProfile(Base):
    """
    เก็บข้อมูลบริษัท/ร้าน มีได้ 1 แถว
    """
    __tablename__ = "store_profile"

    id                 = Column(Integer, primary_key=True, default=1)   # single-row
    name               = Column(String,  nullable=False)
    address            = Column(String)
    phone              = Column(String)
    email              = Column(String)
    open_time          = Column(Time)      # เวลาเปิดร้าน
    close_time         = Column(Time)      # เวลาปิดร้าน
    tax_id             = Column(String)
    service_charge_pct = Column(Numeric(5, 2), default=0)
    vat_pct            = Column(Numeric(5, 2), default=0)
    logo_url           = Column(String)
    layout_picture    = Column(String)

    created_at         = Column(DateTime(timezone=True),
                                 server_default=func.now())
    updated_at         = Column(DateTime(timezone=True),
                                 onupdate=func.now(),
                                 server_default=func.now())
    
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    message = Column(Text)
    type = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
