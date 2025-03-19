# myproject/models/project.py
import uuid
from sqlalchemy import Column, String, Text, Date ,DateTime
from sqlalchemy.dialects.postgresql import UUID
from ..config.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
class Project(Base):
    __tablename__ = 'project'  # ชื่อตาราง

    projectId = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    project_name = Column(String(255), nullable=False)
    project_desc = Column(Text, nullable=True)
    project_code = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    picture = Column(String)
    responsible = Column(String)
    contact = Column(String)
    createdAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationship เชื่อมไปยัง ProjectMember และ ProjectEquipment
    project_member = relationship(
        "ProjectMember",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    project_equipment = relationship(
        "ProjectEquipment",
        back_populates="project",
        cascade="all, delete-orphan"
    )
