"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Edit,
  ExternalLink,
  GripVertical,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAdminMenu,
  deleteAdminMenu,
  getAdminMenus,
  MenuItem,
  MenuItemType,
  MenuLocation,
  MenuPayload,
  reorderAdminMenus,
  updateAdminMenu,
} from "@/services/menuService";
import { CmsPage, getAdminPages } from "@/services/pageService";
import { getAdminIssues } from "@/services/issues.service";
import { Issue } from "@/types/issue";
import {
  EditorialCategorySetting,
  getAdminEditorialBoardConfig,
} from "@/services/editorialBoardService";

type LinkSource = "page" | "issue" | "editorial" | "site" | "custom";

type MenuFormState = {
  label: string;
  type: MenuItemType;
  source: LinkSource;
  linkedValue: string;
  url: string;
  parentId: string;
  location: MenuLocation;
  isExternal: boolean;
  openInNewTab: boolean;
  isActive: boolean;
};

const emptyForm: MenuFormState = {
  label: "",
  type: "link",
  source: "page",
  linkedValue: "",
  url: "",
  parentId: "",
  location: "main",
  isExternal: false,
  openInNewTab: false,
  isActive: true,
};

const linkSourceOptions: { label: string; value: LinkSource }[] = [
  { label: "CMS Page", value: "page" },
  { label: "Issue", value: "issue" },
  { label: "Editorial Role", value: "editorial" },
  { label: "Site Section", value: "site" },
  { label: "Custom URL", value: "custom" },
];

const siteDestinations: {
  id: string;
  label: string;
  url: string;
  location: MenuLocation;
}[] = [
  { id: "home", label: "Home", url: "/", location: "main" },
  {
    id: "editorial-board",
    label: "Editorial Board",
    url: "/editorial-board",
    location: "main",
  },
  {
    id: "call-for-papers",
    label: "Call for Papers",
    url: "/call-for-papers",
    location: "main",
  },
  {
    id: "issues-archive",
    label: "All Issues / Archive",
    url: "/issues/archive",
    location: "issues",
  },
  { id: "contact", label: "Contact Us", url: "/contact", location: "about" },
];

const locationOptions: { label: string; value: MenuLocation | "all" }[] = [
  { label: "All Locations", value: "all" },
  { label: "Main Navbar", value: "main" },
  { label: "About Dropdown", value: "about" },
  { label: "Issues Dropdown", value: "issues" },
  { label: "For Authors Dropdown", value: "for-authors" },
  { label: "Reviewers Dropdown", value: "reviewers" },
  { label: "Editorial Board Dropdown", value: "editorial-board" },
  { label: "Footer", value: "footer" },
];

const formLocations = locationOptions.filter(
  (item): item is { label: string; value: MenuLocation } => item.value !== "all"
);

const getParentId = (menu: MenuItem) => {
  if (!menu.parentId) return "";
  return typeof menu.parentId === "string" ? menu.parentId : menu.parentId._id;
};

const getLocationLabel = (location: MenuLocation) =>
  formLocations.find((item) => item.value === location)?.label || location;

