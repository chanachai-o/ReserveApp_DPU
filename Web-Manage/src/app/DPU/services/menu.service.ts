import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { MenusModel } from '../models/all.model';
import { Observable } from 'rxjs';
export interface Menu {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category: {
    id: number;
    name: string;
  };
}

// โครงสร้างข้อมูลรายการอาหารในตะกร้า
export interface CartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

// โครงสร้างข้อมูลที่จะส่งไปให้ API ตอนยืนยันออเดอร์
export interface TakeawayPayload {
  customer_name: string;
  customer_phone: string;
  expected_pickup_time: string; // ISO 8601 format
  order_items: {
    menu_id: number;
    quantity: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class MenusService {


  apiBaseUrl = "/api/menus";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<MenusModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new MenusModel(e)));
  }

  getLists() {
    return this.http
      .get<MenusModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new MenusModel(e)))
      );
  }

  save(body: MenusModel) {
    return this.http.post<{
      "message": string,
      "user": MenusModel
    }>(this.apiBaseUrl, new MenusModel(body));
  }

  update(body: MenusModel) {
    return this.http.put<{
      "message": string,
      "user": MenusModel
    }>(this.apiBaseUrl + "/" + body.id, new MenusModel(body));
  }

  delete(body: MenusModel) {
    return this.http.delete<{
      "message": string,
      "user": MenusModel
    }>(this.apiBaseUrl + "/" + body.id);
  }

  getAvailableMenus(): Observable<MenusModel[]> {
    // ใช้ Endpoint ที่เราสร้างไว้สำหรับดึงเมนู
    return this.http.get<MenusModel[]>(`${this.apiBaseUrl}/menus?available_only=true`);
  }

  /**
   * ส่งข้อมูลออเดอร์สั่งกลับบ้าน
   * @param payload ข้อมูลออเดอร์
   */
  submitTakeawayOrder(payload: TakeawayPayload): Observable<any> {
    // ใช้ Endpoint ที่เราสร้างไว้สำหรับ Takeaway
    return this.http.post<any>(`${this.apiBaseUrl}/orders/takeaway`, payload);
  }

}
