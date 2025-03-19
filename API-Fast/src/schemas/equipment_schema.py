# myproject/schemas/equipment_schema.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class EquipmentBase(BaseModel):
    equipmentName: str
    description: Optional[str] = None
    serialNumber: Optional[str] = None
    picture: Optional[str] = None
    quantity: int = 0
    is_returnable: bool = True

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(EquipmentBase):
    pass

class EquipmentResponse(EquipmentBase):
    equipmentId: UUID
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True