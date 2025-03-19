from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from .project_schema import ProjectResponse  # Schema ของ Project
from .member_schema import MemberResponse    # Schema ของ Member

class ProjectMemberBase(BaseModel):
    memberId: UUID
    role_in_project: Optional[str] = None

class ProjectMemberCreate(ProjectMemberBase):
    projectId: UUID

class ProjectMemberResponse(ProjectMemberBase):
    pmId: UUID
    projectId: UUID
    project: Optional[ProjectResponse] = None  # ข้อมูลของ Project ที่สัมพันธ์กัน
    member: Optional[MemberResponse] = None    # ข้อมูลของ Member ที่สัมพันธ์กัน

    class Config:
        orm_mode = True
