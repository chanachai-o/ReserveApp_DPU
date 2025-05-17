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
import { MenuModel, TablesModel } from '../../models/menus.model';
import { Reservation } from '../../services/reservation.service';
import swal from 'sweetalert';
import { ReservationModel } from '../../models/all.model';
import { TokenService } from '../../../shared/services/token.service';
import { OrderFoodComponent } from '../order-food/order-food.component';
import { MenusService } from '../../services/menu.service';
@Component({
  selector: 'app-walk-in-reservation',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, FlatpickrModule, MaterialModuleModule, SimplebarAngularModule, FilePondModule, FormsModule, ReactiveFormsModule, AvailableTableCardComponent, ReservationCardComponent, CustomerCardComponent, PaymentCardComponent, TableReservationComponent, OrderFoodComponent],
  providers: [FlatpickrDefaults],
  templateUrl: './walk-in-reservation.component.html',
  styleUrl: './walk-in-reservation.component.scss'
})
export class WalkInReservationComponent {
  availableTables: TablesModel[] = [];
  selectedTable?: TablesModel
  reservationList: ReservationModel[] = [];
  activeTableList: ReservationModel[] = [];
  paymentList: any = [
    {
      id: 31,
      table: { id: 21, table_number: 'A4', picture: 'assets/images/tables/table8.jpg' },
      bill: { id: 101, amount: 880.00, status: 'pending', slip_url: '', },
      customer: { name: 'นิด', phone: '0814447777' }
    },
    {
      id: 32,
      table: { id: 22, table_number: 'B4', picture: '' },
      bill: { id: 102, amount: 1250.00, status: 'pending', slip_url: 'assets/images/slips/slip1.png' },
      customer: { name: 'Sara', phone: '0891112222' }
    },
    {
      id: 33,
      table: { id: 23, table_number: 'VIP2', picture: 'assets/images/tables/vip2.jpg' },
      bill: { id: 103, amount: 2990.00, status: 'completed', slip_url: 'assets/images/slips/slip2.png' },
      customer: { name: 'คุณหญิง', phone: '0819998888' }
    },
    {
      id: 34,
      table: { id: 24, table_number: 'C5', picture: '' },
      bill: { id: 104, amount: 670.00, status: 'pending', slip_url: '' },
      customer: { name: 'Bob', phone: '0843334444' }
    },
    {
      id: 35,
      table: { id: 25, table_number: 'B5', picture: 'assets/images/tables/table9.jpg' },
      bill: { id: 105, amount: 555.00, status: 'pending', slip_url: 'assets/images/slips/slip3.png' },
      customer: { name: 'Jane', phone: '0855556666' }
    }
  ];

  reservation?: ReservationModel
  menuList: MenuModel[] = []
  constructor(private tableService: TablesService, private http: HttpClient, private tokenService: TokenService, private menuService: MenusService) {
    this.getMenu()
  }

  ngOnInit(): void {
    this.getTable()
    this.getReserved()
    this.getCheckIn()
  }

  getMenu() {
    this.menuService.getLists().subscribe(result => {
      this.menuList = result
    })
  }

  getReserved() {
    this.http.get<ReservationModel[]>("http://127.0.0.1:8000/reservations").subscribe(result => {
      this.reservationList = result.filter(e => e.status == 'pending')
    })
  }

  getCheckIn() {
    this.http.get<ReservationModel[]>("http://127.0.0.1:8000/reservations").subscribe(result => {
      this.activeTableList = result.filter(e => e.status == 'checked_in')
    })
  }

  getTable() {
    this.tableService.getActiveList().subscribe(result => {
      this.availableTables = result
    })
  }



  handleOpenTable(item: TablesModel) {
    // เรียก API Check-In/Check-in
    this.selectedTable = item
    console.log('เลือก', this.selectedTable);
  }

  handleReserveTable(item: TablesModel) {
    // call API จองโต๊ะ ส่ง reservationData
    this.selectedTable = item
    console.log('เลือก', this.selectedTable);
  }

  reserveTable(item: any) {
    console.log('API', item);
    item.status = 'pending'
    item.end_time = item.start_time
    delete item.room_id
    this.http.post("http://127.0.0.1:8000/reservations", item).subscribe(result => {
      console.log(result)
      this.tableService.reseave(item.table_id).subscribe(result => {
        swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
        this.ngOnInit()
      })
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
    // console.log("ssssss", id)
    // เรียก API Check-in
    console.log('API', item);
    item.end_time = item.start_time
    delete item.room_id
    console.log(item)
    this.http.post("http://127.0.0.1:8000/reservations/" + item.id + "/checkin", item).subscribe(result => {
      console.log(result)
      this.tableService.reseave(item.table_id).subscribe(result => {
        swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
        this.ngOnInit()
      })
    })
  }

  handleCancel(item: any) {
    console.log(item)
    item.end_time = item.start_time
    item.status = 'cancelled'
    console.log(item)
    this.http.put("http://127.0.0.1:8000/reservations/" + item.id, item).subscribe(result => {
      console.log(result)
      this.tableService.cancelReseave(item.table_id).subscribe(result => {
        swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
        this.ngOnInit()
      })
    })
    // เรียก API ยกเลิกการจอง
  }

  onCloseTable(item: any) {

  }

  onBill(item: any) {
    console.log("bile", item)
    item.end_time = new Date().toISOString()
    this.http.post("http://127.0.0.1:8000/reservations/" + item.id + "/checkout", item).subscribe(result => {
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

  }

  onViewBill(item: any) {

  }

}
