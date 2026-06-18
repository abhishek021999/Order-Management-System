/**
 * Customer API Service
 */

import api from "./api";
import {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerListResponse,
} from "@/types";

export const customerService = {
  /**
   * Create a new customer
   */
  create: async (customer: CustomerCreate): Promise<Customer> => {
    const { data } = await api.post("/api/customers", customer);
    return data;
  },

  /**
   * Get all customers with pagination
   */
  getAll: async (page: number = 1, pageSize: number = 10): Promise<CustomerListResponse> => {
    const skip = (page - 1) * pageSize;
    const { data } = await api.get("/api/customers", {
      params: { skip, limit: pageSize },
    });
    return data;
  },

  /**
   * Get a specific customer by ID
   */
  getById: async (id: number): Promise<Customer> => {
    const { data } = await api.get(`/api/customers/${id}`);
    return data;
  },

  /**
   * Update a customer
   */
  update: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    const { data } = await api.put(`/api/customers/${id}`, customer);
    return data;
  },

  /**
   * Delete a customer
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/customers/${id}`);
  },
};
