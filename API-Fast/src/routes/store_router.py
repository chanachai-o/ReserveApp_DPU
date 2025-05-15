# src/routers/store.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import StoreProfile, UserRole, User
from src.schemas import StoreProfileCreate, StoreProfileUpdate, StoreProfileOut
from src.config.database import get_db

store_router = APIRouter(prefix="/store", tags=["Store"])

# ────────────────────────────────────────────────
@store_router.get("/profile", response_model=StoreProfileOut)
async def get_store_profile(db: AsyncSession = Depends(get_db)):
    stmt = select(StoreProfile).limit(1)
    result = await db.execute(stmt)
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(404, "Store profile not found")
    return profile


@store_router.post(
    "/profile",
    status_code=status.HTTP_201_CREATED,
    response_model=StoreProfileOut,
)
async def create_store_profile(
    payload: StoreProfileCreate,
    db: AsyncSession = Depends(get_db)
):
    # ➊ อนุญาตเฉพาะ Manager
    # if current.role != UserRole.manager:
    #     raise HTTPException(403, "Not authorised")

    # ➋ อนุญาตสร้างได้ครั้งเดียว
    stmt = select(StoreProfile).limit(1)
    if (await db.execute(stmt)).scalars().first():
        raise HTTPException(400, "Store profile already exists")

    profile = StoreProfile(**payload.dict())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@store_router.put("/profile", response_model=StoreProfileOut)
async def update_store_profile(
    payload: StoreProfileUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StoreProfile).limit(1)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    # ถ้ายังไม่มีให้สร้างใหม่จากข้อมูลที่ส่งมา
    if not profile:
        profile = StoreProfile(**payload.dict(exclude_unset=True))
        db.add(profile)
    else:
        for key, value in payload.dict(exclude_unset=True).items():
            setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile
