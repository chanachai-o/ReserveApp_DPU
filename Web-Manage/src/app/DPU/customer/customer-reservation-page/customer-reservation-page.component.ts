import { StoreProfile } from './../../services/store-profile.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ViewBillModalComponent } from '../view-bill-modal/view-bill-modal.component';
import { AvailableItemCardComponent } from '../available-item-card/available-item-card.component';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { TokenService } from '../../../shared/services/token.service';
import { MenusService } from '../../services/menu.service';
import { ReservationService } from '../../services/reservation.service';
import { RoomService } from '../../services/room.service';
import { TablesService } from '../../services/tables.service';
import { AvailableItem } from '../../models/all.model';
import { ReservationCustomerCardComponent } from '../reservation-card/reservation-card.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TableReservationModalComponent } from '../table-reservation-modal/table-reservation-modal.component';
import { OrderFoodModalComponent } from '../order-food-modal/order-food-modal.component';
import { StoreProfileService } from '../../services/store-profile.service';
import swal from 'sweetalert';
@Component({
  selector: 'app-customer-reservation-page',
  templateUrl: './customer-reservation-page.component.html',
  standalone: true,
  imports: [CommonModule, AvailableItemCardComponent, ViewBillModalComponent, ReservationCustomerCardComponent, TableReservationModalComponent, OrderFoodModalComponent, FormsModule],
  styleUrls: ['./customer-reservation-page.component.scss']
})
export class CustomerReservationPageComponent implements OnInit {
  availableList: any[] = [];
  availableTables: AvailableItem[] = [];
  availableRooms: AvailableItem[] = [];
  reservationList: any[] = [];
  selectedItem: any = null;
  selectedOrderRes: any = null;
  selectedBillRes: any = null;
  menuList: any[] = [];
  showReserveModal = false;
  showOrderModal = false;
  showBillModal = false;
  filterType: string = '';
  filterCapacity: string = '';
  filteredAvailableList: AvailableItem[] = [];
  searchText: string = '';
  storeModel: StoreProfile = new StoreProfile();
  showMap: boolean = false;
  constructor(private tableService: TablesService, private http: HttpClient, private tokenService: TokenService, private menuService: MenusService, private roomService: RoomService, private reserveService: ReservationService, private storeService: StoreProfileService) {

  }

  ngOnInit() {
    // เรียกข้อมูล availableList, reservationList, menuList จาก API หรือ service
    this.getTable()
    this.getReserved();
    this.getStoreProfile()
  }

  getReserved() {
    this.reserveService.getReservations({ user: this.tokenService.getUser().id }).subscribe(result => {
      this.reservationList = result
    })

  }

  getStoreProfile() {
    this.storeService.getProfile().subscribe(result => {
      this.storeModel = result;
    }, error => {
      console.error('Error fetching store profile:', error);
    });
  }


  getTable() {
    forkJoin({
      tables: this.tableService.getActiveList(),
      rooms: this.roomService.getActiveList()
    }).subscribe(({ tables, rooms }) => {
      this.availableTables = tables;
      this.availableRooms = rooms;
      this.onTypeChange(); // เรียกครั้งเดียวหลังข้อมูลครบ
    });
  }
  filterAvailable() {
    console.log('Filtering available items with:', {
      searchText: this.searchText,
      filterType: this.filterType,
      filterCapacity: this.filterCapacity
    });
    this.filteredAvailableList = this.availableList.filter(item => {
      const textMatch = !this.searchText || (item.name || item.table_number || item.room_number || '').toLowerCase().includes(this.searchText.toLowerCase());
      const typeMatch = !this.filterType || item.type === this.filterType;
      const capacityMatch = !this.filterCapacity || item.capacity >= +this.filterCapacity;
      return textMatch && typeMatch && capacityMatch;
    });
  }

  onTypeChange() {
    this.availableList = [...this.availableTables, ...this.availableRooms];
    this.filterAvailable();
  }


