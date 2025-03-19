# myproject/routers/inventory_lot_router.py

from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from ..controllers.inventory_lot_controller import (
    create_inventory_lot,
    get_all_inventory_lots,
    get_inventory_lot_by_id
)
from ..schemas.inventory_lot_schema import InventoryLotCreate, InventoryLotResponse
from ..config.database import get_db

router = APIRouter()

@router.post("/", response_model=InventoryLotResponse)
async def create_lot(lot_in: InventoryLotCreate, db: AsyncSession = Depends(get_db)):
    return await create_inventory_lot(db, lot_in)

@router.get("/", response_model=list[InventoryLotResponse])
async def read_all_lots(db: AsyncSession = Depends(get_db)):
    return await get_all_inventory_lots(db)

@router.get("/{lot_id}", response_model=InventoryLotResponse)
async def read_lot_by_id(lot_id: UUID, db: AsyncSession = Depends(get_db)):
    lot = await get_inventory_lot_by_id(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="InventoryLot not found")
    return lot
