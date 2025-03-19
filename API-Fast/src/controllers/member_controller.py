from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException
from uuid import UUID

from ..models.member import Member
from ..utils.file_handler import save_uploaded_file
from ..schemas.member_schema import UserCreate,UserUpdate


def create_user(db: AsyncSession, user: UserCreate):
    db_user = Member(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: AsyncSession, user_id: int):
    return db.query(Member).filter(Member.id == user_id).first()

def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    return db.query(Member).offset(skip).limit(limit).all()

def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate):
    db_user = db.query(Member).filter(Member.id == user_id).first()
    if not db_user:
        return None
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: AsyncSession, user_id: int):
    db_user = db.query(Member).filter(Member.id == user_id).first()
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return db_user