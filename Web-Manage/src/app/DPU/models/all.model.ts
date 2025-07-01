import { environment } from "../../../environments/environment";
import { UserProfileModel } from "./user.model";

// ========== ENUM + Utility ==========
export enum UserRole {
  Customer = 'customer',
  Staff = 'staff',
  Chef = 'chef',
  Manager = 'manager',
}
export const UserRoleLabel = {
  [UserRole.Customer]: 'ลูกค้า',
  [UserRole.Staff]: 'พนักงาน',
  [UserRole.Chef]: 'เชฟ',
  [UserRole.Manager]: 'ผู้จัดการ',
};

export enum TableStatus { Available = 'available', Reserved = 'reserved', Occupied = 'occupied', Cleaning = 'cleaning', Maintenance = 'maintenance', }
export enum RoomStatus { Available = 'available', Reserved = 'reserved', Occupied = 'occupied', Cleaning = 'cleaning', Maintenance = 'maintenance', }
export enum ReservationStatus { Pending = 'PENDING', CheckedIn = 'CHECKED_IN', Completed = 'COMPLETED', Cancelled = 'CANCELLED', NoShow = 'NO_SHOW', }
export enum OrderStatus { Pending = 'pending', Preparing = 'preparing', Cooked = 'cooked', Served = 'served', Rejected = 'rejected', }
export enum OrderItemStatus { Pending = 'pending', Preparing = 'preparing', Cooked = 'cooked', Served = 'served', Rejected = 'rejected', }
export enum PaymentStatus { Pending = 'PENDING', Completed = 'COMPLETED', Declined = 'FAILED', }

// ========== BASE MODEL ==========
export class BaseModel {
  constructor(obj: any) {
    Object.assign(this, obj);
  }
}

// ========== USER ==========

// ========== TABLE/ROOM ==========
export interface Table {
  id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  picture?: string | null;
  getPicture(): string;
}
export class TableModel extends BaseModel implements Table {
  id = 0;
  table_number = '';
  capacity = 0;
  status = TableStatus.Available;
  picture?: string | null = null;
  constructor(data: Partial<Table> = {}) {
    super(data);
    this.id = data.id || 0;
    this.table_number = data.table_number || '';
    this.capacity = data.capacity || 0;
    this.status = data.status || TableStatus.Available;
    this.picture = data.picture || null;
  }
  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/222.png';
  }
}

export interface Room {
  id: number;
  room_name: string;
  capacity: number;
  equipment?: string | null;
  status: RoomStatus;
  picture?: string | null;
  getPicture(): string;

}
export class RoomModel extends BaseModel implements Room {
  id = 0;
  room_name = '';
  capacity = 0;
  equipment?: string | null = null;
  status = RoomStatus.Available;
  picture?: string | null = null;
  constructor(data: Partial<Room> = {}) {
    super(data);
    this.id = data.id || 0;
    this.room_name = data.room_name || '';
    this.capacity = data.capacity || 0;
    this.equipment = data.equipment || null;
    this.status = data.status || RoomStatus.Available;
    this.picture = data.picture || null;
  }
  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/333.png';
  }
}

// ========== AVAILABLE ITEM (เลือกใช้ class) ==========
export class AvailableItem {
  id = 0;
  type: 'table' | 'room' = 'table';
  table_number = '';
  room_number = '';
  name = '';
  capacity = 0;
  picture = '';
  description = '';
  status = '';

  constructor(data: Partial<AvailableItem>) {
    Object.assign(this, data);
    if (typeof data.type === "undefined") {
      this.type = data.table_number ? 'table' : 'room';
    }
  }
  getPicture(): string {
    return this.picture
      ? environment.baseUrl + '/images/' + this.picture
      : (this.type === 'room'
        ? './assets/images/faces/333.png'
        : './assets/images/faces/222.png');
  }
  getLabel(): string {
    if (this.type === 'table') return `โต๊ะ ${this.table_number || this.id}`;
    if (this.type === 'room') return `ห้อง ${this.name || this.room_number || this.id}`;
    return this.name || '';
  }
  getStatusLabel(): string {
    if (this.status === 'available') return 'เปิดบริการ';
    if (this.status === 'reserved') return 'จอง';
    return 'ไม่เปิดให้บริการ';
  }
}

// ========== MENU ==========
export interface Menus {
  id: number;
  name: string;
  description?: string | null;
  category_id?: string | null;
  category?: {
    name: string;
    description: string;
    id: number;
    is_active: boolean;
  };
  price: number;
  is_active: boolean;
  image_url?: string | null;
  getPicture(): string;
}
export class MenusModel extends BaseModel implements Menus {
  id = 0;
  name = '';
  description = '';
  category_id = '';
  category?
  price = 0;
  is_active = false;
  image_url?: string | null = null;
  constructor(data: Partial<Menus> = {}) {
    super(data);
    this.id = data.id || 0;
    this.name = data.name || '';
    this.description = data.description || '';
    this.category_id = data.category_id || '';
    this.category = data.category ? {
      name: data.category.name || '',
      description: data.category.description || '',
      id: data.category.id || 0,
      is_active: data.category.is_active || false
    } : undefined;
    this.price = data.price || 0;
    this.is_active = data.is_active || false;
    this.image_url = data.image_url || null;
  }
  getPicture(): string {
    return this.image_url
      ? `${environment.baseUrl}/images/${this.image_url}`
      : './assets/images/faces/111.jpg';
  }
  getStatus(): string {
    return this.is_active ? 'เปิดบริการ' : 'ปิดการให้บริการ';
  }
}

