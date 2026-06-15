"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAdminEditorialBoard,
  deleteAdminEditorialBoard,
  EditorialBoardMember,
  EditorialBoardPayload,
  getAdminEditorialBoard,
  reorderAdminEditorialBoard,
  updateAdminEditorialBoard,
} from "@/services/editorialBoardService";
import { uploadMedia } from "@/services/mediaService";

type StatusFilter = "all" | "active" | "inactive";

type EditorFormState = {
  category: string;
  editorialArea: string;
  name: string;
  designation: string;
  institution: string;
  department: string;
  expertise: string;
  profileImage: string;
  bio: string;
  email: string;
  isActive: boolean;
};

const emptyForm: EditorFormState = {
  category: "Editorial Board Member",
  editorialArea: "Computer Science and Information Technology",
  name: "",
  designation: "",
  institution: "",
  department: "",
  expertise: "",
  profileImage: "",
  bio: "",
  email: "",
  isActive: true,
};

const categoryOptions = [
  "Chief Patron",
  "Chief Editor",
  "Editor",
  "Assistant Editor",
  "Editorial Advisory Board",
];

const editorialAreaOptions = [
  "Journal Leadership",
  "Assistant Editorial Team",
  "Editorial Advisory Board",
  "General",
];

const categorySortRank = (category?: string) => {
  const normalized = (category || "").toLowerCase().trim();
  const orderMap: Record<string, number> = {
    "chief patron": 1,
    "chief editor": 2,
    editor: 3,
    "assistant editor": 4,
    "assistant editors": 4,
    "editorial advisory board": 5,
    "editorial advisory board member": 5,
    "editorial advisory board members": 5,
    "advisory board member": 5,
    "advisory board members": 5,
  };

  return orderMap[normalized] || 99;
};

