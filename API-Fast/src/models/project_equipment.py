# myproject/models/project_equipment.py
import uuid
from sqlalchemy import Column, Integer ,ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..config.database import Base
from sqlalchemy.orm import relationship

class ProjectEquipment(Base):
    __tablename__ = "project_equipment"

    peId = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    # Foreign Keys
    projectId = Column(
        UUID(as_uuid=True),
        ForeignKey("project.projectId"),
        nullable=False
    )
    equipmentId = Column(
        UUID(as_uuid=True),
        ForeignKey("equipment.equipmentId"),
        nullable=False
    )

    quantity_in_project = Column(Integer, nullable=False, default=0)

    # Relationship กลับไปยัง Project และ Equipment
    project = relationship("Project", back_populates="project_equipment", lazy="joined")
    equipment = relationship("Equipment", lazy="joined")

    # เชื่อมโยงกับ BorrowTransaction
    borrow_transactions = relationship(
        "BorrowTransaction",
        back_populates="project_equipment"
    )
