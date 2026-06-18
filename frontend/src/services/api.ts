/**
 * Axios API instance configuration
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.detail || error.message;
    toast.error(typeof message === "string" ? message : "An error occurred");
    return Promise.reject(error);
  }
);

export default api;
