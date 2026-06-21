import axios from "axios";
import { getAdminToken, removeAdminToken } from "./auth";
import { getBrowserApiBaseUrl } from "./apiBase";

const api = axios.create({
  baseURL: getBrowserApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeAdminToken();

      if (typeof window !== "undefined") {
        const isAdminRoute = window.location.pathname.startsWith("/admin");

        if (isAdminRoute && window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;