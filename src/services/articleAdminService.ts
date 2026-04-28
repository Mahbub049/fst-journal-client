import api from "@/lib/api";
import { Article } from "@/types/issue";

export type ArticleStatus = "published" | "inPress";

export type ArticlePayload = {
  issueId: string;
  title: string;
  slug: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  pages: string;
  pdfUrl: string;

  articleId: string;
  articleUrl: string;
  doi: string;
  publishDate: string;

  views: number;
  downloads: number;
  citations: number;

  status: ArticleStatus;
  articleType: string;
  accessType: string;

  order: number;
  isPublished: boolean;
};

type AdminArticlesResponse = {
  success: boolean;
  data: Article[];
};

type AdminArticleResponse = {
  success: boolean;
  data: Article;
};

export const getAdminArticles = async (params?: {
  search?: string;
  issueId?: string;
  status?: "all" | ArticleStatus;
  publication?: "all" | "published" | "draft";
}) => {
  const query: Record<string, string> = {};

  if (params?.search) query.search = params.search;
  if (params?.issueId && params.issueId !== "all") query.issueId = params.issueId;
  if (params?.status && params.status !== "all") query.status = params.status;
  if (params?.publication && params.publication !== "all") {
    query.publication = params.publication;
  }

  const { data } = await api.get<AdminArticlesResponse>("/articles/admin/all", {
    params: query,
  });

  return data.data || [];
};

export const getAdminArticleById = async (id: string) => {
  const { data } = await api.get<AdminArticleResponse>(`/articles/admin/${id}`);
  return data.data;
};

export const createAdminArticle = async (payload: ArticlePayload) => {
  const { data } = await api.post<AdminArticleResponse>(
    "/articles/admin",
    payload
  );

  return data.data;
};

export const updateAdminArticle = async (
  id: string,
  payload: ArticlePayload
) => {
  const { data } = await api.put<AdminArticleResponse>(
    `/articles/admin/${id}`,
    payload
  );

  return data.data;
};

export const deleteAdminArticle = async (id: string) => {
  const { data } = await api.delete(`/articles/admin/${id}`);
  return data;
};