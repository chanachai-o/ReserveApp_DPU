# myproject/controllers/menus_controller.py

from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..models.menu import Menu
from ..schemas.menu_schema import MenuCreate, MenuUpdate

async def get_all_menus(db: AsyncSession):
    result = await db.execute(select(Menu))
    return result.scalars().all()

async def get_menu_by_id(menu_id: UUID, db: AsyncSession):
    # ใช้ db.get เพื่อความสั้น
    eq_db = await db.get(Menu, menu_id)
    return eq_db

async def create_menu(menu_data: MenuCreate, db: AsyncSession):
    new_menu = Menu(
        menuName=menu_data.menuName,
        description=menu_data.description,
        categoryId=menu_data.categoryId,
        price=menu_data.price,
        picture=menu_data.picture,
    )
    db.add(new_menu)
    try:
        await db.commit()
        await db.refresh(new_menu)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))
    return new_menu

async def update_menu(menu_id: UUID, menu_data: MenuUpdate, db: AsyncSession):
    eq_db = await db.get(Menu, menu_id)
    if not eq_db:
        raise HTTPException(status_code=404, detail="Menu not found")

    if menu_data.menuName is not None:
        eq_db.menuName = menu_data.menuName
    if menu_data.description is not None:
        eq_db.description = menu_data.description
    if menu_data.price is not None:
        eq_db.price = menu_data.price
    if menu_data.is_returnable is not None:
        eq_db.is_returnable = menu_data.is_returnable
    if menu_data.picture is not None:
        eq_db.picture = menu_data.picture

    try:
        await db.commit()
        await db.refresh(eq_db)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return eq_db

async def delete_menu(menu_id: UUID, db: AsyncSession):
    eq_db = await db.get(Menu, menu_id)
    if not eq_db:
        raise HTTPException(status_code=404, detail="Menu not found")

    try:
        await db.delete(eq_db)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))

    return {"message": "Menu deleted successfully"}
