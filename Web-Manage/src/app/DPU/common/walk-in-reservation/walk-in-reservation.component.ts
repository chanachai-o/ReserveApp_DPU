import { Component, ViewChild } from '@angular/core';
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
import { TablesModel } from '../../models/menus.model';
import { Reservation } from '../../services/reservation.service';
@Component({
  selector: 'app-walk-in-reservation',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, FlatpickrModule, MaterialModuleModule, SimplebarAngularModule, FilePondModule, FormsModule, ReactiveFormsModule, AvailableTableCardComponent, ReservationCardComponent, CustomerCardComponent, PaymentCardComponent, TableReservationComponent],
  providers: [FlatpickrDefaults],
  templateUrl: './walk-in-reservation.component.html',
  styleUrl: './walk-in-reservation.component.scss'
})
export class WalkInReservationComponent {
  availableTables: TablesModel[] = [];
  selectedTable?: TablesModel
  reservationList = [
    {
      id: 1,
      user_id: 101,
      table_id: 5,
      room_id: null,
      start_time: '2025-06-01T18:00:00+07:00',
      end_time: '2025-06-01T20:00:00+07:00',
      num_people: 4,
      status: 'pending',
      note: 'ลูกค้าโทรจอง'
    },
    {
      id: 2,
      user_id: 102,
      table_id: null,
      room_id: 3,
      start_time: '2025-06-01T13:00:00+07:00',
      end_time: '2025-06-01T15:00:00+07:00',
      num_people: 12,
      status: 'checked_in',
      note: 'ประชุมบริษัท'
    },
    {
      id: 3,
      user_id: 103,
      table_id: 1,
      room_id: null,
      start_time: '2025-06-01T12:00:00+07:00',
      end_time: '2025-06-01T13:30:00+07:00',
      num_people: 2,
      status: 'completed',
      note: null
    },
    {
      id: 4,
      user_id: 104,
      table_id: 7,
      room_id: null,
      start_time: '2025-06-02T19:30:00+07:00',
      end_time: '2025-06-02T21:00:00+07:00',
      num_people: 5,
      status: 'cancelled',
      note: 'ลูกค้าแจ้งยกเลิก'
    },
    {
      id: 5,
      user_id: 105,
      table_id: null,
      room_id: 1,
      start_time: '2025-06-03T10:00:00+07:00',
      end_time: '2025-06-03T12:00:00+07:00',
      num_people: 8,
      status: 'no_show',
      note: 'จองห้องแต่ไม่มา'
    }
  ];
  activeTableList: Reservation[] = [
    {
      id: 1,
      user_id: 101,
      table_id: 5,
      room_id: null,
      start_time: '2025-06-01T18:00:00+07:00',
      end_time: '2025-06-01T20:00:00+07:00',
      num_people: 4,
      status: 'pending',
      note: 'ลูกค้าโทรจอง'
    },
    {
      id: 2,
      user_id: 102,
      table_id: null,
      room_id: 3,
      start_time: '2025-06-01T13:00:00+07:00',
      end_time: '2025-06-01T15:00:00+07:00',
      num_people: 12,
      status: 'checked_in',
      note: 'ประชุมบริษัท'
    },
    {
      id: 3,
      user_id: 103,
      table_id: 1,
      room_id: null,
      start_time: '2025-06-01T12:00:00+07:00',
      end_time: '2025-06-01T13:30:00+07:00',
      num_people: 2,
      status: 'checked_in',
      note: "Walk-In"
    },
  ];
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

  constructor(private tableService: TablesService) {

  }

  ngOnInit(): void {
    this.getTable()

  }

  getTable() {
    this.tableService.getActiveList().subscribe(result => {
      this.availableTables = result
    })
  }



  handleOpenTable(id: number) {
    // เรียก API เปิดโต๊ะ/Check-in
  }

  handleReserveTable(item: TablesModel) {
    // call API จองโต๊ะ ส่ง reservationData
    this.selectedTable = item
    console.log('เลือก', this.selectedTable);
  }

  reserveTable(item: any) {
    console.log('API', item);
  }

  handleCheckIn(id: number) {
    // เรียก API Check-in
  }

  handleCancel(id: number) {
    // เรียก API ยกเลิกการจอง
  }

  onViewDetail(id: number) {
    // เรียก API ดูรายละเอียดการจอง
  }

  onCloseTable(item: any) {

  }

  onBill(item: any) {

  }

  onOrder(item: any) {

  }

  onVerifyPayment(item: any) {

  }

  onViewBill(item: any) {

  }

}
