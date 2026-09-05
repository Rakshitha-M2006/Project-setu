import axios, { AxiosError } from "axios";
import { ApiResponse } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token & Preferred Language
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("setu_auth_token");
    const lang = localStorage.getItem("setu_preferred_language") || "en";
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers["Accept-Language"] = lang;
      config.headers["X-Language"] = lang;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalized Error Handling & Session Expiration
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      // 401 Unauthorized: Expired or invalid token
      if (error.response.status === 401) {
        localStorage.removeItem("setu_auth_token");
        localStorage.removeItem("setu_user");

        // Only redirect if not already on public authentication routes
        const currentPath = window.location.pathname;
        if (
          currentPath !== "/login" &&
          currentPath !== "/register" &&
          currentPath !== "/"
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
