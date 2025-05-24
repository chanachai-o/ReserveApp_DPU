import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-card.component.html',
  styleUrls: ['./payment-card.component.scss']
})
export class PaymentCardComponent {
  @Input() checkout: any;         // ข้อมูลโต๊ะ
  @Input() bill: any;          // ข้อมูลบิลหรือ payment ที่ต้องชำระ
  @Input() customer: any;      // ข้อมูลลูกค้า (optional)

  @Output() verifyPayment = new EventEmitter<number>();
  @Output() viewBill = new EventEmitter<number>();

  onVerify() {
    this.verifyPayment.emit(this.checkout);
  }

  onViewBill() {
    this.viewBill.emit(this.checkout);
  }

  // รวมยอดเงินทั้งหมดของ orders ใน checkout
  getTotalAmount(orders: any[]): number {
    if (!orders) return 0;
    return orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  }

}
