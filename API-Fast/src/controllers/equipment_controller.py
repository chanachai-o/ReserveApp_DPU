# myproject/controllers/equipment_controller.py

from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..models.equipment import Equipment
from ..schemas.equipment_schema import EquipmentCreate, EquipmentUpdate

async def get_all_equipment(db: AsyncSession):
    result = await db.execute(select(Equipment))
    return result.scalars().all()

async def get_equipment_by_id(equipment_id: UUID, db: AsyncSession):
    # ใช้ db.get เพื่อความสั้น
    eq_db = await db.get(Equipment, equipment_id)
    return eq_db

async def create_equipment(equipment_data: EquipmentCreate, db: AsyncSession):
    new_equipment = Equipment(
        equipmentName=equipment_data.equipmentName,
        description=equipment_data.description,
        quantity=equipment_data.quantity,
        is_returnable=equipment_data.is_returnable,
        picture=equipment_data.picture,
        serialNumber=equipment_data.serialNumber
    )
    db.add(new_equipment)
    try:
        await db.commit()
        await db.refresh(new_equipment)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))
    return new_equipment

async def update_equipment(equipment_id: UUID, equipment_data: EquipmentUpdate, db: AsyncSession):
    eq_db = await db.get(Equipment, equipment_id)
    if not eq_db:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if equipment_data.equipmentName is not None:
        eq_db.equipmentName = equipment_data.equipmentName
    if equipment_data.description is not None:
        eq_db.description = equipment_data.description
    if equipment_data.serialNumber is not None:
        eq_db.serialNumber = equipment_data.serialNumber
    if equipment_data.is_returnable is not None:
        eq_db.is_returnable = equipment_data.is_returnable
    if equipment_data.picture is not None:
        eq_db.picture = equipment_data.picture

    try:
        await db.commit()
        await db.refresh(eq_db)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return eq_db

async def delete_equipment(equipment_id: UUID, db: AsyncSession):
    eq_db = await db.get(Equipment, equipment_id)
    if not eq_db:
        raise HTTPException(status_code=404, detail="Equipment not found")

    try:
        await db.delete(eq_db)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return {"message": "Equipment deleted successfully"}
