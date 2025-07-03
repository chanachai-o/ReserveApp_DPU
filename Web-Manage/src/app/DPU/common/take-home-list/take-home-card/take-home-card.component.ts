// src/app/DPU/staff/take-home-management/take-home-card.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { StaffOrderService } from '../../../services/staff-order.service';
import { OrderStatus, TakeawayOrder } from '../../../models/staff-take-home.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-take-home-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './take-home-card.component.html',
  styleUrls: ['./take-home-card.component.scss']
})
export class TakeHomeCardComponent {
  @Input() order!: TakeawayOrder;
  @Output() statusUpdated = new EventEmitter<number>();

  isUpdating = false;

  constructor(private staffOrderService: StaffOrderService) {}

  updateStatus(newStatus: OrderStatus): void {
    if (this.isUpdating) return;
    this.isUpdating = true;

    this.staffOrderService.updateOrderStatus(this.order.id, { status: newStatus })
      .pipe(finalize(() => this.isUpdating = false))
      .subscribe({
        next: () => {
          this.statusUpdated.emit(this.order.id);
        },
        error: (err) => {
          console.error(`Failed to update order ${this.order.id} to ${newStatus}`, err);
          alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
      });
  }
}
