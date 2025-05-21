import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../models/all.model';

@Component({
  selector: 'app-view-bill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-bill.component.html',
})
export class ViewBillComponent {
  @Input() order!: Order;
}