// ========== ORDER/ORDER ITEM ==========
export interface OrderItem {
  id: number;
  menu_id: number;
  quantity: number;
  status: OrderItemStatus;
  menu: Menus;
  note?: string | null;
}
export class OrderItemModel extends BaseModel implements OrderItem {
  id = 0;
  menu_id = 0;
  quantity = 1;
  status = OrderItemStatus.Pending;
  menu: Menus
  note?: string | null = null;
  constructor(data: Partial<OrderItem> = {}) {
    super(data);
    this.id = data.id || 0;
    this.menu_id = data.menu_id || 0;
    this.quantity = data.quantity || 1;
    this.status = data.status || OrderItemStatus.Pending;
    this.menu = data.menu ? new MenusModel(data.menu) : new MenusModel();
    this.note = data.note || null;
  }
}

export interface Order {
  id: number;
  user_id: number;
  reservation_id?: number | null;
  status: OrderStatus;
  total_amount: number;
  order_items: OrderItem[];
}
export class OrderModel extends BaseModel implements Order {
  id = 0;
  user_id = 0;
  reservation_id?: number | null = null;
  status = OrderStatus.Pending;
  total_amount = 0;
  order_items: OrderItem[] = [];
  constructor(data: Partial<Order> = {}) {
    super(data);
    this.id = data.id || 0;
    this.user_id = data.user_id || 0;
    this.reservation_id = data.reservation_id || null;
    this.status = data.status || OrderStatus.Pending;
    this.total_amount = data.total_amount || 0;
    this.order_items = data.order_items ? data.order_items.map(item => new OrderItemModel(item)) : [];
  }
}

// ========== PAYMENT ==========
export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  slip_url: string | null;
  status: PaymentStatus;
  getSlipUrl(): string;
}
export class PaymentModel extends BaseModel implements Payment {
  id = 0;
  order_id = 0;
  amount = 0;
  slip_url: string | null = null;
  status = PaymentStatus.Pending;
  constructor(data: Partial<Payment> = {}) {
    super(data);
    this.id = data.id || 0;
    this.order_id = data.order_id || 0;
    this.amount = data.amount || 0;
    this.slip_url = data.slip_url || null;
    this.status = data.status || PaymentStatus.Pending;
  }
  getSlipUrl(): string {
    return this.slip_url ? environment.baseUrl + '/images/' + this.slip_url : 'assets/img/no-image.png';
  }
}

// ========== STORE ==========
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
export class StoreProfile extends BaseModel implements StoreProfileModel {
  id?: number | undefined;
  name = '';
  address = '';
  phone = '';
  email?: string;
  open_time = '';
  close_time = '';
  logo_url?: string;
  layout_picture?: string;
  getPicture(): string { return this.logo_url || 'assets/img/no-image.png'; }
  getLayout(): string { return this.layout_picture || 'assets/img/layout-placeholder.png'; }
}

// ========== NOTIFICATION ==========
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}
export class NotificationModel extends BaseModel implements Notification {
  id = 0;
  user_id = 0;
  title = '';
  message = '';
  type = '';
  is_read = false;
  created_at = new Date().toISOString();
  constructor(data: Partial<Notification> = {}) {
    super(data);
    this.id = data.id || 0;
    this.user_id = data.user_id || 0;
    this.title = data.title || '';
    this.message = data.message || '';
    this.type = data.type || '';
    this.is_read = data.is_read || false;
    this.created_at = data.created_at || new Date().toISOString();
  }
}

// ========== RESERVATION ==========
export interface ReservationDetailModel {
  id: number;
  user_id?: number | null;
  table_id?: number | null;
  room_id?: number | null;
  start_time: string;
  end_time: string;
  num_people: number;
  status: ReservationStatus;
  note?: string | null;
  user: UserProfileModel;
  table?: Table;
  room?: Room;
  orders: Order[];
  payments: Payment[];
}
export class ReservationModel extends BaseModel implements ReservationDetailModel {
  id = 0;
  user_id?: number | null = null;
  table_id?: number | null = null;
  room_id?: number | null = null;
  start_time = '';
  end_time = '';
  num_people = 0;
  status = ReservationStatus.Pending;
  note?: string | null = '';
  user: UserProfileModel = new UserProfileModel();
  table?: Table = undefined;
  room?: Room = undefined;
  orders: Order[] = [];
  payments: Payment[] = [];
  constructor(data: Partial<ReservationDetailModel>) {
    super(data);
    this.id = data.id || 0;
    this.user_id = data.user_id || null;
    this.table_id = data.table_id || null;
    this.room_id = data.room_id || null;
    this.start_time = data.start_time || '';
    this.end_time = data.end_time || '';
    this.num_people = data.num_people || 0;
    this.status = data.status || ReservationStatus.Pending;
    this.note = data.note || '';

    this.user = data.user ? new UserProfileModel(data.user) : new UserProfileModel();
    this.table = data.table ? new TableModel(data.table) : undefined;
    this.room = data.room ? new RoomModel(data.room) : undefined;
    this.orders = data.orders ? data.orders.map(o => new OrderModel(o)) : [];
    this.payments = data.payments ? data.payments.map(p => new PaymentModel(p)) : [];
  }
}
