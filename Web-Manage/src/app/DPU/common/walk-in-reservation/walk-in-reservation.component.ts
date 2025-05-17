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

export interface TablesModel {
  id: number
  table_number: string;
  capacity: number;
  picture: string;
  status: string;
}
@Component({
  selector: 'app-walk-in-reservation',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, FlatpickrModule, MaterialModuleModule, SimplebarAngularModule, FilePondModule, FormsModule, ReactiveFormsModule, AvailableTableCardComponent, ReservationCardComponent, CustomerCardComponent, PaymentCardComponent, TableReservationComponent],
  providers: [FlatpickrDefaults],
  templateUrl: './walk-in-reservation.component.html',
  styleUrl: './walk-in-reservation.component.scss'
})
export class WalkInReservationComponent {
  availableTables: TablesModel[] = [
    { id: 0 ,table_number: 'A1', capacity: 2, picture: 'assets/images/tables/table1.jpg', status: "" },
    { id: 1 ,table_number: 'A2', capacity: 4, picture: 'assets/images/tables/table2.jpg', status: "" },
    { id: 2 ,table_number: 'B1', capacity: 6, picture: '', status: "" },
    { id: 3 ,table_number: 'C3', capacity: 4, picture: 'assets/images/tables/table4.jpg', status: "" },
    { id: 4 ,table_number: 'VIP', capacity: 10, picture: 'assets/images/tables/vip.jpg', status: "" },
  ];
  selectedTable?: TablesModel
  reservationList = [
    {
      id: 11,
      table_number: 'A3',
      reserved_by: { name: 'สมชาย', phone: '0812345678' },
      time: '18:00-20:00',
      capacity: 4,
      status: 'reserved',
      picture: 'assets/images/tables/table3.jpg'
    },
    {
      id: 12,
      table_number: 'B2',
      reserved_by: { name: 'Alice', phone: '0890000001' },
      time: '17:30-19:00',
      capacity: 2,
      status: 'reserved',
      picture: ''
    },
    {
      id: 13,
      table_number: 'D1',
      reserved_by: { name: 'John', phone: '0848882222' },
      time: '19:00-20:00',
      capacity: 6,
      status: 'reserved',
      picture: 'assets/images/tables/table6.jpg'
    },
    {
      id: 14,
      table_number: 'C1',
      reserved_by: { name: 'พิม', phone: '0871112233' },
      time: '18:30-21:00',
      capacity: 4,
      status: 'reserved',
      picture: ''
    },
    {
      id: 15,
      table_number: 'B3',
      reserved_by: { name: 'Tom', phone: '0829998888' },
      time: '20:00-22:00',
      capacity: 2,
      status: 'reserved',
      picture: 'assets/images/tables/table7.jpg'
    }
  ];
  activeTableList = [
    {
      id: 21,
      table_number: 'A4',
      customer: { name: 'นิด', phone: '0814447777' },
      checkin_time: '17:55',
      capacity: 2,
      order_count: 3,
      picture: 'assets/images/tables/table8.jpg'
    },
    {
      id: 22,
      table_number: 'B4',
      customer: { name: 'Sara', phone: '0891112222' },
      checkin_time: '18:10',
      capacity: 4,
      order_count: 1,
      picture: ''
    },
    {
      id: 23,
      table_number: 'VIP2',
      customer: { name: 'คุณหญิง', phone: '0819998888' },
      checkin_time: '19:00',
      capacity: 8,
      order_count: 5,
      picture: 'assets/images/tables/vip2.jpg'
    },
    {
      id: 24,
      table_number: 'C5',
      customer: { name: 'Bob', phone: '0843334444' },
      checkin_time: '18:30',
      capacity: 6,
      order_count: 2,
      picture: ''
    },
    {
      id: 25,
      table_number: 'B5',
      customer: { name: 'Jane', phone: '0855556666' },
      checkin_time: '18:50',
      capacity: 2,
      order_count: 2,
      picture: 'assets/images/tables/table9.jpg'
    }
  ]
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
  selectedNames = ['Angelina May'];
  names = [
    { id: 1, name: 'Angelina May' },
    { id: 2, name: 'Kiara advain' },
    { id: 3, name: 'Washed' },
    { id: 4, name: 'Solid' },
  ]
  selectedTags = ['UI/UX'];
  tags = [
    { id: 1, name: 'UI/UX' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Designing' },
    { id: 5, name: 'Authentication' },
    { id: 6, name: 'Product' },
    { id: 7, name: 'Development' },
  ]
  @ViewChild("myPond") myPond!: FilePondComponent;

  pondOptions: FilePond.FilePondOptions = {
    allowMultiple: true,
    labelIdle: "Drop files here to Upload...",
  };
  singlepondOptions: FilePond.FilePondOptions = {
    allowMultiple: false,
    labelIdle: "Drop files here to Upload...",
  };

  pondFiles: FilePond.FilePondOptions["files"] = [

  ];

  pondHandleInit() {
    console.log("FilePond has initialised", this.myPond);
  }

  pondHandleAddFile(event: any) {
    console.log("A file was added", event);
  }

  pondHandleActivateFile(event: any) {
    console.log("A file was activated", event);
  }
  flatpickrOptions: any = {
    inline: true,
  };
  ngOnInit(): void {

    this.flatpickrOptions = {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
    };

    flatpickr('#inlinetime', this.flatpickrOptions);

    this.flatpickrOptions = {
      enableTime: true,
      dateFormat: 'Y-m-d H:i', // Specify the format you want
      defaultDate: '2023-11-07 14:30', // Set the default/preloaded time (adjust this to your desired time)
    };

    flatpickr('#pretime', this.flatpickrOptions);
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
