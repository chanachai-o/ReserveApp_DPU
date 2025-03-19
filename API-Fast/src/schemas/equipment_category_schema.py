# myproject/schemas/equipment_category_schema.py

from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class EquipmentCategoryBase(BaseModel):
    categoryName: str
    categoryDesc: Optional[str] = None

class EquipmentCategoryCreate(EquipmentCategoryBase):
    pass

class EquipmentCategoryResponse(EquipmentCategoryBase):
    categoryId: UUID

    class Config:
        orm_mode = True
