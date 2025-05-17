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
  @Input() table!: TablesModel
  @Output() openTable = new EventEmitter<any>();
  @Output() reserveTable = new EventEmitter<TablesModel>();
  modalOpen = false;
  selectedTable: any = null;
  openReserveModal(table: any) {
    console.log(table)
    this.selectedTable = table;
    this.modalOpen = true;
  }

  closeReserveModal() {
    this.modalOpen = false;
    this.selectedTable = null;
  }

  onOpen() {
    this.openTable.emit(this.table);
  }

  onReserve() {
    this.reserveTable.emit(this.table);
  }
}
