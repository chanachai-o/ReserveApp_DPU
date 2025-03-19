# myproject/routers/equipment_category_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from ..schemas.equipment_category_schema import (
    EquipmentCategoryCreate,
    EquipmentCategoryResponse,
)
from ..controllers.equipment_category_controller import (
    create_equipment_category,
    get_all_equipment_categories,
    get_equipment_category_by_id,
)
from ..config.database import get_db

router = APIRouter()

@router.post("/", response_model=EquipmentCategoryResponse)
async def create_category(
    category_in: EquipmentCategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_equipment_category(db, category_in)

@router.get("/", response_model=List[EquipmentCategoryResponse])
async def read_categories(db: AsyncSession = Depends(get_db)):
    return await get_all_equipment_categories(db)

@router.get("/{category_id}", response_model=EquipmentCategoryResponse)
async def read_category(category_id: UUID, db: AsyncSession = Depends(get_db)):
    category = await get_equipment_category_by_id(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="EquipmentCategory not found")
    return category

# @router.put("/{category_id}", response_model=EquipmentCategoryResponse)
# async def update_category(
#     category_id: UUID,
#     category_in: EquipmentCategoryCreate,
#     db: AsyncSession = Depends(get_db)
# ):
#     return await update_equipment_category(db, category_id, category_in)

# @router.delete("/{category_id}", response_model=dict)
# async def delete_category(category_id: UUID, db: AsyncSession = Depends(get_db)):
#     return await delete_equipment_category(db, category_id)
