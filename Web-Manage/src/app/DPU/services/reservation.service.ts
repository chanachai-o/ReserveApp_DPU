/*  src/app/services/reservation.service.ts
    Angular ≥ v17 service สำหรับจัดการ Reservation API  */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservationModel } from '../models/all.model';

// export interface Reservation {
//   id?: number;                 // undefined เมื่อยังไม่สร้าง
//   user_id?: number;            // backend ใส่เอง
//   table_id?: number | null;
//   room_id?:  number | null;
//   start_time: string;          // ISO-8601
//   end_time:   string;
//   num_people: number;
//   status?:   'pending' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
//   note?: string | null;
// }
// export type ReservationCreate = Omit<Reservation, 'id' | 'status'>;   // payload ตอนสร้าง
// export type ReservationUpdate = Partial<Omit<Reservation, 'id'>>;     // payload ตอนแก้ไข

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  /** URL ต้นทาง:  https://api.example.com/reservations */
  private readonly BASE_URL = `${environment.apiBaseUrl}/reservations`;

  constructor(private http: HttpClient) {}

  /* ────────────────────────────────
          READ
  ────────────────────────────────── */

  /** ดึงรายการจองทั้งหมด (ถ้าใส่ userId จะ filter ตาม owner) */
  getReservations(userId?: number): Observable<ReservationModel[]> {
    let params = new HttpParams();
    if (userId != null) params = params.set('user', userId.toString());
    return this.http.get<ReservationModel[]>(this.BASE_URL, { params });
  }

  /** ดึงรายการจองเดี่ยวตาม id */
  getReservationById(id: number): Observable<ReservationModel> {
    return this.http.get<ReservationModel>(`${this.BASE_URL}/${id}`);
  }

  /* ────────────────────────────────
          CREATE / UPDATE / DELETE
  ────────────────────────────────── */

  /** สร้างการจองใหม่ */
  createReservation(body: ReservationModel): Observable<ReservationModel> {
    return this.http.post<ReservationModel>(this.BASE_URL, body);
  }

  /** แก้ไขการจอง */
  updateReservation(
    id: number,
    body: ReservationModel
  ): Observable<ReservationModel> {
    return this.http.put<ReservationModel>(`${this.BASE_URL}/${id}`, body);
  }

  /** ยกเลิกการจอง  */
  cancelReservation(id: number): Observable<{ detail: string }> {
    return this.http.delete<{ detail: string }>(`${this.BASE_URL}/${id}`);
  }

  /* ────────────────────────────────
          CHECK-IN / CHECK-OUT
  ────────────────────────────────── */

  /** เช็กอินเมื่อถึงร้าน */
  checkIn(id: number): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(
      `${this.BASE_URL}/${id}/checkin`,
      {}
    );
  }

  /** เช็กเอาท์เมื่อเสร็จสิ้น */
  checkOut(id: number): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(
      `${this.BASE_URL}/${id}/checkout`,
      {}
    );
  }
}
