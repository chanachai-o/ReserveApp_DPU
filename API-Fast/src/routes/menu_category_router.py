from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..config.database import get_db
from ..controllers.menu_category_controller import (
    get_all_categorys,
    get_category_by_id,
    create_category,
    update_category,
    delete_category
)
from ..schemas.menu_category_schema import MenuCategoryCreate, MenuCategoryUpdate, MenuCategoryResponse

router = APIRouter()

@router.get("/", response_model=List[MenuCategoryResponse])
async def get_menus_route(db: AsyncSession = Depends(get_db)):
    return await get_all_categorys(db)

@router.get("/{menuId}", response_model=MenuCategoryResponse)
async def get_menu_by_id_route(menuId: str, db: AsyncSession = Depends(get_db)):
    return await get_category_by_id(menuId, db)

@router.post("/", response_model=MenuCategoryResponse)
async def create_menu_route(menu: MenuCategoryCreate, db: AsyncSession = Depends(get_db)):
    return await create_category(menu.dict(), db)

@router.put("/{menuId}", response_model=MenuCategoryResponse)
async def update_menu_route(menuId: str, menu: MenuCategoryUpdate, db: AsyncSession = Depends(get_db)):
    return await update_category(menuId, menu.dict(exclude_unset=True), db)

@router.delete("/{menuId}")
async def delete_menu_route(menuId: str, db: AsyncSession = Depends(get_db)):
    await delete_category(menuId, db)
    return {"detail": "Menu deleted successfully"}
