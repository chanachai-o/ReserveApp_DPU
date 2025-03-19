# myproject/controllers/equipment_category_controller.py

from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..models.equipment_category import EquipmentCategory
from ..schemas.equipment_category_schema import EquipmentCategoryCreate

async def create_equipment_category(db: AsyncSession, cat_in: EquipmentCategoryCreate):
    new_cat = EquipmentCategory(**cat_in.dict())
    try:
        db.add(new_cat)
        await db.commit()
        await db.refresh(new_cat)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return new_cat

async def get_all_equipment_categories(db: AsyncSession):
    result = await db.execute(select(EquipmentCategory))
    return result.scalars().all()

async def get_equipment_category_by_id(db: AsyncSession, category_id: UUID):
    return await db.get(EquipmentCategory, category_id)

# update, delete ตามต้องการ
