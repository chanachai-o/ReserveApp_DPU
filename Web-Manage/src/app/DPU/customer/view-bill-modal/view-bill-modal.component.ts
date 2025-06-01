import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ViewBillComponent } from '../../common/view-bill/view-bill.component';

@Component({
  selector: 'app-view-bill-modal',
  standalone: true,
  imports: [CommonModule, ViewBillComponent],
  templateUrl: './view-bill-modal.component.html',
  styleUrl: './view-bill-modal.component.scss'
})
export class ViewBillModalComponent {
  @Input() show = false;
  @Input() reservation: any;
  @Output() closed = new EventEmitter<void>();
  @Output() uploadSlip = new EventEmitter<any>();
  @Output() checkOut = new EventEmitter<any>();
}
