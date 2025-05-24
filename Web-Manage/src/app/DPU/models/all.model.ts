import { environment } from "../../../environments/environment";

export enum UserRole {
  Customer = 'customer',
  Staff = 'staff',
  Chef = 'chef',
  Manager = 'manager',
}

export enum TableStatus {
  Available = 'available',
  Reserved = 'reserved',
  Occupied = 'occupied',
  Cleaning = 'cleaning',
  Maintenance = 'maintenance',
}

export enum RoomStatus {
  Available = 'available',
  Reserved = 'reserved',
  Occupied = 'occupied',
  Cleaning = 'cleaning',
  Maintenance = 'maintenance',
}

export enum ReservationStatus {
  Pending = 'pending',
  CheckedIn = 'checked_in',
  CheckedOut = 'checked_out',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
}

export enum OrderStatus {
  Pending = 'pending',
  Preparing = 'preparing',
  Cooked = 'cooked',
  Served = 'served',
  Rejected = 'rejected',
}

export enum OrderItemStatus {
  Pending = 'pending',
  Preparing = 'preparing',
  Cooked = 'cooked',
  Served = 'served',
  Rejected = 'rejected',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Declined = 'declined',
}


export interface UserProfileModel {
  id: number;
  name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  picture?: string | null;
}

export interface Table {
  id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  picture?: string | null;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  equipment?: string | null;
  status: RoomStatus;
  picture?: string | null;
}

export class AvailableItem {
  id: number;
  type: 'table' | 'room';
  table_number?: string;
  room_number?: string;
  name?: string;
  capacity: number;
  picture?: string;
  description?: string;
  status?: string;

  constructor(data: Partial<AvailableItem> = {}) {
    this.id = data.id ?? 0;
    this.type = data.table_number ? 'table' : 'room';
    this.table_number = data.table_number ?? '';
    this.room_number = data.room_number ?? '';
    this.name = data.name ?? '';
    this.capacity = data.capacity ?? 0;
    this.picture = data.picture ?? '';
    this.description = data.description ?? '';
    this.status = data.status
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : (this.type === 'room'
      ? './assets/images/faces/333.png'
      : './assets/images/faces/222.png')
  }

  getLabel(): string {
    // คืนชื่อที่เหมาะสม (เช่น โต๊ะ 1, ห้อง A)
    if (this.type === 'table') return `โต๊ะ ${this.table_number || this.id}`;
    if (this.type === 'room') return `ห้อง ${this.name || this.room_number || this.id}`;
    return this.name || '';
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


export interface Menus {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  is_active: boolean;
  picture?: string | null;
}

export class MenusModel implements Menus {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  is_active: boolean;
  picture?: string | null;

  constructor(data: Partial<Menus> = {}) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.description = data.description ?? '';
    this.category = data.category ?? '';
    this.price = data.price ?? 0;
    this.is_active = data.is_active ?? false;
    this.picture = data.picture ?? null;
  }

  getPicture(): string {
    return this.picture
      ? `${environment.baseUrl}/images/${this.picture}`
      : './assets/images/faces/111.jpg';
  }

  getStatus(): string {
    return this.is_active ? 'เปิดบริการ' : 'ปิดการให้บริการ';
  }
}
export interface OrderItem {
  id: number;
  menu_id: number;
  quantity: number;
  status: OrderItemStatus;
  menu?: Menus;
  note?: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  reservation_id?: number | null;
  status: OrderStatus;
  total_amount: number;
  order_items: OrderItem[] | [];
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  slip_url?: string | null;
  status: PaymentStatus;
}

export interface StoreProfileModel {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  open_time: string;      // “HH:mm”
  close_time: string;     // “HH:mm”
  logo_url?: string;
  layout_picture?: string;
}

export class StoreProfile implements StoreProfileModel {
  id?: number | undefined;
  name: string;
  address: string;
  phone: string;
  email?: string | undefined;
  open_time: string;
  close_time: string;
  logo_url?: string | undefined;
  layout_picture?: string | undefined;
  // ...implement methods for getPicture(), getLayout() as fallback
  getPicture(): string { return this.logo_url || 'assets/img/no-image.png'; }
  getLayout(): string { return this.layout_picture || 'assets/img/layout-placeholder.png'; }
  // etc.
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

export interface ReservationModel {
  id: number;
  user_id?: number | null;
  table_id?: number | null;
  room_id?: number | null;
  start_time: string;     // ISO 8601 (Date)
  end_time: string;
  num_people: number;
  status: ReservationStatus;
  note?: string | null;

  // Relations (optional for display/detail)
  user: UserProfileModel;
  table?: Table;
  room?: Room;
  orders: Order[];
  payments?: Payment[];
}
