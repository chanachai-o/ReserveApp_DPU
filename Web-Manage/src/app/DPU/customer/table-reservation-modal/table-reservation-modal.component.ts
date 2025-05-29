import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableReservationComponent } from '../../common/table-reservation/table-reservation.component';

@Component({
  selector: 'app-table-reservation-modal',
  standalone: true,
  imports: [CommonModule,TableReservationComponent],
  templateUrl: './table-reservation-modal.component.html',
  styleUrls: ['./table-reservation-modal.component.scss']
})
export class TableReservationModalComponent {

  @Input() show = false;
  @Input() item: any;
  @Output() reserved = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();
}
