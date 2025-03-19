# myproject/routes/menus_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.database import get_db
from ..controllers.menu_controller import (
    get_all_menus,
    get_menu_by_id,
    create_menu,
    update_menu,
    delete_menu
)
from ..schemas.menu_schema import (
    MenuCreate,
    MenuUpdate,
    MenuResponse
)

router = APIRouter()

# GET ALL
@router.get("/", response_model=List[MenuResponse])
async def read_menus(db: AsyncSession = Depends(get_db)):
    return await get_all_menus(db)

# GET ONE
@router.get("/{menusId}", response_model=MenuResponse)
async def read_menus(menusId: UUID, db: AsyncSession = Depends(get_db)):
    eq_db = await get_menu_by_id(menusId, db)
    if not eq_db:
        raise HTTPException(status_code=404, detail="Menus not found")
    return eq_db

# CREATE
@router.post("/", response_model=MenuResponse, status_code=status.HTTP_201_CREATED)
async def create_new_menus(
    menus_in: MenuCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_menu(menus_in, db)

# UPDATE
@router.put("/{menusId}", response_model=MenuResponse)
async def update_existing_menus(
    menusId: UUID,
    menus_in: MenuUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await update_menu(menusId, menus_in, db)

# DELETE
@router.delete("/{menusId}")
async def delete_existing_menus(
    menusId: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await delete_menu(menusId, db)
