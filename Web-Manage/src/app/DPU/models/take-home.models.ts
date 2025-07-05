// src/app/DPU/take-home/take-home.models.ts

// โครงสร้างข้อมูลเมนูที่ได้รับจาก API
export interface Menu {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category: {
    id: number;
    name: string;
  };
}

// โครงสร้างข้อมูลรายการอาหารในตะกร้า
export interface CartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

// โครงสร้างข้อมูลสำหรับส่งไปให้ API ตอนสร้างออเดอร์
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface PaymentBase {
  amount: number;
  payment_method: string;
  slip_url: string;
  status: PaymentStatus;
}

export interface PaymentCreate extends PaymentBase {
  order_id?: number; // Optional for creation, will be set by backend
}

export interface OrderCreatePayload {
  user_id: number;
  customer_name: string;
  customer_phone: string;
  expected_pickup_time?: string; // Assuming it's a string for now, can be refined to Date if needed
  order_items: {
    menu_id: number;
    quantity: number;
  }[];
  payment?: PaymentCreate; // Optional payment details
}

// โครงสร้างข้อมูลออเดอร์ที่ได้รับกลับมา (สำหรับแสดงในประวัติ)
export interface PaymentOut {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  slip_url: string;
  status: PaymentStatus;
  created_at: string;
}

export interface OrderHistoryItem {
  id: number;
  reservation_id?: number; // Optional, only for dine-in orders
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  total_amount: number;
  created_at: string; // ISO date string
  order_items: {
    quantity: number;
    menu: {
      name: string;
    }
  }[];
  payments?: PaymentOut[]; // Add payments array
}
