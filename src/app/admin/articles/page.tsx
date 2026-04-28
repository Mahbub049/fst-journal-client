"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  ArticlePayload,
  ArticleStatus,
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticles,
  updateAdminArticle,
} from "@/services/articleAdminService";
import { getAdminIssues } from "@/services/issues.service";
import { Article, Issue, PopulatedIssue } from "@/types/issue";

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

  status: "published",
  articleType: "Research Article",
  accessType: "Open Access",

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

const splitCommaValues = (value: string) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getIssueTitle = (issueId: string | PopulatedIssue) => {
  if (typeof issueId === "string") return "Issue not populated";

  return `${issueId.title} — Vol. ${issueId.volume}, Issue ${issueId.issueNumber}`;
};

const getIssueIdValue = (issueId: string | PopulatedIssue) => {
  if (typeof issueId === "string") return issueId;
  return issueId._id;
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

      return String(b._id).localeCompare(String(a._id));
    });
  }, [articles]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editingId ? prev.slug : makeSlug(value),
    }));
  };

  const handleEdit = (article: Article) => {
    setEditingId(article._id);

    setForm({
      issueId: getIssueIdValue(article.issueId),
      title: article.title || "",
      slug: article.slug || "",
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
      slug: makeSlug(form.slug || form.title),
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
        setMessage("Article created successfully.");
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

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchArticles();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Scrum 17
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Articles / Papers Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Add and manage papers under journal issues. This removes the
                need to manually insert article JSON in MongoDB.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Public article pages are not redesigned here.
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
                  Select issue, add article metadata, authors, PDF, DOI, and
                  display settings.
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: makeSlug(event.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
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

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  PDF URL
                </label>
                <input
                  value={form.pdfUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      pdfUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Article URL
                </label>
                <input
                  value={form.articleUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      articleUrl: event.target.value,
                    }))
                  }
                  placeholder="Optional article detail/source URL"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
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
                  placeholder="https://doi.org/..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        order: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>
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
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        citations: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
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
                  placeholder="Open Access"
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

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Article List
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, edit, publish, or delete articles.
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
                {sortedArticles.map((article) => (
                  <div
                    key={article._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-950">
                          {article.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {getIssueTitle(article.issueId)}
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
                          <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                            Order {article.order ?? 0}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                            {article.articleType || "Research Article"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                            {article.accessType || "Open Access"}
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
                          <span
                            className={[
                              "inline-flex items-center gap-1 rounded-full px-3 py-1",
                              article.isPublished
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700",
                            ].join(" ")}
                          >
                            {article.isPublished ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            {article.isPublished ? "Visible" : "Hidden"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                          <span>Views: {article.views || 0}</span>
                          <span>Downloads: {article.downloads || 0}</span>
                          <span>Citations: {article.citations || 0}</span>
                        </div>

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

                      <div className="flex flex-wrap justify-end gap-2">
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