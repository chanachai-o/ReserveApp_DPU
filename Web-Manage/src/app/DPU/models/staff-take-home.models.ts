// src/app/DPU/staff/take-home-management/staff-take-home.models.ts

// OrderStatus ควร import มาจากที่เดียวกับที่อื่นใช้
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

// โครงสร้างข้อมูลเมนูในออเดอร์
export interface OrderItemMenu {
  name: string;
}

// โครงสร้างข้อมูลรายการอาหารในออเดอร์
export interface OrderItem {
  quantity: number;
  menu: OrderItemMenu;
}

// โครงสร้างข้อมูลลูกค้าในออเดอร์
export interface OrderCustomer {
  name: string;
  phone: string;
}

// โครงสร้างข้อมูลหลักของออเดอร์สำหรับหน้านี้
export interface TakeawayOrder {
  id: number;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  user: OrderCustomer;
  order_items: OrderItem[];
}

// โครงสร้างข้อมูลสำหรับส่งไปอัปเดตสถานะ
export interface OrderStatusUpdate {
  status: OrderStatus;
}
