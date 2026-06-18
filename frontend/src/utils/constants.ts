/**
 * Application constants
 */

export const APP_NAME = "Inventory Management System";
export const APP_VERSION = "1.0.0";

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
};

export const LOW_STOCK_THRESHOLD = 10;
