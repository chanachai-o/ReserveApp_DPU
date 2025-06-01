import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TokenService } from '../../../shared/services/token.service';
import { ReservationModel } from '../../models/all.model';
import { UserProfileModel } from '../../models/user.model';
import { MenusService } from '../../services/menu.service';
import { ReservationService } from '../../services/reservation.service';
import { RoomService } from '../../services/room.service';
import { TablesService } from '../../services/tables.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reserved-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './reserved-history.component.html',
  styleUrl: './reserved-history.component.scss'
})
export class ReservedHistoryComponent {
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
    this.reservationService.getReservations({}).subscribe(reservations => {
      this.allList = reservations;
      this.filteredList = [...this.allList]; // เริ่มต้นแสดงทั้งหมด
    });
    this.userService.getLists().subscribe(result => {
      this.customerList = result.filter(e => e.role == 'customer')
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
      case 'pending': return 'รอดำเนินการ';
      case 'checked_in': return 'เข้าใช้บริการ';
      case 'checked_out': return 'เช็คบิล';
      case 'completed': return 'สำเร็จ';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  }

  viewDetail(res: ReservationModel) {
    this.selectedReservation = res;
    this.showDetailModal = true;
  }
}
