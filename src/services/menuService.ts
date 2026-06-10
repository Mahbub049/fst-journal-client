import api from "@/lib/api";

export type MenuLocation =
  | "main"
  | "about"
  | "issues"
  | "for-authors"
  | "editorial-board"
  | "footer";

export type MenuItemType = "link" | "dropdown" | "button";

export type ParentMenuSummary = {
  _id: string;
  label: string;
  location: MenuLocation;
  type: MenuItemType;
};

export type MenuItem = {
  _id: string;
  label: string;
  location: MenuLocation;
  type: MenuItemType;
  url: string;
  parentId?: string | ParentMenuSummary | null;
  isExternal: boolean;
  openInNewTab: boolean;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MenuPayload = {
  label: string;
  location: MenuLocation;
  type: MenuItemType;
  url?: string;
  parentId?: string | null;
  isExternal?: boolean;
  openInNewTab?: boolean;
  order?: number;
  isActive?: boolean;
};

export const getAdminMenus = async (params?: {
  location?: MenuLocation | "all";
  parentId?: string;
}) => {
  const query: Record<string, string> = {};

  if (params?.location && params.location !== "all") {
    query.location = params.location;
  }

  if (params?.parentId) {
    query.parentId = params.parentId;
  }

  const { data } = await api.get("/menus/admin/all", {
    params: query,
  });

  return data.menus as MenuItem[];
};

export const getAdminMenuById = async (id: string) => {
  const { data } = await api.get(`/menus/admin/${id}`);
  return data.menu as MenuItem;
};

export const createAdminMenu = async (payload: MenuPayload) => {
  const { data } = await api.post("/menus/admin", payload);
  return data.menu as MenuItem;
};

export const updateAdminMenu = async (id: string, payload: MenuPayload) => {
  const { data } = await api.put(`/menus/admin/${id}`, payload);
  return data.menu as MenuItem;
};

export const deleteAdminMenu = async (id: string) => {
  const { data } = await api.delete(`/menus/admin/${id}`);
  return data;
};