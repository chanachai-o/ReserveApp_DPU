import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from '../../shared/services/token.service';
import { UserProfileModel } from '../models/user.model';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { PageResponseModel, ResponseModel } from '../models/base.model';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole } from '../models/all.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // แก้ไข: กำหนด URL ของ API ให้ถูกต้อง
  private apiUrl = `${environment.apiBaseUrl}/api/users`;

  constructor(private http: HttpClient) { }

  /**
   * ดึงรายชื่อผู้ใช้ทั้งหมด สามารถกรองตาม role ได้
   * @param role (Optional) บทบาทของผู้ใช้ที่ต้องการกรอง
   * @returns Observable ของ Array of User
   */
  getUsers(role?: string): Observable<UserProfileModel[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    // แก้ไข: เพิ่ม / ต่อท้าย และใช้ HttpParams ในการส่ง filter
    // ไม่จำเป็นต้องส่ง Token เอง เพราะ Interceptor จัดการให้แล้ว
    return this.http.get<UserProfileModel[]>(`${this.apiUrl}/`, { params }).pipe(
      map((e) => e.map((e) => new UserProfileModel(e)))
    );
  }

  /**
   * ดึงข้อมูลผู้ใช้ตาม ID
   * @param id ID ของผู้ใช้
   * @returns Observable ของ User
   */
  getUserById(id: number): Observable<UserProfileModel> {
    return this.http.get<UserProfileModel>(`${this.apiUrl}/${id}`).pipe(map((e) => new UserProfileModel(e)));
  }

  /**
   * สร้างผู้ใช้ใหม่
   * @param userData ข้อมูลของผู้ใช้ที่จะสร้าง
   * @returns Observable ของ User ที่ถูกสร้างขึ้น
   */
  createUser(userData: UserProfileModel): Observable<UserProfileModel> {
    // ใช้ POST และ URL ที่มี / ต่อท้าย
    return this.http.post<UserProfileModel>(`${this.apiUrl}/`, userData);
  }

  /**
   * อัปเดตข้อมูลผู้ใช้
   * @param id ID ของผู้ใช้ที่จะอัปเดต
   * @param userData ข้อมูลที่ต้องการอัปเดต
   * @returns Observable ของ User ที่อัปเดตแล้ว
   */
  updateUser(id: number, userData: UserProfileModel): Observable<UserProfileModel> {
    return this.http.put<UserProfileModel>(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * ลบผู้ใช้
   * @param id ID ของผู้ใช้ที่จะลบ
   * @returns Observable<void> (ไม่มีข้อมูลตอบกลับเมื่อสำเร็จ)
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
