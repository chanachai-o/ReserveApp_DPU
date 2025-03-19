# myproject/controllers/borrow_controller.py

from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..models.project_equipment import ProjectEquipment
from ..models.project_member import ProjectMember
from ..models.borrow_transaction import BorrowTransaction
from ..models.equipment import Equipment
from ..schemas.borrow_schema import BorrowTransactionBase

# CREATE
async def create_borrow_transaction(db: AsyncSession, borrow_in: BorrowTransactionBase):
    """
    สร้าง BorrowTransaction โดยที่ถ้าสถานะเป็น 'approved'
    ระบบจะตัดจำนวนในสต็อกทันที (deduct stock) และบันทึกสถานะเป็น 'approved'
    Admin เป็นผู้สร้าง transaction นี้และระบุ memberId ที่เบิกอุปกรณ์
    """
    # หา ProjectEquipment ที่อ้างอิง
    pe_db = await db.get(ProjectEquipment, borrow_in.peId)
    if not pe_db:
        raise HTTPException(status_code=404, detail="ProjectEquipment not found")

    # ตรวจสอบว่า member อยู่ใน project หรือไม่
    result_pm = await db.execute(
        select(ProjectMember).where(
            ProjectMember.memberId == borrow_in.memberId,
            ProjectMember.projectId == pe_db.projectId
        )
    )
    pm_db = result_pm.scalar_one_or_none()
    if not pm_db:
        raise HTTPException(status_code=403, detail="Member is not in this project")

    # กำหนดสถานะเริ่มต้นจาก input ถ้ามี, ถ้าไม่ระบุให้เป็น "requested"
    status = borrow_in.status if borrow_in.status else "requested"
    
    new_borrow = BorrowTransaction(
        memberId=borrow_in.memberId,
        peId=borrow_in.peId,
        quantity_borrowed=borrow_in.quantity_borrowed,
        status=status
    )
    
    # ถ้าสถานะเป็น "approved" ให้ทำการตรวจสอบและตัดสต็อกทันที
    if status == "approved":
        if pe_db.quantity_in_project < borrow_in.quantity_borrowed:
            raise HTTPException(status_code=400, detail="Not enough equipment to approve")
        pe_db.quantity_in_project -= borrow_in.quantity_borrowed
        # บันทึกการตัดสต็อก (อาจเพิ่ม approved_by, approved_at ได้ที่นี่)
        new_borrow.approved_by = borrow_in.approved_by  # ถ้ามีการส่ง admin id
        new_borrow.approved_at = datetime.utcnow()
        db.add(pe_db)

    try:
        db.add(new_borrow)
        await db.commit()
        await db.refresh(new_borrow)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return new_borrow

# UPDATE
async def update_borrow_transaction(db: AsyncSession, borrow_id: UUID, borrow_up: BorrowTransactionBase):
    borrow_db = await db.get(BorrowTransaction, borrow_id)
    if not borrow_db:
        raise HTTPException(status_code=404, detail="BorrowTransaction not found")

    try:
        # ถ้า user ส่ง status ใหม่มา
        if borrow_up.status:
            # ------------------------------------------------------------------
            # 1) กรณี "approved"
            # ------------------------------------------------------------------
            if borrow_up.status == "approved":
                # ต้องเป็นคำขอที่ยังอยู่ในสถานะ requested ก่อน
                if borrow_db.status != "requested":
                    raise HTTPException(
                        status_code=400,
                        detail="Cannot approve a transaction that is not in 'requested' status."
                    )

                # หา projectEquipment
                pe_db = await db.get(ProjectEquipment, borrow_db.peId)
                if not pe_db:
                    raise HTTPException(status_code=404, detail="ProjectEquipment not found")

                # ตรวจสอบจำนวน
                if pe_db.quantity_in_project < borrow_db.quantity_borrowed:
                    raise HTTPException(status_code=400, detail="Not enough equipment to approve")

                # ตัดจำนวนใน project_equipment
                pe_db.quantity_in_project -= borrow_db.quantity_borrowed
                db.add(pe_db)

                # เปลี่ยนสถานะเป็น approved
                borrow_db.status = "approved"
                # หากต้องการเก็บว่าใครเป็นคน approved และเวลาใด
                # borrow_db.approved_by = current_admin_id
                # borrow_db.approved_at = datetime.utcnow()

            # ------------------------------------------------------------------
            # 2) กรณี "returned"
            # ------------------------------------------------------------------
            elif borrow_up.status == "returned":
                # หา projectEquipment
                pe_db = await db.get(ProjectEquipment, borrow_db.peId)
                if not pe_db:
                    raise HTTPException(status_code=404, detail="ProjectEquipment not found")

                # หาอุปกรณ์
                result_eq = await db.execute(select(Equipment).where(Equipment.equipmentId == pe_db.equipmentId))
                eq_db = result_eq.scalar_one_or_none()
                if not eq_db:
                    raise HTTPException(status_code=404, detail="Equipment not found")

                # ถ้าอุปกรณ์เป็นประเภทคืนได้ (is_returnable == True) ก็คืนจำนวน
                if eq_db.is_returnable:
                    pe_db.quantity_in_project += borrow_db.quantity_borrowed
                    db.add(pe_db)

                borrow_db.status = "returned"
                borrow_db.returned_date = datetime.utcnow()

            # ------------------------------------------------------------------
            # 3) กรณีสถานะอื่น ๆ (เช่น rejected, borrowed, ฯลฯ)
            # ------------------------------------------------------------------
            else:
                borrow_db.status = borrow_up.status

        # ถ้ามีฟิลด์อื่น เช่น quantity_borrowed หรืออื่น ๆ ก็อัปเดตที่นี่
        # if borrow_up.quantity_borrowed is not None:
        #     borrow_db.quantity_borrowed = borrow_up.quantity_borrowed
        #     ...

        db.add(borrow_db)
        await db.commit()
        await db.refresh(borrow_db)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return borrow_db


# GET ALL
async def get_all_borrow_transactions(db: AsyncSession):
    result = await db.execute(select(BorrowTransaction))
    return result.scalars().all()


# GET BY ID
async def get_borrow_transaction_by_id(db: AsyncSession, borrow_id: UUID):
    return await db.get(BorrowTransaction, borrow_id)


# DELETE
async def delete_borrow_transaction(db: AsyncSession, borrow_id: UUID):
    borrow_db = await db.get(BorrowTransaction, borrow_id)
    if not borrow_db:
        raise HTTPException(status_code=404, detail="BorrowTransaction not found")

    try:
        await db.delete(borrow_db)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return {"message": "BorrowTransaction deleted"}

# NEW API: Search BorrowTransactions by query parameters
async def search_borrow_transactions(
    db: AsyncSession,
    member_id: Optional[UUID] = None,
    peId: Optional[UUID] = None,
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
    ) -> List[BorrowTransaction]:
    """
    ค้นหา BorrowTransaction โดยสามารถกรองตาม:
      - member_id: รหัสสมาชิกที่เบิกอุปกรณ์
      - status: สถานะของการเบิก (requested, approved, returned, rejected, etc.)
      - date_from และ date_to: ช่วงวันของ created_at
    """
    query = select(BorrowTransaction)
    if member_id:
        query = query.where(BorrowTransaction.memberId == member_id)
    if peId:
        query = query.where(BorrowTransaction.peId == peId)
    if status:
        query = query.where(BorrowTransaction.status == status)
    if date_from:
        query = query.where(BorrowTransaction.created_at >= date_from)
    if date_to:
        query = query.where(BorrowTransaction.created_at <= date_to)
    result = await db.execute(query)
    return result.scalars().all()