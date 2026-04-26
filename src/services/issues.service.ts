import api from "@/lib/api";
import { Issue } from "@/types/issue";

type RecentIssuesResponse = {
  success: boolean;
  data: Issue[];
};

export const getRecentIssues = async (): Promise<Issue[]> => {
  const res = await api.get<RecentIssuesResponse>("/issues/recent");
  return res.data.data || [];
};