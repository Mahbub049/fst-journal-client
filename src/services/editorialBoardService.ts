import api from "@/lib/api";
import { getServerApiBaseUrl } from "@/lib/apiBase";

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
  professionalProfileUrl: string;
  googleScholarUrl: string;
  researchGateUrl: string;
  linkedinUrl: string;
  orcidUrl: string;
  scopusUrl: string;
  webOfScienceUrl: string;
  personalWebsiteUrl: string;
  biographyUrl: string;
  professionalProfileLabel: string;
  biographyLabel: string;
  order?: number;
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
  professionalProfileUrl: string;
  googleScholarUrl: string;
  researchGateUrl: string;
  linkedinUrl: string;
  orcidUrl: string;
  scopusUrl: string;
  webOfScienceUrl: string;
  personalWebsiteUrl: string;
  biographyUrl: string;
  professionalProfileLabel: string;
  biographyLabel: string;
  order?: number;
  isActive: boolean;
};

export type EditorialCategorySetting = {
  _id?: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  showInSummary: boolean;
};

export type EditorialAreaSetting = {
  _id?: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
};

export type EditorialBoardPageSettings = {
  _id?: string;
  showEyebrow: boolean;
  eyebrow: string;
  pageTitle: string;
  intro: string;
  summaryEyebrow: string;
  summaryTitle: string;
  summaryDescription: string;
  chiefEditorResponsibilityTitle: string;
  chiefEditorResponsibilityDescription: string;
  showSummaryCards: boolean;
  showTotalCard: boolean;
  showEditorialOffice: boolean;
  editorialOfficeEyebrow: string;
  editorialOfficeTitle: string;
  editorialOfficeDescription: string;
  editorialOfficePublisher: string;
  editorialOfficeInstitution: string;
  editorialOfficeAddress: string;
  editorialOfficeEmail: string;
  editorialOfficePhone: string;
  showEditorialOfficeEmailButton: boolean;
  editorialOfficeEmailButtonLabel: string;
  editorialOfficeEmailSubject: string;
  categories: EditorialCategorySetting[];
  editorialAreas: EditorialAreaSetting[];
};

type EditorialBoardListResponse = {
  success: boolean;
  data: EditorialBoardMember[];
};

type EditorialBoardSingleResponse = {
  success: boolean;
  data: EditorialBoardMember;
};

type EditorialBoardConfigResponse = {
  success: boolean;
  data: EditorialBoardPageSettings;
};

export const getAdminEditorialBoard = async (params?: {
  search?: string;
  category?: string;
  editorialArea?: string;
  status?: "all" | "active" | "inactive";
}) => {
  const query: Record<string, string> = {};
  if (params?.search) query.search = params.search;
  if (params?.category && params.category !== "all") query.category = params.category;
  if (params?.editorialArea && params.editorialArea !== "all") {
    query.editorialArea = params.editorialArea;
  }
  if (params?.status && params.status !== "all") query.status = params.status;

  const { data } = await api.get<EditorialBoardListResponse>(
    "/editorial-board/admin/all",
    { params: query }
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

export const reorderAdminEditorialBoard = async (orderedIds: string[]) => {
  const { data } = await api.put("/editorial-board/admin/reorder", {
    orderedIds,
  });
  return data;
};

export const getAdminEditorialBoardConfig = async () => {
  const { data } = await api.get<EditorialBoardConfigResponse>(
    "/editorial-board/admin/config"
  );
  return data.data;
};

export const updateAdminEditorialBoardConfig = async (
  payload: EditorialBoardPageSettings
) => {
  const { data } = await api.put<EditorialBoardConfigResponse>(
    "/editorial-board/admin/config",
    payload
  );
  return data.data;
};

const fetchPublicEditorialApi = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Editorial board API request failed with ${response.status}.`);
  }

  return (await response.json()) as T;
};

export const getPublicEditorialBoard = async () => {
  const data = await fetchPublicEditorialApi<EditorialBoardListResponse>(
    "/editorial-board"
  );
  return data.data || [];
};

export const getPublicEditorialBoardById = async (id: string) => {
  const data = await fetchPublicEditorialApi<EditorialBoardSingleResponse>(
    `/editorial-board/${encodeURIComponent(id)}`
  );
  return data.data;
};

export const getPublicEditorialBoardConfig = async () => {
  const data = await fetchPublicEditorialApi<EditorialBoardConfigResponse>(
    "/editorial-board/config"
  );
  return data.data;
};
