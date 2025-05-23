import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Pipe } from '@angular/core';
import { ReservationModel } from '../../../models/all.model';

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-card.component.html',
})
export class ReservationCardComponent {
 @Input() reservation!: ReservationModel; // ใช้ interface ที่ประกาศไว้
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
}
