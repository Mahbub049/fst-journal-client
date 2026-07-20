import api from "@/lib/api";

export type PublicMenuLocation =
  | "main"
  | "about"
  | "issues"
  | "for-authors"
  | "reviewers"
  | "editorial-board"
  | "footer";

export type PublicMenuItemType = "link" | "dropdown" | "button";

export type PublicMenuItem = {
  _id: string;
  label: string;
  location: PublicMenuLocation;
  type: PublicMenuItemType;
  url: string;
  parentId?: string | null;
  isExternal: boolean;
  openInNewTab: boolean;
  order: number;
  isActive: boolean;
};

type PublicMenuResponse = {
  success: boolean;
  menus: PublicMenuItem[];
};

export const getPublicMenus = async () => {
  const { data } = await api.get<PublicMenuResponse>("/menus");
  return data.menus || [];
};