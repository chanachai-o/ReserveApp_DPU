from fastapi import HTTPException
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select

from ..models.project import Project
from ..schemas.project_schema import ProjectCreate, ProjectUpdate

# CREATE
async def create_project(db: AsyncSession, project_in: ProjectCreate):
    new_project = Project(
        project_name=project_in.project_name,
        project_desc=project_in.project_desc,
        project_code=project_in.project_code,
        start_date=project_in.start_date,
        end_date=project_in.end_date,
        picture=project_in.picture,
        contact=project_in.contact,
        responsible=project_in.responsible
    )
    try:
        db.add(new_project)
        await db.commit()
        await db.refresh(new_project)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))
    return new_project

# READ ALL
async def get_all_projects(db: AsyncSession):
    result = await db.execute(select(Project))
    return result.scalars().all()

# READ ONE
async def get_project_by_id(db: AsyncSession, project_id: UUID):
    project_db = await db.get(Project, project_id)
    return project_db

# UPDATE
async def update_project(db: AsyncSession, project_id: UUID, project_in: ProjectUpdate):
    project_db = await db.get(Project, project_id)
    if not project_db:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update fields
    if project_in.project_name is not None:
        project_db.project_name = project_in.project_name
    if project_in.project_desc is not None:
        project_db.project_desc = project_in.project_desc
    if project_in.project_code is not None:
        project_db.project_code = project_in.project_code
    if project_in.start_date is not None:
        project_db.start_date = project_in.start_date
    if project_in.end_date is not None:
        # สมมติว่าต้องการเช็คไม่ให้ end_date < start_date
        if project_in.start_date and project_in.end_date < project_in.start_date:
            raise HTTPException(status_code=400, detail="end_date cannot be before start_date")
        project_db.end_date = project_in.end_date
    if project_in.picture is not None:
        project_db.picture = project_in.picture
    if project_in.responsible is not None:
        project_db.responsible = project_in.responsible
    if project_in.contact is not None:
        project_db.contact = project_in.contact

    try:
        await db.commit()
        await db.refresh(project_db)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))
    return project_db

# DELETE
async def delete_project(db: AsyncSession, project_id: UUID):
    project_db = await db.get(Project, project_id)
    if not project_db:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        await db.delete(project_db)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return {"message": "Project deleted successfully"}
