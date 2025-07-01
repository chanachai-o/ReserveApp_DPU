import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReservationModel } from '../../../models/all.model';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-card.component.html',
  styleUrls: ['./customer-card.component.scss']
})
export class CustomerCardComponent {
  @Input() occupied: ReservationModel; // หรือใช้ interface ที่เหมาะสม
  @Input() customer: any; // ข้อมูลลูกค้า หรือ null
  @Input() currentOrder: any; // ข้อมูลออเดอร์ปัจจุบัน (optional)

  @Output() order = new EventEmitter<ReservationModel>();
  @Output() bill = new EventEmitter<ReservationModel>();
  @Output() closeTable = new EventEmitter<number>();

  onOrder() {
    this.order.emit(this.occupied);
  }
  onBill() {
    this.bill.emit(this.occupied);
  }
  onClose() {
    this.closeTable.emit(this.occupied.id);
  }

  getStayDuration(startTime: string): string {
    if (!startTime) return '-';
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diffMs = now - start;
    if (diffMs < 0) return '-';
    const mins = Math.floor(diffMs / 60000) % 60;
    const hrs = Math.floor(diffMs / 3600000);
    return hrs ? `${hrs} ชม. ${mins} นาที` : `${mins} นาที`;
  }

  getOverallPaymentStatus(): 'COMPLETED' | 'PENDING' {
    if (!this.occupied || !this.occupied.orders || this.occupied.orders.length === 0) {
      return 'PENDING';
    }
    // เช็คว่าทุก payment ในทุก order มีสถานะเป็น COMPLETED หรือไม่
    const allPaid = this.occupied.orders.every(order =>
      order.payments && order.payments.every(p => p.status === 'COMPLETED')
    );

    // หรืออาจจะเช็คจากสถานะของ Reservation โดยตรง
    if (this.occupied.status === 'COMPLETED') {
      return 'COMPLETED';
    }

    return 'PENDING';
  }

}
