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
export interface OrderCreatePayload {
  user_id: number;
  order_items: {
    menu_id: number;
    quantity: number;
  }[];
}

// โครงสร้างข้อมูลออเดอร์ที่ได้รับกลับมา (สำหรับแสดงในประวัติ)
export interface OrderHistoryItem {
    id: number;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
    total_amount: number;
    created_at: string; // ISO date string
    order_items: {
        quantity: number;
        menu: {
            name: string;
        }
    }[];
}
