export enum UserRole {
  customer = 'customer',
  staff = 'staff',
  chef = 'chef',
  manager = 'manager'
}

export enum TableStatus {
  available = 'available',      // ว่าง ลูกค้าจองได้
  reserved = 'reserved',        // มีการจองล่วงหน้า
  occupied = 'occupied',        // มีลูกค้านั่งแล้ว
  cleaning = 'cleaning',        // รอพนักงานเช็ดโต๊ะ
  maintenance = 'maintenance'   // ปิดปรับปรุง / ซ่อม
}

export enum RoomStatus {
  available = 'available',
  reserved = 'reserved',
  occupied = 'occupied',
  cleaning = 'cleaning',
  maintenance = 'maintenance'
}

export enum ReservationStatus {
  pending = 'pending',
  checked_in = 'checked_in',
  completed = 'completed',
  cancelled = 'cancelled'
}

export enum PaymentStatus {
  pending = 'pending',
  completed = 'completed',
  declined = 'declined'
}

export enum OrderStatus {
  pending = 'pending',
  preparing = 'preparing',
  cooked = 'cooked',
  served = 'served'
}

export enum OrderItemStatus {
  pending = 'PENDING',
  preparing = 'PREPARING',
  cooked = 'COOKED',
  rejected = 'REJECTED',
  served = 'SERVED'
}


export interface User {
  id: number;
  phone: string;
  hashed_password?: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  picture?: string;
}

export interface Table {
  id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  picture?: string;
}


export interface Room {
  id: number;
  name: string;
  capacity: number;
  equipment?: string;
  status: RoomStatus;
  picture?: string;
}

export interface ReservationModel {
  id: number;
  user_id: number;
  table_id?: number;
  room_id?: number;
  start_time: string;   // ISO8601 string
  end_time: string;
  num_people: number;
  status: ReservationStatus;
}

export interface Menu {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  is_active: boolean;
  picture?: string;
}

export interface Order {
  id: number;
  user_id: number;
  reservation_id?: number;
  status: OrderStatus;
  total_amount: number;
  order_items?: OrderItem[]; // Optional, may need to import OrderItem
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_id: number;
  quantity: number;
  status: OrderItemStatus;
  menu?: Menu; // Optional, for display with menu info
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  slip_url: string;
  status: PaymentStatus;
}

export interface StoreProfile {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  open_time?: string;   // 'HH:mm:ss'
  close_time?: string;
  tax_id?: string;
  service_charge_pct?: number;
  vat_pct?: number;
  logo_url?: string;
  layout_picture?: string;
  created_at?: string;
  updated_at?: string;
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
