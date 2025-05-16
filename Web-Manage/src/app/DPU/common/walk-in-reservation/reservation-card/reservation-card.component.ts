import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Pipe } from '@angular/core';

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-card.component.html',
})
export class ReservationCardComponent {
  @Input() reservation: any; // กำหนด type/interface ภายหลังได้
  @Output() checkIn = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<number>();
  @Output() view = new EventEmitter<number>();

  onCheckIn() {
    this.checkIn.emit(this.reservation.id);
  }
  onCancel() {
    this.cancel.emit(this.reservation.id);
  }
  onView() {
    this.view.emit(this.reservation.id);
  }
}
