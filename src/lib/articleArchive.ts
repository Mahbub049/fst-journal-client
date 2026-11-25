import type { Article, PopulatedIssue } from "@/types/issue";

export const articleTabs = [
  { value: "all", label: "All articles" },
  { value: "latest", label: "Latest published" },
  { value: "inPress", label: "Articles in press" },
  { value: "topCited", label: "Top cited" },
  { value: "mostDownloaded", label: "Most downloaded" },
  { value: "mostPopular", label: "Most popular" },
] as const;
export type ArchiveTab = (typeof articleTabs)[number]["value"];
export type ArchiveQuery = { tab: ArchiveTab; q: string; issue: string; page: number; pageSize: number };
export type ArchiveArticle = Pick<Article, "_id" | "title" | "slug" | "authors" | "pages" | "publishDate" | "articleType" | "accessType" | "status" | "views" | "downloads" | "citations" | "doi"> & { issueId: PopulatedIssue };
export type ArchiveResult = { articles: ArchiveArticle[]; issues: PopulatedIssue[]; total: number; totalPages: number; page: number; pageSize: number };
export const defaultArchiveQuery: ArchiveQuery = { tab: "all", q: "", issue: "", page: 1, pageSize: 10 };
const integer = (raw: unknown, fallback: number, max: number) => {
  const s = String(raw ?? "").trim();
  const n = Number(s);
  return /^\d+$/.test(s) && Number.isSafeInteger(n) && n > 0 ? Math.min(n, max) : fallback;
};
export function parseArchiveQuery(params: URLSearchParams): ArchiveQuery {
  const tab = params.get("tab");
  return {
    tab: articleTabs.find(item => item.value === tab)?.value || "all",
    q: (params.get("q") || "").trim().slice(0, 120),
    issue: (params.get("issue") || "").trim().slice(0, 200),
    page: integer(params.get("page"), 1, 1000000),
    pageSize: integer(params.get("pageSize"), 10, 100),
  };
}
export function archiveParams(query: ArchiveQuery): string {
  const params = new URLSearchParams();
  if (query.tab !== "all") params.set("tab", query.tab);
  if (query.q) params.set("q", query.q);
  if (query.issue) params.set("issue", query.issue);
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.pageSize !== 10) params.set("pageSize", String(query.pageSize));
  return params.toString();
}
export function archiveHref(query: ArchiveQuery) {
  const params = archiveParams(query);
  return `/articles${params ? `?${params}` : ""}`;
}
export function archiveApiPath(query: ArchiveQuery) {
  const params = archiveParams(query);
  return `/articles/public/archive${params ? `?${params}` : ""}`;
}
export function paginationItems(page: number, total: number): Array<number | "gap-left" | "gap-right"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "gap-right", total];
  if (page >= total - 3) return [1, "gap-left", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "gap-left", page - 1, page, page + 1, "gap-right", total];
}
