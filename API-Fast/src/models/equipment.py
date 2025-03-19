# myproject/models/equipment.py

import uuid
from sqlalchemy import Column, String, Integer ,Boolean,ForeignKey,DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy.orm import relationship
from ..config.database import Base

class Equipment(Base):
    __tablename__ = 'equipment'  # หรือ 'equipments' ตามต้องการ

    equipmentId = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    equipmentName = Column(String(255), nullable=False)
    serialNumber = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False)
    is_returnable = Column(Boolean, nullable=False, default=True)
    categoryId = Column(UUID(as_uuid=True), ForeignKey("equipment_category.categoryId"), nullable=True)
    picture = Column(String)
    # ถ้าต้องการวันเวลาสร้าง/แก้ไข
    createdAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship เชื่อมไปยัง ProjectEquipment
    project_equipment = relationship(
        "ProjectEquipment",
        back_populates="equipment",
        cascade="all, delete-orphan"
    )
    
