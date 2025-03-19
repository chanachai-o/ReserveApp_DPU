# myproject/models/project_member.py

import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..config.database import Base
from sqlalchemy.orm import relationship

class ProjectMember(Base):
    __tablename__ = 'project_member'

    pmId = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    memberId = Column(UUID(as_uuid=True), ForeignKey("member.memberId"), nullable=False)
    projectId = Column(UUID(as_uuid=True), ForeignKey("project.projectId"), nullable=False)
    role_in_project = Column(String(100), nullable=True)
    
    project = relationship("Project", back_populates="project_member", lazy="joined")
    member = relationship("Member", back_populates="project_member", lazy="joined")
