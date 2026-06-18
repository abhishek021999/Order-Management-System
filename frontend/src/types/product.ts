/**
 * Product Types and Interfaces
 */

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  price: number;
  quantity?: number;
  description?: string;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
}

export interface ProductListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Product[];
}
