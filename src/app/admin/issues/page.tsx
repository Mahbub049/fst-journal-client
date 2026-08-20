"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Eye,
  EyeOff,
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
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAdminIssue,
  deleteAdminIssue,
  getAdminIssues,
  IssuePayload,
  reorderAdminIssues,
  updateAdminIssue,
} from "@/services/issues.service";
import { Issue } from "@/types/issue";
import { uploadMedia } from "@/services/mediaService";
import { confirmAdminAction } from "@/lib/adminDialogs";

type IssueStatusFilter = "all" | "published" | "draft" | "recent";

type IssueFormState = {
  title: string;
  category: string;
  issn: string;
  volume: string;
  issueNumber: string;
  publishDateLabel: string;
  coverImage: string;
  pdfUrl: string;
  isRecent: boolean;
  isPublished: boolean;
};

const DEFAULT_ISSUE_TITLE = "Journal of FST";
const DEFAULT_ISSUE_CATEGORY = "Science & Technology";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDefaultPublicationDateLabel = () => {
  return `July ${new Date().getFullYear()}`;
};

const getMonthInputValue = (label: string) => {
  const match = String(label || "").trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return "";

  const monthIndex = monthNames.findIndex(
    (month) => month.toLowerCase() === match[1].toLowerCase()
  );

  if (monthIndex < 0) return "";
  return `${match[2]}-${String(monthIndex + 1).padStart(2, "0")}`;
};

const getPublicationDateLabelFromMonth = (value: string) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})$/);
  if (!match) return "";

  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "";

  return `${monthNames[monthIndex]} ${match[1]}`;
};

