import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-available-table-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './available-table-card.component.html',
  styleUrls: ['./available-table-card.component.scss']
})
export class AvailableTableCardComponent {
  @Input() table!: {
    id: number;
    table_number: string;
    capacity: number;
    picture?: string;
    // เพิ่ม field อื่นๆได้
  };

  @Output() openTable = new EventEmitter<number>();
  @Output() reserveTable = new EventEmitter<number>();

  onOpen() {
    this.openTable.emit(this.table.id);
  }

  onReserve() {
    this.reserveTable.emit(this.table.id);
  }
}
