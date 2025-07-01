import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Order, ReservationModel } from '../../../models/all.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-card.component.html',
  styleUrls: ['./payment-card.component.scss']
})
export class PaymentCardComponent {
  @Input() checkout: ReservationModel;         // ข้อมูลโต๊ะ
  @Input() bill: any;          // ข้อมูลบิลหรือ payment ที่ต้องชำระ
  @Input() customer: any;      // ข้อมูลลูกค้า (optional)

  @Output() verifyPayment = new EventEmitter<ReservationModel>();
  @Output() viewBill = new EventEmitter<ReservationModel>();

  constructor() { }

  /**
   * คำนวณยอดรวมทั้งหมดจากทุก Order ที่อยู่ในการจองนี้
   * @param orders Array ของ Order
   * @returns ยอดรวมทั้งหมด (number)
   */
  getTotalAmount(orders: Order[]): number {
    if (!orders || orders.length === 0) {
      return 0;
    }
    // ใช้ reduce เพื่อรวมยอด total_amount จากทุก order
    return orders.reduce((sum, currentOrder) => {
      return sum + Number(currentOrder.total_amount || 0);
    }, 0);
  }

  /**
   * สร้าง URL เต็มสำหรับรูปสลิป
   * @returns URL ของรูปภาพ หรือ null ถ้าไม่มี
   */
  getSlipUrl(): string | null {
    // แก้ไข: ตรวจสอบให้แน่ใจว่าเข้าถึง payments array ได้ถูกต้อง
    const firstOrderWithPayment = this.checkout?.orders?.find(o => o.payments && o.payments.length > 0);
    const slipUrl = firstOrderWithPayment?.payments[0]?.slip_url;

    if (slipUrl) {
      // ตรวจสอบว่า slipUrl เป็น URL เต็มแล้วหรือยัง
      if (slipUrl.startsWith('http')) {
        return slipUrl;
      }
      // ถ้าเป็นแค่ path ให้เติม API URL เข้าไปข้างหน้า
      return `${environment.baseUrl}/images/${slipUrl}`;
    }
    return null;
  }

  /**
   * จัดการเมื่อกดปุ่ม "ดูบิล"
   * ส่งข้อมูลการจองกลับไปให้ Parent Component
   */
  onViewBill(): void {
    this.viewBill.emit(this.checkout);
  }

  /**
   * จัดการเมื่อกดปุ่ม "ยืนยันรับเงิน"
   * ส่งข้อมูลการจองกลับไปให้ Parent Component เพื่อเรียก API ยืนยัน
   */
  onVerify(): void {
    // อาจจะมีการแสดง confirmation dialog ก่อนส่ง
    // if (confirm('คุณต้องการยืนยันการรับเงินใช่หรือไม่?')) {
    //   this.verifyPayment.emit(this.checkout);
    // }
    this.verifyPayment.emit(this.checkout);
  }

  /**
   * ตรวจสอบสถานะการชำระเงินโดยรวมของการจองนี้
   * @returns 'COMPLETED' หรือ 'PENDING'
   */
  getOverallPaymentStatus(): 'COMPLETED' | 'PENDING' {
    if (!this.checkout || !this.checkout.orders || this.checkout.orders.length === 0) {
      return 'PENDING';
    }
    // เช็คว่าทุก payment ในทุก order มีสถานะเป็น COMPLETED หรือไม่
    const allPaid = this.checkout.orders.every(order =>
      order.payments && order.payments.every(p => p.status === 'COMPLETED')
    );

    // หรืออาจจะเช็คจากสถานะของ Reservation โดยตรง
    if (this.checkout.status === 'COMPLETED') {
      return 'COMPLETED';
    }

    return 'PENDING';
  }

  getPaymentStatus(reservation: ReservationModel): { status: 'Paid' | 'Partial' | 'Unpaid'; paidAmount: number; totalAmount: number } {

    // วิธีที่ 1: ตรวจสอบจากสถานะของการจองโดยตรง (ง่ายและแนะนำ)
    // if (reservation.status === 'COMPLETED') {
    //   const totalAmount = this.getTotalOrderAmount(reservation);
    //   return { status: 'Paid', paidAmount: totalAmount, totalAmount: totalAmount };
    // }

    // วิธีที่ 2: คำนวณจากยอดชำระจริง (ละเอียดกว่า)
    const totalAmount = this.getTotalOrderAmount(reservation);
    const paidAmount = this.getTotalPaidAmount(reservation);

    // if (totalAmount === 0) {
    //   return { status: 'Unpaid', paidAmount: 0, totalAmount: 0 };
    // }

    if (paidAmount >= totalAmount) {
      return { status: 'Paid', paidAmount: paidAmount, totalAmount: totalAmount };
    } else if (paidAmount > 0) {
      return { status: 'Partial', paidAmount: paidAmount, totalAmount: totalAmount };
    } else {
      return { status: 'Unpaid', paidAmount: 0, totalAmount: totalAmount };
    }
  }

  getTotalOrderAmount(reservation: ReservationModel): number {
    if (!reservation.orders || reservation.orders.length === 0) {
      return 0;
    }
    return reservation.orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  }

  getTotalPaidAmount(reservation: ReservationModel): number {
    if (!reservation.orders || reservation.orders.length === 0) {
      return 0;
    }
    let totalPaid = 0;
    reservation.orders.forEach(order => {
      if (order.payments && order.payments.length > 0) {
        const paidInOrder = order.payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((sum, payment) => sum + Number(payment.amount), 0);
        totalPaid += paidInOrder;
      }
    });
    return totalPaid;
  }

}
