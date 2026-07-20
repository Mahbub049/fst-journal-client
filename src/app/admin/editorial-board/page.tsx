"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Edit,
  ExternalLink,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAdminEditorialBoard,
  deleteAdminEditorialBoard,
  EditorialAreaSetting,
  EditorialBoardMember,
  EditorialBoardPageSettings,
  EditorialBoardPayload,
  EditorialCategorySetting,
  getAdminEditorialBoard,
  getAdminEditorialBoardConfig,
  reorderAdminEditorialBoard,
  updateAdminEditorialBoard,
  updateAdminEditorialBoardConfig,
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
  professionalProfileUrl: string;
  biographyUrl: string;
  professionalProfileLabel: string;
  biographyLabel: string;
  isActive: boolean;
};

const defaultConfig: EditorialBoardPageSettings = {
  eyebrow: "Editorial Leadership",
  pageTitle: "Editorial Board",
  intro:
    "The editorial board of BUP Faculty of Science and Technology Journal supports academic quality, publication ethics, manuscript evaluation, and scholarly direction.",
  summaryEyebrow: "Board Summary",
  summaryTitle: "Editorial Review Structure",
  summaryDescription:
    "Members are organized according to the official editorial structure and their assigned roles.",
  chiefEditorResponsibilityTitle: "Chief Editor Responsibilities",
  chiefEditorResponsibilityDescription:
    "Our chief editor is accountable for the overall direction of the journal, ensuring that published work is of the highest quality, follows BUP publication policies and procedures, and advances the journal's editorial mission.",
  showSummaryCards: true,
  showTotalCard: true,
  editorialOfficeTitle: "Editorial Office",
  editorialOfficeDescription:
    "For journal-related queries, manuscript preparation, publication information, and author support, please contact the editorial office.",
  editorialOfficePublisher: "Faculty of Science & Technology",
  editorialOfficeInstitution: "Bangladesh University of Professionals",
  editorialOfficeAddress: "Mirpur Cantonment, Dhaka - 1216",
  editorialOfficeEmail: "editor.fstjournal@bup.edu.bd",
  editorialOfficePhone: "",
  categories: [
    { name: "Chief Patron", description: "", order: 0, isActive: true, showInSummary: true },
    { name: "Chief Editor", description: "", order: 1, isActive: true, showInSummary: true },
    { name: "Editor", description: "", order: 2, isActive: true, showInSummary: true },
    { name: "Assistant Editor", description: "", order: 3, isActive: true, showInSummary: true },
    { name: "Editorial Advisory Board", description: "", order: 4, isActive: true, showInSummary: true },
  ],
  editorialAreas: [
    { name: "Journal Leadership", description: "", order: 0, isActive: true },
    { name: "Assistant Editorial Team", description: "", order: 1, isActive: true },
    { name: "Editorial Advisory Board", description: "", order: 2, isActive: true },
    { name: "General", description: "", order: 3, isActive: true },
  ],
};

const emptyEditor = (config: EditorialBoardPageSettings): EditorFormState => ({
  category: config.categories.find((item) => item.isActive)?.name || "Editorial Board Member",
  editorialArea: config.editorialAreas.find((item) => item.isActive)?.name || "General",
  name: "",
  designation: "",
  institution: "",
  department: "",
  expertise: "",
  profileImage: "",
  bio: "",
  email: "",
  professionalProfileUrl: "",
  biographyUrl: "",
  professionalProfileLabel: "",
  biographyLabel: "View Full Biography",
  isActive: true,
});

const splitCommaValues = (value: string) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

const isChiefEditorRole = (value: string) => {
  const normalized = value.toLowerCase().replace(/[^a-z]+/g, " ").trim();
  return normalized === "chief editor" || normalized === "editor in chief";
};

const normalizeConfigOrder = (config: EditorialBoardPageSettings) => ({
  ...config,
  categories: config.categories.map((item, index) => ({ ...item, order: index })),
  editorialAreas: config.editorialAreas.map((item, index) => ({ ...item, order: index })),
});

