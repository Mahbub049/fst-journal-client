import api from "@/lib/api";
import { Article, Issue } from "@/types/issue";

export type SearchPageItem = {
  _id: string;
  title: string;
  slug: string;
  group: "about" | "for-authors" | "issues" | "custom";
  subtitle?: string;
  shortDescription?: string;
};

export type SearchResponseData = {
  articles: Article[];
  issues: Issue[];
  pages: SearchPageItem[];
};

type SearchResponse = {
  success: boolean;
  data: SearchResponseData;
};

export const searchJournal = async (
  query: string
): Promise<SearchResponseData> => {
  const { data } = await api.get<SearchResponse>("/search", {
    params: {
      q: query,
    },
  });

  return data.data;
};