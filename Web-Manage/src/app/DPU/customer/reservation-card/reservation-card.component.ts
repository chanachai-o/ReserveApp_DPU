import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';


@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-card.component.html',
  styleUrls: ['./reservation-card.component.scss']
})
export class ReservationCardComponent {

  @Input() reservation: any;
  @Output() cancel = new EventEmitter<any>();
  @Output() order = new EventEmitter<any>();
  @Output() viewBill = new EventEmitter<any>();

  getStatusLabel(status: string) {
    switch (status) {
      case 'pending': return 'รอเข้าใช้';
      case 'checked_in': return 'กำลังใช้';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  }

}
