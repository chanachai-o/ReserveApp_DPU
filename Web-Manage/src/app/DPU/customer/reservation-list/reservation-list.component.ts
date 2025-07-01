import { Component } from '@angular/core';
import { AvailableItem, ReservationModel } from '../../models/all.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { TokenService } from '../../../shared/services/token.service';
import { MenusService } from '../../services/menu.service';
import { RoomService } from '../../services/room.service';
import { TablesService } from '../../services/tables.service';
import { ReservationCardComponent } from '../../common/walk-in-reservation/reservation-card/reservation-card.component';
import { TableReservationComponent } from '../../common/table-reservation/table-reservation.component';
import swal from 'sweetalert';
import { ReservationService } from '../../services/reservation.service';
import { UserProfileModel } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent {
  customerList: UserProfileModel[] = []; // {id,name,phone...}
  selectedCustomer?: number = this.tokenService.getUser().id; // เริ่มต้นแสดงข้อมูลของผู้ใช้ที่ล็อกอินอยู่
  dateFrom: string = '';
  dateTo: string = '';
  allList: ReservationModel[] = []; // ดึงข้อมูลทั้งหมด
  filteredList: ReservationModel[] = [];

  selectedReservation: ReservationModel | null = null;
  showDetailModal = false;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private menusService: MenusService,
    private roomService: RoomService,
    private tablesService: TablesService,
    private reservationService: ReservationService,
    private userService: UserService
  ) { }

  ngOnInit() {
    // load allList, customerList ...
    this.reservationService.getReservations({user : this.selectedCustomer}).subscribe(reservations => {
      this.allList = reservations;
      this.filteredList = [...this.allList]; // เริ่มต้นแสดงทั้งหมด
    });
    this.userService.getUsers('customer').subscribe(result => {
      this.customerList = result
    })
    this.filter();
  }

  filter() {
    this.filteredList = this.allList.filter(r => {
      let matchCustomer = !this.selectedCustomer || r.user_id === this.selectedCustomer;
      let matchFrom = !this.dateFrom || r.start_time >= this.dateFrom;
      let matchTo = !this.dateTo || r.start_time <= this.dateTo + 'T23:59:59';
      return matchCustomer && matchFrom && matchTo;
    });
  }

  getTotalAmount(res: ReservationModel): number {
    return res.orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 0;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'CHECKED_IN': return 'เข้าใช้บริการ';
      case 'COMPLETED': return 'สำเร็จ';
      case 'CANCELLED': return 'ยกเลิก';
      default: return status;
    }
  }

  viewDetail(res: ReservationModel) {
    this.selectedReservation = res;
    this.showDetailModal = true;
  }
}
