"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  ArticlePayload,
  ArticleStatus,
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticles,
  reorderAdminArticles,
  syncAdminAllArticleCitations,
  syncAdminArticleCitation,
  updateAdminArticle,
  uploadAdminArticlePdf,
} from "@/services/articleAdminService";
import { getAdminIssues } from "@/services/issues.service";
import { Article, Issue, PopulatedIssue } from "@/types/issue";
import { getBrowserFileOrigin } from "@/lib/apiBase";

type PublicationFilter = "all" | "published" | "draft";

type ArticleFormState = {
  issueId: string;
  title: string;
  slug: string;
  authors: string;
  abstract: string;
  keywords: string;
  pages: string;
  pdfUrl: string;

  articleId: string;
  articleUrl: string;
  doi: string;
  publishDate: string;

  views: string;
  downloads: string;
  citations: string;
  citationSyncEnabled: boolean;

  status: ArticleStatus;
  articleType: string;
  accessType: string;

  order: string;
  isPublished: boolean;
};

const emptyForm: ArticleFormState = {
  issueId: "",
  title: "",
  slug: "",
  authors: "",
  abstract: "",
  keywords: "",
  pages: "",
  pdfUrl: "",

  articleId: "",
  articleUrl: "",
  doi: "",
  publishDate: "",

  views: "0",
  downloads: "0",
  citations: "0",
  citationSyncEnabled: true,

  status: "published",
  articleType: "Research Article",
  accessType: "Hybrid",

  order: "0",
  isPublished: true,
};

const makeSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const API_ORIGIN = getBrowserFileOrigin();

const getPdfPreviewUrl = (pdfUrl: string) => {
  const value = pdfUrl.trim();

  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

const splitCommaValues = (value: string) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const reorderList = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
};

const getIssueTitle = (issueId: string | PopulatedIssue) => {
  if (typeof issueId === "string") return "Issue not populated";

  return `${issueId.title} — Vol. ${issueId.volume}, Issue ${issueId.issueNumber}`;
};

const getIssueIdValue = (issueId: string | PopulatedIssue) => {
  if (typeof issueId === "string") return issueId;
  return issueId._id;
};

