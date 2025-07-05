// src/app/DPU/take-home/take-home.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; // Import HttpClient

import { MenusModel, Order } from '../../models/all.model';
import { UserProfileModel } from '../../models/user.model';
import { OrderCreatePayload, OrderHistoryItem, PaymentCreate, PaymentStatus } from '../../models/take-home.models'; // Import PaymentCreate and PaymentStatus
import { TakeHomeService } from '../../services/take-home.service';
import { AuthService } from '../../../shared/services/auth.service';
import { TokenService } from '../../../shared/services/token.service';
import { environment } from '../../../../environments/environment';
import swal from 'sweetalert';
@Component({
  selector: 'app-take-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './take-home.component.html',
  styleUrls: ['./take-home.component.scss']
})
export class TakeHomeComponent implements OnInit, OnDestroy {

  // --- Component State ---
  currentUser: UserProfileModel | null = null;
  menuList: MenusModel[] = [];
  form!: FormGroup;
  orderHistory: OrderHistoryItem[] = [];

  isLoadingMenu = true;
  isSubmitting = false;
  isLoadingHistory = true;
  selectedSlipFile: File | null = null; // To store the selected file
  uploadedSlipUrl: string | null = null; // To store the URL of the uploaded slip

  private destroy$ = new Subject<void>();
  private statusRefreshTimer$ = timer(0, 30000); // รีเฟรชสถานะทุก 30 วินาที

  constructor(
    private fb: FormBuilder,
    private takeHomeService: TakeHomeService,
    private tokenService: TokenService,
    private http: HttpClient // Inject HttpClient
  ) { }

