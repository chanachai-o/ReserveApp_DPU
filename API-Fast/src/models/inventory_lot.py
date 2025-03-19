# myproject/models/inventory_lot.py

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from uuid import uuid4
from datetime import datetime
import enum

from ..config.database import Base  # ปรับ path ให้ตรงกับโปรเจค

class InventoryAction(enum.Enum):
    INBOUND = "INBOUND"     # นำเข้า
    OUTBOUND = "OUTBOUND"   # ถอนออก
    SCRAP = "SCRAP"         # ทิ้ง/โละ
    MAINTENANCE_OUT = "MAINTENANCE_OUT"  # ส่งซ่อม

class InventoryLot(Base):
    __tablename__ = "inventory_lot"

    lotId = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    equipmentId = Column(UUID(as_uuid=True), ForeignKey("equipment.equipmentId"), nullable=False)
    quantity = Column(Integer, nullable=False)
    action = Column(Enum(InventoryAction), nullable=False)
    remark = Column(String, nullable=True)

    # ใครเป็นคนทำ Lot นี้ (สมมติ FK -> member.memberId)
    created_by = Column(UUID(as_uuid=True), ForeignKey("member.memberId"), nullable=True)
    
    # วันเวลาที่บันทึก
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
