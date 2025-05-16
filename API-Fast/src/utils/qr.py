# utils/qr.py
import qrcode
from pathlib import Path

def generate_promptpay_qr(amount: float, merchant_phone: str, out_dir: Path, order_id: int) -> str:
    """
    คืน path ไฟล์ PNG ของ QR (พร้อมยอดเงิน fix)
    พร้อมสร้างโฟลเดอร์ถ้ายังไม่มี
    """
    payload = _build_promptpay_payload(merchant_phone, amount)  # >>> "000201..."
    qr = qrcode.make(payload)
    out_dir.mkdir(parents=True, exist_ok=True)
    file_path = out_dir / f"qr_order_{order_id}.png"
    qr.save(file_path)
    return str(file_path)

def _build_promptpay_payload(phone: str, amt: float) -> str:
    # ใช้ไลบรารี "promptpay-qrcode" ก็ได้
    import promptpay_qrcode as pp
    return pp.generate_payload(phone, amt)
