import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReservationModel } from '../../models/all.model';

@Component({
  selector: 'app-cus-reservation-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './reservation-card.component.html',
  styleUrls: ['./reservation-card.component.scss']
})
export class ReservationCustomerCardComponent {
  @Input() reservation: ReservationModel;
  @Output() preorder = new EventEmitter();
  @Output() order = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() viewBill = new EventEmitter();

  getStatusLabel(status: string) {
    switch (status) {
      case 'pending': return 'รอยืนยัน';
      case 'checked_in': return 'เข้าใช้บริการ';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  }
}
