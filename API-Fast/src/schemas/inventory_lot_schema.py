# myproject/schemas/inventory_lot_schema.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
import enum

class InventoryActionEnum(str, enum.Enum):
    INBOUND = "INBOUND"
    OUTBOUND = "OUTBOUND"
    SCRAP = "SCRAP"
    MAINTENANCE_OUT = "MAINTENANCE_OUT"

class InventoryLotBase(BaseModel):
    equipmentId: UUID
    quantity: int
    action: InventoryActionEnum
    remark: Optional[str] = None
    created_by: Optional[UUID] = None

class InventoryLotCreate(InventoryLotBase):
    pass

class InventoryLotResponse(InventoryLotBase):
    lotId: UUID
    created_at: datetime

    class Config:
        orm_mode = True
