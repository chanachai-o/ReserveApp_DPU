import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ViewBillModalComponent } from '../view-bill-modal/view-bill-modal.component';
import { AvailableItemCardComponent } from '../available-item-card/available-item-card.component';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { TokenService } from '../../../shared/services/token.service';
import { MenusService } from '../../services/menu.service';
import { ReservationService } from '../../services/reservation.service';
import { RoomService } from '../../services/room.service';
import { TablesService } from '../../services/tables.service';
import { AvailableItem } from '../../models/all.model';

@Component({
  selector: 'app-customer-reservation-page',
  templateUrl: './customer-reservation-page.component.html',
  standalone: true,
  imports: [CommonModule, AvailableItemCardComponent, ViewBillModalComponent,],
  styleUrls: ['./customer-reservation-page.component.scss']
})
export class CustomerReservationPageComponent implements OnInit {
  availableList: any[] = [];
  availableTables: AvailableItem[] = [];
  availableRooms: AvailableItem[] = [];
  reservationList: any[] = [];
  selectedItem: any = null;
  selectedOrderRes: any = null;
  selectedBillRes: any = null;
  menuList: any[] = [];
  showReserveModal = false;
  showOrderModal = false;
  showBillModal = false;
  tableType = ''
  constructor(private tableService: TablesService, private http: HttpClient, private tokenService: TokenService, private menuService: MenusService, private roomService: RoomService, private reserveService: ReservationService) {

  }

  ngOnInit() {
    // เรียกข้อมูล availableList, reservationList, menuList จาก API หรือ service
    this.getTable()
  }

  getTable() {
    forkJoin({
      tables: this.tableService.getActiveList(),
      rooms: this.roomService.getActiveList()
    }).subscribe(({ tables, rooms }) => {
      this.availableTables = tables;
      this.availableRooms = rooms;
      this.onTypeChange(); // เรียกครั้งเดียวหลังข้อมูลครบ
    });
  }

  onTypeChange() {
    if (this.tableType === 'tables') {
      this.availableList = [...this.availableTables];
    } else if (this.tableType === 'room') {
      this.availableList = [...this.availableRooms];
    } else {
      this.availableList = [...this.availableTables, ...this.availableRooms];
    }
    console.log("filter", this.availableList)
  }

  onReserve(item: any) {
    this.selectedItem = item;
    this.showReserveModal = true;
  }
  handleReserved(e: any) {
    this.showReserveModal = false;
    // reload data
  }
  onCancel(res: any) {
    // ยกเลิกจอง
  }
  onOrder(res: any) {
    this.selectedOrderRes = res;
    this.showOrderModal = true;
  }
  handleOrder(e: any) {
    this.showOrderModal = false;
    // reload data
  }
  onViewBill(res: any) {
    this.selectedBillRes = res;
    this.showBillModal = true;
  }
}
