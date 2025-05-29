import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BillComponent } from '../bill/bill.component';

@Component({
  selector: 'app-view-bill-modal',
  standalone: true,
  imports: [CommonModule, BillComponent],
  templateUrl: './view-bill-modal.component.html',
  styleUrl: './view-bill-modal.component.scss'
})
export class ViewBillModalComponent {
  @Input() show = false;
  @Input() reservation: any;
  @Output() closed = new EventEmitter<void>();
}
