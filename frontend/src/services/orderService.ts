/**
 * Order API Service
 */

import api from "./api";
import {
  Order,
  OrderCreate,
  OrderUpdate,
  OrderListResponse,
  DashboardStats,
} from "@/types";

export const orderService = {
  /**
   * Create a new order
   */
  create: async (order: OrderCreate): Promise<Order> => {
    const { data } = await api.post("/api/orders", order);
    return data;
  },

  /**
   * Get all orders with pagination
   */
  getAll: async (page: number = 1, pageSize: number = 10): Promise<OrderListResponse> => {
    const skip = (page - 1) * pageSize;
    const { data } = await api.get("/api/orders", {
      params: { skip, limit: pageSize },
    });
    return data;
  },

  /**
   * Get a specific order by ID
   */
  getById: async (id: number): Promise<Order> => {
    const { data } = await api.get(`/api/orders/${id}`);
    return data;
  },

  /**
   * Update an order
   */
  update: async (id: number, order: OrderUpdate): Promise<Order> => {
    const { data } = await api.put(`/api/orders/${id}`, order);
    return data;
  },

  /**
   * Delete/Cancel an order
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/orders/${id}`);
  },

  /**
   * Get orders for a specific customer
   */
  getByCustomerId: async (
    customerId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<OrderListResponse> => {
    const skip = (page - 1) * pageSize;
    const { data } = await api.get(`/api/orders/customer/${customerId}`, {
      params: { skip, limit: pageSize },
    });
    return data;
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get("/api/orders/stats/dashboard");
    return data;
  },
};
