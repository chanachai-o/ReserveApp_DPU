import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export class StoreProfile {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  open_time?: string;      // "HH:mm"
  close_time?: string;     // "HH:mm"
  tax_id?: string;
  service_charge_pct?: number;
  vat_pct?: number;
  logo_url?: string;
  laylout_picture?: string;

  constructor(
    data?: Partial<StoreProfile>
  ) {
    this.id = data?.id!;
    this.name = data?.name!;
    this.address = data?.address!;
    this.phone = data?.phone!;
    this.email = data?.email!;
    this.open_time = data?.open_time!;
    this.close_time = data?.close_time!;
    this.tax_id = data?.tax_id!;
    this.service_charge_pct = data?.service_charge_pct!;
    this.vat_pct = data?.vat_pct!;
    this.logo_url = data?.logo_url!;
    this.laylout_picture = data?.laylout_picture!;
  }

  getPicture(): string {
    return this.logo_url ? environment.baseUrl + '/images/' + this.logo_url : './assets/images/faces/9.jpg'
  }

  getLayout(): string {
    return this.laylout_picture ? environment.baseUrl + '/images/' + this.laylout_picture : ''
  }
}

@Injectable({
  providedIn: 'root',
})
export class StoreProfileService {
  /** ปรับ BASE_URL จาก environment */
  private readonly BASE_URL = `http://127.0.0.1:8000/api/store/profile`;

  constructor(private http: HttpClient) { }

  /** ดึงโปรไฟล์ (GET /store/profile) */
  getProfile(): Observable<StoreProfile> {
    return this.http.get<StoreProfile>(this.BASE_URL).pipe(
      map((data) => new StoreProfile(data)),
      // catchError((error) => {
      //   console.error('Error fetching store profile:', error);
      //   return of(new StoreProfile());
      // })
    );
  }

  /** สร้างโปรไฟล์ครั้งแรก (POST) */
  createProfile(payload: Omit<StoreProfile, 'id'>): Observable<StoreProfile> {
    return this.http.post<StoreProfile>(this.BASE_URL, new StoreProfile(payload));
  }

  /** อัปเดตโปรไฟล์ (PUT) */
  updateProfile(payload: StoreProfile): Observable<StoreProfile> {
    return this.http.put<StoreProfile>(this.BASE_URL , new StoreProfile(payload));
  }

  /* ---------- ตัวเลือกเสริม: Promise style ---------- */
  getProfileOnce(): Promise<StoreProfile> {
    return firstValueFrom(this.getProfile());
  }
}
