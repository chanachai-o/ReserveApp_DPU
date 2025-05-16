# jobs/no_show_checker.py
now = datetime.utcnow()
stmt = select(Reservation).where(
    Reservation.start_time < now,
    Reservation.status == ReservationStatus.pending
)
result = await db.execute(stmt)
for res in result.scalars().all():
    res.status = ReservationStatus.no_show
    await trigger_notification(
        db,
        user_id=res.user_id,
        title="ลูกค้าไม่มาตามนัด",
        message="ระบบเปลี่ยนสถานะจองของคุณเป็น No-show",
        type="reservation"
    )
await db.commit()
