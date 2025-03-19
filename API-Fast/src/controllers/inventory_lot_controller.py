# myproject/controllers/inventory_lot_controller.py

from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..models.inventory_lot import InventoryLot
from ..models.equipment import Equipment
from ..schemas.inventory_lot_schema import InventoryLotCreate
from ..models.inventory_lot import InventoryAction

async def create_inventory_lot(db: AsyncSession, lot_in: InventoryLotCreate):
    # 1) ตรวจสอบว่า equipmentId นี้มีอยู่จริงไหม
    equipment_db = await db.get(Equipment, lot_in.equipmentId)
    if not equipment_db:
        raise HTTPException(status_code=400, detail="Invalid equipmentId")

    new_lot = InventoryLot(**lot_in.dict())

    try:
        db.add(new_lot)
        # ปรับปรุง quantity ของ equipment ถ้าต้องการ
        if lot_in.action == 'INBOUND':
            equipment_db.quantity += lot_in.quantity
        elif lot_in.action in ["OUTBOUND", InventoryAction.SCRAP, InventoryAction.MAINTENANCE_OUT]:
            if equipment_db.quantity < lot_in.quantity:
                raise HTTPException(status_code=400, detail="Not enough quantity in stock")
            equipment_db.quantity -= lot_in.quantity

        db.add(equipment_db)
        await db.commit()
        await db.refresh(new_lot)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return new_lot

async def get_all_inventory_lots(db: AsyncSession):
    result = await db.execute(select(InventoryLot))
    return result.scalars().all()

async def get_inventory_lot_by_id(db: AsyncSession, lot_id: UUID):
    return await db.get(InventoryLot, lot_id)

# ถ้าอยากมี update/delete ก็ทำได้เช่นเดียวกับ CRUD ทั่วไป
