# myproject/schemas/borrow_schema.py
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

from .member_schema import MemberResponse         # Schema สำหรับ Member
from .project_equipment_schema import ProjectEquipmentResponse  # Schema สำหรับ ProjectEquipment

class BorrowTransactionBase(BaseModel):
    peId: Optional[UUID] = None
    quantity_borrowed: int
    status: str = "borrowed"     # เช่น requested, borrowed, returned
    returned_date: Optional[datetime] = None
    memberId: UUID
    approved_by : Optional[UUID] = None

class BorrowTransactionCreate(BorrowTransactionBase):
    peId: UUID
    memberId: UUID

class BorrowTransactionResponse(BorrowTransactionBase):
    borrowId: UUID
    created_at: datetime
    peId: UUID
    memberId: UUID
    # แสดงข้อมูลของสมาชิกที่เบิกอุปกรณ์ (จาก memberId)
    member: Optional[MemberResponse] = None
    # แสดงข้อมูลของ project_equipment ที่ผูกกับ peId ซึ่งจะมีข้อมูลอุปกรณ์ (ผ่าน relationship ใน ORM)
    project_equipment: Optional[ProjectEquipmentResponse] = None
    # แสดงข้อมูลของสมาชิกที่อนุมัติ (จาก approved_by)
    approved_by_member: Optional[MemberResponse] = None

    class Config:
        orm_mode = True