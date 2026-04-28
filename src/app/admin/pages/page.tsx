"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  FileText,
  ImageIcon,
  LinkIcon,
  List,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  CmsPage,
  ContentBlock,
  ContentBlockType,
  createAdminPage,
  deleteAdminPage,
  getAdminPages,
  PageGroup,
  PagePayload,
  updateAdminPage,
} from "@/services/pageService";

const pageGroups: { label: string; value: PageGroup | "" }[] = [
  { label: "All Groups", value: "" },
  { label: "About", value: "about" },
  { label: "For Authors", value: "for-authors" },
  { label: "Issues", value: "issues" },
  { label: "Custom", value: "custom" },
];

const blockTypes: { label: string; value: ContentBlockType }[] = [
  { label: "Heading", value: "heading" },
  { label: "Paragraph", value: "paragraph" },
  { label: "List", value: "list" },
  { label: "Card", value: "card" },
  { label: "Image", value: "image" },
  { label: "PDF", value: "pdf" },
  { label: "Button", value: "button" },
];

const emptyForm: PagePayload = {
  title: "",
  slug: "",
  group: "about",
  subtitle: "",
  bannerImage: "",
  shortDescription: "",
  contentBlocks: [],
  buttonLabel: "",
  buttonUrl: "",
  metaTitle: "",
  metaDescription: "",
  order: 0,
  isPublished: true,
};

const createEmptyBlock = (type: ContentBlockType, order: number): ContentBlock => {
  return {
    type,
    title: "",
    content: "",
    items: [],
    imageUrl: "",
    fileUrl: "",
    buttonLabel: "",
    buttonUrl: "",
    order,
    isActive: true,
  };
};

