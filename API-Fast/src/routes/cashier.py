# src/routers/cashier.py
from decimal import Decimal
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.config.database import get_db
from src.dependencies import get_current_active_user
from src.models import UserRole, User, Order, OrderStatus, StoreProfile
from src.schemas import CheckoutRequest, CheckoutResponse
from utils.qr import generate_promptpay_qr

cashier_router = APIRouter(prefix="/cashier", tags=["Cashier"])

QR_DIR = Path("static/qr")

@cashier_router.post(
    "/orders/{order_id}/checkout",
    response_model=CheckoutResponse,
    summary="คิดเงิน & สร้าง QR จ่ายเงิน"
)
async def checkout_order(
    order_id: int,
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    # 1) Role check
    if current.role not in {UserRole.cashier, UserRole.manager, UserRole.staff}:
        raise HTTPException(403, "Not authorised")

    # 2) หาบิลที่พร้อมคิดเงิน
    stmt = select(Order).where(Order.id == order_id)
    order: Order = (await db.execute(stmt)).scalars().first()
    if not order:
        raise HTTPException(404, "Order not found")
    if order.status not in {"served", "pending"}:
        raise HTTPException(400, "Order not in correct state for checkout")

    # 3) ดึง store profile เพื่อรู้ service_charge_pct / vat_pct
    profile: StoreProfile = (
        await db.execute(select(StoreProfile).limit(1))
    ).scalars().first()
    sc_pct = profile.service_charge_pct or Decimal(0)
    vat_pct = profile.vat_pct or Decimal(0)

    # 4) คำนวณ
    sub_total = order.total_amount                           # จากตอนสร้างออเดอร์
    service_charge = (sub_total * sc_pct / 100).quantize(Decimal("0.01"))
    discount = Decimal(0)
    if payload.discount_type == "percent":
        discount = (sub_total * Decimal(payload.discount_value) / 100).quantize(Decimal("0.01"))
    elif payload.discount_type == "fixed":
        discount = Decimal(payload.discount_value).quantize(Decimal("0.01"))

    vat_base = (sub_total + service_charge - discount)
    vat = (vat_base * vat_pct / 100).quantize(Decimal("0.01"))
    grand_total = (vat_base + vat).quantize(Decimal("0.01"))

    # 5) สร้าง QR
    qr_path = generate_promptpay_qr(float(grand_total), profile.phone, QR_DIR, order_id)

    # 6) บันทึก
    order.service_charge = service_charge
    order.discount = discount
    order.vat = vat
    order.grand_total = grand_total
    order.checkout_qr = qr_path
    order.status = OrderStatus.checkout_pending
    await db.commit()
    await db.refresh(order)

    return CheckoutResponse(
        order_id=order.id,
        sub_total=sub_total,
        service_charge=service_charge,
        discount=discount,
        vat=vat,
        grand_total=grand_total,
        qr_code_url=f"/static/qr/{Path(qr_path).name}",
        status=order.status.value,
    )
