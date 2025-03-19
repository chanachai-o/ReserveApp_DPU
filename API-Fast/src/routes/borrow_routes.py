# myproject/routes/borrow_routes.py

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.database import get_db
from ..controllers.borrow_controller import (
    create_borrow_transaction,
    update_borrow_transaction,
    get_all_borrow_transactions,
    get_borrow_transaction_by_id,
    delete_borrow_transaction,
    search_borrow_transactions
)
from ..schemas.borrow_schema import (
    BorrowTransactionBase,
    BorrowTransactionResponse,
)

router = APIRouter()

# CREATE (พนักงานยืมอุปกรณ์)
@router.post("/", response_model=BorrowTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_borrow_endpoint(
    borrow_in: BorrowTransactionBase,
    db: AsyncSession = Depends(get_db)
):
    new_borrow = await create_borrow_transaction(db, borrow_in)
    return new_borrow

# UPDATE (เช่น คืนอุปกรณ์)
@router.put("/{borrowId}", response_model=BorrowTransactionResponse)
async def update_borrow_endpoint(
    borrowId: UUID,
    borrow_up: BorrowTransactionBase,
    db: AsyncSession = Depends(get_db)
):
    updated_borrow = await update_borrow_transaction(db, borrowId, borrow_up)
    return updated_borrow

# GET ALL
@router.get("/", response_model=List[BorrowTransactionResponse])
async def get_all_borrows_endpoint(db: AsyncSession = Depends(get_db)):
    return await get_all_borrow_transactions(db)

# GET BY ID
@router.get("/{borrowId}", response_model=BorrowTransactionResponse)
async def get_borrow_by_id_endpoint(
    borrowId: UUID,
    db: AsyncSession = Depends(get_db)
):
    tx = await get_borrow_transaction_by_id(db, borrowId)
    if not tx:
        raise HTTPException(status_code=404, detail="BorrowTransaction not found")
    return tx

# DELETE
@router.delete("/{borrowId}")
async def delete_borrow_endpoint(
    borrowId: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await delete_borrow_transaction(db, borrowId)

# NEW API: Search BorrowTransactions by query parameters
@router.get("/search/borrow", response_model=List[BorrowTransactionResponse])
async def search_borrow_endpoint(
    member_id: Optional[UUID] = None,
    peId: Optional[UUID] = None,
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    results = await search_borrow_transactions(db, member_id,peId, status, date_from, date_to)
    return results