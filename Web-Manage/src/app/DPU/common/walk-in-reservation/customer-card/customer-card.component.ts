import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-card.component.html',
})
export class CustomerCardComponent {
  @Input() table: any; // หรือใช้ interface ที่เหมาะสม
  @Input() customer: any; // ข้อมูลลูกค้า หรือ null
  @Input() currentOrder: any; // ข้อมูลออเดอร์ปัจจุบัน (optional)

  @Output() order = new EventEmitter<number>();
  @Output() bill = new EventEmitter<number>();
  @Output() closeTable = new EventEmitter<number>();

  onOrder() {
    this.order.emit(this.table.id);
  }
  onBill() {
    this.bill.emit(this.table.id);
  }
  onClose() {
    this.closeTable.emit(this.table.id);
  }
}