const getIssueObject = (
  issueId: string | PopulatedIssue,
  issues: Issue[]
): PopulatedIssue | Issue | null => {
  if (!issueId) return null;
  if (typeof issueId !== "string") return issueId;

  return issues.find((issue) => issue._id === issueId) || null;
};
const formatSyncDate = (value?: string | null) => {
  if (!value) return "Never synced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Never synced";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCitationBadgeClass = (status?: Article["citationSyncStatus"]) => {
  if (status === "success") return "bg-emerald-50 text-emerald-700";
  if (status === "failed") return "bg-rose-50 text-rose-700";
  if (status === "skipped") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
};


export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  const [form, setForm] = useState<ArticleFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [issueFilter, setIssueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ArticleStatus>("all");
  const [publicationFilter, setPublicationFilter] =
    useState<PublicationFilter>("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [syncingAllCitations, setSyncingAllCitations] = useState(false);
  const [syncingArticleId, setSyncingArticleId] = useState<string | null>(null);
  const [draggedArticleId, setDraggedArticleId] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  const fetchIssues = async () => {
    const data = await getAdminIssues({
      status: "all",
    });

    setIssues(data);
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);

      const data = await getAdminArticles({
        search,
        issueId: issueFilter,
        status: statusFilter,
        publication: publicationFilter,
      });

      setArticles(data);
    } catch {
      setMessage("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [issueFilter, statusFilter, publicationFilter]);

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const orderA = Number(a.order || 0);
      const orderB = Number(b.order || 0);

      if (orderA !== orderB) return orderA - orderB;

      return String(a._id).localeCompare(String(b._id));
    });
  }, [articles]);

  const canReorderArticles =
    issueFilter !== "all" &&
    !search.trim() &&
    statusFilter === "all" &&
    publicationFilter === "all";

  const selectedIssue = issues.find((issue) => issue._id === issueFilter);
  const selectedIssueLabel = selectedIssue
    ? `${selectedIssue.title} — Vol. ${selectedIssue.volume}, Issue ${selectedIssue.issueNumber}`
    : "Select one issue to arrange paper order";

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: makeSlug(value),
    }));
  };

  const handleEdit = (article: Article) => {
    setEditingId(article._id);

    setForm({
      issueId: getIssueIdValue(article.issueId),
      title: article.title || "",
      slug: makeSlug(article.title || article.slug || ""),
      authors: article.authors?.join(", ") || "",
      abstract: article.abstract || "",
      keywords: article.keywords?.join(", ") || "",
      pages: article.pages || "",
      pdfUrl: article.pdfUrl || "",

      articleId: article.articleId || "",
      articleUrl: article.articleUrl || "",
      doi: article.doi || "",
      publishDate: article.publishDate || "",

      views: String(article.views || 0),
      downloads: String(article.downloads || 0),
      citations: String(article.citations || 0),
      citationSyncEnabled: article.citationSyncEnabled ?? true,

      status: article.status || "published",
      articleType: article.articleType || "Research Article",
      accessType: article.accessType || "Open Access",

      order: String(article.order || 0),
      isPublished: article.isPublished ?? true,
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = (): ArticlePayload => {
    return {
      issueId: form.issueId,
      title: form.title.trim(),
      slug: makeSlug(form.title),
      authors: splitCommaValues(form.authors),
      abstract: form.abstract.trim(),
      keywords: splitCommaValues(form.keywords),
      pages: form.pages.trim(),
      pdfUrl: form.pdfUrl.trim(),

      articleId: form.articleId.trim(),
      articleUrl: form.articleUrl.trim(),
      doi: form.doi.trim(),
      publishDate: form.publishDate.trim(),

      views: Number(form.views || 0),
      downloads: Number(form.downloads || 0),
      citations: Number(form.citations || 0),
      citationSyncEnabled: form.citationSyncEnabled,
      citationSource: form.citationSyncEnabled ? undefined : "manual",

      status: form.status,
      articleType: form.articleType.trim(),
      accessType: form.accessType.trim(),

      order: Number(form.order || 0),
      isPublished: form.isPublished,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload = buildPayload();

      if (editingId) {
        await updateAdminArticle(editingId, payload);
        setMessage("Article updated successfully.");
      } else {
        await createAdminArticle(payload);
        setMessage(
          "Article created successfully. It has been placed at the top of its issue."
        );
      }

      resetForm();
      await fetchArticles();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article: Article) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${article.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteAdminArticle(article._id);
      setMessage("Article deleted successfully.");

      if (editingId === article._id) {
        resetForm();
      }

      await fetchArticles();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to delete article.");
    }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!form.issueId) {
      setMessage("Please select the issue first. The PDF will be stored inside that issue folder.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingPdf(true);
      setMessage("");

      const uploaded = await uploadAdminArticlePdf({
        file,
        issueId: form.issueId,
        title: form.title ? `${form.title} PDF` : file.name,
        slug: form.slug || makeSlug(form.title),
      });

      setForm((prev) => ({
        ...prev,
        pdfUrl: uploaded.fileUrl,
      }));

      setMessage(
        uploaded.folder
          ? `PDF uploaded successfully to ${uploaded.folder}. Save the article to publish this PDF link.`
          : "PDF uploaded to the local server. Save the article to publish this PDF link."
      );
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to upload PDF.");
    } finally {
      setUploadingPdf(false);
      event.target.value = "";
    }
  };

  const handleToggleVisibility = async (article: Article) => {
    try {
      const payload: ArticlePayload = {
        issueId: getIssueIdValue(article.issueId),
        title: article.title || "",
        slug: makeSlug(article.title || article.slug),
        authors: article.authors || [],
        abstract: article.abstract || "",
        keywords: article.keywords || [],
        pages: article.pages || "",
        pdfUrl: article.pdfUrl || "",

        articleId: article.articleId || "",
        articleUrl: article.articleUrl || "",
        doi: article.doi || "",
        publishDate: article.publishDate || "",

        views: Number(article.views || 0),
        downloads: Number(article.downloads || 0),
        citations: Number(article.citations || 0),
        citationSyncEnabled: article.citationSyncEnabled ?? true,
        citationSource: article.citationSource || "manual",
        citationSourceId: article.citationSourceId || "",
        citationSyncStatus: article.citationSyncStatus || "idle",
        citationSyncMessage: article.citationSyncMessage || "",

        status: article.status || "published",
        articleType: article.articleType || "Research Article",
        accessType: article.accessType || "Open Access",

        order: Number(article.order || 0),
        isPublished: !(article.isPublished ?? true),
      };

      await updateAdminArticle(article._id, payload);
      setMessage(
        article.isPublished
          ? "Article hidden from the public website."
          : "Article made visible on the public website."
      );

      await fetchArticles();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to update article visibility."
      );
    }
  };

  const saveArticleOrder = async (orderedArticles: Article[]) => {
    if (!canReorderArticles) {
      setMessage(
        "Select one issue and clear all search/status filters before changing article order."
      );
      return;
    }

    try {
      setReordering(true);

      const orderedWithIndex = orderedArticles.map((article, index) => ({
        ...article,
        order: index,
      }));

      setArticles(orderedWithIndex);
      await reorderAdminArticles({
        issueId: issueFilter,
        articleIds: orderedWithIndex.map((article) => article._id),
      });
      await fetchArticles();
      setMessage(
        "Article order updated. The selected issue page will follow this order."
      );
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to update article order.");
      await fetchArticles();
    } finally {
      setReordering(false);
      setDraggedArticleId(null);
    }
  };

  const handleArticleDrop = async (targetArticleId: string) => {
    if (
      !draggedArticleId ||
      draggedArticleId === targetArticleId ||
      !canReorderArticles
    ) {
      setDraggedArticleId(null);
      return;
    }

    const fromIndex = sortedArticles.findIndex(
      (article) => article._id === draggedArticleId
    );
    const toIndex = sortedArticles.findIndex(
      (article) => article._id === targetArticleId
    );

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedArticleId(null);
      return;
    }

    await saveArticleOrder(reorderList(sortedArticles, fromIndex, toIndex));
  };

  const moveArticle = async (fromIndex: number, toIndex: number) => {
    if (
      toIndex < 0 ||
      toIndex >= sortedArticles.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    await saveArticleOrder(reorderList(sortedArticles, fromIndex, toIndex));
  };

  const getArticlePublicHref = (article: Article) => {
    const issue = getIssueObject(article.issueId, issues);

    if (!issue?.slug || !article.slug) return "";

    return `/issues/${issue.slug}/articles/${article.slug}`;
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchArticles();
  };

  const handleSyncAllCitations = async () => {
    try {
      setSyncingAllCitations(true);
      setMessage("Syncing citations from OpenAlex/Crossref. Please wait...");

      const response = await syncAdminAllArticleCitations();

      if (Array.isArray(response.data)) {
        setArticles(response.data);
      } else {
        await fetchArticles();
      }

      const summary = response.sync;
      setMessage(
        summary
          ? `Citation sync completed. Success: ${summary.success || 0}, Failed: ${summary.failed || 0}, Skipped: ${summary.skipped || 0}, Total increase: ${summary.totalIncrease || 0}.`
          : response.message || "Citation sync completed."
      );
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to sync citations.");
    } finally {
      setSyncingAllCitations(false);
    }
  };

  const handleSyncOneCitation = async (article: Article) => {
    if (!article.doi?.trim()) {
      setMessage("Add a DOI before syncing citations for this article.");
      return;
    }

    try {
      setSyncingArticleId(article._id);
      setMessage(`Syncing citation count for "${article.title}"...`);

      const response = await syncAdminArticleCitation(article._id);

      if (response.data && !Array.isArray(response.data)) {
        setArticles((prev) =>
          prev.map((item) =>
            item._id === article._id ? (response.data as Article) : item
          )
        );

        if (editingId === article._id) {
          setForm((prev) => ({
            ...prev,
            citations: String((response.data as Article).citations || 0),
            citationSyncEnabled:
              (response.data as Article).citationSyncEnabled ?? true,
          }));
        }
      } else {
        await fetchArticles();
      }

      const sync = response.sync?.results?.[0];
      setMessage(
        sync
          ? `${sync.title}: citations ${sync.previousCitations} → ${sync.citations}.`
          : response.message || "Citation sync completed."
      );
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to sync this article citation."
      );
    } finally {
      setSyncingArticleId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Article Management
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Articles / Papers Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Create and manage journal articles under specific issues. Slugs
                are generated from article titles, new articles appear first in
                their issue, and final public order can be arranged by dragging.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Local PDF upload enabled
              </div>

              <button
                type="button"
                onClick={handleSyncAllCitations}
                disabled={syncingAllCitations}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#005A78]/20 bg-[#005A78] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#064963] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {syncingAllCitations ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {syncingAllCitations ? "Syncing Citations..." : "Sync All Citations"}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {editingId ? "Edit Article" : "Create Article"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select issue, add metadata, upload or paste PDF link, and set
                  publication status. Slug and position are automatic.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Issue
                </label>
                <select
                  value={form.issueId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      issueId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                >
                  <option value="">Select issue</option>
                  {issues.map((issue) => (
                    <option key={issue._id} value={issue._id}>
                      {issue.title} — Vol. {issue.volume}, Issue{" "}
                      {issue.issueNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Article Title
                </label>
                <input
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="A Text Feature-Based CNN Approach to Detect Fake News"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Auto-generated Slug
                </label>
                <input
                  value={form.slug}
                  readOnly
                  placeholder="Slug will be generated from article title"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                />
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Example: a-text-feature-based-cnn-approach-to-detect-fake-news
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Authors
                </label>
                <input
                  value={form.authors}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      authors: event.target.value,
                    }))
                  }
                  placeholder="Author One, Author Two, Author Three"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Abstract
                </label>
                <textarea
                  value={form.abstract}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      abstract: event.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Keywords
                </label>
                <input
                  value={form.keywords}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      keywords: event.target.value,
                    }))
                  }
                  placeholder="Machine Learning, Swarm Optimization, Data Mining"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Pages
                  </label>
                  <input
                    value={form.pages}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        pages: event.target.value,
                      }))
                    }
                    placeholder="1-24"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Publish Date
                  </label>
                  <input
                    value={form.publishDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        publishDate: event.target.value,
                      }))
                    }
                    placeholder="July 1, 2025"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#005A78]/10 bg-[#005A78]/[0.03] p-4">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  PDF Link
                </label>
                <input
                  value={form.pdfUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      pdfUrl: event.target.value,
                    }))
                  }
                  placeholder="Upload a local PDF or paste an external PDF URL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Select an issue first, then upload. The PDF will be stored in:
                  <span className="font-semibold text-slate-700">
                    {" "}
                    public/pdfs/articles/volume-XX/issue-XX
                  </span>
                  . External PDF links can still be pasted manually.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    {uploadingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadingPdf ? "Uploading..." : "Upload PDF Locally"}
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                      className="hidden"
                    />
                  </label>

                  {form.pdfUrl ? (
                    <a
                      href={getPdfPreviewUrl(form.pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open PDF
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Article URL field intentionally hidden from the admin UI.
                  The articleUrl value is still kept in state and payload for old data/backward compatibility. */}

              <div className="rounded-2xl border border-[#005A78]/10 bg-[#005A78]/[0.03] p-4">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  DOI
                </label>
                <input
                  value={form.doi}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      doi: event.target.value,
                    }))
                  }
                  placeholder="https://doi.org/... or 10.xxxx/jfst.xxxx"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />

                <label className="mt-3 flex items-start gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.citationSyncEnabled}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        citationSyncEnabled: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    Auto-sync citation count from DOI
                    <span className="block text-xs font-medium leading-5 text-slate-500">
                      The server checks OpenAlex first and Crossref as fallback. Turn this off only when you want to keep a manual citation number.
                    </span>
                  </span>
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Article ID
                </label>
                <input
                  value={form.articleId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      articleId: event.target.value,
                    }))
                  }
                  placeholder="3142"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Views
                  </label>
                  <input
                    type="number"
                    value={form.views}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        views: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Downloads
                  </label>
                  <input
                    type="number"
                    value={form.downloads}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        downloads: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Citations
                  </label>
                  <input
                    type="number"
                    value={form.citations}
                    disabled={form.citationSyncEnabled}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        citations: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {form.citationSyncEnabled
                      ? "Auto mode: value updates from DOI sync."
                      : "Manual mode: edit this number yourself."}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        status: event.target.value as ArticleStatus,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  >
                    <option value="published">Published</option>
                    <option value="inPress">In Press</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Article Type
                  </label>
                  <input
                    value={form.articleType}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        articleType: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Access Type
                </label>
                <input
                  value={form.accessType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      accessType: event.target.value,
                    }))
                  }
                  placeholder="Hybrid"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isPublished: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  Published / visible through public article API
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#004765] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Article"
                      : "Create Article"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Article List
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, edit, publish, delete, or arrange papers by
                  issue.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchArticles}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mb-5 grid gap-3 xl:grid-cols-[1fr_220px_150px_150px_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, author, DOI, article ID"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <select
                value={issueFilter}
                onChange={(event) => setIssueFilter(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                <option value="all">All Issues</option>
                {issues.map((issue) => (
                  <option key={issue._id} value={issue._id}>
                    Vol. {issue.volume}, Issue {issue.issueNumber}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | ArticleStatus)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="inPress">In Press</option>
              </select>

              <select
                value={publicationFilter}
                onChange={(event) =>
                  setPublicationFilter(event.target.value as PublicationFilter)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                <option value="all">All Visibility</option>
                <option value="published">Visible</option>
                <option value="draft">Hidden</option>
              </select>

              <button
                type="submit"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Search
              </button>
            </form>

            <div
              className={[
                "mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold",
                canReorderArticles
                  ? "border-[#005A78]/20 bg-[#005A78]/5 text-[#005A78]"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              ].join(" ")}
            >
              {canReorderArticles
                ? `Ordering mode is active for ${selectedIssueLabel}. Drag papers or use arrows. The top paper will show first on the issue page.`
                : "Ordering is enabled only after selecting one issue with search/status/visibility filters cleared."}
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#005A78]" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Loading articles...
                </p>
              </div>
            ) : sortedArticles.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-800">
                  No articles found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create the first article using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedArticles.map((article, index) => (
                  <div
                    key={article._id}
                    draggable={canReorderArticles && !reordering}
                    onDragStart={() => setDraggedArticleId(article._id)}
                    onDragOver={(event) => {
                      if (canReorderArticles) event.preventDefault();
                    }}
                    onDrop={() => handleArticleDrop(article._id)}
                    onDragEnd={() => setDraggedArticleId(null)}
                    className={[
                      "rounded-2xl border bg-slate-50 p-4 transition",
                      draggedArticleId === article._id
                        ? "border-[#005A78] opacity-70 ring-2 ring-[#005A78]/15"
                        : "border-slate-200 hover:border-[#005A78]/30",
                      canReorderArticles ? "cursor-move" : "cursor-default",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex shrink-0 flex-col items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005A78] text-xs font-black text-white shadow-sm">
                            {index + 1}
                          </div>

                          <div
                            className={[
                              "flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-400",
                              canReorderArticles
                                ? "border-slate-200"
                                : "border-slate-100 opacity-50",
                            ].join(" ")}
                            title="Drag to reorder"
                          >
                            {reordering && draggedArticleId === article._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <GripVertical className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-950">
                            {article.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {getIssueTitle(article.issueId)}
                          </p>

                          <p className="mt-1 break-all text-xs font-semibold text-slate-400">
                            /articles/{article.slug}
                          </p>

                          {article.authors?.length > 0 && (
                            <p className="mt-2 text-sm text-slate-700">
                              {article.authors.join(", ")}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                              Pages: {article.pages || "-"}
                            </span>
                            <span className="rounded-full bg-[#005A78]/10 px-3 py-1 text-[#005A78]">
                              {canReorderArticles
                                ? `Issue position ${index + 1}`
                                : `Saved order ${article.order ?? 0}`}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                              {article.articleType || "Research Article"}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                              {article.accessType || "Hybrid"}
                            </span>
                            <span
                              className={[
                                "rounded-full px-3 py-1",
                                article.status === "inPress"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-blue-50 text-blue-700",
                              ].join(" ")}
                            >
                              {article.status === "inPress"
                                ? "In Press"
                                : "Published"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(article)}
                              className={[
                                "inline-flex items-center gap-1 rounded-full px-3 py-1 transition hover:brightness-95",
                                article.isPublished
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700",
                              ].join(" ")}
                              title="Click to toggle public visibility"
                            >
                              {article.isPublished ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                              {article.isPublished ? "Visible" : "Hidden"}
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                            <span>Views: {article.views || 0}</span>
                            <span>Downloads: {article.downloads || 0}</span>
                            <span>Citations: {article.citations || 0}</span>
                            <span>Source: {article.citationSource || "manual"}</span>
                            <span>Last synced: {formatSyncDate(article.citationLastSyncedAt)}</span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                            <span
                              className={[
                                "rounded-full px-3 py-1",
                                getCitationBadgeClass(article.citationSyncStatus),
                              ].join(" ")}
                            >
                              Citation Sync: {article.citationSyncStatus || "idle"}
                            </span>
                            <span
                              className={[
                                "rounded-full px-3 py-1",
                                article.citationSyncEnabled === false
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700",
                              ].join(" ")}
                            >
                              {article.citationSyncEnabled === false
                                ? "Manual citation mode"
                                : "Auto citation mode"}
                            </span>
                          </div>

                          {article.citationSyncMessage ? (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {article.citationSyncMessage}
                            </p>
                          ) : null}

                          {article.doi && (
                            <div className="mt-3 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-500">
                              DOI:{" "}
                              <span className="break-all text-slate-700">
                                {article.doi}
                              </span>
                            </div>
                          )}

                          {article.pdfUrl && (
                            <div className="mt-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-500">
                              PDF:{" "}
                              <span className="break-all text-slate-700">
                                {article.pdfUrl}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={!canReorderArticles || reordering || index === 0}
                          onClick={() => moveArticle(index, index - 1)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={
                            !canReorderArticles ||
                            reordering ||
                            index === sortedArticles.length - 1
                          }
                          onClick={() => moveArticle(index, index + 1)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSyncOneCitation(article)}
                          disabled={!article.doi || syncingArticleId === article._id}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#005A78]/20 bg-[#005A78]/10 px-4 py-2.5 text-sm font-bold text-[#005A78] transition hover:bg-[#005A78]/15 disabled:cursor-not-allowed disabled:opacity-45"
                          title={article.doi ? "Sync citation from DOI" : "Add DOI first"}
                        >
                          {syncingArticleId === article._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Sync Citation
                        </button>

                        {article.isPublished && getArticlePublicHref(article) ? (
                          <Link
                            href={getArticlePublicHref(article)}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleEdit(article)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(article)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
