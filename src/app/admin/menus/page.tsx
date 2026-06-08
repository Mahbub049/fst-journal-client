"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAdminMenu,
  deleteAdminMenu,
  getAdminMenus,
  MenuItem,
  MenuItemType,
  MenuLocation,
  MenuPayload,
  updateAdminMenu,
} from "@/services/menuService";

const locationOptions: { label: string; value: MenuLocation | "all" }[] = [
  { label: "All Locations", value: "all" },
  { label: "Main Navbar", value: "main" },
  { label: "About Dropdown", value: "about" },
  { label: "Issues Dropdown", value: "issues" },
  { label: "For Authors Dropdown", value: "for-authors" },
  { label: "Footer", value: "footer" },
];

const formLocationOptions: { label: string; value: MenuLocation }[] = [
  { label: "Main Navbar", value: "main" },
  { label: "About Dropdown", value: "about" },
  { label: "Issues Dropdown", value: "issues" },
  { label: "For Authors Dropdown", value: "for-authors" },
  { label: "Footer", value: "footer" },
];

const menuTypeOptions: { label: string; value: MenuItemType }[] = [
  { label: "Link", value: "link" },
  { label: "Dropdown Parent", value: "dropdown" },
  { label: "Button", value: "button" },
];

type MenuFormState = {
  label: string;
  location: MenuLocation;
  type: MenuItemType;
  url: string;
  parentId: string;
  isExternal: boolean;
  openInNewTab: boolean;
  order: string;
  isActive: boolean;
};

const emptyForm: MenuFormState = {
  label: "",
  location: "main",
  type: "link",
  url: "",
  parentId: "",
  isExternal: false,
  openInNewTab: false,
  order: "0",
  isActive: true,
};

const getParentId = (menu: MenuItem) => {
  if (!menu.parentId) return "";
  if (typeof menu.parentId === "string") return menu.parentId;
  return menu.parentId._id;
};

const getParentLabel = (menu: MenuItem) => {
  if (!menu.parentId) return "Root";
  if (typeof menu.parentId === "string") return "Parent selected";
  return menu.parentId.label;
};

const getLocationLabel = (location: MenuLocation) => {
  return (
    formLocationOptions.find((item) => item.value === location)?.label ||
    location
  );
};

const getSuggestedLocationForParent = (parent?: MenuItem) => {
  if (!parent) return undefined;

  const label = parent.label.toLowerCase();

  if (label.includes("about")) return "about";
  if (label.includes("issue")) return "issues";
  if (label.includes("author")) return "for-authors";

  return parent.location;
};

