from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from .project_schema import ProjectResponse
from .equipment_schema import EquipmentResponse

class ProjectEquipmentBase(BaseModel):
    quantity_in_project: int = 0

class ProjectEquipmentCreate(ProjectEquipmentBase):
    projectId: UUID
    equipmentId: UUID

class ProjectEquipmentResponse(ProjectEquipmentBase):
    peId: UUID
    projectId: UUID
    equipmentId: UUID
    project: Optional[ProjectResponse] = None
    equipment: Optional[EquipmentResponse] = None

    class Config:
        orm_mode = True
