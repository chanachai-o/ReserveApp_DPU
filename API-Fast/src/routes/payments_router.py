# src/routes/payments_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

# --- Local Imports ---
from ..config.database import get_db
# เพิ่ม Notification และ User models เข้ามา
from ..models import Payment, Order, PaymentStatus, Notification, User
from ..schemas import PaymentCreate, PaymentUpdate, PaymentOut, PaymentVerify
# from ..middlewares.auth_middleware import require_role # หากต้องการใช้ auth

payments_router = APIRouter()

# ================================================================
#                       Payment Endpoints
# ================================================================

@payments_router.post("/payments", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_in: PaymentCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    สร้างรายการชำระเงินใหม่สำหรับออเดอร์
    - Endpoint นี้มักจะถูกเรียกใช้โดยระบบ (เช่น ตอน checkout) ไม่ใช่โดยตรงจากลูกค้า
    """
    # ตรวจสอบว่า Order ที่จะจ่ายเงินมีอยู่จริงหรือไม่
    order = await db.get(Order, payment_in.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {payment_in.order_id} not found."
        )

    # TODO: เพิ่ม Logic ตรวจสอบว่ายอดที่จ่าย (payment_in.amount) ตรงกับยอดรวมของออเดอร์ (order.total_amount) หรือไม่

    db_payment = Payment(**payment_in.model_dump())
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment


@payments_router.get("/payments", response_model=List[PaymentOut])
async def get_all_payments(
    order_id: Optional[int] = None,
    status: Optional[PaymentStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลการชำระเงินทั้งหมด สามารถกรองตาม order_id หรือ status ได้
    """
    stmt = select(Payment).order_by(Payment.created_at.desc())
    if order_id:
        stmt = stmt.where(Payment.order_id == order_id)
    if status:
        stmt = stmt.where(Payment.status == status)
    
    result = await db.execute(stmt)
    payments = result.scalars().all()
    return payments


@payments_router.get("/payments/{payment_id}", response_model=PaymentOut)
async def get_payment_by_id(
    payment_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลการชำระเงินตาม ID
    """
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


@payments_router.post("/payments/{payment_id}/verify", response_model=PaymentOut)
async def verify_payment(
    payment_id: int, 
    verify_data: PaymentVerify, 
    db: AsyncSession = Depends(get_db)
    # current_user: User = Depends(require_role("cashier")) # จำกัดสิทธิ์เฉพาะ Cashier หรือ Manager
):
    """
    ยืนยันหรือปฏิเสธการชำระเงิน (สำหรับ Cashier/Manager)
    และส่งการแจ้งเตือนไปยังลูกค้า
    """
    # Eager load the order and user relationship to get the user_id for notification
    stmt = (
        select(Payment)
        .where(Payment.id == payment_id)
        .options(selectinload(Payment.order).selectinload(Order.user))
    )
    result = await db.execute(stmt)
    payment = result.scalars().first()
    
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if payment.status == PaymentStatus.COMPLETED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This payment has already been completed.")

    payment.status = verify_data.status
    
    # --- เพิ่มการสร้าง Notification ---
    if payment.order and payment.order.user:
        title = ""
        message = ""
        if payment.status == PaymentStatus.COMPLETED:
            title = "การชำระเงินสำเร็จ"
            message = f"การชำระเงินสำหรับออเดอร์ #{payment.order_id} จำนวน {payment.amount} บาท สำเร็จแล้ว"
            # TODO: เพิ่ม Logic อัปเดตสถานะ Order/Reservation ที่เกี่ยวข้องเป็น COMPLETED
            
        elif payment.status == PaymentStatus.FAILED:
            title = "การชำระเงินล้มเหลว"
            message = f"การชำระเงินสำหรับออเดอร์ #{payment.order_id} ล้มเหลว กรุณาติดต่อพนักงาน"
            
        if title and message:
            notification = Notification(
                user_id=payment.order.user.id,
                title=title,
                message=message,
                type="payment_update"
            )
            db.add(notification)
    # --- สิ้นสุดการสร้าง Notification ---

    await db.commit()
    await db.refresh(payment)
    return payment