const sortMenus = (items: MenuItem[]) => {
  return [...items].sort((a, b) => {
    const orderA = Number(a.order || 0);
    const orderB = Number(b.order || 0);

    if (orderA !== orderB) return orderA - orderB;

    return a.label.localeCompare(b.label);
  });
};

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<MenuLocation | "all">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchMenus = async () => {
    try {
      setLoading(true);

      const [filteredMenus, completeMenus] = await Promise.all([
        getAdminMenus({ location: locationFilter }),
        getAdminMenus({ location: "all" }),
      ]);

      setMenus(sortMenus(filteredMenus));
      setAllMenus(sortMenus(completeMenus));
    } catch (error) {
      setMessage("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationFilter]);

  const parentOptions = useMemo(() => {
    return allMenus.filter((menu) => {
      const isDropdown = menu.type === "dropdown";
      const isNotCurrentItem = editingId ? menu._id !== editingId : true;

      return isDropdown && isNotCurrentItem;
    });
  }, [allMenus, editingId]);

  const selectedParent = useMemo(() => {
    if (!form.parentId) return undefined;
    return allMenus.find((menu) => menu._id === form.parentId);
  }, [allMenus, form.parentId]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingId(menu._id);
    setForm({
      label: menu.label,
      location: menu.location,
      type: menu.type,
      url: menu.url || "",
      parentId: getParentId(menu),
      isExternal: menu.isExternal,
      openInNewTab: menu.openInNewTab,
      order: String(menu.order ?? 0),
      isActive: menu.isActive,
    });
    setMessage("");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleParentChange = (parentId: string) => {
    const parent = allMenus.find((menu) => menu._id === parentId);
    const suggestedLocation = getSuggestedLocationForParent(parent);

    setForm((prev) => ({
      ...prev,
      parentId,
      location: suggestedLocation || prev.location,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload: MenuPayload = {
        label: form.label.trim(),
        location: form.location,
        type: form.type,
        url: form.url.trim(),
        parentId: form.parentId || null,
        isExternal: form.isExternal,
        openInNewTab: form.openInNewTab,
        order: Number(form.order || 0),
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
      await fetchMenus();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to save menu item."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    try {
      await deleteAdminMenu(id);
      setMessage("Menu item deleted successfully.");
      await fetchMenus();

      if (editingId === id) {
        resetForm();
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to delete menu item."
      );
    }
  };

  const handleToggleStatus = async (menu: MenuItem) => {
    try {
      await updateAdminMenu(menu._id, {
        label: menu.label,
        location: menu.location,
        type: menu.type,
        url: menu.url || "",
        parentId: getParentId(menu) || null,
        isExternal: menu.isExternal,
        openInNewTab: menu.openInNewTab,
        order: menu.order,
        isActive: !menu.isActive,
      });

      setMessage(
        !menu.isActive
          ? "Menu item activated successfully."
          : "Menu item hidden from public navbar."
      );
      await fetchMenus();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to update menu status."
      );
    }
  };

  const handleView = (url: string, isExternal: boolean) => {
    if (!url) return;

    if (isExternal) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Navigation Control
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Menu Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Manage public navbar labels, dropdown items, button links,
                display order, and active status from one place.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Active menu items are shown on the public website.
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">
                {editingId ? "Edit Menu Item" : "Create Menu Item"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create main navbar items, dropdown parents, dropdown child links,
                footer links, or button-style links.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Menu Label
                </label>
                <input
                  value={form.label}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      label: event.target.value,
                    }))
                  }
                  placeholder="Example: About, Current Issue"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <select
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        location: event.target.value as MenuLocation,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  >
                    {formLocationOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        type: event.target.value as MenuItemType,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  >
                    {menuTypeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  URL
                </label>
                <input
                  value={form.url}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      url: event.target.value,
                    }))
                  }
                  placeholder={
                    form.type === "dropdown"
                      ? "Optional for dropdown parent"
                      : "Example: /about/about-the-journal"
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  required={form.type !== "dropdown"}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Internal URLs can be written like /about/about-the-journal.
                  External links should start with https://.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Parent Menu
                </label>
                <select
                  value={form.parentId}
                  onChange={(event) => handleParentChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                >
                  <option value="">Root menu item</option>
                  {parentOptions.map((menu) => (
                    <option key={menu._id} value={menu._id}>
                      {menu.label} — {getLocationLabel(menu.location)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  Select a dropdown parent only when this item should appear
                  inside a dropdown.
                </p>
                {selectedParent && (
                  <p className="mt-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                    This item will appear under: {selectedParent.label}
                  </p>
                )}
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
                    checked={form.isExternal}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isExternal: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  External link
                </label>

                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.openInNewTab}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        openInNewTab: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  Open in new tab
                </label>

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
                  Show on public website
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#005A78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#004765] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Menu"
                      : "Create Menu"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Menu Items
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Filter and manage existing menu items.
                </p>
              </div>

              <select
                value={locationFilter}
                onChange={(event) =>
                  setLocationFilter(event.target.value as MenuLocation | "all")
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
              >
                {locationOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                Loading menu items...
              </div>
            ) : menus.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <h3 className="font-bold text-slate-800">
                  No menu items found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create your first menu item using the form.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2">Label</th>
                      <th className="px-4 py-2">Location</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Parent</th>
                      <th className="px-4 py-2">URL</th>
                      <th className="px-4 py-2">Order</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {menus.map((menu) => (
                      <tr key={menu._id} className="bg-slate-50">
                        <td className="rounded-l-2xl px-4 py-4 font-bold text-slate-900">
                          {menu.label}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {getLocationLabel(menu.location)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-slate-700">
                            {menu.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {getParentLabel(menu)}
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-4 text-slate-600">
                          {menu.url || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {menu.order}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(menu)}
                            className={[
                              "rounded-full px-3 py-1 text-xs font-bold transition",
                              menu.isActive
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100",
                            ].join(" ")}
                          >
                            {menu.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {menu.url && (
                              <button
                                type="button"
                                onClick={() => handleView(menu.url, menu.isExternal)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                              >
                                View
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEdit(menu)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(menu._id)}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
