# myproject/schemas/equipment_category_schema.py

from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class MenuCategoryBase(BaseModel):
    categoryName: str
    categoryDesc: Optional[str] = None

class MenuCategoryCreate(MenuCategoryBase):
    pass

class MenuCategoryUpdate(MenuCategoryBase):
    pass

class MenuCategoryResponse(MenuCategoryBase):
    categoryId: UUID

    class Config:
        orm_mode = True
