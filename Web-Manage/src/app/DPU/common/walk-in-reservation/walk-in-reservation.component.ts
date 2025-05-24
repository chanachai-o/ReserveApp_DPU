import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlatpickrModule, FlatpickrDefaults } from 'angularx-flatpickr';
import flatpickr from 'flatpickr';
import { MaterialModuleModule } from '../../../material-module/material-module.module';
import { SharedModule } from '../../../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { FilePondModule, FilePondComponent } from 'ngx-filepond';
import { SimplebarAngularModule } from 'simplebar-angular';
import * as FilePond from 'filepond';
import { AvailableTableCardComponent } from './available-table-card/available-table-card.component';
import { CommonModule } from '@angular/common';
import { ReservationCardComponent } from './reservation-card/reservation-card.component';
import { CustomerCardComponent } from './customer-card/customer-card.component';
import { PaymentCardComponent } from './payment-card/payment-card.component';
import { TableReservationComponent } from '../table-reservation/table-reservation.component';
import { TablesService } from '../../services/tables.service';
import { Reservation } from '../../services/reservation.service';
import swal from 'sweetalert';
import { AvailableItem, MenusModel, Order, OrderItem, ReservationModel } from '../../models/all.model';
import { TokenService } from '../../../shared/services/token.service';
import { OrderFoodComponent } from '../order-food/order-food.component';
import { MenusService } from '../../services/menu.service';
import { RoomService } from '../../services/room.service';
import { ViewBillComponent } from '../view-bill/view-bill.component';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-walk-in-reservation',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, FlatpickrModule, MaterialModuleModule, SimplebarAngularModule, FilePondModule, FormsModule, ReactiveFormsModule, AvailableTableCardComponent, ReservationCardComponent, CustomerCardComponent, PaymentCardComponent, TableReservationComponent, OrderFoodComponent, ViewBillComponent],
  providers: [FlatpickrDefaults],
  templateUrl: './walk-in-reservation.component.html',
  styleUrl: './walk-in-reservation.component.scss'
})
export class WalkInReservationComponent {
  availableTables: AvailableItem[] = [];
  availableRooms: AvailableItem[] = [];
  filteredAvailable: AvailableItem[] = []
  selectedTable?: AvailableItem
  reservationList: ReservationModel[] = [];
  activeTableList: ReservationModel[] = [];
  paymentList: ReservationModel[] = [];
  reservation?: ReservationModel
  menuList: MenusModel[] = []
  selectedOrder: Order
  isLoading = false;
  errorMsg = '';
  tableType = '';
  constructor(private tableService: TablesService, private http: HttpClient, private tokenService: TokenService, private menuService: MenusService, private roomService: RoomService) {
    this.getMenu()
  }

  ngOnInit(): void {
    this.getTable();
    this.getReservations();
  }

