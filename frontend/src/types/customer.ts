/**
 * Customer Types and Interfaces
 */

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  full_name: string;
  email: string;
  phone_number?: string;
  address?: string;
}

export interface CustomerUpdate {
  full_name?: string;
  phone_number?: string;
  address?: string;
}

export interface CustomerListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Customer[];
}
