# myproject/routes/equipment_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.database import get_db
from ..controllers.equipment_controller import (
    get_all_equipment,
    get_equipment_by_id,
    create_equipment,
    update_equipment,
    delete_equipment
)
from ..schemas.equipment_schema import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentResponse
)

router = APIRouter()

# GET ALL
@router.get("/", response_model=List[EquipmentResponse])
async def read_equipments(db: AsyncSession = Depends(get_db)):
    return await get_all_equipment(db)

# GET ONE
@router.get("/{equipmentId}", response_model=EquipmentResponse)
async def read_equipment(equipmentId: UUID, db: AsyncSession = Depends(get_db)):
    eq_db = await get_equipment_by_id(equipmentId, db)
    if not eq_db:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return eq_db

# CREATE
@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_equipment(
    equipment_in: EquipmentCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_equipment(equipment_in, db)

# UPDATE
@router.put("/{equipmentId}", response_model=EquipmentResponse)
async def update_existing_equipment(
    equipmentId: UUID,
    equipment_in: EquipmentUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await update_equipment(equipmentId, equipment_in, db)

# DELETE
@router.delete("/{equipmentId}")
async def delete_existing_equipment(
    equipmentId: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await delete_equipment(equipmentId, db)