  getMenu() {
    this.menuService.getLists().subscribe(result => {
      this.menuList = result
    })
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

  getReservations() {
    this.isLoading = true;
    this.http.get<ReservationModel[]>("http://127.0.0.1:8000/reservations")
      .subscribe({
        next: (result) => {
          this.reservationList = result.filter(e => e.status === 'pending');
          this.activeTableList = result.filter(e => e.status === 'checked_in');
          this.paymentList = result.filter(e => ['checked_out', 'completed'].includes(e.status));
          this.isLoading = false;
        },
        error: () => {
          this.errorMsg = "โหลดข้อมูลไม่สำเร็จ";
          this.isLoading = false;
        }
      });
  }

  handleOpenTable(item: AvailableItem) {
    // เรียก API Check-In/Check-in
    this.selectedTable = item
    console.log('เลือก', this.selectedTable);
  }

  handleReserveTable(item: AvailableItem) {
    // call API จองโต๊ะ ส่ง reservationData
    this.selectedTable = item
    console.log('เลือก', this.selectedTable);
  }

  reserveTable(item: any) {
    console.log('API', item);
    item.status = 'pending'
    item.end_time = item.start_time
    this.http.post("http://127.0.0.1:8000/reservations", item).subscribe(result => {
      console.log(result)
      if (item['table_id']) {
        this.tableService.reseave(item.table_id).subscribe(result => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit()
        })
      }
      else {
        this.roomService.reseave(item.room_id).subscribe(result => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit()
        })
      }
    })
  }

  checkInTable(item: any) {
    console.log('API', item);
    item.status = 'checked_in'
    item.end_time = item.start_time
    if (!item.user_id) {
      item.user_id = this.tokenService.getUser().id
    }
    delete item.room_id
    console.log(item)
    this.http.post("http://127.0.0.1:8000/reservations", item).subscribe(result => {
      console.log(result)
      this.tableService.reseave(item.table_id).subscribe(result => {
        swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
        this.ngOnInit()
      })
    })
  }

  handleCheckIn(item: any) {
    console.log('API', item);
    item.end_time = item.start_time;

    // เช็คว่าเป็นการจองห้องหรือโต๊ะ
    if (item.table_id) {
      // โต๊ะ
      this.http.post("http://127.0.0.1:8000/reservations/" + item.id + "/checkin", item).subscribe(result => {
        console.log(result);
        this.tableService.reseave(item.table_id).subscribe(_ => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit();
        });
      });
    } else if (item.room_id) {
      // ห้องประชุม
      this.http.post("http://127.0.0.1:8000/reservations/" + item.id + "/checkin", item).subscribe(result => {
        console.log(result);
        this.roomService.reseave(item.room_id).subscribe(_ => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit();
        });
      });
    } else {
      swal("Error", "ไม่พบข้อมูลโต๊ะหรือห้อง", "error");
    }
  }

  handleCancel(item: any) {
    console.log(item);
    item.end_time = item.start_time;
    item.status = 'cancelled';

    this.http.put("http://127.0.0.1:8000/reservations/" + item.id, item).subscribe(result => {
      console.log(result);
      // เช็คว่าเป็นการจองโต๊ะหรือห้อง เพื่อยกเลิกสถานะ
      if (item.table_id) {
        this.tableService.cancelReseave(item.table_id).subscribe(_ => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit();
        });
      } else if (item.room_id) {
        this.roomService.cancelReseave(item.room_id).subscribe(_ => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit();
        });
      } else {
        swal("Error", "ไม่พบข้อมูลโต๊ะหรือห้อง", "error");
      }
    });
  }

  onCloseTable(item: any) {

  }

  onBill(item: any) {
    console.log("bile", item)
    item.end_time = new Date().toISOString()
    item.status = 'checked_out'
    console.log(item)
    this.http.put("http://127.0.0.1:8000/reservations/" + item.id, item).subscribe(result => {
      console.log(result)
      this.tableService.cancelReseave(item.table_id).subscribe(result => {
        swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
        this.ngOnInit()
      })
    })
    // this.http.post("http://127.0.0.1:8000/payments/orders/" + item.id + "/payment", {
    //   "amount": 0,
    //   "slip_url": ""
    // }).subscribe(result => {
    //   swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
    //   this.ngOnInit()
    // })
  }

  onOrder(item: any) {
    this.reservation = item
    console.log("order", item)
  }

  handleOrder(item: any) {
    console.log("submitOrderL0", item)
    this.http.post("http://127.0.0.1:8000/orders", item).subscribe(result => {
      swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
      this.ngOnInit()
    })
  }

  onVerifyPayment(item: any) {
    console.log(item)
    item.status = 'completed'
    console.log(item)
    this.http.put("http://127.0.0.1:8000/reservations/" + item.id, item).subscribe(result => {
      console.log(result)
      this.tableService.cancelReseave(item.table_id).subscribe(result => {
        swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
        this.ngOnInit()
      })
    })
  }

  onViewBill(item: any) {
    console.log(item)
    this.selectedOrder = item
    // item.status = 'completed'
    // console.log(item)
    // this.http.put("http://127.0.0.1:8000/reservations/" + item.id, item).subscribe(result => {
    //   console.log(result)
    //   this.tableService.cancelReseave(item.table_id).subscribe(result => {
    //     swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
    //     this.ngOnInit()
    //   })
    // })
  }

  onTypeChange() {
    if (this.tableType === 'tables') {
      this.filteredAvailable = [...this.availableTables];
    } else if (this.tableType === 'room') {
      this.filteredAvailable = [...this.availableRooms];
    } else {
      this.filteredAvailable = [...this.availableTables, ...this.availableRooms];
    }
    console.log("filter", this.filteredAvailable)
  }
}
