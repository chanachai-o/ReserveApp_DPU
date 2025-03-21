# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

# Enum definitions
class UserRole(enum.Enum):
    customer = "customer"
    staff = "staff"
    chef = "chef"
    manager = "manager"

class TableStatus(enum.Enum):
    available = "available"
    reserved = "reserved"
    unavailable = "unavailable"

class ReservationStatus(enum.Enum):
    pending = "pending"
    checked_in = "checked_in"
    completed = "completed"
    cancelled = "cancelled"

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
    status = Column(String, default="available")  # สามารถเปลี่ยนเป็น Enum ได้เช่นกัน
    picture = Column(String)

    reservations = relationship("Reservation", back_populates="room")

# Reservation model
class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    num_people = Column(Integer, nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.pending)

    user = relationship("User", back_populates="reservations")
    table = relationship("Table", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")

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
class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=True)
    status = Column(String, default="pending")  # อาจเปลี่ยนเป็น Enum ตามที่ต้องการ
    total_amount = Column(Numeric(10,2), default=0)

    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    reservation = relationship("Reservation")

# OrderItem model
class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="order_items")
    menu = relationship("Menu")

# Payment model
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Numeric(10,2), nullable=False)
    picture = Column(String)
    slip_url = Column(String, nullable=False)  # URL สำหรับสลิปการโอน
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
