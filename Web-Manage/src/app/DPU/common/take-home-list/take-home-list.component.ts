import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';
import { StaffOrderService } from '../../services/staff-order.service';
import { TakeawayOrder } from '../../models/staff-take-home.models';
import { TakeHomeCardComponent } from './take-home-card/take-home-card.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-take-home-list',
  standalone: true,
  imports: [TakeHomeCardComponent , CommonModule],
  templateUrl: './take-home-list.component.html',
  styleUrls: ['./take-home-list.component.scss']
})
export class TakeHomeListComponent implements OnInit, OnDestroy {

  pendingOrders: TakeawayOrder[] = [];
  preparingOrders: TakeawayOrder[] = [];
  readyOrders: TakeawayOrder[] = [];

  isLoading = true;
  private destroy$ = new Subject<void>();
  private refreshTimer$ = timer(0, 15000); // รีเฟรชทุก 15 วินาที

  constructor(private staffOrderService: StaffOrderService) { }

  ngOnInit(): void {
    this.startOrderRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startOrderRefresh(): void {
    this.refreshTimer$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        if (!this.isLoading) this.isLoading = true;
        return this.staffOrderService.getOrders().pipe(
          finalize(() => this.isLoading = false)
        );
      })
    ).subscribe(orders => {
      this.filterOrdersByStatus(orders);
    });
  }

  filterOrdersByStatus(orders: TakeawayOrder[]): void {
    this.pendingOrders = orders.filter(o => o.status === 'PENDING' && !o.reservation_id).sort((a,b) => +new Date(a.created_at) - +new Date(b.created_at));
    this.preparingOrders = orders.filter(o => o.status === 'PREPARING' && !o.reservation_id).sort((a,b) => +new Date(a.created_at) - +new Date(b.created_at));
    this.readyOrders = orders.filter(o => o.status === 'READY' && !o.reservation_id).sort((a,b) => +new Date(a.created_at) - +new Date(b.created_at));
    console.log('Pending Orders:', this.pendingOrders);
    console.log('Preparing Orders:', this.preparingOrders);
    console.log('Ready Orders:', this.readyOrders);
  }

  handleStatusUpdate(orderId: number): void {
    // เมื่อมีการอัปเดตสถานะ ให้โหลดข้อมูลใหม่ทันที
    this.isLoading = true;
    this.staffOrderService.getOrders().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(orders => {
      this.filterOrdersByStatus(orders);
    });
  }
}
