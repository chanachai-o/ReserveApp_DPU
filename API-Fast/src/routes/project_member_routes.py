# myproject/routes/project_member_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.database import get_db
from ..controllers.project_member_controller import (
    create_project_member,
    get_all_project_members,
    get_project_member_by_id,
    update_project_member,
    delete_project_member,
    get_projects_by_member_id,
    get_members_by_project_id
)
from ..schemas.project_member_schema import (
    ProjectMemberCreate,
    ProjectMemberResponse
)

router = APIRouter()

# CREATE
@router.post("/", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_pm_endpoint(
    pm_in: ProjectMemberCreate,
    db: AsyncSession = Depends(get_db)
):
    new_pm = await create_project_member(db, pm_in)
    return new_pm

# READ ALL
@router.get("/", response_model=List[ProjectMemberResponse])
async def read_all_pms(db: AsyncSession = Depends(get_db)):
    pms = await get_all_project_members(db)
    return pms

# READ ONE
@router.get("/{pmId}", response_model=ProjectMemberResponse)
async def read_pm_by_id(
    pmId: UUID,
    db: AsyncSession = Depends(get_db)
):
    pm_db = await get_project_member_by_id(db, pmId)
    if not pm_db:
        raise HTTPException(status_code=404, detail="ProjectMember not found")
    return pm_db

# UPDATE
@router.put("/{pmId}", response_model=ProjectMemberResponse)
async def update_pm_endpoint(
    pmId: UUID,
    pm_in: ProjectMemberCreate,
    db: AsyncSession = Depends(get_db)
):
    updated_pm = await update_project_member(db, pmId, pm_in)
    return updated_pm

# DELETE
@router.delete("/{pmId}")
async def delete_pm_endpoint(
    pmId: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await delete_project_member(db, pmId)

@router.get("/member/{memberId}", response_model=List[ProjectMemberResponse])
async def get_projects_for_member(
    memberId: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงรายการ ProjectMember ทั้งหมดที่ memberId คนนี้สังกัดอยู่
    """
    pms = await get_projects_by_member_id(db, memberId)
    return pms

@router.get("/project/{projectId}", response_model=List[ProjectMemberResponse])
async def get_member_for_project(
    projectId: UUID,
    db: AsyncSession = Depends(get_db)
):
    pms = await get_members_by_project_id(db, projectId)
    return pms