const getNextVolume = (issues: Issue[]) => {
  const maxVolume = issues.reduce((max, issue) => {
    const match = String(issue.volume || "").match(/\d+/);
    const value = match ? Number(match[0]) : 0;
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return String(maxVolume + 1).padStart(2, "0");
};

const buildCreateIssueForm = (issues: Issue[] = []): IssueFormState => {
  const latestIssue = [...issues].sort((a, b) => {
    const orderA = Number(a.order ?? 9999);
    const orderB = Number(b.order ?? 9999);
    if (orderA !== orderB) return orderA - orderB;
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  })[0];

  return {
    title: latestIssue?.title || DEFAULT_ISSUE_TITLE,
    category: DEFAULT_ISSUE_CATEGORY,
    issn: "",
    volume: getNextVolume(issues),
    issueNumber: "01",
    publishDateLabel: getDefaultPublicationDateLabel(),
    coverImage: "",
    pdfUrl: "",
    isRecent: true,
    isPublished: true,
  };
};

const makeSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const formatTwoDigitValue = (value: string) => {
  const trimmed = value.trim();
  const numericMatch = trimmed.match(/\d+/);

  if (!numericMatch) {
    return makeSlug(trimmed);
  }

  return numericMatch[0].padStart(2, "0");
};

const buildIssueSlug = (form: Pick<IssueFormState, "title" | "volume" | "issueNumber" | "publishDateLabel">) => {
  const titleSlug = makeSlug(form.title);
  const volumeSlug = form.volume.trim()
    ? `volume-${formatTwoDigitValue(form.volume)}`
    : "";
  const issueSlug = form.issueNumber.trim()
    ? `issue-${formatTwoDigitValue(form.issueNumber)}`
    : "";
  const dateSlug = makeSlug(form.publishDateLabel);

  return [titleSlug, volumeSlug, issueSlug, dateSlug].filter(Boolean).join("-");
};

const reorderList = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
};

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [form, setForm] = useState<IssueFormState>(() => buildCreateIssueForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  const generatedSlug = useMemo(() => buildIssueSlug(form), [form]);
  const canReorderIssues = statusFilter === "all" && search.trim().length === 0;

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

  useEffect(() => {
    const loadCreateDefaults = async () => {
      try {
        const data = await getAdminIssues({ status: "all" });
        setAllIssues(data);
        setForm((current) =>
          editingId ? current : buildCreateIssueForm(data)
        );
      } catch {
        // The normal issue list request already shows any loading error.
      }
    };

    loadCreateDefaults();
  }, []);

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
    setForm(buildCreateIssueForm(allIssues));
    setEditingId(null);
    setMessage("");
  };

  const handleEdit = (issue: Issue) => {
    setEditingId(issue._id);

    setForm({
      title: issue.title || "",
      category: issue.category || DEFAULT_ISSUE_CATEGORY,
      issn: issue.issn || "",
      volume: issue.volume || "",
      issueNumber: issue.issueNumber || "",
      publishDateLabel: issue.publishDateLabel || "",
      coverImage: issue.coverImage || "",
      pdfUrl: issue.pdfUrl || "",
      isRecent: issue.isRecent ?? true,
      isPublished: issue.isPublished ?? true,
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = (): IssuePayload => {
    return {
      title: form.title.trim(),
      slug: generatedSlug,
      category: DEFAULT_ISSUE_CATEGORY,
      issn: form.issn.trim(),
      volume: form.volume.trim(),
      issueNumber: form.issueNumber.trim(),
      publishDateLabel: form.publishDateLabel.trim(),
      coverImage: form.coverImage.trim(),
      pdfUrl: form.pdfUrl.trim(),
      isRecent: form.isRecent,
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
        await updateAdminIssue(editingId, payload);
        await fetchIssues();
        const refreshedIssues = await getAdminIssues({ status: "all" });
        setAllIssues(refreshedIssues);
        setEditingId(null);
        setForm(buildCreateIssueForm(refreshedIssues));
        setMessage(
          "Issue updated successfully. Its article PDF folder is ready on the server."
        );
      } else {
        await createAdminIssue(payload);
        await fetchIssues();
        const refreshedIssues = await getAdminIssues({ status: "all" });
        setAllIssues(refreshedIssues);
        setEditingId(null);
        setForm(buildCreateIssueForm(refreshedIssues));
        setMessage(
          "Issue created successfully. It is now first in public order and its article PDF folder has been created automatically."
        );
      }
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

  const saveIssueOrder = async (orderedIssues: Issue[]) => {
    if (!canReorderIssues) {
      setMessage("Clear search and select All before changing issue order.");
      return;
    }

    try {
      setReordering(true);
      const orderedWithIndex = orderedIssues.map((issue, index) => ({
        ...issue,
        order: index,
      }));

      setIssues(orderedWithIndex);
      await reorderAdminIssues(orderedWithIndex.map((issue) => issue._id));
      await fetchIssues();
      setMessage("Issue display order updated. The public website will follow this order.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to update issue order.");
      await fetchIssues();
    } finally {
      setReordering(false);
      setDraggedIssueId(null);
    }
  };

  const handleIssueDrop = async (targetIssueId: string) => {
    if (!draggedIssueId || draggedIssueId === targetIssueId || !canReorderIssues) {
      setDraggedIssueId(null);
      return;
    }

    const fromIndex = sortedIssues.findIndex((issue) => issue._id === draggedIssueId);
    const toIndex = sortedIssues.findIndex((issue) => issue._id === targetIssueId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedIssueId(null);
      return;
    }

    await saveIssueOrder(reorderList(sortedIssues, fromIndex, toIndex));
  };

  const moveIssue = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sortedIssues.length || fromIndex === toIndex) return;
    await saveIssueOrder(reorderList(sortedIssues, fromIndex, toIndex));
  };

  const handleDelete = async (issue: Issue) => {
    const confirmed = await confirmAdminAction({
      title: "Delete issue?",
      text: `"${issue.title}" will be removed permanently.`,
      confirmButtonText: "Delete issue",
      destructive: true,
    });

    if (!confirmed) return;

    try {
      await deleteAdminIssue(issue._id);
      setMessage("Issue deleted successfully.");

      if (editingId === issue._id) {
        resetForm();
      }

      await fetchIssues();
      const refreshedIssues = await getAdminIssues({ status: "all" });
      setAllIssues(refreshedIssues);
      if (!editingId || editingId === issue._id) {
        setForm(buildCreateIssueForm(refreshedIssues));
      }
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
                Create issues with automatic slugs and control the public display
                order using drag and drop.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Public issue order follows this list.
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
                  Fill issue details. The slug and display position are handled automatically.
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
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Example: Journal of FST"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div className="rounded-2xl border border-dashed border-[#005A78]/25 bg-[#005A78]/5 px-4 py-3">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#005A78]">
                  Auto-generated slug
                </label>
                <p className="break-all text-sm font-semibold text-slate-700">
                  {generatedSlug || "journal-of-fst-volume-03-issue-01-july-2025"}
                </p>
                {/* <p className="mt-1 text-xs text-slate-500">
                  Format: issue-title-volume-no-issue-no-publication-date-label.
                </p> */}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Volume
                  </label>
                  <input
                    value={form.volume}
                    inputMode="numeric"
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, volume: event.target.value }))
                    }
                    onBlur={() =>
                      setForm((prev) => ({
                        ...prev,
                        volume: prev.volume ? formatTwoDigitValue(prev.volume) : prev.volume,
                      }))
                    }
                    placeholder="04"
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
                    inputMode="numeric"
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        issueNumber: event.target.value,
                      }))
                    }
                    onBlur={() =>
                      setForm((prev) => ({
                        ...prev,
                        issueNumber: prev.issueNumber
                          ? formatTwoDigitValue(prev.issueNumber)
                          : prev.issueNumber,
                      }))
                    }
                    placeholder="01"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Publication Month & Year
                </label>
                <input
                  type="month"
                  value={getMonthInputValue(form.publishDateLabel)}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      publishDateLabel: getPublicationDateLabelFromMonth(
                        event.target.value
                      ),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Saved publicly as {form.publishDateLabel || "Month Year"}. New issues default to July of the current year.
                </p>
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
                  placeholder="/media/issues/issue-cover.jpg or image URL"
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

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
                New issues are automatically inserted at the top of the public display order.
                The newest three published issues appear in the Issues navbar dropdown.
                <span className="mt-1 block text-amber-900">
                  Article folder: public/pdfs/articles/volume-{formatTwoDigitValue(form.volume || "00")}_issue-{formatTwoDigitValue(form.issueNumber || "00")}
                </span>
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
                  Issue List & Display Order
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Drag issues to control which one appears first on the public website.
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
              className="mb-4 grid gap-3 lg:grid-cols-[1fr_180px_auto]"
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
{/* 
            <div
              className={[
                "mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold",
                canReorderIssues
                  ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                  : "border-amber-200 bg-amber-50 text-amber-800",
              ].join(" ")}
            >
              {canReorderIssues
                ? "Ordering mode is active. Drag an issue, or use the arrow buttons, then the public site will follow the saved order."
                : "Ordering is disabled while searching or filtering. Select All and clear the search box to rearrange issues."}
            </div> */}

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
                {sortedIssues.map((issue, index) => (
                  <div
                    key={issue._id}
                    draggable={canReorderIssues && !reordering}
                    onDragStart={() => setDraggedIssueId(issue._id)}
                    onDragOver={(event) => {
                      if (canReorderIssues) event.preventDefault();
                    }}
                    onDrop={() => handleIssueDrop(issue._id)}
                    onDragEnd={() => setDraggedIssueId(null)}
                    className={[
                      "rounded-2xl border bg-slate-50 p-4 transition",
                      draggedIssueId === issue._id
                        ? "border-[#005A78] opacity-70 ring-2 ring-[#005A78]/15"
                        : "border-slate-200 hover:border-[#005A78]/30",
                      canReorderIssues ? "cursor-move" : "cursor-default",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex shrink-0 flex-col items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005A78] text-xs font-black text-white shadow-sm">
                            {index + 1}
                          </div>

                          <div
                            className={[
                              "flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-400",
                              canReorderIssues
                                ? "border-slate-200"
                                : "border-slate-100 opacity-50",
                            ].join(" ")}
                            title="Drag to reorder"
                          >
                            {reordering && draggedIssueId === issue._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <GripVertical className="h-4 w-4" />
                            )}
                          </div>
                        </div>

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

                          <p className="mt-1 break-all text-sm text-slate-500">
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
                            <span className="rounded-full bg-[#005A78]/10 px-3 py-1 text-[#005A78]">
                              Public position {index + 1}
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
                          disabled={!canReorderIssues || reordering || index === 0}
                          onClick={() => moveIssue(index, index - 1)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={
                            !canReorderIssues ||
                            reordering ||
                            index === sortedIssues.length - 1
                          }
                          onClick={() => moveIssue(index, index + 1)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>

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
