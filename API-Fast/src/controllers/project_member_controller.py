from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID

from ..models.project_member import ProjectMember
from ..schemas.project_member_schema import ProjectMemberCreate

# CREATE
async def create_project_member(db: AsyncSession, pm_in: ProjectMemberCreate):
    new_pm = ProjectMember(
        memberId=pm_in.memberId,
        projectId=pm_in.projectId,
        role_in_project=pm_in.role_in_project
    )
    try:
        db.add(new_pm)
        await db.commit()
        await db.refresh(new_pm)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))
    return new_pm

# READ ALL (โหลดข้อมูล Project และ Member ด้วย)
async def get_all_project_members(db: AsyncSession):
    stmt = select(ProjectMember).options(
        selectinload(ProjectMember.project),
        selectinload(ProjectMember.member)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

# READ ONE (โหลดข้อมูล Project และ Member ด้วย)
async def get_project_member_by_id(db: AsyncSession, pm_id: UUID):
    stmt = select(ProjectMember).options(
        selectinload(ProjectMember.project),
        selectinload(ProjectMember.member)
    ).where(ProjectMember.pmId == pm_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

# UPDATE
async def update_project_member(db: AsyncSession, pm_id: UUID, pm_in: ProjectMemberCreate):
    pm_db = await db.get(ProjectMember, pm_id)
    if not pm_db:
        raise HTTPException(status_code=404, detail="ProjectMember not found")

    if pm_in.memberId is not None:
        pm_db.memberId = pm_in.memberId
    if pm_in.projectId is not None:
        pm_db.projectId = pm_in.projectId
    if pm_in.role_in_project is not None:
        pm_db.role_in_project = pm_in.role_in_project

    try:
        await db.commit()
        await db.refresh(pm_db)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return pm_db

# DELETE
async def delete_project_member(db: AsyncSession, pm_id: UUID):
    pm_db = await db.get(ProjectMember, pm_id)
    if not pm_db:
        raise HTTPException(status_code=404, detail="ProjectMember not found")

    try:
        await db.delete(pm_db)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return {"message": "ProjectMember deleted successfully"}

# READ Projects by MemberId (โหลดข้อมูล Project ด้วย)
async def get_projects_by_member_id(db: AsyncSession, member_id: UUID):
    stmt = select(ProjectMember).options(
        selectinload(ProjectMember.project),
        selectinload(ProjectMember.member)
    ).where(ProjectMember.memberId == member_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_members_by_project_id(db: AsyncSession, project_id: UUID):
    """
    ดึงข้อมูล ProjectMember ทั้งหมดที่สัมพันธ์กับ project_id ที่กำหนด
    พร้อมโหลดข้อมูลของ Member ด้วย (nested)
    """
    stmt = select(ProjectMember).options(
        selectinload(ProjectMember.member)
    ).where(ProjectMember.projectId == project_id)
    result = await db.execute(stmt)
    return result.scalars().all()