const getPageUrl = (page: CmsPage) => {
  if (page.group === "about" && page.slug === "contact-us") return "/contact";
  if (page.group === "about") return `/about/${page.slug}`;
  if (page.group === "for-authors") return `/for-authors/${page.slug}`;
  if (page.group === "reviewers") return `/reviewers/${page.slug}`;
  if (page.group === "issues") return `/issues/${page.slug}`;
  return `/${page.slug}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getEditorialRoleId = (category: EditorialCategorySetting) =>
  category._id || category.name;


const getChildLocationForParent = (parent?: MenuItem): MenuLocation => {
  if (!parent) return "main";

  const identity = `${parent.label} ${parent.url || ""}`.toLowerCase();
  if (identity.includes("about")) return "about";
  if (identity.includes("issue")) return "issues";
  if (identity.includes("author")) return "for-authors";
  if (identity.includes("reviewer")) return "reviewers";
  if (identity.includes("editorial")) return "editorial-board";
  if (parent.location === "footer") return "footer";

  return parent.location;
};

const getPageMenuLocation = (page: CmsPage): MenuLocation => {
  if (page.group === "about") return "about";
  if (page.group === "for-authors") return "for-authors";
  if (page.group === "reviewers") return "reviewers";
  if (page.group === "issues") return "issues";
  return "main";
};

const inferSource = (
  url: string,
  pages: CmsPage[],
  issues: Issue[],
  categories: EditorialCategorySetting[]
) => {
  const page = pages.find((item) => getPageUrl(item) === url);
  if (page) return { source: "page" as const, linkedValue: page._id };

  const issue = issues.find((item) => `/issues/${item.slug}` === url);
  if (issue) return { source: "issue" as const, linkedValue: issue._id };

  const category = categories.find(
    (item) => `/editorial-board#${slugify(item.name)}` === url
  );
  if (category) {
    return {
      source: "editorial" as const,
      linkedValue: getEditorialRoleId(category),
    };
  }

  const siteDestination = siteDestinations.find((item) => item.url === url);
  if (siteDestination) {
    return { source: "site" as const, linkedValue: siteDestination.id };
  }

  return { source: "custom" as const, linkedValue: "" };
};

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [editorialCategories, setEditorialCategories] = useState<
    EditorialCategorySetting[]
  >([]);
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<MenuLocation | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [menuData, pageData, issueData, editorialConfig] = await Promise.all([
        getAdminMenus({ location: "all" }),
        getAdminPages(),
        getAdminIssues(),
        getAdminEditorialBoardConfig(),
      ]);
      setMenus(menuData);
      setPages(pageData);
      setIssues(issueData);
      setEditorialCategories(editorialConfig.categories || []);
    } catch {
      setMessage("Failed to load navbar builder data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const parents = useMemo(
    () => menus.filter((menu) => menu.type === "dropdown" && menu._id !== editingId),
    [menus, editingId]
  );

  const visibleMenus = useMemo(() => {
    if (locationFilter === "all") return menus;

    const matchingItems = menus.filter(
      (menu) => menu.location === locationFilter
    );
    const requiredParentIds = new Set(
      matchingItems.map(getParentId).filter(Boolean)
    );

    return menus.filter(
      (menu) =>
        menu.location === locationFilter || requiredParentIds.has(menu._id)
    );
  }, [menus, locationFilter]);

  const roots = useMemo(
    () =>
      visibleMenus
        .filter((menu) => !getParentId(menu))
        .sort((a, b) => a.location.localeCompare(b.location) || a.order - b.order),
    [visibleMenus]
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    visibleMenus.forEach((menu) => {
      const parentId = getParentId(menu);
      if (!parentId) return;
      const list = map.get(parentId) || [];
      list.push(menu);
      map.set(parentId, list);
    });
    map.forEach((list) => list.sort((a, b) => a.order - b.order));
    return map;
  }, [visibleMenus]);


  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const scrollToForm = () => {
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const selectLinkSource = (source: LinkSource) => {
    setForm((prev) => ({
      ...prev,
      source,
      linkedValue: "",
      ...(source === "custom" ? {} : { isExternal: false }),
    }));
  };

  const applyLinkedContent = (source: LinkSource, linkedValue: string) => {
    if (!linkedValue) {
      selectLinkSource(source);
      return;
    }

    if (source === "page") {
      const page = pages.find((item) => item._id === linkedValue);
      if (!page) return;
      setForm((prev) => ({
        ...prev,
        source,
        linkedValue,
        label: page.title,
        url: getPageUrl(page),
        location: prev.parentId ? prev.location : getPageMenuLocation(page),
        isExternal: false,
      }));
      return;
    }

    if (source === "issue") {
      const issue = issues.find((item) => item._id === linkedValue);
      if (!issue) return;
      setForm((prev) => ({
        ...prev,
        source,
        linkedValue,
        label: issue.title,
        url: `/issues/${issue.slug}`,
        location: prev.parentId ? prev.location : "issues",
        isExternal: false,
      }));
      return;
    }

    if (source === "editorial") {
      const category = editorialCategories.find(
        (item) => getEditorialRoleId(item) === linkedValue
      );
      if (!category) return;
      setForm((prev) => ({
        ...prev,
        source,
        linkedValue,
        label: category.name,
        url: `/editorial-board#${slugify(category.name)}`,
        location: prev.parentId ? prev.location : "editorial-board",
        isExternal: false,
      }));
      return;
    }

    if (source === "site") {
      const destination = siteDestinations.find((item) => item.id === linkedValue);
      if (!destination) return;
      setForm((prev) => ({
        ...prev,
        source,
        linkedValue,
        label: destination.label,
        url: destination.url,
        location: prev.parentId ? prev.location : destination.location,
        isExternal: false,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, source, linkedValue: "" }));
  };

  const handleEdit = (menu: MenuItem) => {
    const inferred = inferSource(
      menu.url || "",
      pages,
      issues,
      editorialCategories
    );
    setEditingId(menu._id);
    setForm({
      label: menu.label,
      type: menu.type,
      source: menu.type === "dropdown" ? "custom" : inferred.source,
      linkedValue: inferred.linkedValue,
      url: menu.url || "",
      parentId: getParentId(menu),
      location: menu.location,
      isExternal: menu.isExternal,
      openInNewTab: menu.openInNewTab,
      isActive: menu.isActive,
    });
    setMessage("");
    scrollToForm();
  };

  const handleParentChange = (parentId: string) => {
    const parent = menus.find((menu) => menu._id === parentId);
    setForm((prev) => ({
      ...prev,
      parentId,
      location: parent ? getChildLocationForParent(parent) : prev.location,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.label.trim()) {
      setMessage("Menu label is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const payload: MenuPayload = {
        label: form.label.trim(),
        type: form.type,
        url: form.type === "dropdown" ? form.url.trim() : form.url.trim(),
        parentId: form.parentId || null,
        location: form.location,
        isExternal: form.isExternal,
        openInNewTab: form.openInNewTab,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateAdminMenu(editingId, payload);
        setMessage("Menu item updated successfully.");
      } else {
        await createAdminMenu(payload);
        setMessage("Menu item created successfully.");
      }

      resetForm();
      await fetchAll();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to save menu item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menu: MenuItem) => {
    if (!window.confirm(`Delete "${menu.label}"?`)) return;
    try {
      await deleteAdminMenu(menu._id);
      setMessage("Menu item deleted successfully.");
      if (editingId === menu._id) resetForm();
      await fetchAll();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to delete menu item.");
    }
  };

  const toggleStatus = async (menu: MenuItem) => {
    try {
      await updateAdminMenu(menu._id, {
        label: menu.label,
        location: menu.location,
        type: menu.type,
        url: menu.url,
        parentId: getParentId(menu) || null,
        isExternal: menu.isExternal,
        openInNewTab: menu.openInNewTab,
        isActive: !menu.isActive,
      });
      await fetchAll();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDrop = async (target: MenuItem) => {
    if (!draggingId || draggingId === target._id) return;
    const source = menus.find((menu) => menu._id === draggingId);
    if (!source) return;

    const sourceParent = getParentId(source);
    const targetParent = getParentId(target);
    if (source.location !== target.location || sourceParent !== targetParent) {
      setMessage("Drag-and-drop reordering works among items in the same parent menu. Use Edit to change a parent.");
      setDraggingId(null);
      return;
    }

    const siblings = menus
      .filter(
        (menu) =>
          menu.location === target.location && getParentId(menu) === targetParent
      )
      .sort((a, b) => a.order - b.order);
    const sourceIndex = siblings.findIndex((menu) => menu._id === source._id);
    const targetIndex = siblings.findIndex((menu) => menu._id === target._id);
    const next = [...siblings];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);

    try {
      await reorderAdminMenus({
        location: target.location,
        parentId: targetParent || null,
        orderedIds: next.map((menu) => menu._id),
      });
      setMessage("Menu order updated successfully.");
      await fetchAll();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to reorder menu items.");
    } finally {
      setDraggingId(null);
    }
  };

  const renderMenuRow = (menu: MenuItem, depth = 0) => (
    <div
      key={menu._id}
      draggable
      onDragStart={() => setDraggingId(menu._id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => handleDrop(menu)}
      onDragEnd={() => setDraggingId(null)}
      className={[
        "rounded-2xl border bg-slate-50 p-4 transition",
        draggingId === menu._id
          ? "border-[#005A78] opacity-60 ring-2 ring-[#005A78]/10"
          : "border-slate-200 hover:bg-white",
      ].join(" ")}
      style={{ marginLeft: depth ? `${Math.min(depth * 28, 84)}px` : undefined }}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <GripVertical className="shrink-0 cursor-grab text-slate-400" size={18} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-950">{menu.label}</h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-slate-600">
                {menu.type}
              </span>
              <button
                type="button"
                onClick={() => toggleStatus(menu)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  menu.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {menu.isActive ? "Active" : "Inactive"}
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {getLocationLabel(menu.location)} · {menu.url || "Dropdown parent"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {menu.url && (
            <a
              href={menu.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              <ExternalLink size={14} /> View
            </a>
          )}
          <button
            type="button"
            onClick={() => handleEdit(menu)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            <Edit size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(menu)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">Navbar Control</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Connected Navbar Builder</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Link menu items directly to existing pages or issues, edit dropdown parents, change placement, and drag sibling items into the correct order.
          </p>
        </div>

        {message && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="scroll-mt-24 self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {editingId ? "Edit Menu Item" : "Create Menu Item"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Parent items and child links use the same form.
                </p>
              </div>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 p-2 text-slate-500">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Menu Type</label>
                <select
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value as MenuItemType;
                    setForm((prev) => ({
                      ...prev,
                      type,
                      parentId: type === "dropdown" ? "" : prev.parentId,
                      location: type === "dropdown" ? "main" : prev.location,
                      source: type === "dropdown" ? "custom" : prev.source,
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                >
                  <option value="link">Standard Link</option>
                  <option value="dropdown">Dropdown Parent</option>
                  <option value="button">Button Link</option>
                </select>
              </div>

              {form.type !== "dropdown" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Connect To</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {linkSourceOptions.map((source) => (
                        <button
                          key={source.value}
                          type="button"
                          onClick={() => selectLinkSource(source.value)}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                            form.source === source.value
                              ? "border-[#005A78] bg-[#005A78]/5 text-[#005A78]"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          {source.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.source === "page" && (
                    <select
                      value={form.linkedValue}
                      onChange={(event) => applyLinkedContent("page", event.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="">Select an existing page...</option>
                      {pages.map((page) => (
                        <option key={page._id} value={page._id}>
                          {page.title} — {page.group}
                        </option>
                      ))}
                    </select>
                  )}

                  {form.source === "issue" && (
                    <select
                      value={form.linkedValue}
                      onChange={(event) => applyLinkedContent("issue", event.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="">Select an existing issue...</option>
                      {issues.map((issue) => (
                        <option key={issue._id} value={issue._id}>{issue.title}</option>
                      ))}
                    </select>
                  )}

                  {form.source === "editorial" && (
                    <select
                      value={form.linkedValue}
                      onChange={(event) =>
                        applyLinkedContent("editorial", event.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="">Select an editorial role...</option>
                      {editorialCategories.map((category) => (
                        <option
                          key={getEditorialRoleId(category)}
                          value={getEditorialRoleId(category)}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {form.source === "site" && (
                    <select
                      value={form.linkedValue}
                      onChange={(event) =>
                        applyLinkedContent("site", event.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                    >
                      <option value="">Select a site section...</option>
                      {siteDestinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.label}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Menu Label</label>
                <input
                  value={form.label}
                  onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                  placeholder="Example: About"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                />
              </div>

              {(form.type === "dropdown" || form.source === "custom") && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    {form.type === "dropdown" ? "Optional Parent Landing URL" : "URL"}
                  </label>
                  <input
                    value={form.url}
                    onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                    placeholder="/about/about-the-journal or https://..."
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                  />
                </div>
              )}

              {form.type !== "dropdown" && form.source !== "custom" && form.url && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                  Connected URL: {form.url}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Parent Menu</label>
                <select
                  value={form.parentId}
                  onChange={(event) => handleParentChange(event.target.value)}
                  disabled={form.type === "dropdown"}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm disabled:bg-slate-100"
                >
                  <option value="">Root menu item</option>
                  {parents.map((parent) => (
                    <option key={parent._id} value={parent._id}>
                      {parent.label} — {getLocationLabel(parent.location)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  Dropdown parents stay at root. Child placement is inherited from the selected parent.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {form.parentId ? "Dropdown Section" : "Menu Location"}
                </label>
                <select
                  value={form.location}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      location: event.target.value as MenuLocation,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                >
                  {formLocations.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  {form.parentId
                    ? "This is selected automatically from the parent, but you can correct the dropdown section when needed."
                    : "Root dropdown parents normally stay in Main Navbar."}
                </p>
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isExternal} onChange={(event) => setForm((prev) => ({ ...prev, isExternal: event.target.checked }))} />
                  External link
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.openInNewTab} onChange={(event) => setForm((prev) => ({ ...prev, openInNewTab: event.target.checked }))} />
                  Open in new tab
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
                  Show on public website
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#005A78] px-5 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : editingId ? <Save size={17} /> : <Plus size={17} />}
                {saving ? "Saving..." : editingId ? "Update Menu Item" : "Create Menu Item"}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Menu Structure</h2>
                <p className="mt-1 text-sm text-slate-500">Drag sibling items to reorder. Child items appear indented below their parent.</p>
              </div>
              <select
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value as MenuLocation | "all")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"
              >
                {locationOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-[#005A78]" /></div>
            ) : roots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">No menu items found.</div>
            ) : (
              <div className="space-y-3">
                {roots.map((root) => (
                  <div key={root._id} className="space-y-3">
                    {renderMenuRow(root)}
                    {(childrenByParent.get(root._id) || []).map((child) => renderMenuRow(child, 1))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
