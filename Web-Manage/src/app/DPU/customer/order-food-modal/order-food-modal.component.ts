import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrderFoodComponent } from '../../common/order-food/order-food.component';


@Component({
  selector: 'app-order-food-modal',
  standalone: true,
  imports: [CommonModule,OrderFoodComponent],
  templateUrl: './order-food-modal.component.html',
  styleUrl: './order-food-modal.component.scss'
})
export class OrderFoodModalComponent {
  @Input() show = false;
  @Input() reservation: any;
  @Input() menuList: any[] = [];
  @Output() submitted = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();
}
