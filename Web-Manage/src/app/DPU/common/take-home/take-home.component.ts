// src/app/DPU/take-home/take-home.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';


import { MenusModel, Order } from '../../models/all.model';
import { UserProfileModel } from '../../models/user.model';
import { OrderCreatePayload, OrderHistoryItem } from '../../models/take-home.models';
import { TakeHomeService } from '../../services/take-home.service';
import { AuthService } from '../../../shared/services/auth.service';
import { TokenService } from '../../../shared/services/token.service';
import { environment } from '../../../../environments/environment';

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

  private destroy$ = new Subject<void>();
  private statusRefreshTimer$ = timer(0, 30000); // รีเฟรชสถานะทุก 30 วินาที

  constructor(
    private fb: FormBuilder,
    private takeHomeService: TakeHomeService,
    private tokenService: TokenService
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
    ).subscribe(history => this.orderHistory = history);
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
    ).subscribe(history => this.orderHistory = history);
  }

  // --- Form Management ---
  initForm(): void {
    this.form = this.fb.group({
      order_items: this.fb.array([this.createItem()])
    });
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
      order_items: formValue.order_items
    };

    this.takeHomeService.submitOrder(payload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (createdOrder) => {
        alert(`สั่งอาหารสำเร็จ! หมายเลขออเดอร์ของคุณคือ #${createdOrder.id}`);
        this.form.reset();
        this.items.clear();
        this.addItem();
        this.getOrderHistory(); // Refresh history after submitting
      },
      error: (err: any) => {
        console.error("Order submission failed:", err);
        alert(`เกิดข้อผิดพลาด: ${err.error?.detail || 'ไม่สามารถสั่งอาหารได้'}`);
      }
    });
  }
}
