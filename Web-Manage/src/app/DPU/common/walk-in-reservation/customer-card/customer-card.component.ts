import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReservationModel } from '../../../models/all.model';
import { environment } from '../../../../../environments/environment';

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

  getSlipUrl(): string | null {
    // แก้ไข: ตรวจสอบให้แน่ใจว่าเข้าถึง payments array ได้ถูกต้อง
    const firstOrderWithPayment = this.occupied?.orders?.find(o => o.payments && o.payments.length > 0);
    const slipUrl = firstOrderWithPayment?.payments[0]?.slip_url;

    if (slipUrl) {
      // ตรวจสอบว่า slipUrl เป็น URL เต็มแล้วหรือยัง
      if (slipUrl.startsWith('http')) {
        return slipUrl;
      }
      // ถ้าเป็นแค่ path ให้เติม API URL เข้าไปข้างหน้า
      return `${environment.apiBaseUrl}/static/images/${slipUrl}`;
    }
    return null;
  }

  getOverallPaymentStatus(): 'COMPLETED' | 'PENDING' {
    if (!this.occupied || !this.occupied.orders || this.occupied.orders.length === 0) {
      return 'PENDING';
    }
    // รวบรวม payments ทั้งหมดจากทุก order
    const allPayments = this.occupied.orders.flatMap(order => order.payments || []);

    // ถ้าไม่มี payment เลยสักรายการ สถานะคือ PENDING
    if (allPayments.length === 0) {
      return 'PENDING';
    }

    // เช็คว่า payment ที่มีอยู่ทั้งหมด มีสถานะเป็น COMPLETED หรือไม่
    const allPaid = allPayments.every(p => p.status === 'COMPLETED');

    // // หรืออาจจะเช็คจากสถานะของ Reservation โดยตรง
    // if (this.occupied.status === 'COMPLETED') {
    //   return 'COMPLETED';
    // }

    return allPaid ? 'COMPLETED' : 'PENDING';
  }

}