const splitCommaValues = (value: string) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function AdminEditorialBoardPage() {
  const [editors, setEditors] = useState<EditorialBoardMember[]>([]);
  const [form, setForm] = useState<EditorFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editorialAreaFilter, setEditorialAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const fetchEditors = async () => {
    try {
      setLoading(true);

      const data = await getAdminEditorialBoard({
        search,
        category: categoryFilter,
        editorialArea: editorialAreaFilter,
        status: statusFilter,
      });

      setEditors(data);
    } catch {
      setMessage("Failed to load editorial board members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditors();
  }, []);

  useEffect(() => {
    fetchEditors();
  }, [categoryFilter, editorialAreaFilter, statusFilter]);

  const allCategoryOptions = useMemo(() => {
    const existing = editors.map((editor) => editor.category).filter(Boolean);
    return Array.from(new Set([...categoryOptions, ...existing]));
  }, [editors]);

  const allEditorialAreaOptions = useMemo(() => {
    const existing = editors
      .map((editor) => editor.editorialArea)
      .filter(Boolean);

    return Array.from(new Set([...editorialAreaOptions, ...existing]));
  }, [editors]);

  const sortedEditors = useMemo(() => {
    return [...editors].sort((a, b) => {
      const categoryRankA = categorySortRank(a.category);
      const categoryRankB = categorySortRank(b.category);

      if (categoryRankA !== categoryRankB) return categoryRankA - categoryRankB;

      if ((a.category || "") !== (b.category || "")) {
        return (a.category || "").localeCompare(b.category || "");
      }

      const orderA = Number(a.order || 0);
      const orderB = Number(b.order || 0);

      if (orderA !== orderB) return orderA - orderB;

      return a.name.localeCompare(b.name);
    });
  }, [editors]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const buildPayload = (): EditorialBoardPayload => {
    return {
      category: form.category.trim(),
      editorialArea: form.editorialArea.trim(),
      name: form.name.trim(),
      designation: form.designation.trim(),
      institution: form.institution.trim(),
      department: form.department.trim(),
      expertise: splitCommaValues(form.expertise),
      profileImage: form.profileImage.trim(),
      bio: form.bio.trim(),
      email: form.email.trim(),
      isActive: form.isActive,
    };
  };

  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({
      ...prev,
      category,
      editorialArea:
        category === "Chief Patron" ||
        category === "Chief Editor" ||
        category === "Editor"
          ? "Journal Leadership"
          : category === "Assistant Editor"
            ? "Assistant Editorial Team"
            : category === "Editorial Advisory Board"
              ? "Editorial Advisory Board"
              : prev.editorialArea,
    }));
  };

  const handleEdit = (editor: EditorialBoardMember) => {
    setEditingId(editor._id);

    setForm({
      category: editor.category || "Editorial Board Member",
      editorialArea: editor.editorialArea || "General",
      name: editor.name || "",
      designation: editor.designation || "",
      institution: editor.institution || "",
      department: editor.department || "",
      expertise: editor.expertise?.join(", ") || "",
      profileImage: editor.profileImage || "",
      bio: editor.bio || "",
      email: editor.email || "",
      isActive: editor.isActive ?? true,
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayloadFromEditor = (
    editor: EditorialBoardMember,
    overrides: Partial<EditorialBoardPayload> = {},
  ): EditorialBoardPayload => ({
    category: editor.category || "Editorial Board Member",
    editorialArea: editor.editorialArea || "General",
    name: editor.name || "",
    designation: editor.designation || "",
    institution: editor.institution || "",
    department: editor.department || "",
    expertise: editor.expertise || [],
    profileImage: editor.profileImage || "",
    bio: editor.bio || "",
    email: editor.email || "",
    order: Number(editor.order || 0),
    isActive: editor.isActive ?? true,
    ...overrides,
  });

  const handleToggleActive = async (editor: EditorialBoardMember) => {
    try {
      const nextStatus = !(editor.isActive ?? true);

      await updateAdminEditorialBoard(
        editor._id,
        buildPayloadFromEditor(editor, { isActive: nextStatus }),
      );

      setMessage(
        nextStatus
          ? "Member is now visible on the public editorial board page."
          : "Member is now hidden from the public editorial board page.",
      );

      await fetchEditors();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to update member status.",
      );
    }
  };

  const persistOrder = async (nextEditors: EditorialBoardMember[]) => {
    try {
      setEditors(nextEditors);
      setMessage("");

      await reorderAdminEditorialBoard(nextEditors.map((editor) => editor._id));
      setMessage("Editorial board display order updated successfully.");
      await fetchEditors();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Failed to update editorial board display order.",
      );
      await fetchEditors();
    } finally {
      setDraggingId(null);
    }
  };

  const handleMoveMember = async (editorId: string, direction: "up" | "down") => {
    const currentIndex = sortedEditors.findIndex((editor) => editor._id === editorId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sortedEditors.length) {
      return;
    }

    const nextEditors = [...sortedEditors];
    const [movedEditor] = nextEditors.splice(currentIndex, 1);
    nextEditors.splice(targetIndex, 0, movedEditor);

    await persistOrder(nextEditors);
  };

  const handleDropMember = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const currentIndex = sortedEditors.findIndex((editor) => editor._id === draggingId);
    const targetIndex = sortedEditors.findIndex((editor) => editor._id === targetId);

    if (currentIndex < 0 || targetIndex < 0) {
      setDraggingId(null);
      return;
    }

    const nextEditors = [...sortedEditors];
    const [movedEditor] = nextEditors.splice(currentIndex, 1);
    nextEditors.splice(targetIndex, 0, movedEditor);

    await persistOrder(nextEditors);
  };

  const handleProfileImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);
      setMessage("");

      const media = await uploadMedia({
        file,
        title: file.name,
        folder: "editorial-board",
      });

      setForm((prev) => ({
        ...prev,
        profileImage: media.fileUrl,
      }));

      setMessage(
        "Profile image uploaded successfully. Save the member to apply it.",
      );
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to upload profile image.",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload = buildPayload();

      if (editingId) {
        await updateAdminEditorialBoard(editingId, payload);
        setMessage("Editorial board member updated successfully.");
      } else {
        await createAdminEditorialBoard(payload);
        setMessage("Editorial board member created successfully.");
      }

      resetForm();
      await fetchEditors();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Failed to save editorial board member.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (editor: EditorialBoardMember) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${editor.name}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteAdminEditorialBoard(editor._id);
      setMessage("Editorial board member deleted successfully.");

      if (editingId === editor._id) {
        resetForm();
      }

      await fetchEditors();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Failed to delete editorial board member.",
      );
    }
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchEditors();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Editorial Board
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Editorial Board Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Manage editor categories, editorial areas, designations,
                institutions, expertise, profile images, bios, and active
                status.
              </p>
            </div>

            <a
              href="/editorial-board"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
              View Public Page
            </a>
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
                  {editingId ? "Edit Member" : "Create Member"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add editorial board profile details.
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
                  Category / Role
                </label>

                <select
                  value={form.category}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                >
                  {allCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Editorial Area
                </label>

                <select
                  value={form.editorialArea}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      editorialArea: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                >
                  {allEditorialAreaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-slate-500">
                  Category controls the public section. Editorial area is used
                  for internal grouping and filtering.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Example: Prof. Dr. ..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Designation
                </label>
                <input
                  value={form.designation}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      designation: event.target.value,
                    }))
                  }
                  placeholder="Professor, Dean, Editor-in-Chief"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Institution
                </label>
                <input
                  value={form.institution}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      institution: event.target.value,
                    }))
                  }
                  placeholder="Bangladesh University of Professionals"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Department
                </label>
                <input
                  value={form.department}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      department: event.target.value,
                    }))
                  }
                  placeholder="Department / Faculty"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Expertise
                </label>
                <input
                  value={form.expertise}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      expertise: event.target.value,
                    }))
                  }
                  placeholder="AI, Cyber Security, Data Science"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Separate multiple expertise areas with commas.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Profile Image
                </label>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    value={form.profileImage}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        profileImage: event.target.value,
                      }))
                    }
                    placeholder="Paste Cloudinary or image URL"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />

                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadingImage ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {form.profileImage ? (
                  <div className="mt-3 h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img
                      src={form.profileImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Optional email"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Biography
                </label>
                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      bio: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="Short biography or profile description"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  Active / visible on public editorial board page
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
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Member"
                      : "Create Member"}
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
                  Editorial Board List
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, edit, activate, deactivate, delete, or reorder members by dragging.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchEditors}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mb-5 grid gap-3 xl:grid-cols-[1fr_180px_210px_140px_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, area, institution, expertise"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                <option value="all">All Roles</option>
                {allCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={editorialAreaFilter}
                onChange={(event) => setEditorialAreaFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                <option value="all">All Areas</option>
                {allEditorialAreaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                  Loading editorial board members...
                </p>
              </div>
            ) : sortedEditors.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <UserRound className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-800">
                  No members found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create the first editorial board member using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedEditors.map((editor, index) => (
                  <div
                    key={editor._id}
                    draggable
                    onDragStart={() => setDraggingId(editor._id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropMember(editor._id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={[
                      "rounded-2xl border bg-slate-50 p-4 transition",
                      draggingId === editor._id
                        ? "border-[#005A78] opacity-60 ring-2 ring-[#005A78]/10"
                        : "border-slate-200 hover:border-[#005A78]/40 hover:bg-white",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex shrink-0 flex-col items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005A78] text-sm font-bold text-white">
                            {index + 1}
                          </div>
                          <button
                            type="button"
                            title="Drag to reorder"
                            className="cursor-grab rounded-full border border-slate-200 bg-white p-2 text-slate-400 active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          {editor.profileImage ? (
                            <img
                              src={editor.profileImage}
                              alt={editor.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserRound className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-950">
                              {editor.name}
                            </h3>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(editor)}
                              className={[
                                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition",
                                editor.isActive
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 hover:bg-rose-100",
                              ].join(" ")}
                              title="Click to toggle public visibility"
                            >
                              {editor.isActive ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                              {editor.isActive ? "Active" : "Inactive"}
                            </button>
                          </div>

                          <p className="mt-1 text-sm font-semibold text-[#005A78]">
                            {editor.category}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-600">
                            Area: {editor.editorialArea || "General"}
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {editor.designation || "No designation"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {editor.department || "No department"}
                            {editor.institution
                              ? `, ${editor.institution}`
                              : ""}
                          </p>

                          {editor.email && (
                            <p className="mt-1 break-all text-sm text-slate-500">
                              {editor.email}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-[#005A78]">
                              Display position {index + 1}
                            </span>

                            {editor.expertise?.map((item) => (
                              <span
                                key={item}
                                className="rounded-full bg-blue-50 px-3 py-1 text-blue-700"
                              >
                                {item}
                              </span>
                            ))}
                          </div>

                          {editor.bio && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {editor.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveMember(editor._id, "up")}
                          disabled={index === 0}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveMember(editor._id, "down")}
                          disabled={index === sortedEditors.length - 1}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(editor)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(editor)}
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
