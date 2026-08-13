import axios from "axios";
import {
  clearAdminUser,
  clearLegacyAdminStorage,
} from "./auth";
import { getBrowserApiBaseUrl } from "./apiBase";

const api = axios.create({
  baseURL: getBrowserApiBaseUrl(),
  withCredentials: true,
});

clearLegacyAdminStorage();

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAdminUser();
      clearLegacyAdminStorage();

      if (typeof window !== "undefined") {
        const isAdminRoute =
          window.location.pathname.startsWith(
            "/admin"
          );

        const isLoginPage =
          window.location.pathname ===
          "/admin/login";

        if (isAdminRoute && !isLoginPage) {
          window.location.replace(
            "/admin/login"
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;