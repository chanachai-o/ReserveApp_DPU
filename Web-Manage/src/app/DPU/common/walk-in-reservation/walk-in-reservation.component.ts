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
@Component({
  selector: 'app-walk-in-reservation',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, FlatpickrModule, MaterialModuleModule, SimplebarAngularModule, FilePondModule, FormsModule, ReactiveFormsModule, AvailableTableCardComponent, ReservationCardComponent],
  providers: [FlatpickrDefaults],
  templateUrl: './walk-in-reservation.component.html',
  styleUrl: './walk-in-reservation.component.scss'
})
export class WalkInReservationComponent {
  availableTables = [
    { id: 1, table_number: "A01", capacity: 4, picture: '' },
    { id: 2, table_number: "A02", capacity: 2, picture: '' }
    // ...ดึงจาก API จริง
  ];
  reservationList = [{
    "start_time": "2025-05-16T19:18:37.523Z",
    "end_time": "2025-05-16T19:18:37.523Z",
    "num_people": 0,
    "user_id": 0,
    "phone": "string",
    "table_id": 0,
    "room_id": 0,
    "status": "pending"
  }, {
    "start_time": "2025-05-16T19:18:37.523Z",
    "end_time": "2025-05-16T19:18:37.523Z",
    "num_people": 0,
    "user_id": 0,
    "phone": "string",
    "table_id": 0,
    "room_id": 0,
    "status": "pending"
  }]
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

  handleReserveTable(id: number) {
    // เรียก API จองโต๊ะ
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



}
