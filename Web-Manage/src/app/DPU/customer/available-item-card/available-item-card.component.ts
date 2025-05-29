import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-available-item-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './available-item-card.component.html',
  styleUrl: './available-item-card.component.scss'
})
export class AvailableItemCardComponent {
  @Input() item: any;
  @Output() reserve = new EventEmitter<any>();
}
