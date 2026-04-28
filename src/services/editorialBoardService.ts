import api from "@/lib/api";

export type EditorialBoardMember = {
  _id: string;
  category: string;
  editorialArea: string;
  name: string;
  designation: string;
  institution: string;
  department: string;
  expertise: string[];
  profileImage: string;
  bio: string;
  email: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EditorialBoardPayload = {
  category: string;
  editorialArea: string;
  name: string;
  designation: string;
  institution: string;
  department: string;
  expertise: string[];
  profileImage: string;
  bio: string;
  email: string;
  order: number;
  isActive: boolean;
};

type EditorialBoardListResponse = {
  success: boolean;
  data: EditorialBoardMember[];
};

type EditorialBoardSingleResponse = {
  success: boolean;
  data: EditorialBoardMember;
};

export const getAdminEditorialBoard = async (params?: {
  search?: string;
  category?: string;
  editorialArea?: string;
  status?: "all" | "active" | "inactive";
}) => {
  const query: Record<string, string> = {};

  if (params?.search) query.search = params.search;

  if (params?.category && params.category !== "all") {
    query.category = params.category;
  }

  if (params?.editorialArea && params.editorialArea !== "all") {
    query.editorialArea = params.editorialArea;
  }

  if (params?.status && params.status !== "all") {
    query.status = params.status;
  }

  const { data } = await api.get<EditorialBoardListResponse>(
    "/editorial-board/admin/all",
    {
      params: query,
    }
  );

  return data.data || [];
};

export const getAdminEditorialBoardById = async (id: string) => {
  const { data } = await api.get<EditorialBoardSingleResponse>(
    `/editorial-board/admin/${id}`
  );

  return data.data;
};

export const createAdminEditorialBoard = async (
  payload: EditorialBoardPayload
) => {
  const { data } = await api.post<EditorialBoardSingleResponse>(
    "/editorial-board/admin",
    payload
  );

  return data.data;
};

export const updateAdminEditorialBoard = async (
  id: string,
  payload: EditorialBoardPayload
) => {
  const { data } = await api.put<EditorialBoardSingleResponse>(
    `/editorial-board/admin/${id}`,
    payload
  );

  return data.data;
};

export const deleteAdminEditorialBoard = async (id: string) => {
  const { data } = await api.delete(`/editorial-board/admin/${id}`);
  return data;
};

export const getPublicEditorialBoard = async () => {
  const { data } = await api.get<EditorialBoardListResponse>(
    "/editorial-board"
  );

  return data.data || [];
};