import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RoomReservationRequest {
  roomId: number;
  customerName: string;
  customerPhone: string;
  reservationDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numPeople: number;
}

@Component({
  selector: 'app-room-reservation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-reservation.component.html',
})
export class RoomReservationComponent {
  @Input() roomId?: number;
  @Output() reserve = new EventEmitter<RoomReservationRequest>();

  form: RoomReservationRequest = {
    roomId: 0,
    customerName: '',
    customerPhone: '',
    reservationDate: '',
    startTime: '',
    endTime: '',
    numPeople: 1,
  };

  ngOnInit() {
    if (this.roomId) {
      this.form.roomId = this.roomId;
    }
  }

  onSubmit() {
    if (!this.form.roomId) return;
    this.reserve.emit({ ...this.form });
  }
}
