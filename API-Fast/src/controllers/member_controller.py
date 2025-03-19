from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException
from uuid import UUID

from ..models.member import Member
from ..utils.file_handler import save_uploaded_file
from ..schemas.member_schema import MemberCreate, MemberUpdate


async def get_users(db: AsyncSession):
    result = await db.execute(select(Member))
    return result.scalars().all()


async def get_user_by_id(member_id: UUID, db: AsyncSession):
    user = await db.get(Member, member_id)
    return user


async def create_user(user_data: MemberCreate, db: AsyncSession):
    # เช็คก่อนว่ามี username หรือ email ที่ซ้ำไหม (ถ้าระบบออกแบบว่าต้อง unique)
    # ตัวอย่างเช็คซ้ำด้วย username:
    result = await db.execute(select(Member).where(Member.username == user_data.username))
    existing_member = result.scalar_one_or_none()
    if existing_member:
        raise HTTPException(status_code=400, detail="Username already taken")

    # สร้าง User
    try:
        new_user = Member(
            username=user_data.username,
            firstName=user_data.firstName,
            lastName=user_data.lastName,
            email=user_data.email,
            phoneNumber=user_data.phoneNumber,
            role=user_data.role,
            status=user_data.status
        )
        new_user.hash_password(user_data.password)

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return new_user
    except IntegrityError as ie:
        # ถ้ามี constraint อะไรซ้ำหรือผิดพลาด
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(ie.orig))
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def update_user(member_id: UUID, user_data: MemberUpdate, db: AsyncSession):
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # อัปเดตฟิลด์ทีละค่า (check None ก่อน)
    if user_data.username is not None:
        member.username = user_data.username

    if user_data.password is not None and user_data.password != "":
        member.hash_password(user_data.password)

    if user_data.firstName is not None:
        member.firstName = user_data.firstName

    if user_data.lastName is not None:
        member.lastName = user_data.lastName

    if user_data.email is not None:
        member.email = user_data.email

    if user_data.phoneNumber is not None:
        member.phoneNumber = user_data.phoneNumber

    if user_data.role is not None:
        member.role = user_data.role

    if user_data.status is not None:
        member.status = user_data.status

    if user_data.picture is not None:
        member.picture = user_data.picture

    try:
        await db.commit()
        await db.refresh(member)
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return member


async def delete_user(member_id: UUID, db: AsyncSession):
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    try:
        await db.delete(member)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "actionStatus": "Success",
        "message": "User deleted successfully",
        "statusCode": 200,
    }
