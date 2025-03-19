# myproject/models/equipment_category.py

from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from ..config.database import Base

class EquipmentCategory(Base):
    __tablename__ = "equipment_category"

    categoryId = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    categoryName = Column(String(255), nullable=False, unique=True)
    categoryDesc = Column(Text, nullable=True)
