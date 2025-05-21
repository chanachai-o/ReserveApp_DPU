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


export interface User {
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

export interface Menu {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  is_active: boolean;
  picture?: string | null;
}

export interface OrderItem {
  id: number;
  menu_id: number;
  quantity: number;
  status: OrderItemStatus;
  menu?: Menu;
  note?: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  reservation_id?: number | null;
  status: OrderStatus;
  total_amount: number;
  order_items: OrderItem[];
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  slip_url?: string | null;
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

export interface Reservation {
  id: number;
  user_id: number;
  table_id?: number | null;
  room_id?: number | null;
  start_time: string;     // ISO 8601 (Date)
  end_time: string;
  num_people: number;
  status: ReservationStatus;
  note?: string | null;

  // Relations (optional for display/detail)
  user?: User;
  table?: Table;
  room?: Room;
  orders?: Order[];
  payments?: Payment[];
}
