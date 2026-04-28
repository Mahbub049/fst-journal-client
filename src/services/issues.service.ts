import api from "@/lib/api";
import {
  Article,
  ArticleDetailsResponse,
  Issue,
  IssueDetailsResponse,
} from "@/types/issue";

type RecentIssuesResponse = {
  success: boolean;
  data: Issue[];
};

type SingleIssueResponse = {
  success: boolean;
  data: IssueDetailsResponse;
};

type SingleArticleResponse = {
  success: boolean;
  data: ArticleDetailsResponse;
};

type HomeArticlesResponse = {
  success: boolean;
  data: Article[];
};

type AdminIssuesResponse = {
  success: boolean;
  data: Issue[];
};

type AdminIssueResponse = {
  success: boolean;
  data: Issue;
};

export type IssuePayload = {
  title: string;
  slug: string;
  category: string;
  issn: string;
  volume: string;
  issueNumber: string;
  publishDateLabel: string;
  coverImage: string;
  pdfUrl?: string;
  isRecent: boolean;
  isPublished: boolean;
  order: number;
};

/* Public issue APIs */

export const getRecentIssues = async (): Promise<Issue[]> => {
  const res = await api.get<RecentIssuesResponse>("/issues/recent");
  return res.data.data || [];
};

export const getIssueBySlug = async (
  slug: string
): Promise<IssueDetailsResponse> => {
  const res = await api.get<SingleIssueResponse>(`/issues/${slug}`);
  return res.data.data;
};

export const getArticleBySlug = async (
  issueSlug: string,
  articleSlug: string
): Promise<ArticleDetailsResponse> => {
  const res = await api.get<SingleArticleResponse>(
    `/issues/${issueSlug}/articles/${articleSlug}`
  );

  return res.data.data;
};

export const getHomeArticles = async (tab: string): Promise<Article[]> => {
  const res = await api.get<HomeArticlesResponse>(
    `/issues/articles/home?tab=${tab}`
  );

  return res.data.data || [];
};

/* Admin issue APIs */

export const getAdminIssues = async (params?: {
  search?: string;
  status?: "all" | "published" | "draft" | "recent";
}): Promise<Issue[]> => {
  const query: Record<string, string> = {};

  if (params?.search) {
    query.search = params.search;
  }

  if (params?.status && params.status !== "all") {
    query.status = params.status;
  }

  const res = await api.get<AdminIssuesResponse>("/issues/admin/all", {
    params: query,
  });

  return res.data.data || [];
};

export const getAdminIssueById = async (id: string): Promise<Issue> => {
  const res = await api.get<AdminIssueResponse>(`/issues/admin/${id}`);
  return res.data.data;
};

export const createAdminIssue = async (
  payload: IssuePayload
): Promise<Issue> => {
  const res = await api.post<AdminIssueResponse>("/issues/admin", payload);
  return res.data.data;
};

export const updateAdminIssue = async (
  id: string,
  payload: IssuePayload
): Promise<Issue> => {
  const res = await api.put<AdminIssueResponse>(`/issues/admin/${id}`, payload);
  return res.data.data;
};

export const deleteAdminIssue = async (id: string) => {
  const res = await api.delete(`/issues/admin/${id}`);
  return res.data;
};