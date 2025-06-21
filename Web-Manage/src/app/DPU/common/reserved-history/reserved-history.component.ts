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

    this.reservationService.getReservations({}).subscribe(reservations => {
      this.allList = reservations;
      this.dateFrom = '';
      this.dateTo = '';
      this.selectedCustomer = undefined;
      this.filter()
    });
    this.userService.getLists().subscribe(result => {
      this.customerList = result.filter(e => e.role == 'customer')
    });
  }

  filter() {
    this.filteredList = this.allList.filter(r => {
      // เปรียบเทียบ customer
      let matchCustomer = !this.selectedCustomer || r.user_id === this.selectedCustomer;
      // เปรียบเทียบวันที่เริ่ม (From)
      let matchFrom = true, matchTo = true;

      if (this.dateFrom) {
        // แปลงทั้งสองเป็น date เทียบกัน (เอาแต่วันที่)
        const from = new Date(this.dateFrom + 'T00:00:00');
        const start = new Date(r.start_time);
        matchFrom = start >= from;
      }
      if (this.dateTo) {
        // dateTo จะปิดวัน ต้อง +1 วัน หรือ set เวลาเป็น 23:59:59
        const to = new Date(this.dateTo + 'T23:59:59');
        const start = new Date(r.start_time);
        matchTo = start <= to;
      }
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
