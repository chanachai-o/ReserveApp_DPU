# myproject/routes/project_equipment_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from ..config.database import get_db
from ..controllers.project_equipment_controller import (
    create_project_equipment,
    get_all_project_equipments,
    get_project_equipment_by_id,
    update_project_equipment,
    delete_project_equipment,
    get_equipment_by_project_id
)
from ..schemas.project_equipment_schema import (
    ProjectEquipmentCreate,
    ProjectEquipmentResponse
)

router = APIRouter()

# CREATE
@router.post("/", response_model=ProjectEquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_pe_endpoint(
    pe_in: ProjectEquipmentCreate,
    db: AsyncSession = Depends(get_db)
):
    new_pe = await create_project_equipment(db, pe_in)
    return new_pe

# READ ALL
@router.get("/", response_model=List[ProjectEquipmentResponse])
async def read_all_pe_endpoint(db: AsyncSession = Depends(get_db)):
    pes = await get_all_project_equipments(db)
    return pes

# READ ONE
@router.get("/{peId}", response_model=ProjectEquipmentResponse)
async def read_pe_by_id_endpoint(
    peId: UUID,
    db: AsyncSession = Depends(get_db)
):
    pe_db = await get_project_equipment_by_id(db, peId)
    if not pe_db:
        raise HTTPException(status_code=404, detail="ProjectEquipment not found")
    return pe_db

# UPDATE
@router.put("/{peId}", response_model=ProjectEquipmentResponse)
async def update_pe_endpoint(
    peId: UUID,
    pe_in: ProjectEquipmentCreate,
    db: AsyncSession = Depends(get_db)
):
    updated_pe = await update_project_equipment(db, peId, pe_in)
    return updated_pe

# DELETE
@router.delete("/{peId}")
async def delete_pe_endpoint(
    peId: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await delete_project_equipment(db, peId)


@router.get("/project/{projectId}", response_model=List[ProjectEquipmentResponse])
async def get_equipment_for_project(
    projectId: UUID,
    db: AsyncSession = Depends(get_db)
):
    pes = await get_equipment_by_project_id(db, projectId)
    return pes