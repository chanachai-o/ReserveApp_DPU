import { environment } from "../../../environments/environment";
import { TableStatus } from "./all.model";

export class TablesModel {
  table_number: string;
  capacity: number;
  status: TableStatus;
  id: number;
  picture: string;

  constructor(data?: Partial<TablesModel>) {
    this.picture = data?.picture ?? '';
    this.table_number = data?.table_number!
    this.capacity = data?.capacity!
    this.status = data?.status!
    this.id = data?.id!
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/222.png'
  }

  getStatus(): string {
    // # available, reserved, unavailable
    if (this.status == 'available') {
      return 'ว่าง'
    } else if (this.status == 'reserved') {
      return 'มีการจองล่วงหน้า'
    } else if (this.status == 'occupied') {
      return 'มีลูกค้านั่งแล้ว'
    }
    else if (this.status == 'cleaning') {
      return 'รอพนักงานเช็ดโต๊ะ'
    } else if (this.status == 'maintenance') {
      return 'ปิดปรับปรุง / ซ่อม'
    }
    else {
      return '-'
    }
    //  available    = "available"     # ว่าง ลูกค้าจองได้
    // reserved     = "reserved"      # มีการจองล่วงหน้า
    // occupied     = "occupied"      # มีลูกค้านั่งแล้ว
    // cleaning     = "cleaning"      # รอพนักงานเช็ดโต๊ะ
    // maintenance  = "maintenance"   # ปิดปรับปรุง / ซ่อม
  }

}

export class RoomModel {
  name: string;
  picture?: any;
  capacity: number;
  equipment: string;
  status: string;
  id: number;

  constructor(data?: Partial<RoomModel>) {
    this.picture = data?.picture ?? '';
    this.name = data?.name!
    this.capacity = data?.capacity!
    this.status = data?.status!
    this.id = data?.id!
    this.equipment = data?.equipment!
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/333.png'
  }

  getStatus(): string {
    // # available, reserved, unavailable
    if (this.status == 'available') {
      return 'เปิดบริการ'
    } else if (this.status == 'reserved') {
      return 'จอง'
    } {
      return 'ไม่เปิดให้บริการ'
    }
  }

}
