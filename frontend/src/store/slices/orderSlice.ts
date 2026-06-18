/**
 * Order Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Order, OrderCreate, OrderUpdate, OrderListResponse, DashboardStats } from "@/types";
import { orderService } from "@/services";

interface OrderState {
  items: Order[];
  total: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  stats: DashboardStats | null;
  statsLoading: boolean;
}

const initialState: OrderState = {
  items: [],
  total: 0,
  currentPage: 1,
  pageSize: 10,
  loading: false,
  error: null,
  stats: null,
  statsLoading: false,
};

// Async Thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    return await orderService.getAll(page, pageSize);
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (order: OrderCreate) => {
    return await orderService.create(order);
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, order }: { id: number; order: OrderUpdate }) => {
    return await orderService.update(id, order);
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id: number) => {
    await orderService.delete(id);
    return id;
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "orders/fetchDashboardStats",
  async () => {
    return await orderService.getDashboardStats();
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrderListResponse>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.page_size;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch orders";
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create order";
      })
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const index = state.items.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update order";
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.items = state.items.filter((o) => o.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete order";
      })
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(
        fetchDashboardStats.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.statsLoading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.statsLoading = false;
        state.error = "Failed to fetch dashboard statistics";
      });
  },
});

export const { setCurrentPage } = orderSlice.actions;
export default orderSlice.reducer;
