from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from uuid import UUID

from ..models.project_equipment import ProjectEquipment
from ..models.project import Project
from ..models.equipment import Equipment
from ..schemas.project_equipment_schema import ProjectEquipmentCreate

# CREATE
async def create_project_equipment(db: AsyncSession, pe_in: ProjectEquipmentCreate):
    new_pe = ProjectEquipment(
        projectId=pe_in.projectId,
        equipmentId=pe_in.equipmentId,
        quantity_in_project=pe_in.quantity_in_project
    )
    try:
        db.add(new_pe)
        await db.commit()
        await db.refresh(new_pe)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))
    return new_pe

# READ ALL (แสดงข้อมูล Project และ Equipment แบบ nested)
async def get_all_project_equipments(db: AsyncSession):
    stmt = select(ProjectEquipment).options(
        selectinload(ProjectEquipment.project),
        selectinload(ProjectEquipment.equipment)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

# READ ONE (แสดงข้อมูล Project และ Equipment แบบ nested)
async def get_project_equipment_by_id(db: AsyncSession, pe_id: UUID):
    stmt = select(ProjectEquipment).options(
        selectinload(ProjectEquipment.project),
        selectinload(ProjectEquipment.equipment)
    ).where(ProjectEquipment.peId == pe_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

# UPDATE
async def update_project_equipment(db: AsyncSession, pe_id: UUID, pe_in: ProjectEquipmentCreate):
    pe_db = await db.get(ProjectEquipment, pe_id)
    if not pe_db:
        raise HTTPException(status_code=404, detail="ProjectEquipment not found")

    if pe_in.projectId is not None:
        pe_db.projectId = pe_in.projectId
    if pe_in.equipmentId is not None:
        pe_db.equipmentId = pe_in.equipmentId
    if pe_in.quantity_in_project is not None:
        pe_db.quantity_in_project = pe_in.quantity_in_project

    try:
        await db.commit()
        await db.refresh(pe_db)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return pe_db

# DELETE
async def delete_project_equipment(db: AsyncSession, pe_id: UUID):
    pe_db = await db.get(ProjectEquipment, pe_id)
    if not pe_db:
        raise HTTPException(status_code=404, detail="ProjectEquipment not found")

    try:
        await db.delete(pe_db)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return {"message": "ProjectEquipment deleted successfully"}

# GET Equipment by ProjectId
async def get_equipment_by_project_id(db: AsyncSession, project_id: UUID):
    stmt = select(ProjectEquipment).options(
        selectinload(ProjectEquipment.equipment)
    ).where(ProjectEquipment.projectId == project_id)
    result = await db.execute(stmt)
    return result.scalars().all()
