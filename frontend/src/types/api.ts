/**
 * API Response Types
 */

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface ApiError {
  detail: string | string[];
  status_code?: number;
}
