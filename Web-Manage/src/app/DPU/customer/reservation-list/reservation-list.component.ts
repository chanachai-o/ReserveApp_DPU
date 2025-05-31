import { Component } from '@angular/core';
import { AvailableItem, ReservationModel } from '../../models/all.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { TokenService } from '../../../shared/services/token.service';
import { MenusService } from '../../services/menu.service';
import { RoomService } from '../../services/room.service';
import { TablesService } from '../../services/tables.service';
import { ReservationCardComponent } from '../../common/walk-in-reservation/reservation-card/reservation-card.component';
import { TableReservationComponent } from '../../common/table-reservation/table-reservation.component';
import swal from 'sweetalert';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, TableReservationComponent],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent {
  reservationList: ReservationModel[] = [];
  availableList: AvailableItem[] = [];
  showReserveModal = false;
  selectedItem: AvailableItem | null = null;
  availableTables: AvailableItem[] = [];
  availableRooms: AvailableItem[] = [];
  tableType = '';
  constructor(private tableService: TablesService, private http: HttpClient, private tokenService: TokenService, private menuService: MenusService, private roomService: RoomService, private reserveService: ReservationService) {

  }
  getPicture(reservation: ReservationModel): string | null {
    if (reservation.table?.picture) {
      return 'YOUR_BASE_URL/' + reservation.table.picture;
    }
    if (reservation.room?.picture) {
      return 'YOUR_BASE_URL/' + reservation.room.picture;
    }
    return null;
  }

  ngOnInit() {
    this.selectedItem = null
    this.getTable()
    this.getReserved()
  }

  getReserved() {
    this.reserveService.getReservations({ user: this.tokenService.getUser().id }).subscribe(result => {
      this.reservationList = result
    })

  }

  getStatusLabel(status: string) {
    switch (status) {
      case 'pending': return 'รอเช็คอิน';
      case 'checked_in': return 'เข้าใช้งาน';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิกแล้ว';
      default: return status;
    }
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

  onOpenBooking() {
    // TODO: เปิด modal หรือ route ไปหน้าฟอร์มจอง
  }

  onCancel(reservation: ReservationModel) {
    // TODO: call api ยกเลิก
  }

  onOrder(reservation: ReservationModel) {
    // TODO: เปิด modal หรือไปหน้าสั่งอาหาร
  }


  onReserve(item: AvailableItem) {
    this.selectedItem = item;
    this.showReserveModal = true;
  }

  handleReserved(reservation: any) {
    // TODO: call API หรือแสดงผลจองสำเร็จ
    this.showReserveModal = false;
    // ...รีเฟรช/แจ้งเตือน หรือ push ไปยังหน้ารายการจอง
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

  reserveTable(item: any) {
    console.log('API', item);
    item.status = 'pending'
    item.end_time = item.start_time
    this.http.post("http://127.0.0.1:8000/reservations", item).subscribe(result => {
      console.log(result)
      if (item['table_id']) {
        this.tableService.reserve(item.table_id).subscribe(result => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit()
        })
      }
      else {
        this.roomService.reserve(item.room_id).subscribe(result => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit()
        })
      }
    })
  }

}
