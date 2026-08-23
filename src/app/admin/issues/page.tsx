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
import { showAdminSuccessToast } from "@/lib/adminToast";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10";

const getDefaultPublicationDateLabel = () => `July ${new Date().getFullYear()}`;

const getMonthInputValue = (label: string) => {
  const match = String(label || "").trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return "";
  const monthIndex = monthNames.findIndex(
    (month) => month.toLowerCase() === match[1].toLowerCase(),
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

const makeSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatTwoDigitValue = (value: string) => {
  const trimmed = value.trim();
  const numericMatch = trimmed.match(/\d+/);
  if (!numericMatch) return makeSlug(trimmed);
  return numericMatch[0].padStart(2, "0");
};

const buildIssueSlug = (
  form: Pick<
    IssueFormState,
    "title" | "volume" | "issueNumber" | "publishDateLabel"
  >,
) => {
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
  const [formOpen, setFormOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const generatedSlug = useMemo(() => buildIssueSlug(form), [form]);
  const canReorderIssues = statusFilter === "all" && search.trim().length === 0;

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await getAdminIssues({ search, status: statusFilter });
      setIssues(data);
    } catch {
      setMessage("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAllIssues = async () => {
    const data = await getAdminIssues({ status: "all" });
    setAllIssues(data);
    return data;
  };

  useEffect(() => {
    void fetchIssues();
  }, [statusFilter]);

  useEffect(() => {
    void refreshAllIssues()
      .then((data) => setForm(buildCreateIssueForm(data)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!formOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) closeFormModal();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [formOpen, saving]);

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      const orderA = Number(a.order || 0);
      const orderB = Number(b.order || 0);
      if (orderA !== orderB) return orderA - orderB;
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
  }, [issues]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(buildCreateIssueForm(allIssues));
    setMessage("");
    setUploadMessage("");
    setFormOpen(true);
  };

  const openEditModal = (issue: Issue) => {
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
    setUploadMessage("");
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setUploadMessage("");
    setForm(buildCreateIssueForm(allIssues));
  };

  const updateField = <K extends keyof IssueFormState>(
    field: K,
    value: IssueFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = (): IssuePayload => ({
    title: form.title.trim(),
    slug: generatedSlug,
    category: DEFAULT_ISSUE_CATEGORY,
    // ISSN is intentionally hidden from issue management. Existing values are
    // preserved while editing; newly created issues do not need an issue-level ISSN.
    issn: form.issn.trim(),
    volume: form.volume.trim(),
    issueNumber: form.issueNumber.trim(),
    publishDateLabel: form.publishDateLabel.trim(),
    coverImage: form.coverImage.trim(),
    pdfUrl: form.pdfUrl.trim(),
    isRecent: form.isRecent,
    isPublished: form.isPublished,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.volume.trim() || !form.issueNumber.trim()) {
      setUploadMessage("Title, volume and issue number are required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setUploadMessage("");
      const payload = buildPayload();

      if (editingId) {
        await updateAdminIssue(editingId, payload);
        void showAdminSuccessToast("Issue saved");
        setMessage("Issue updated successfully.");
      } else {
        await createAdminIssue(payload);
        void showAdminSuccessToast("Issue created");
        setMessage("Issue created successfully and added to the public order.");
      }

      await fetchIssues();
      const refreshed = await refreshAllIssues();
      setForm(buildCreateIssueForm(refreshed));
      setEditingId(null);
      setFormOpen(false);
    } catch (error: any) {
      setUploadMessage(error?.response?.data?.message || "Failed to save issue.");
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (
    field: "coverImage" | "pdfUrl",
    file?: File,
  ) => {
    if (!file) return;

    try {
      field === "coverImage" ? setUploadingCover(true) : setUploadingPdf(true);
      setUploadMessage("");
      const media = await uploadMedia({
        file,
        title: file.name,
        folder: "issues",
      });
      updateField(field, media.fileUrl);
      setUploadMessage(
        field === "coverImage"
          ? "Cover image uploaded successfully."
          : "Issue PDF uploaded successfully.",
      );
    } catch (error: any) {
      setUploadMessage(error?.response?.data?.message || "Failed to upload file.");
    } finally {
      field === "coverImage" ? setUploadingCover(false) : setUploadingPdf(false);
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
      void showAdminSuccessToast("Issue order saved");
      await fetchIssues();
      setMessage("Public issue order updated.");
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
    if (fromIndex < 0 || toIndex < 0) return;
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
      void showAdminSuccessToast("Issue deleted");
      setMessage("Issue deleted successfully.");
      await fetchIssues();
      const refreshed = await refreshAllIssues();
      setForm(buildCreateIssueForm(refreshed));
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
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Issues CMS
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">Issues Management</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Manage published and draft issues, reorder the public archive, and open the issue form only when you need it.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#005A78] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#004968] hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create New Issue
            </button>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Issue List</h2>
              <p className="mt-1 text-sm text-slate-500">
                {canReorderIssues
                  ? "Drag issues or use the arrows to change public display order."
                  : "Clear search and choose All to enable public reordering."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form onSubmit={handleSearchSubmit} className="flex h-11 min-w-[260px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search issues"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
                />
                <button type="submit" className="px-4 text-slate-500 hover:text-[#005A78]" aria-label="Search">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as IssueStatusFilter)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#005A78]"
              >
                <option value="all">All Issues</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="recent">Recent</option>
              </select>

              <button
                type="button"
                onClick={() => void fetchIssues()}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#005A78] hover:text-[#005A78]"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading issues...
              </div>
            ) : sortedIssues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <p className="font-bold text-slate-800">No issues found</p>
                <p className="mt-1 text-sm text-slate-500">Create a new issue or adjust the current filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedIssues.map((issue, index) => (
                  <article
                    key={issue._id}
                    draggable={canReorderIssues && !reordering}
                    onDragStart={() => canReorderIssues && setDraggedIssueId(issue._id)}
                    onDragOver={(event) => canReorderIssues && event.preventDefault()}
                    onDrop={() => void handleIssueDrop(issue._id)}
                    onDragEnd={() => setDraggedIssueId(null)}
                    className={`group grid gap-4 rounded-2xl border bg-white p-4 transition lg:grid-cols-[auto_82px_minmax(0,1fr)_auto] lg:items-center ${
                      draggedIssueId === issue._id
                        ? "border-[#005A78] bg-cyan-50/40 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="hidden cursor-grab text-slate-300 active:cursor-grabbing lg:block">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="relative h-[106px] w-[76px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                      {issue.coverImage ? (
                        <img
                          src={issue.coverImage}
                          alt={`${issue.title} cover`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-bold text-slate-400">
                          NO COVER
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#005A78]/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-[#005A78]">
                          #{index + 1}
                        </span>
                        {issue.isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <Eye className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            <EyeOff className="h-3 w-3" /> Draft
                          </span>
                        )}
                        {issue.isRecent ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Recent</span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 truncate text-base font-bold text-slate-950">{issue.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Volume {issue.volume || "—"} · Issue {issue.issueNumber || "—"} · {issue.publishDateLabel || "No date"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">/{issue.slug}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <button
                        type="button"
                        disabled={!canReorderIssues || reordering || index === 0}
                        onClick={() => void moveIssue(index, index - 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#005A78] hover:text-[#005A78] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Move issue up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!canReorderIssues || reordering || index === sortedIssues.length - 1}
                        onClick={() => void moveIssue(index, index + 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#005A78] hover:text-[#005A78] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Move issue down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(issue)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-[#005A78] hover:text-[#005A78]"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(issue)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {formOpen ? (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#071a33]/70 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) closeFormModal();
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/20 bg-white shadow-[0_28px_90px_rgba(2,8,23,0.35)]"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#005A78]">
                  {editingId ? "Edit Existing Issue" : "Create Journal Issue"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {editingId ? "Update Issue Details" : "New Issue Details"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                aria-label="Close issue form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Journal / Issue Title</label>
                  <input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Volume</label>
                  <input
                    value={form.volume}
                    onChange={(event) => updateField("volume", event.target.value)}
                    placeholder="04"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Issue Number</label>
                  <input
                    value={form.issueNumber}
                    onChange={(event) => updateField("issueNumber", event.target.value)}
                    placeholder="01"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Publication Month</label>
                  <input
                    type="month"
                    value={getMonthInputValue(form.publishDateLabel)}
                    onChange={(event) =>
                      updateField(
                        "publishDateLabel",
                        getPublicationDateLabelFromMonth(event.target.value),
                      )
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Generated URL Slug</label>
                  <input value={generatedSlug} readOnly className={`${inputClass} bg-slate-50 text-slate-500`} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <MediaField
                  title="Issue Cover Image"
                  value={form.coverImage}
                  accept="image/*"
                  uploading={uploadingCover}
                  onUpload={(file) => void handleMediaUpload("coverImage", file)}
                  onClear={() => updateField("coverImage", "")}
                  previewImage
                />
                <MediaField
                  title="Issue PDF"
                  value={form.pdfUrl}
                  accept="application/pdf"
                  uploading={uploadingPdf}
                  onUpload={(file) => void handleMediaUpload("pdfUrl", file)}
                  onClear={() => updateField("pdfUrl", "")}
                />
              </div>

              {uploadMessage ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {uploadMessage}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Show as Recent Issue</p>
                    <p className="mt-1 text-xs text-slate-500">Allows the issue to appear in recent-issue areas.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isRecent}
                    onChange={(event) => updateField("isRecent", event.target.checked)}
                    className="h-4 w-4 accent-[#005A78]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Published</p>
                    <p className="mt-1 text-xs text-slate-500">Draft issues stay hidden from public visitors.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => updateField("isPublished", event.target.checked)}
                    className="h-4 w-4 accent-[#005A78]"
                  />
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#005A78] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#004968] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Issue"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminLayout>
  );
}

function MediaField({
  title,
  value,
  accept,
  uploading,
  onUpload,
  onClear,
  previewImage = false,
}: {
  title: string;
  value: string;
  accept: string;
  uploading: boolean;
  onUpload: (file?: File) => void;
  onClear: () => void;
  previewImage?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-xs text-slate-500">Upload a replacement or keep the current file.</p>
        </div>
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            Clear
          </button>
        ) : null}
      </div>

      {previewImage && value ? (
        <div className="mt-3 h-36 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img src={value} alt="Issue cover preview" className="h-full w-full object-contain" />
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <input
          value={value}
          readOnly
          placeholder="No file selected"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 outline-none"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#005A78]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#005A78] transition hover:bg-cyan-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading" : "Upload"}
          <input
            type="file"
            accept={accept}
            disabled={uploading}
            className="hidden"
            onChange={(event) => {
              onUpload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
