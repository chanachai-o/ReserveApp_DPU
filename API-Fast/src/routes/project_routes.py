# myproject/routes/project_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.database import get_db
from ..controllers.project_controller import (
    create_project,
    get_all_projects,
    get_project_by_id,
    update_project,
    delete_project
)
from ..schemas.project_schema import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse
)

router = APIRouter()

# CREATE
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    project = await create_project(db, project_in)
    return project

# READ ALL
@router.get("/", response_model=List[ProjectResponse])
async def read_all_projects(db: AsyncSession = Depends(get_db)):
    projects = await get_all_projects(db)
    return projects

# READ ONE
@router.get("/{id}", response_model=ProjectResponse)
async def read_project_by_id(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    project = await get_project_by_id(db, id)
    if not project:
        raise HTTPException(
            status_code=404, detail="Project not found"
        )
    return project

# UPDATE
@router.put("/{id}", response_model=ProjectResponse)
async def update_existing_project(
    id: UUID,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    updated = await update_project(db, id, project_in)
    return updated

# DELETE
@router.delete("/{id}")
async def delete_existing_project(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await delete_project(db, id)
