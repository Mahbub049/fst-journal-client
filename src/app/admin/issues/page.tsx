"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAdminIssue,
  deleteAdminIssue,
  getAdminIssues,
  IssuePayload,
  updateAdminIssue,
} from "@/services/issues.service";
import { Issue } from "@/types/issue";
import { uploadMedia } from "@/services/mediaService";

type IssueStatusFilter = "all" | "published" | "draft" | "recent";

type IssueFormState = {
  title: string;
  slug: string;
  category: string;
  issn: string;
  volume: string;
  issueNumber: string;
  publishDateLabel: string;
  coverImage: string;
  pdfUrl: string;
  isRecent: boolean;
  isPublished: boolean;
  order: string;
};

const emptyForm: IssueFormState = {
  title: "",
  slug: "",
  category: "Research Article",
  issn: "",
  volume: "",
  issueNumber: "",
  publishDateLabel: "",
  coverImage: "",
  pdfUrl: "",
  isRecent: true,
  isPublished: true,
  order: "0",
};

const makeSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [form, setForm] = useState<IssueFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [message, setMessage] = useState("");

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await getAdminIssues({
        search,
        status: statusFilter,
      });
      setIssues(data);
    } catch {
      setMessage("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter]);

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      const orderA = Number(a.order || 0);
      const orderB = Number(b.order || 0);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
  }, [issues]);

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

  const handleEdit = (issue: Issue) => {
    setEditingId(issue._id);

    setForm({
      title: issue.title || "",
      slug: issue.slug || "",
      category: issue.category || "Research Article",
      issn: issue.issn || "",
      volume: issue.volume || "",
      issueNumber: issue.issueNumber || "",
      publishDateLabel: issue.publishDateLabel || "",
      coverImage: issue.coverImage || "",
      pdfUrl: issue.pdfUrl || "",
      isRecent: issue.isRecent ?? true,
      isPublished: issue.isPublished ?? true,
      order: String(issue.order ?? 0),
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = (): IssuePayload => {
    return {
      title: form.title.trim(),
      slug: makeSlug(form.slug || form.title),
      category: form.category.trim(),
      issn: form.issn.trim(),
      volume: form.volume.trim(),
      issueNumber: form.issueNumber.trim(),
      publishDateLabel: form.publishDateLabel.trim(),
      coverImage: form.coverImage.trim(),
      pdfUrl: form.pdfUrl.trim(),
      isRecent: form.isRecent,
      isPublished: form.isPublished,
      order: Number(form.order || 0),
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload = buildPayload();

      if (editingId) {
        await updateAdminIssue(editingId, payload);
        setMessage("Issue updated successfully.");
      } else {
        await createAdminIssue(payload);
        setMessage("Issue created successfully.");
      }

      resetForm();
      await fetchIssues();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to save issue.");
    } finally {
      setSaving(false);
    }
  };


  const handleMediaUpload = async (
    field: "coverImage" | "pdfUrl",
    file: File | undefined
  ) => {
    if (!file) return;

    try {
      if (field === "coverImage") {
        setUploadingCover(true);
      } else {
        setUploadingPdf(true);
      }

      setMessage("");

      const media = await uploadMedia({
        file,
        title: file.name,
        folder: "issues",
      });

      setForm((prev) => ({
        ...prev,
        [field]: media.fileUrl,
      }));

      setMessage(
        field === "coverImage"
          ? "Cover image uploaded successfully."
          : "Issue PDF uploaded successfully."
      );
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to upload file.");
    } finally {
      if (field === "coverImage") {
        setUploadingCover(false);
      } else {
        setUploadingPdf(false);
      }
    }
  };

  const handleDelete = async (issue: Issue) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${issue.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteAdminIssue(issue._id);
      setMessage("Issue deleted successfully.");

      if (editingId === issue._id) {
        resetForm();
      }

      await fetchIssues();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to delete issue.");
    }
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchIssues();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Issues CMS
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Issues Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Create and manage published issues, current issue visibility,
                archive records, cover images, and issue PDF links.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Connected to the public issue pages.
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {editingId ? "Edit Issue" : "Create Issue"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add issue metadata, cover image, PDF link, and visibility.
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
                  Issue Title
                </label>
                <input
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Example: Volume 3, Issue 1"
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
                  placeholder="volume-3-issue-1"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Volume
                  </label>
                  <input
                    value={form.volume}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        volume: event.target.value,
                      }))
                    }
                    placeholder="3"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Issue No.
                  </label>
                  <input
                    value={form.issueNumber}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        issueNumber: event.target.value,
                      }))
                    }
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Publication Date Label
                </label>
                <input
                  value={form.publishDateLabel}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      publishDateLabel: event.target.value,
                    }))
                  }
                  placeholder="July 2025"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Research Article"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  ISSN
                </label>
                <input
                  value={form.issn}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      issn: event.target.value,
                    }))
                  }
                  placeholder="ISSN value"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Cover Image URL
                </label>
                <input
                  value={form.coverImage}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      coverImage: event.target.value,
                    }))
                  }
                  placeholder="/images/issue-cover.jpg or Cloudinary URL"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    {uploadingCover ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadingCover ? "Uploading..." : "Upload Cover"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={(event) =>
                        handleMediaUpload("coverImage", event.target.files?.[0])
                      }
                    />
                  </label>

                  {form.coverImage && (
                    <a
                      href={form.coverImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#005A78] hover:underline"
                    >
                      Preview cover
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Issue PDF URL
                </label>
                <input
                  value={form.pdfUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      pdfUrl: event.target.value,
                    }))
                  }
                  placeholder="Optional PDF URL"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    {uploadingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadingPdf ? "Uploading..." : "Upload PDF"}
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      disabled={uploadingPdf}
                      onChange={(event) =>
                        handleMediaUpload("pdfUrl", event.target.files?.[0])
                      }
                    />
                  </label>

                  {form.pdfUrl && (
                    <a
                      href={form.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#005A78] hover:underline"
                    >
                      Open PDF
                    </a>
                  )}
                </div>
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

              <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isRecent}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isRecent: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  Mark as recent issue
                </label>

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
                  Published
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
                      ? "Update Issue"
                      : "Create Issue"}
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
                  Issue List
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, edit, publish, or delete issues.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchIssues}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, slug, volume, issue no."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as IssueStatusFilter)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="recent">Recent</option>
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
                  Loading issues...
                </p>
              </div>
            ) : sortedIssues.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <h3 className="font-bold text-slate-800">No issues found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create the first journal issue from the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {issue.coverImage ? (
                            <img
                              src={issue.coverImage}
                              alt={issue.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                              No Cover
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {issue.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            /issues/{issue.slug}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                              Vol. {issue.volume}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                              Issue {issue.issueNumber}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                              {issue.publishDateLabel}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                              Order {issue.order ?? 0}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                            <span
                              className={[
                                "inline-flex items-center gap-1 rounded-full px-3 py-1",
                                issue.isPublished
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700",
                              ].join(" ")}
                            >
                              {issue.isPublished ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                              {issue.isPublished ? "Published" : "Draft"}
                            </span>

                            {issue.isRecent && (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                Recent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(issue)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(issue)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {issue.pdfUrl && (
                      <div className="mt-4 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-500">
                        PDF:{" "}
                        <span className="break-all text-slate-700">
                          {issue.pdfUrl}
                        </span>
                      </div>
                    )}
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