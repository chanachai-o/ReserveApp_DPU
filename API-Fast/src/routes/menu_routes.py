# src/routes/menu_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

# --- Local Imports ---
from ..config.database import get_db
from ..models import Menu, MenuCategory
from ..schemas import MenuCreate, MenuUpdate, MenuOut
# from ..middlewares.auth_middleware import require_role # หากต้องการใช้ auth

menu_router = APIRouter()

# ================================================================
#                       Menu Endpoints
# ================================================================

@menu_router.post("/menus", response_model=MenuOut, status_code=status.HTTP_201_CREATED)
async def create_new_menu(
    menu_in: MenuCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างรายการเมนูใหม่
    """
    # ตรวจสอบว่า category_id ที่ระบุมามีอยู่จริงหรือไม่
    category = await db.get(MenuCategory, menu_in.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"MenuCategory with id {menu_in.category_id} not found."
        )

    db_menu = Menu(**menu_in.model_dump())
    db.add(db_menu)
    await db.commit()
    
    # Eager load the 'category' relationship before returning
    await db.refresh(db_menu, ["category"])
    
    return db_menu


@menu_router.get("/menus", response_model=List[MenuOut])
async def get_all_menus(
    category_id: Optional[int] = None,
    available_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลเมนูทั้งหมด สามารถกรองตามหมวดหมู่ (category_id)
    และสถานะความพร้อมใช้งาน (available_only)
    """
    stmt = (
        select(Menu)
        .options(selectinload(Menu.category)) # Eager load category data
        .order_by(Menu.id)
    )
    
    if category_id:
        stmt = stmt.where(Menu.category_id == category_id)
    
    if available_only:
        stmt = stmt.where(Menu.is_active == True)

    result = await db.execute(stmt)
    menus = result.scalars().all()
    return menus


@menu_router.get("/menus/{menu_id}", response_model=MenuOut)
async def get_menu_by_id(
    menu_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลเมนูตาม ID
    """
    stmt = (
        select(Menu)
        .where(Menu.id == menu_id)
        .options(selectinload(Menu.category))
    )
    result = await db.execute(stmt)
    menu = result.scalars().first()
    
    if not menu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found")
    return menu


@menu_router.put("/menus/{menu_id}", response_model=MenuOut)
async def update_existing_menu(
    menu_id: int,
    menu_in: MenuUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    อัปเดตข้อมูลเมนู
    """
    db_menu = await db.get(Menu, menu_id)
    if not db_menu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found")

    update_data = menu_in.model_dump(exclude_unset=True)

    # ตรวจสอบ category_id ใหม่ (ถ้ามีการส่งมา)
    if 'category_id' in update_data:
        category = await db.get(MenuCategory, update_data['category_id'])
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"MenuCategory with id {update_data['category_id']} not found."
            )

    for key, value in update_data.items():
        setattr(db_menu, key, value)
    
    await db.commit()
    
    # Eager load the 'category' relationship before returning
    await db.refresh(db_menu, ["category"])
    
    return db_menu


@menu_router.delete("/menus/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    ลบเมนู
    """
    db_menu = await db.get(Menu, menu_id)
    if not db_menu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found")
    
    await db.delete(db_menu)
    await db.commit()
    return None
