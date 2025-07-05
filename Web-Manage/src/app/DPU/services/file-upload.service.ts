// src/app/services/file-upload.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interface สำหรับ Response จาก API อัปโหลดไฟล์
export interface FileUploadResponse {
  filename: string;
  file_path: string; // API ควรคืน path ของไฟล์มาให้
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.baseUrl}/api`;

  constructor(private http: HttpClient) { }

  /**
   * อัปโหลดไฟล์รูปภาพไปยังเซิร์ฟเวอร์
   * @param file ไฟล์ที่ต้องการอัปโหลด
   * @returns Observable ที่มีข้อมูลไฟล์ที่อัปโหลดแล้ว
   */
  uploadImage(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    // 'file' คือ key ที่ Backend (FastAPI) คาดหวังจาก @File()
    formData.append('file', file, file.name);

    // ใช้ POST ไปยัง Endpoint ที่ถูกต้อง
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload-image`, formData);
  }
}
