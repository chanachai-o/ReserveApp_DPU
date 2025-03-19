# myproject/schemas/equipment_schema.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from ..models.menu import AvailableType
from ..schemas.menu_category_schema import MenuCategoryResponse
class MenuBase(BaseModel):
    menuName: str
    description: Optional[str] = None
    categoryId: UUID
    picture: Optional[str] = None
    price: int = 0
    status: AvailableType

class MenuCreate(MenuBase):
    pass

class MenuUpdate(MenuBase):
    pass

class MenuResponse(MenuBase):
    menuId: UUID
    createdAt: datetime
    updatedAt: datetime
    menu_category: Optional[MenuCategoryResponse] 
    class Config:
        orm_mode = True