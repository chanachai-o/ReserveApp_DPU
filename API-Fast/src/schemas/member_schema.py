from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


# Base schema (shared properties)
# สำหรับข้อมูลที่ใช้ในการอ่าน (Response)
class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[EmailStr] = None
    role: str
    is_active: bool

    class Config:
        orm_mode = True

# สำหรับข้อมูลที่ใช้ในการสร้าง User (Create)
class UserCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    role: Optional[str] = "customer"

# สำหรับข้อมูลที่ใช้ในการอัปเดต User (Update)
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None