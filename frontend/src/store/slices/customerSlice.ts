/**
 * Customer Redux Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Customer, CustomerCreate, CustomerUpdate, CustomerListResponse } from "@/types";
import { customerService } from "@/services";

interface CustomerState {
  items: Customer[];
  total: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  items: [],
  total: 0,
  currentPage: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    return await customerService.getAll(page, pageSize);
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customer: CustomerCreate) => {
    return await customerService.create(customer);
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customer }: { id: number; customer: CustomerUpdate }) => {
    return await customerService.update(id, customer);
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id: number) => {
    await customerService.delete(id);
    return id;
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCustomers.fulfilled,
        (state, action: PayloadAction<CustomerListResponse>) => {
          state.loading = false;
          state.items = action.payload.items;
          state.total = action.payload.total;
          state.currentPage = action.payload.page;
          state.pageSize = action.payload.page_size;
        }
      )
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch customers";
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create customer";
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false;
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update customer";
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.items = state.items.filter((c) => c.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete customer";
      });
  },
});

export const { setCurrentPage } = customerSlice.actions;
export default customerSlice.reducer;
