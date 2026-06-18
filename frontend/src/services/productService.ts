/**
 * Product API Service
 */

import api from "./api";
import {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductListResponse,
} from "@/types";

export const productService = {
  /**
   * Create a new product
   */
  create: async (product: ProductCreate): Promise<Product> => {
    const { data } = await api.post("/api/products", product);
    return data;
  },

  /**
   * Get all products with pagination
   */
  getAll: async (page: number = 1, pageSize: number = 10): Promise<ProductListResponse> => {
    const skip = (page - 1) * pageSize;
    const { data } = await api.get("/api/products", {
      params: { skip, limit: pageSize },
    });
    return data;
  },

  /**
   * Get a specific product by ID
   */
  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/api/products/${id}`);
    return data;
  },

  /**
   * Update a product
   */
  update: async (id: number, product: ProductUpdate): Promise<Product> => {
    const { data } = await api.put(`/api/products/${id}`, product);
    return data;
  },

  /**
   * Delete a product
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};
