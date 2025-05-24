import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, Payment, ReservationModel } from '../../models/all.model';

@Component({
  selector: 'app-view-bill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-bill.component.html',
})
export class ViewBillComponent {
  @Input() reservation!: ReservationModel;
  @Input() payments: Payment[] = [];
  @Output() uploadSlip = new EventEmitter<FormData>();
  @Output() checkOut = new EventEmitter<ReservationModel>();
  selectedFile?: File;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    // update form when @Input changes (ไม่ต้อง reset ทั้ง form)
    if (changes['reservation'] && changes['reservation'].currentValue) {
      this.reservation = changes['reservation'].currentValue
    }
    if (changes['payments'] && changes['payments'].currentValue) {
      this.payments =changes['payments'].currentValue
    }

  }

  getTotalAmount() {
    return this.reservation.orders
      .reduce((total, order) => total + Number(order.total_amount || 0), 0);
  }

  getAllOrderItems() {
    return this.reservation.orders?.flatMap(order => order.order_items || []) || [];
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  submitSlip() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('slip', this.selectedFile);
      formData.append('order_id', String(this.reservation.orders?.[0]?.id || 0));
      this.uploadSlip.emit(formData);
    }
  }

  checkBill() {
    this.checkOut.emit(this.reservation);
  }
}
