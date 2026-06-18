/**
 * Redux Store Configuration
 */

import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import customerReducer from "./slices/customerSlice";
import orderReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    customers: customerReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
