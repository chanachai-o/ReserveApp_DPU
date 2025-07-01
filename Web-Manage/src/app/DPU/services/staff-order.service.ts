// src/app/DPU/staff/take-home-management/staff-order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TakeawayOrder, OrderStatus, OrderStatusUpdate } from './staff-take-home.models';

@Injectable({
  providedIn: 'root'
})
export class StaffOrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) { }

  /**
   * ดึงออเดอร์ทั้งหมด (สามารถกรองตามประเภทได้ในอนาคต)
   * @param status (Optional) กรองตามสถานะ
   */
  getOrders(status?: OrderStatus): Observable<TakeawayOrder[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    // เพิ่ม filter สำหรับออเดอร์ที่ไม่มี reservation_id (สั่งกลับบ้าน)
    // หาก API ของคุณรองรับ query param นี้
    // params = params.set('order_type', 'takeaway');

    return this.http.get<TakeawayOrder[]>(this.apiUrl, { params });
  }

  /**
   * อัปเดตสถานะของออเดอร์
   * @param orderId ID ของออเดอร์
   * @param payload สถานะใหม่
   */
  updateOrderStatus(orderId: number, payload: OrderStatusUpdate): Observable<TakeawayOrder> {
    return this.http.post<TakeawayOrder>(`${this.apiUrl}/${orderId}/status`, payload);
  }
}