  onReserve(item: any) {
    this.selectedItem = item;
    this.showReserveModal = true;
  }
  handleReserved(item: any) {
    this.showReserveModal = false;
    console.log('API', item);
    item.status = 'pending'
    item.end_time = item.start_time
    swal({
      title: "Are you sure?",
      text: "คุณต้องการบันทึกการจองนี้หรือไม่?",
      icon: "info",
      buttons: ["Cancel", "Yes, Save it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.reserveService.createReservation(item).subscribe(result => {
            console.log(result);
            if (item['table_id']) {
              this.tableService.reserve(item.table_id).subscribe(() => {
                swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                this.ngOnInit();
              });
            } else {
              this.roomService.reserve(item.room_id).subscribe(() => {
                swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                this.ngOnInit();
              });
            }
          }, error => {
            console.error('Error creating reservation:', error);
            swal("Error", "ไม่สามารถบันทึกข้อมูลได้", "error");
          });
        }
      });


    // this.http.post("http://127.0.0.1:8000/reservations", item).subscribe(result => {
    //   console.log(result)
    //   if (item['table_id']) {
    //     this.tableService.reseave(item.table_id).subscribe(result => {
    //       swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
    //       this.ngOnInit()
    //     })
    //   }
    //   else {
    //     this.roomService.reseave(item.room_id).subscribe(result => {
    //       swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
    //       this.ngOnInit()
    //     })
    //   }
    // })
  }

  onCancel(item: any) {
    console.log(item);
    item.end_time = item.start_time;
    item.status = 'cancelled';
    swal({
      title: "Are you sure?",
      text: "คุณต้องการยกเลิกการจองนี้หรือไม่?",
      icon: "warning",
      dangerMode: true,
      buttons: ["Cancel", "Yes, Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.reserveService.cancelReservation(item.id).subscribe(result => {
            console.log(result);
            // เช็คว่าเป็นการจองโต๊ะหรือห้อง เพื่อยกเลิกสถานะ
            if (item.table_id) {
              this.tableService.cancelReseave(item.table_id).subscribe(_ => {
                swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                this.ngOnInit();
              });
            } else if (item.room_id) {
              this.roomService.cancelReseave(item.room_id).subscribe(_ => {
                swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                this.ngOnInit();
              });
            } else {
              swal("Error", "ไม่พบข้อมูลโต๊ะหรือห้อง", "error");
            }
          });
        }
      });
  }

  onOrder(res: any) {
    this.selectedOrderRes = res;
    this.showOrderModal = true;
    console.log('Selected Reservation for Order:', res);
  }
  handleOrder(item: any) {
    this.showOrderModal = false;
    console.log('Order data:', item);
    swal({
      title: "Are you sure?",
      text: "คุณต้องการบันทึกออเดอร์นี้หรือไม่?",
      icon: "warning",
      dangerMode: true,
      buttons: ["Cancel", "Yes, Save it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.http.post("http://127.0.0.1:8000/orders", item).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
          })
        }
      });

  }
  onViewBill(res: any) {
    this.selectedBillRes = res;
    this.showBillModal = true;
  }

  handleUploadSlip(item: any) {
    this.showBillModal = false;
    // ส่ง formData ไป backend (POST /payments หรือแล้วแต่ API)
    this.http.put("http://127.0.0.1:8000/payments/orders/" + item.orders[0].id + "/payment", {
      "amount": item.orders[0].total_amount,
      "slip_url": item.payments[0].slip_url
    }).subscribe(result => {
      swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
      this.ngOnInit()
    })
  }

  handleCheckOut(item: any) {
    console.log(item);
    this.showBillModal = false;
    item.end_time = new Date().toISOString()
    item.status = 'checked_out'

    this.http.put("http://127.0.0.1:8000/reservations/" + item.id, item).subscribe(result => {
      console.log(result);
      this.savePayment(item.orders[0].id)
      // เช็คว่าเป็นการจองโต๊ะหรือห้อง เพื่อยกเลิกสถานะ
      if (item.table_id) {
        this.tableService.cancelReseave(item.table_id).subscribe(_ => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit();
        });
      } else if (item.room_id) {
        this.roomService.cancelReseave(item.room_id).subscribe(_ => {
          swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
          this.ngOnInit();
        });
      } else {
        swal("Error", "ไม่พบข้อมูลโต๊ะหรือห้อง", "error");
      }
    });
  }

  savePayment(orderId: string) {
    this.http.post("http://127.0.0.1:8000/payments/orders/" + orderId + "/payment", {
      "amount": 0,
      "slip_url": ""
    }).subscribe(result => {
      swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
      this.ngOnInit()
    })
  }
}
