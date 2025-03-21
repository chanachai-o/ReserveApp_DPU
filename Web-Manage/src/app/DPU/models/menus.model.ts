import { environment } from "../../../environments/environment";

export class MenuModel {
  name: string;
  description: string;
  category: string;
  price: string;
  id: number;
  is_active: boolean;
  picture: string;

  constructor(data?: Partial<MenuModel>) {
    this.picture = data?.picture ?? '';
    this.name = data?.name!
    this.description = data?.description!
    this.category = data?.category!
    this.price = data?.price!
    this.id = data?.id!
    this.is_active = data?.is_active!
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/111.jpg'
  }

  getStatus(): string {
    if (this.is_active) {
      return 'เปิดบริการ'
    } else {
      return 'ปิดการให้บริการ'
    }
  }

}

export class TablesModel {
  table_number: string;
  capacity: number;
  status: string;
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
      return 'เปิดบริการ'
    } else if (this.status == 'reserved') {
      return 'จอง'
    } {
      return 'ไม่เปิดให้บริการ'
    }
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
