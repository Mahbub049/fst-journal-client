import api from "@/lib/api";

export type AdminRole = "super_admin" | "admin";

export type AdminAccount = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAdminAccountPayload = {
  name: string;
  email: string;
  temporaryPassword: string;
  role: AdminRole;
  isActive: boolean;
};

export type UpdateAdminAccountPayload = {
  name?: string;
  email?: string;
  role?: AdminRole;
  isActive?: boolean;
  temporaryPassword?: string;
};

export const getAdminAccounts = async () => {
  const { data } = await api.get("/auth/admins");
  return data.admins as AdminAccount[];
};

export const createAdminAccount = async (
  payload: CreateAdminAccountPayload
) => {
  const { data } = await api.post("/auth/admins", payload);
  return data.admin as AdminAccount;
};

export const updateAdminAccount = async (
  id: string,
  payload: UpdateAdminAccountPayload
) => {
  const { data } = await api.patch(`/auth/admins/${id}`, payload);
  return data.admin as AdminAccount;
};

export const deleteAdminAccount = async (id: string) => {
  const { data } = await api.delete(`/auth/admins/${id}`);
  return data;
};

export const updateMyAdminProfile = async (payload: {
  name: string;
  email: string;
}) => {
  const { data } = await api.patch("/auth/me", payload);
  return data.admin as AdminAccount;
};

export const changeMyAdminPassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await api.patch("/auth/me/password", payload);
  return data.admin as AdminAccount;
};
