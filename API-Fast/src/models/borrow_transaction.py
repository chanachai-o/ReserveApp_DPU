from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import relationship
from ..config.database import Base

class BorrowTransaction(Base):
    __tablename__ = "borrow_transactions"

    borrowId = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    peId = Column(UUID(as_uuid=True), ForeignKey("project_equipment.peId"), nullable=False)
    memberId = Column(UUID(as_uuid=True), ForeignKey("member.memberId"), nullable=False)
    quantity_borrowed = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default="requested")  # requested, approved, rejected, borrowed, returned
    returned_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # Approval fields
    approved_by = Column(UUID(as_uuid=True), ForeignKey("member.memberId"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejected_reason = Column(String, nullable=True)

    # Relationships
     # Relationship สำหรับผู้เบิก
    member = relationship("Member", foreign_keys=[memberId], back_populates="borrow_transactions", lazy="joined")
    # Relationship สำหรับ ProjectEquipment
    project_equipment = relationship("ProjectEquipment", back_populates="borrow_transactions", lazy="joined")
    # Relationship สำหรับผู้อนุมัติ
    approved_by_member = relationship("Member", foreign_keys=[approved_by], back_populates="borrow_transactions", lazy="joined")
