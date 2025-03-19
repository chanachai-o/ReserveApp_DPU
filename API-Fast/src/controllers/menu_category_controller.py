from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from ..models.menu import MenuCategory
from fastapi import HTTPException, status

# ดึงข้อมูล category ทั้งหมด
async def get_all_categorys(db: AsyncSession):
    result = await db.execute(select(MenuCategory))
    return result.scalars().all()

# ดึงข้อมูล category ตาม ID
async def get_category_by_id(menuId: str, db: AsyncSession):
    result = await db.execute(select(MenuCategory).where(MenuCategory.menuId == menuId))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MenuCategory not found")
    return category

# สร้าง category ใหม่
async def create_category(menu_data: dict, db: AsyncSession):
    new_category = MenuCategory(**menu_data)
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category

# อัปเดต category
async def update_category(menuId: str, menu_data: dict, db: AsyncSession):
    category = await db.get(MenuCategory, menuId)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MenuCategory not found")

    # อัปเดตข้อมูล category
    for key, value in menu_data.items():
        setattr(category, key, value)

    await db.commit()
    await db.refresh(category)
    return category

# ลบ category
async def delete_category(menuId: str, db: AsyncSession):
    category = await db.get(MenuCategory, menuId)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MenuCategory not found")

    await db.delete(category)
    await db.commit()