export default function AdminEditorialBoardPage() {
  const [editors, setEditors] = useState<EditorialBoardMember[]>([]);
  const [allEditors, setAllEditors] = useState<EditorialBoardMember[]>([]);
  const [config, setConfig] = useState<EditorialBoardPageSettings>(defaultConfig);
  const [form, setForm] = useState<EditorFormState>(emptyEditor(defaultConfig));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [savingMember, setSavingMember] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [draggingMemberId, setDraggingMemberId] = useState<string | null>(null);
  const [draggingTaxonomy, setDraggingTaxonomy] = useState<{ type: "category" | "area"; index: number } | null>(null);
  const memberFormRef = useRef<HTMLFormElement | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memberData, allMemberData, configData] = await Promise.all([
        getAdminEditorialBoard({
          search,
          category: categoryFilter,
          editorialArea: areaFilter,
          status: statusFilter,
        }),
        getAdminEditorialBoard(),
        getAdminEditorialBoardConfig(),
      ]);
      setEditors(memberData);
      setAllEditors(allMemberData);
      setConfig(normalizeConfigOrder({ ...defaultConfig, ...configData }));
      if (!editingId) setForm(emptyEditor({ ...defaultConfig, ...configData }));
    } catch {
      setMessage("Failed to load editorial board management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, areaFilter, statusFilter]);

  const activeCategories = useMemo(
    () => config.categories.filter((item) => item.isActive),
    [config.categories]
  );
  const activeAreas = useMemo(
    () => config.editorialAreas.filter((item) => item.isActive),
    [config.editorialAreas]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allEditors.filter((member) => member.isActive).forEach((member) => {
      counts.set(member.category, (counts.get(member.category) || 0) + 1);
    });
    return counts;
  }, [allEditors]);

  const resetMemberForm = () => {
    setForm(emptyEditor(config));
    setEditingId(null);
  };

  const buildPayload = (): EditorialBoardPayload => ({
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
    professionalProfileUrl: form.professionalProfileUrl.trim(),
    biographyUrl: form.biographyUrl.trim(),
    professionalProfileLabel: form.professionalProfileLabel.trim(),
    biographyLabel: form.biographyLabel.trim() || "View Full Biography",
    isActive: form.isActive,
  });

  const handleEditMember = (member: EditorialBoardMember) => {
    setEditingId(member._id);
    setForm({
      category: member.category,
      editorialArea: member.editorialArea,
      name: member.name,
      designation: member.designation || "",
      institution: member.institution || "",
      department: member.department || "",
      expertise: member.expertise?.join(", ") || "",
      profileImage: member.profileImage || "",
      bio: member.bio || "",
      email: member.email || "",
      professionalProfileUrl: member.professionalProfileUrl || "",
      biographyUrl: member.biographyUrl || "",
      professionalProfileLabel: member.professionalProfileLabel || "",
      biographyLabel: member.biographyLabel || "View Full Biography",
      isActive: member.isActive,
    });
    requestAnimationFrame(() =>
      memberFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const handleProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const media = await uploadMedia({
        file,
        title: file.name,
        folder: "editorial-board",
      });
      setForm((prev) => ({ ...prev, profileImage: media.fileUrl }));
      setMessage("Profile image uploaded. Save the member to apply it.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to upload profile image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmitMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSavingMember(true);
      const payload = buildPayload();
      if (editingId) {
        await updateAdminEditorialBoard(editingId, payload);
        setMessage("Editorial board member updated successfully.");
      } else {
        await createAdminEditorialBoard(payload);
        setMessage("Editorial board member created successfully.");
      }
      resetMemberForm();
      await fetchData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to save editorial board member.");
    } finally {
      setSavingMember(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSavingConfig(true);
      const saved = await updateAdminEditorialBoardConfig(normalizeConfigOrder(config));
      setConfig(normalizeConfigOrder(saved));
      setMessage("Editorial board page, roles, areas, count cards, and editorial office updated successfully.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to save editorial board settings.");
    } finally {
      setSavingConfig(false);
    }
  };

  const addCategory = () => {
    const name = window.prompt("Enter the new category / role name:")?.trim();
    if (!name) return;
    if (config.categories.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setMessage("That role already exists.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { name, description: "", order: prev.categories.length, isActive: true, showInSummary: true },
      ],
    }));
  };

  const addArea = () => {
    const name = window.prompt("Enter the new editorial area name:")?.trim();
    if (!name) return;
    if (config.editorialAreas.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setMessage("That editorial area already exists.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      editorialAreas: [
        ...prev.editorialAreas,
        { name, description: "", order: prev.editorialAreas.length, isActive: true },
      ],
    }));
  };

  const updateCategory = (index: number, patch: Partial<EditorialCategorySetting>) => {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const updateArea = (index: number, patch: Partial<EditorialAreaSetting>) => {
    setConfig((prev) => ({
      ...prev,
      editorialAreas: prev.editorialAreas.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const removeCategory = (index: number) => {
    const item = config.categories[index];
    if (allEditors.some((member) => member.category === item.name)) {
      setMessage("This role is already assigned to a member. Reassign those members before deleting it.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const removeArea = (index: number) => {
    const item = config.editorialAreas[index];
    if (allEditors.some((member) => member.editorialArea === item.name)) {
      setMessage("This editorial area is already assigned to a member. Reassign those members before deleting it.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      editorialAreas: prev.editorialAreas.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const dropTaxonomy = (type: "category" | "area", targetIndex: number) => {
    if (!draggingTaxonomy || draggingTaxonomy.type !== type) return;
    const sourceIndex = draggingTaxonomy.index;
    setConfig((prev) => {
      const key = type === "category" ? "categories" : "editorialAreas";
      const list = [...(prev[key] as any[])];
      const [moved] = list.splice(sourceIndex, 1);
      list.splice(targetIndex, 0, moved);
      return { ...prev, [key]: list.map((item, index) => ({ ...item, order: index })) } as EditorialBoardPageSettings;
    });
    setDraggingTaxonomy(null);
  };

  const toggleMember = async (member: EditorialBoardMember) => {
    try {
      await updateAdminEditorialBoard(member._id, {
        category: member.category,
        editorialArea: member.editorialArea,
        name: member.name,
        designation: member.designation,
        institution: member.institution,
        department: member.department,
        expertise: member.expertise,
        profileImage: member.profileImage,
        bio: member.bio,
        email: member.email,
        professionalProfileUrl: member.professionalProfileUrl || "",
        biographyUrl: member.biographyUrl || "",
        professionalProfileLabel: member.professionalProfileLabel || "",
        biographyLabel: member.biographyLabel || "View Full Biography",
        order: member.order,
        isActive: !member.isActive,
      });
      await fetchData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to update member visibility.");
    }
  };

  const deleteMember = async (member: EditorialBoardMember) => {
    if (!window.confirm(`Delete "${member.name}"?`)) return;
    try {
      await deleteAdminEditorialBoard(member._id);
      setMessage("Editorial board member deleted successfully.");
      await fetchData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to delete member.");
    }
  };

  const dropMember = async (target: EditorialBoardMember) => {
    if (!draggingMemberId || draggingMemberId === target._id) return;
    const sourceIndex = editors.findIndex((member) => member._id === draggingMemberId);
    const targetIndex = editors.findIndex((member) => member._id === target._id);
    const source = editors[sourceIndex];
    if (!source || source.category !== target.category) {
      setMessage("Members can be dragged only within the same role. Edit the member to change the role.");
      setDraggingMemberId(null);
      return;
    }
    const next = [...editors];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    try {
      await reorderAdminEditorialBoard(next.map((member) => member._id));
      setMessage("Member order updated successfully.");
      await fetchData();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to reorder members.");
    } finally {
      setDraggingMemberId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">Editorial Board</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">Editorial Board and Office Management</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Control the public page content, dynamic count cards, editorial office, roles, editorial areas, and member profiles from one place.
              </p>
            </div>
            <a href="/editorial-board" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              <ExternalLink size={17} /> View Public Page
            </a>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">{message}</div>}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2"><Settings2 size={19} className="text-[#005A78]" /><h2 className="text-xl font-bold text-slate-950">Public Page and Editorial Office</h2></div>
              <p className="mt-1 text-sm text-slate-500">These fields now directly control the public editorial board page and office information.</p>
            </div>
            <button type="button" onClick={saveConfig} disabled={savingConfig} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#005A78] px-5 text-sm font-bold text-white disabled:opacity-60">
              {savingConfig ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Save All Settings
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Page Eyebrow</label><input value={config.eyebrow} onChange={(e) => setConfig((p) => ({ ...p, eyebrow: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Page Title</label><input value={config.pageTitle} onChange={(e) => setConfig((p) => ({ ...p, pageTitle: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
            <div className="lg:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-slate-700">Page Introduction</label><textarea value={config.intro} onChange={(e) => setConfig((p) => ({ ...p, intro: e.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Summary Eyebrow</label><input value={config.summaryEyebrow} onChange={(e) => setConfig((p) => ({ ...p, summaryEyebrow: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Summary Title</label><input value={config.summaryTitle} onChange={(e) => setConfig((p) => ({ ...p, summaryTitle: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
            <div className="lg:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-slate-700">Summary Description</label><textarea value={config.summaryDescription} onChange={(e) => setConfig((p) => ({ ...p, summaryDescription: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></div>
            <div className="lg:col-span-2 rounded-2xl border border-[#005A78]/15 bg-[#eef8fc] p-5">
              <h3 className="text-base font-bold text-slate-950">Chief Editor detail page</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                This responsibility text is shown only on the Chief Editor&apos;s separate biography page. The main Editorial Board card remains the same as every other member card.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Responsibility Heading</label>
                  <input value={config.chiefEditorResponsibilityTitle} onChange={(e) => setConfig((p) => ({ ...p, chiefEditorResponsibilityTitle: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm" />
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Chief Editor Responsibility Description</label>
                  <textarea value={config.chiefEditorResponsibilityDescription} onChange={(e) => setConfig((p) => ({ ...p, chiefEditorResponsibilityDescription: e.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={config.showSummaryCards} onChange={(e) => setConfig((p) => ({ ...p, showSummaryCards: e.target.checked }))} /> Show role count cards</label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={config.showTotalCard} onChange={(e) => setConfig((p) => ({ ...p, showTotalCard: e.target.checked }))} /> Show total member card</label>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-950">Editorial Office</h3>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Office Title</label><input value={config.editorialOfficeTitle} onChange={(e) => setConfig((p) => ({ ...p, editorialOfficeTitle: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label><input value={config.editorialOfficeEmail} onChange={(e) => setConfig((p) => ({ ...p, editorialOfficeEmail: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div className="lg:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label><textarea value={config.editorialOfficeDescription} onChange={(e) => setConfig((p) => ({ ...p, editorialOfficeDescription: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Publisher / Faculty</label><input value={config.editorialOfficePublisher} onChange={(e) => setConfig((p) => ({ ...p, editorialOfficePublisher: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Institution</label><input value={config.editorialOfficeInstitution} onChange={(e) => setConfig((p) => ({ ...p, editorialOfficeInstitution: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Address</label><input value={config.editorialOfficeAddress} onChange={(e) => setConfig((p) => ({ ...p, editorialOfficeAddress: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label><input value={config.editorialOfficePhone} onChange={(e) => setConfig((p) => ({ ...p, editorialOfficePhone: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-950">Categories / Roles</h2><p className="text-sm text-slate-500">Create roles, choose count cards, and drag to control public section order.</p></div><button type="button" onClick={addCategory} className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Add Role</button></div>
            <div className="space-y-3">
              {config.categories.map((item, index) => (
                <div key={item._id || `${item.name}-${index}`} draggable onDragStart={() => setDraggingTaxonomy({ type: "category", index })} onDragOver={(e) => e.preventDefault()} onDrop={() => dropTaxonomy("category", index)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3"><GripVertical className="mt-3 cursor-grab text-slate-400" size={17} /><div className="flex-1 space-y-3"><input value={item.name} onChange={(e) => updateCategory(index, { name: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" /><input value={item.description || ""} onChange={(e) => updateCategory(index, { description: e.target.value })} placeholder="Optional role description" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /><div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" checked={item.isActive} onChange={(e) => updateCategory(index, { isActive: e.target.checked })} /> Available</label><label className="flex items-center gap-2"><input type="checkbox" checked={item.showInSummary} onChange={(e) => updateCategory(index, { showInSummary: e.target.checked })} /> Count card</label><span>Active members: {categoryCounts.get(item.name) || 0}</span></div></div><button type="button" onClick={() => removeCategory(index)} className="rounded-lg border border-rose-200 p-2 text-rose-600"><Trash2 size={15} /></button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-950">Editorial Areas</h2><p className="text-sm text-slate-500">Create subject or organizational areas and drag to order them.</p></div><button type="button" onClick={addArea} className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Add Area</button></div>
            <div className="space-y-3">
              {config.editorialAreas.map((item, index) => (
                <div key={item._id || `${item.name}-${index}`} draggable onDragStart={() => setDraggingTaxonomy({ type: "area", index })} onDragOver={(e) => e.preventDefault()} onDrop={() => dropTaxonomy("area", index)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3"><GripVertical className="mt-3 cursor-grab text-slate-400" size={17} /><div className="flex-1 space-y-3"><input value={item.name} onChange={(e) => updateArea(index, { name: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" /><input value={item.description || ""} onChange={(e) => updateArea(index, { description: e.target.value })} placeholder="Optional area description" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /><label className="flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={item.isActive} onChange={(e) => updateArea(index, { isActive: e.target.checked })} /> Available for members</label></div><button type="button" onClick={() => removeArea(index)} className="rounded-lg border border-rose-200 p-2 text-rose-600"><Trash2 size={15} /></button></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <form ref={memberFormRef} onSubmit={handleSubmitMember} className="scroll-mt-24 self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
            <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-950">{editingId ? "Edit Member" : "Create Member"}</h2><p className="mt-1 text-sm text-slate-500">Assign a role and editorial area created above.</p></div>{editingId && <button type="button" onClick={resetMemberForm} className="rounded-full border border-slate-200 p-2"><X size={16} /></button>}</div>
            <div className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Category / Role</label><select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm">{activeCategories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Editorial Area</label><select value={form.editorialArea} onChange={(e) => setForm((p) => ({ ...p, editorialArea: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm">{activeAreas.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Designation</label><input value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Institution</label><input value={form.institution} onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Department</label><input value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Expertise</label><input value={form.expertise} onChange={(e) => setForm((p) => ({ ...p, expertise: e.target.value }))} placeholder="AI, Cyber Security, Data Science" className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Profile Image</label><div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input value={form.profileImage} onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /><label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold">{uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload<input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" /></label></div>{form.profileImage && <img src={form.profileImage} alt="Profile preview" className="mt-3 h-24 w-24 rounded-2xl border border-slate-200 object-cover" />}</div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label><input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" /></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-950">Member details page and external links</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  The public member card shows one button that opens an internal details page. The external URLs below are displayed only inside that details page.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Professional Profile URL (optional)</label>
                    <input type="url" value={form.professionalProfileUrl} onChange={(e) => setForm((p) => ({ ...p, professionalProfileUrl: e.target.value }))} placeholder="https://example.com/professional-profile" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm" />
                  </div>
                  {isChiefEditorRole(form.category) ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Chief Editor Card Button Label</label>
                      <input value={form.professionalProfileLabel} onChange={(e) => setForm((p) => ({ ...p, professionalProfileLabel: e.target.value }))} placeholder="Meet the Chief Editor" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm" />
                    </div>
                  ) : null}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">External Biography URL (optional)</label>
                    <input type="url" value={form.biographyUrl} onChange={(e) => setForm((p) => ({ ...p, biographyUrl: e.target.value }))} placeholder="https://example.com/external-biography" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm" />
                  </div>
                  {!isChiefEditorRole(form.category) ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Member Card Button Label</label>
                      <input value={form.biographyLabel} onChange={(e) => setForm((p) => ({ ...p, biographyLabel: e.target.value }))} placeholder="View Full Biography" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm" />
                    </div>
                  ) : null}
                </div>
              </div>
              <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Biography / Description</label><p className="mb-2 text-xs leading-5 text-slate-500">This text is shown only on the member&apos;s separate details page, not below the main card.</p><textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={7} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></div>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} /> Visible on public page</label>
              <button type="submit" disabled={savingMember} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#005A78] text-sm font-bold text-white disabled:opacity-60">{savingMember ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{savingMember ? "Saving..." : editingId ? "Update Member" : "Create Member"}</button>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold text-slate-950">Editorial Board Members</h2><p className="mt-1 text-sm text-slate-500">Drag members within the same role to control display order.</p></div><button type="button" onClick={fetchData} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"><RefreshCw size={16} /> Refresh</button></div>
            <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="mb-5 grid gap-3 lg:grid-cols-[1fr_170px_190px_130px_auto]"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members" className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm" /></div><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">All Roles</option>{config.categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select><select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">All Areas</option>{config.editorialAreas.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><button type="submit" className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white">Search</button></form>

            {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-[#005A78]" /></div> : editors.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">No members found.</div> : <div className="space-y-3">{editors.map((member) => <div key={member._id} draggable onDragStart={() => setDraggingMemberId(member._id)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropMember(member)} onDragEnd={() => setDraggingMemberId(null)} className={`rounded-2xl border p-4 transition ${draggingMemberId === member._id ? "border-[#005A78] bg-cyan-50 opacity-60" : "border-slate-200 bg-slate-50"}`}><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="flex min-w-0 gap-4"><GripVertical className="mt-7 shrink-0 cursor-grab text-slate-400" size={18} /><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">{member.profileImage ? <img src={member.profileImage} alt={member.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><UserRound className="text-slate-400" size={30} /></div>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{member.name}</h3><button type="button" onClick={() => toggleMember(member)} className={`rounded-full px-3 py-1 text-xs font-bold ${member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{member.isActive ? "Active" : "Inactive"}</button></div><p className="mt-1 text-sm font-semibold text-[#005A78]">{member.category}</p><p className="mt-1 text-sm text-slate-600">{member.editorialArea}</p><p className="mt-1 text-sm text-slate-500">{member.designation}{member.institution ? ` · ${member.institution}` : ""}</p>{member.expertise?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{member.expertise.map((item) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{item}</span>)}</div>}</div></div><div className="flex gap-2"><button type="button" onClick={() => handleEditMember(member)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"><Edit size={14} /> Edit</button><button type="button" onClick={() => deleteMember(member)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"><Trash2 size={14} /> Delete</button></div></div></div>)}</div>}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
