from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..config.database import get_db
from ..models.member import Member
from ..schemas.member_schema import UserResponse,UserUpdate,UserCreate
from ..controllers.member_controller import (
    get_users,
    get_user,
    create_user,
    update_user,
    delete_user
)
from ..middlewares.auth_middleware import authenticate_jwt  # Middleware for token authentication

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_route(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = create_user(db, user)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/", response_model=list[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.put("/{user_id}", response_model=UserResponse)
def update_user_route(user_id: int, user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    db_user = update_user(db, user_id, user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}", response_model=UserResponse)
def delete_user_route(user_id: int, db: AsyncSession = Depends(get_db)):
    db_user = delete_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user