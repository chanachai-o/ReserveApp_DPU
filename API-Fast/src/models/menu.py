# myproject/models/equipment.py

import uuid
from sqlalchemy import Column, String, Float, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy.orm import relationship
from ..config.database import Base
import enum

class AvailableType(enum.Enum):
    Available = 1
    Unavailable = 0
    
class MenuCategory(Base):
    __tablename__ = "menu_category"

    categoryId = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    categoryName = Column(String(255), nullable=False, unique=True)
    categoryDesc = Column(String, nullable=True)
    
    # เปลี่ยนชื่อเป็น 'menus' เพื่อให้ความหมายชัดเจน
    menus = relationship("Menu", back_populates="menu_category")

class Menu(Base):
    __tablename__ = "menu"

    menuId = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # ใช้ uuid4 จาก uuid import uuid4
    menuName = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False, default=0)
    categoryId = Column(UUID(as_uuid=True), ForeignKey('menu_category.categoryId'), nullable=False)
    picture = Column(String)
    status = Column(Enum(AvailableType), nullable=False, default=AvailableType.Available)  # Default as Enum instance    
    createdAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    menu_category = relationship("MenuCategory", back_populates="menus" , lazy="joined")