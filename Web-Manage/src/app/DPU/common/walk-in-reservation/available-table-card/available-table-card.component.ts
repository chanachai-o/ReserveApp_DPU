import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableReservationComponent } from '../../table-reservation/table-reservation.component';
import { TablesModel } from '../../../models/menus.model';

@Component({
  selector: 'app-available-table-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './available-table-card.component.html',
  styleUrls: ['./available-table-card.component.scss']
})
export class AvailableTableCardComponent {
  @Input() item!: any; // ใช้ item แทน table เพื่อรับทั้ง room/table
  @Output() openTable = new EventEmitter<any>();
  @Output() reserveTable = new EventEmitter<any>();

  get displayName(): string {
    return this.item.name || this.item.table_number || this.item.room_number || `#${this.item.id}`;
  }
  get displayNumber(): string {
    return this.item.table_number || this.item.room_number || this.item.id;
  }
  get displayTypeLabel(): string {
    return this.item.type === 'table' ? 'โต๊ะ' : 'ห้องประชุม';
  }
  get isRoom(): boolean {
    return this.item.type === 'room';
  }
  get icon(): string {
    return this.item.type === 'table'
      ? '<i class="ri-table-fill"></i>'
      : '<i class="ri-door-lock-fill"></i>';
  }

  onOpen() {
    this.openTable.emit(this.item);
  }

  onReserve() {
    this.reserveTable.emit(this.item);
  }
}
