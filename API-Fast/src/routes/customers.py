# src/routers/customers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import User, UserRole, Reservation, Order
from ..schemas import CustomerHistoryOut, CustomerBanUpdate, ReservationBrief, OrderBrief
from ..config.database import get_db


customers_router = APIRouter(prefix="/customers", tags=["Customers"])

# ──────────────────────────────────────────────────────────────
@customers_router.get("/{customer_id}/history", response_model=CustomerHistoryOut)
async def get_customer_history(
    customer_id: int,
    db: AsyncSession = Depends(get_db)
):
    # ✅ Manager only

    # ── 1. ดึง User (ต้องเป็นลูกค้า)
    stmt_user = select(User).where(User.id == customer_id)
    user = (await db.execute(stmt_user)).scalars().first()
    if not user or user.role != UserRole.customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # ── 2. ดึง Reservations
    stmt_res = select(Reservation).where(Reservation.user_id == customer_id).order_by(Reservation.start_time.desc())
    reservations = (await db.execute(stmt_res)).scalars().all()

    # ── 3. ดึง Orders
    stmt_ord = select(Order).where(Order.user_id == customer_id).order_by(Order.id.desc())
    orders = (await db.execute(stmt_ord)).scalars().all()

    return CustomerHistoryOut(
        customer_id=user.id,
        name=user.name,
        phone=user.phone,
        reservations=reservations,
        orders=orders,
    )

# ──────────────────────────────────────────────────────────────
@customers_router.patch("/{customer_id}/ban", response_model=dict)
async def ban_or_unban_customer(
    customer_id: int,
    payload: CustomerBanUpdate,
    db: AsyncSession = Depends(get_db)
):

    stmt = select(User).where(User.id == customer_id)
    user = (await db.execute(stmt)).scalars().first()
    if not user or user.role != UserRole.customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    user.is_active = payload.is_active
    await db.commit()
    return {"detail": "Updated", "is_active": user.is_active}
