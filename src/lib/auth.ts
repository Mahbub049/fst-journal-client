export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
};

const TOKEN_KEY = "bup_fst_journal_admin_token";
const ADMIN_KEY = "bup_fst_journal_admin_user";

export const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAdminToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};

export const setAdminUser = (admin: AdminUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const getAdminUser = (): AdminUser | null => {
  if (typeof window === "undefined") return null;

  const admin = localStorage.getItem(ADMIN_KEY);

  if (!admin) return null;

  try {
    return JSON.parse(admin);
  } catch {
    return null;
  }
};

export const logoutAdmin = () => {
  removeAdminToken();
};