/**
 * Order Types and Interfaces
 */

export interface CustomerBrief {
  id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string | null;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  customer: CustomerBrief | null;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  customer_id: number;
  items: OrderItemCreate[];
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderUpdate {
  status?: OrderStatus;
}

export interface OrderListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Order[];
}

export interface DashboardStats {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_products: LowStockProduct[];
  total_revenue: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  quantity: number;
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}
