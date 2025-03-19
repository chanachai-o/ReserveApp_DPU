# myproject/schemas/project_schema.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date

class ProjectBase(BaseModel):
    project_name: str
    project_desc: Optional[str] = None
    project_code: Optional[str] = None
    responsible: Optional[str] = None
    contact: Optional[str] = None
    start_date: Optional[date] = None
    picture: Optional[str] = None
    end_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass  # อาจจะไม่มีฟิลด์เพิ่มเติม

class ProjectUpdate(ProjectBase):
    pass  # ใช้สำหรับแก้ไข

class ProjectResponse(ProjectBase):
    projectId: UUID

    class Config:
        orm_mode = True