  ngOnInit(): void {
    this.currentUser = this.tokenService.getUser();
    this.initForm();
    this.loadMenuAndHistory();
    this.startStatusRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Data Loading and Refreshing ---
  loadMenuAndHistory(): void {
    this.getMenuList();
    this.getOrderHistory();
  }

  getMenuList(): void {
    this.isLoadingMenu = true;
    this.takeHomeService.getAvailableMenus().pipe(
      finalize(() => this.isLoadingMenu = false)
    ).subscribe(result => this.menuList = result);
  }

  getOrderHistory(showLoading = true): void {
    if (!this.currentUser) return;
    if (showLoading) this.isLoadingHistory = true;

    this.takeHomeService.getOrderHistory(this.currentUser.id).pipe(
      finalize(() => this.isLoadingHistory = false)
    ).subscribe(history => {
      this.orderHistory = history
    });
  }

  startStatusRefresh(): void {
    this.statusRefreshTimer$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        if (this.currentUser) {
          return this.takeHomeService.getOrderHistory(this.currentUser.id);
        }
        return [];
      })
    ).subscribe(history => this.orderHistory = history.filter(order => order.reservation_id== undefined));
  }

  // --- Form Management ---
  initForm(): void {
    this.form = this.fb.group({
      order_items: this.fb.array([this.createItem()]),
      customer_name: [this.currentUser?.name || '', Validators.required],
      customer_phone: [this.currentUser?.phone || '', Validators.required],
      expected_pickup_time: [null] // New field for pickup time
    });
    this.selectedSlipFile = null;
    this.uploadedSlipUrl = null;
  }

  get items(): FormArray {
    return this.form.get('order_items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      menu_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  // --- File Upload ---
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedSlipFile = fileList[0];
      this.uploadSlipImage();
    } else {
      this.selectedSlipFile = null;
      this.uploadedSlipUrl = null;
    }
  }

  uploadSlipImage(): void {
    if (!this.selectedSlipFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedSlipFile, this.selectedSlipFile.name);

    this.http.post<any>(`${environment.baseUrl}/api/files/upload-image/`, formData).pipe(
      finalize(() => { /* Optional: handle loading state */ })
    ).subscribe({
      next: (response) => {
        this.uploadedSlipUrl = response.path; // Store the URL returned by the backend
        swal("Upload Success!", "อัปโหลดสลิปสำเร็จ", "success");
      },
      error: (err) => {
        console.error("Slip upload failed:", err);
        swal("Upload Failed!", `เกิดข้อผิดพลาดในการอัปโหลดสลิป: ${err.error?.detail || 'ไม่สามารถอัปโหลดไฟล์ได้'}`, "error");
        this.selectedSlipFile = null;
        this.uploadedSlipUrl = null;
      }
    });
  }

  // --- UI Logic ---
  menuById(id: number): MenusModel | undefined {
    return this.menuList.find(m => m.id === id);
  }

  getImageUrl(path?: string): string {
    if (!path) return 'https://placehold.co/100x100/e2e8f0/64748b?text=No+Image';
    return path.startsWith('http') ? path : `${environment.baseUrl}/images/${path}`;
  }

  getTotal(): number {
    return this.items.controls.reduce((sum, itemControl) => {
      const menu = this.menuById(itemControl.value.menu_id);
      const quantity = itemControl.value.quantity || 0;
      const price = menu?.price || 0;
      return sum + (price * quantity);
    }, 0);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'PREPARING': return 'status-preparing';
      case 'READY': return 'status-ready';
      case 'SERVED': // or COMPLETED
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  // --- Form Submission ---
  onSubmit(): void {
    if (this.form.invalid || !this.currentUser) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.form.getRawValue();
    const payload: OrderCreatePayload = {
      user_id: this.currentUser.id,
      customer_name: formValue.customer_name,
      customer_phone: formValue.customer_phone,
      order_items: formValue.order_items,
      expected_pickup_time: formValue.expected_pickup_time
    };

    // Add payment details if a slip was uploaded
    if (this.uploadedSlipUrl) {
      const payment: PaymentCreate = {
        amount: this.getTotal(), // Assuming total amount is the payment amount
        payment_method: 'transfer', // Or allow user to select
        slip_url: this.uploadedSlipUrl,
        status: PaymentStatus.COMPLETED // Assuming payment is completed upon slip upload
      };
      payload.payment = payment;
    }

    this.takeHomeService.submitOrder(payload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (createdOrder) => {
        // alert(`สั่งอาหารสำเร็จ! หมายเลขออเดอร์ของคุณคือ #${createdOrder.id}`);
        swal("Order Success!", `สั่งอาหารสำเร็จ! หมายเลขออเดอร์ของคุณคือ #${createdOrder.id}`, "success");
        this.form.reset();
        this.items.clear();
        this.addItem();
        this.getOrderHistory(); // Refresh history after submitting
      },
      error: (err: any) => {
        console.error("Order submission failed:", err);
        // alert(`เกิดข้อผิดพลาด: ${err.error?.detail || 'ไม่สามารถสั่งอาหารได้'}`);
        swal("Order Failed!", `เกิดข้อผิดพลาด: ${err.error?.detail || 'ไม่สามารถสั่งอาหารได้'}`, "error");
      }
    });
  }

  getStatusInfo(status: string) {
    switch (status) {
      case 'PENDING':
        return { text: 'รอดำเนินการ', icon: 'fa-solid fa-hourglass-start', cssClass: 'status-pending' };
      case 'PREPARING':
        return { text: 'กำลังทำอาหาร', icon: 'fa-solid fa-utensils', cssClass: 'status-preparing' };
      case 'READY':
        return { text: 'พร้อมเสิร์ฟ', icon: 'fa-solid fa-check-circle', cssClass: 'status-ready' };
      case 'SERVED':
      case 'COMPLETED':
        return { text: 'เสิร์ฟแล้ว', icon: 'fa-solid fa-thumbs-up', cssClass: 'status-completed' };
      case 'CANCELLED':
        return { text: 'ยกเลิก', icon: 'fa-solid fa-ban', cssClass: 'status-cancelled' };
      default:
        return { text: 'ไม่ทราบสถานะ', icon: 'fa-solid fa-question-circle', cssClass: '' };
    }
  }
}

