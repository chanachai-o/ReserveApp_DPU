// src/app/DPU/take-home/take-home.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenusModel } from '../models/all.model';
import { environment } from '../../../environments/environment';
import { OrderCreatePayload, OrderHistoryItem } from '../models/take-home.models';

@Injectable({
  providedIn: 'root'
})
export class TakeHomeService {
  private apiUrl = `${environment.baseUrl}/api`;

  constructor(private http: HttpClient) { }

  /**
   * ดึงรายการเมนูทั้งหมดที่พร้อมขาย
   */
  getAvailableMenus(): Observable<MenusModel[]> {
    const params = new HttpParams().set('available_only', 'true');
    return this.http.get<MenusModel[]>(`${this.apiUrl}/menus`, { params });
  }

  /**
   * ส่งข้อมูลออเดอร์สั่งกลับบ้าน
   * @param payload ข้อมูลออเดอร์
   */
  submitOrder(payload: OrderCreatePayload): Observable<OrderHistoryItem> {
    return this.http.post<OrderHistoryItem>(`${this.apiUrl}/orders`, payload);
  }

  /**
   * ดึงประวัติการสั่งซื้อของผู้ใช้
   * @param userId ID ของผู้ใช้
   */
  getOrderHistory(userId: number): Observable<OrderHistoryItem[]> {
    const params = new HttpParams()
      .set('user_id', userId.toString())
      // เพิ่ม filter สำหรับออเดอร์ที่ไม่มี reservation_id (สั่งกลับบ้าน)
      .set('order_type', 'takeaway');
    return this.http.get<OrderHistoryItem[]>(`${this.apiUrl}/orders`, { params });
  }
}
