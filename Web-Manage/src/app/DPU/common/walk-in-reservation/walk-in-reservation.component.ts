import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlatpickrModule, FlatpickrDefaults } from 'angularx-flatpickr';
import flatpickr from 'flatpickr';
import { MaterialModuleModule } from '../../../material-module/material-module.module';
import { SharedModule } from '../../../shared/shared.module';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-walk-in-reservation',
  standalone: true,
  imports: [SharedModule, NgSelectModule, MaterialModuleModule, FlatpickrModule, FormsModule, ReactiveFormsModule],
  providers: [FlatpickrDefaults],
  templateUrl: './walk-in-reservation.component.html',
  styleUrl: './walk-in-reservation.component.scss'
})
export class WalkInReservationComponent {
  flatpickrOptions: any = {
    inline: true,
  };
  constructor(private http : HttpClient) {

  }
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

  saveReservation() {
    let reservationData = {
      "start_time": "2025-05-16T19:18:37.523Z",
      "end_time": "2025-05-16T19:18:37.523Z",
      "num_people": 0,
      "user_id": 0,
      "phone": "string",
      "table_id": 0,
      "room_id": 0,
      "status": "pending"
    }
    this.http.post('http://localhost:8080/api/v1/reservation', reservationData).subscribe(
      (response) => {
        console.log('Reservation saved successfully!', response);
      }
    );
  }
}
