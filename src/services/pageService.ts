import api from "@/lib/api";

export type PageGroup = "about" | "for-authors" | "issues" | "custom";

export type ContentBlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "card"
  | "image"
  | "pdf"
  | "button";

export type ContentBlock = {
  _id?: string;
  type: ContentBlockType;
  title?: string;
  content?: string;
  items?: string[];
  imageUrl?: string;
  fileUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  order: number;
  isActive: boolean;
};

export type CmsPage = {
  _id: string;
  title: string;
  slug: string;
  group: PageGroup;
  subtitle?: string;
  bannerImage?: string;
  shortDescription?: string;
  contentBlocks: ContentBlock[];
  buttonLabel?: string;
  buttonUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PagePayload = {
  title: string;
  slug?: string;
  group: PageGroup;
  subtitle?: string;
  bannerImage?: string;
  shortDescription?: string;
  contentBlocks: ContentBlock[];
  buttonLabel?: string;
  buttonUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  order?: number;
  isPublished?: boolean;
};

export const getAdminPages = async (group?: string) => {
  const { data } = await api.get("/pages/admin/all", {
    params: group ? { group } : {},
  });

  return data.pages as CmsPage[];
};

export const getAdminPageById = async (id: string) => {
  const { data } = await api.get(`/pages/admin/${id}`);
  return data.page as CmsPage;
};

export const createAdminPage = async (payload: PagePayload) => {
  const { data } = await api.post("/pages/admin", payload);
  return data.page as CmsPage;
};

export const updateAdminPage = async (id: string, payload: PagePayload) => {
  const { data } = await api.put(`/pages/admin/${id}`, payload);
  return data.page as CmsPage;
};

export const deleteAdminPage = async (id: string) => {
  const { data } = await api.delete(`/pages/admin/${id}`);
  return data;
};