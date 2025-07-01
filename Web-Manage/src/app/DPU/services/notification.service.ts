import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationModel } from '../models/all.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiBaseUrl = '/api'; // ปรับเป็น endpoint ของ backend จริง

  constructor(private http: HttpClient) {}

  // ดึงแจ้งเตือนทั้งหมดของผู้ใช้
  getUserNotifications(userId: number): Observable<NotificationModel[]> {
    return this.http.get<NotificationModel[]>(`${this.apiBaseUrl}/users/${userId}/notifications`);
  }

  // สร้างการแจ้งเตือนใหม่
  createNotification(data: NotificationModel): Observable<NotificationModel> {
    return this.http.post<NotificationModel>(`${this.apiBaseUrl}/notifications`, data);
  }

  // mark as read
  markAsRead(notificationId: number): Observable<NotificationModel> {
    return this.http.patch<NotificationModel>(`${this.apiBaseUrl}/notifications/${notificationId}/read`, {});
  }

  // delete
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/notifications/${notificationId}`);
  }
}