const groupLabel = (group: string) => {
  if (group === "for-authors") return "For Authors";
  if (group === "about") return "About";
  if (group === "issues") return "Issues";
  return "Custom";
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [form, setForm] = useState<PagePayload>(emptyForm);
  const [message, setMessage] = useState("");

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await getAdminPages(selectedGroup);
      setPages(data);
    } catch {
      setMessage("Failed to load pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [selectedGroup]);

  const sortedBlocks = useMemo(() => {
    return [...form.contentBlocks].sort((a, b) => a.order - b.order);
  }, [form.contentBlocks]);

  const openCreateForm = () => {
    setEditingPage(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    setMessage("");
  };

  const openEditForm = (page: CmsPage) => {
    setEditingPage(page);
    setForm({
      title: page.title || "",
      slug: page.slug || "",
      group: page.group,
      subtitle: page.subtitle || "",
      bannerImage: page.bannerImage || "",
      shortDescription: page.shortDescription || "",
      contentBlocks: page.contentBlocks || [],
      buttonLabel: page.buttonLabel || "",
      buttonUrl: page.buttonUrl || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      order: page.order || 0,
      isPublished: page.isPublished,
    });
    setIsFormOpen(true);
    setMessage("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPage(null);
    setForm(emptyForm);
  };

  const updateField = (field: keyof PagePayload, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addBlock = (type: ContentBlockType) => {
    const nextOrder = form.contentBlocks.length + 1;

    setForm((prev) => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, createEmptyBlock(type, nextOrder)],
    }));
  };

  const updateBlock = (
    index: number,
    field: keyof ContentBlock,
    value: any
  ) => {
    const updatedBlocks = [...form.contentBlocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      [field]: value,
    };

    setForm((prev) => ({
      ...prev,
      contentBlocks: updatedBlocks,
    }));
  };

  const removeBlock = (index: number) => {
    const updatedBlocks = form.contentBlocks.filter((_, itemIndex) => {
      return itemIndex !== index;
    });

    setForm((prev) => ({
      ...prev,
      contentBlocks: updatedBlocks.map((block, itemIndex) => ({
        ...block,
        order: itemIndex + 1,
      })),
    }));
  };

  const handleListItemsChange = (index: number, value: string) => {
    const items = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    updateBlock(index, "items", items);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Page title is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload: PagePayload = {
        ...form,
        contentBlocks: form.contentBlocks.map((block, index) => ({
          ...block,
          order: index + 1,
        })),
      };

      if (editingPage) {
        await updateAdminPage(editingPage._id, payload);
        setMessage("Page updated successfully.");
      } else {
        await createAdminPage(payload);
        setMessage("Page created successfully.");
      }

      await fetchPages();
      closeForm();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to save page."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: CmsPage) => {
    const confirmed = window.confirm(
      `Delete "${page.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteAdminPage(page._id);
      setMessage("Page deleted successfully.");
      await fetchPages();
    } catch {
      setMessage("Failed to delete page.");
    }
  };

  const togglePublish = async (page: CmsPage) => {
    try {
      await updateAdminPage(page._id, {
        title: page.title,
        slug: page.slug,
        group: page.group,
        subtitle: page.subtitle,
        bannerImage: page.bannerImage,
        shortDescription: page.shortDescription,
        contentBlocks: page.contentBlocks,
        buttonLabel: page.buttonLabel,
        buttonUrl: page.buttonUrl,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        order: page.order,
        isPublished: !page.isPublished,
      });

      setMessage(
        !page.isPublished
          ? "Page published successfully."
          : "Page unpublished successfully."
      );

      await fetchPages();
    } catch {
      setMessage("Failed to update publish status.");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005A78]">
              Dynamic Pages CMS
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Pages Management
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Manage About pages, For Authors pages, issue-related pages, and
              custom content pages. You can add text, lists, cards, images, PDFs,
              and buttons.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#005A78] px-5 text-sm font-bold text-white transition hover:bg-[#00465d]"
          >
            <Plus size={18} />
            Add Page
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">All Pages</h2>
          <p className="text-sm text-slate-500">
            Filter pages by section group.
          </p>
        </div>

        <select
          value={selectedGroup}
          onChange={(event) => setSelectedGroup(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#005A78]"
        >
          {pageGroups.map((item) => (
            <option key={item.label} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {isFormOpen && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                {editingPage ? "Edit Page" : "Create New Page"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add content blocks and connect images/PDFs by pasting URLs from
                the media library.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Page Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Example: About the Journal"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => updateField("slug", event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="about-the-journal"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Group
                </label>
                <select
                  value={form.group}
                  onChange={(event) =>
                    updateField("group", event.target.value as PageGroup)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                >
                  <option value="about">About</option>
                  <option value="for-authors">For Authors</option>
                  <option value="issues">Issues</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(event) =>
                    updateField("order", Number(event.target.value))
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(event) =>
                    updateField("subtitle", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Short subtitle for the page"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Banner Image URL
                </label>
                <input
                  type="text"
                  value={form.bannerImage}
                  onChange={(event) =>
                    updateField("bannerImage", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Paste image URL from media library"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Short Description
                </label>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) =>
                    updateField("shortDescription", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Short summary of this page"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">
                    Content Blocks
                  </h3>
                  <p className="text-sm text-slate-500">
                    Add headings, paragraphs, lists, cards, images, PDFs, or
                    buttons.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {blockTypes.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => addBlock(item.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#005A78] hover:text-[#005A78]"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {sortedBlocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <FileText className="mx-auto text-slate-400" size={34} />
                  <h4 className="mt-3 text-lg font-bold text-slate-800">
                    No content blocks added
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Add your first block using the buttons above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.contentBlocks.map((block, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005A78]/10 text-[#005A78]">
                            {block.type === "image" ? (
                              <ImageIcon size={18} />
                            ) : block.type === "button" ? (
                              <LinkIcon size={18} />
                            ) : block.type === "list" ? (
                              <List size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">
                              {block.type} block
                            </h4>
                            <p className="text-xs text-slate-500">
                              Block #{index + 1}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeBlock(index)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            Block Title
                          </label>
                          <input
                            type="text"
                            value={block.title || ""}
                            onChange={(event) =>
                              updateBlock(index, "title", event.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                            placeholder="Optional title"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            Order
                          </label>
                          <input
                            type="number"
                            value={block.order}
                            onChange={(event) =>
                              updateBlock(
                                index,
                                "order",
                                Number(event.target.value)
                              )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                          />
                        </div>

                        {(block.type === "paragraph" ||
                          block.type === "heading" ||
                          block.type === "card") && (
                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                              Content
                            </label>
                            <textarea
                              value={block.content || ""}
                              onChange={(event) =>
                                updateBlock(
                                  index,
                                  "content",
                                  event.target.value
                                )
                              }
                              rows={4}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                              placeholder="Write content here"
                            />
                          </div>
                        )}

                        {block.type === "list" && (
                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                              List Items
                            </label>
                            <textarea
                              value={(block.items || []).join("\n")}
                              onChange={(event) =>
                                handleListItemsChange(index, event.target.value)
                              }
                              rows={5}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                              placeholder={"Write one item per line"}
                            />
                          </div>
                        )}

                        {block.type === "image" && (
                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                              Image URL
                            </label>
                            <input
                              type="text"
                              value={block.imageUrl || ""}
                              onChange={(event) =>
                                updateBlock(
                                  index,
                                  "imageUrl",
                                  event.target.value
                                )
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                              placeholder="Paste image URL from Media Library"
                            />
                          </div>
                        )}

                        {block.type === "pdf" && (
                          <div className="lg:col-span-2">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                              PDF / File URL
                            </label>
                            <input
                              type="text"
                              value={block.fileUrl || ""}
                              onChange={(event) =>
                                updateBlock(
                                  index,
                                  "fileUrl",
                                  event.target.value
                                )
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                              placeholder="Paste PDF URL from Media Library"
                            />
                          </div>
                        )}

                        {block.type === "button" && (
                          <>
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                Button Label
                              </label>
                              <input
                                type="text"
                                value={block.buttonLabel || ""}
                                onChange={(event) =>
                                  updateBlock(
                                    index,
                                    "buttonLabel",
                                    event.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                                placeholder="Download Template"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                Button URL
                              </label>
                              <input
                                type="text"
                                value={block.buttonUrl || ""}
                                onChange={(event) =>
                                  updateBlock(
                                    index,
                                    "buttonUrl",
                                    event.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#005A78]"
                                placeholder="https://..."
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Main Button Label
                </label>
                <input
                  type="text"
                  value={form.buttonLabel}
                  onChange={(event) =>
                    updateField("buttonLabel", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Optional page button label"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Main Button URL
                </label>
                <input
                  type="text"
                  value={form.buttonUrl}
                  onChange={(event) =>
                    updateField("buttonUrl", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Optional button link"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(event) =>
                    updateField("metaTitle", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Meta Description
                </label>
                <input
                  type="text"
                  value={form.metaDescription}
                  onChange={(event) =>
                    updateField("metaDescription", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) =>
                    updateField("isPublished", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#005A78]"
                />
                Publish this page
              </label>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#005A78] px-6 text-sm font-bold text-white transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {editingPage ? "Update Page" : "Create Page"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-[#005A78]" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Loading pages...
              </p>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <FileText className="mx-auto text-slate-400" size={38} />
            <h3 className="mt-4 text-lg font-bold text-slate-800">
              No pages found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create your first dynamic page.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Page
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Group
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Slug
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Blocks
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {pages.map((page) => (
                    <tr key={page._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-950">
                            {page.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {page.subtitle || "No subtitle"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#005A78]/10 px-3 py-1 text-xs font-bold text-[#005A78]">
                          {groupLabel(page.group)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {page.slug}
                        </code>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {page.contentBlocks?.length || 0}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => togglePublish(page)}
                          className={[
                            "rounded-full px-3 py-1 text-xs font-bold",
                            page.isPublished
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(page)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Edit size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(page)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}