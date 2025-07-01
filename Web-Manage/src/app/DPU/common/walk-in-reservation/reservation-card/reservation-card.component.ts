import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Pipe } from '@angular/core';
import { ReservationModel } from '../../../models/all.model';

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-card.component.html',
  styleUrls: ['./reservation-card.component.scss']
})
export class ReservationCardComponent {
  @Input() reservation: ReservationModel; // ใช้ interface ที่ประกาศไว้
  @Output() checkIn = new EventEmitter<ReservationModel>();
  @Output() cancel = new EventEmitter<ReservationModel>();
  @Output() view = new EventEmitter<number>();

  onCheckIn() {
    this.checkIn.emit(this.reservation);  // ส่ง ReservationModel กลับไป
  }
  onCancel() {
    this.cancel.emit(this.reservation);   // ส่ง ReservationModel กลับไป
  }
  onView() {
    this.view.emit(this.reservation.id);  // ส่งแค่ id กรณีดูรายละเอียด
  }

  getPaymentStatus(reservation: ReservationModel): { status: 'Paid' | 'Partial' | 'Unpaid'; paidAmount: number; totalAmount: number } {

    // วิธีที่ 1: ตรวจสอบจากสถานะของการจองโดยตรง (ง่ายและแนะนำ)
    if (reservation.status === 'COMPLETED') {
      const totalAmount = this.getTotalOrderAmount(reservation);
      return { status: 'Paid', paidAmount: totalAmount, totalAmount: totalAmount };
    }

    // วิธีที่ 2: คำนวณจากยอดชำระจริง (ละเอียดกว่า)
    const totalAmount = this.getTotalOrderAmount(reservation);
    const paidAmount = this.getTotalPaidAmount(reservation);

    if (totalAmount === 0) {
      return { status: 'Unpaid', paidAmount: 0, totalAmount: 0 };
    }

    if (paidAmount >= totalAmount) {
      return { status: 'Paid', paidAmount: paidAmount, totalAmount: totalAmount };
    } else if (paidAmount > 0) {
      return { status: 'Partial', paidAmount: paidAmount, totalAmount: totalAmount };
    } else {
      return { status: 'Unpaid', paidAmount: 0, totalAmount: totalAmount };
    }
  }

  /**
   * Helper: คำนวณยอดรวมของทุกออเดอร์ในการจอง
   */
  getTotalOrderAmount(reservation: ReservationModel): number {
    if (!reservation.orders || reservation.orders.length === 0) {
      return 0;
    }
    return reservation.orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  }

  /**
   * Helper: คำนวณยอดที่ชำระแล้วทั้งหมด (เฉพาะที่ COMPLETED)
   */
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
