"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAdminHomepage,
  HomepageButton,
  HomepageContent,
  HomepageInfoItem,
  HomepageMetric,
  updateAdminHomepage,
} from "@/services/homepageService";
import { uploadMedia } from "@/services/mediaService";

const emptyHomepage: HomepageContent = {
  heroTitle: "",
  heroSubtitle: "",
  journalCoverImage: "",
  publishingModel: "",
  issnPrint: "",
  issnOnline: "",

  metrics: [],

  overviewTitle: "",
  overviewContent: "",

  journalInfoTitle: "",
  journalInfoItems: [],

  executiveEditorsTitle: "",
  executiveEditorsSubtitle: "",

  articlesSectionTitle: "",
  articlesSectionSubtitle: "",

  recentIssuesTitle: "",
  recentIssuesSubtitle: "",

  buttons: [],

  isPublished: true,
};

const createMetric = (order: number): HomepageMetric => ({
  label: "",
  value: "",
  description: "",
  order,
  isActive: true,
});

const createInfoItem = (order: number): HomepageInfoItem => ({
  label: "",
  value: "",
  order,
  isActive: true,
});

const createButton = (order: number): HomepageButton => ({
  label: "",
  url: "",
  variant: "primary",
  order,
  isActive: true,
});

export default function AdminHomepagePage() {
  const [form, setForm] = useState<HomepageContent>(emptyHomepage);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [coverUploadMessage, setCoverUploadMessage] = useState("");

  const fetchHomepage = async () => {
    try {
      setLoading(true);
      const data = await getAdminHomepage();

      setForm({
        ...emptyHomepage,
        ...data,
        metrics: data.metrics || [],
        journalInfoItems: data.journalInfoItems || [],
        buttons: data.buttons || [],
      });
    } catch {
      setMessage("Failed to load homepage content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepage();
  }, []);

  const updateField = <K extends keyof HomepageContent>(
    field: K,
    value: HomepageContent[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCoverImageUpload = async (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCoverUploadMessage("Please upload an image file only.");
      return;
    }

    try {
      setCoverUploading(true);
      setCoverUploadMessage("");

      const uploaded = await uploadMedia({
        file,
        title: file.name,
        folder: "homepage",
      });

      updateField("journalCoverImage", uploaded.fileUrl);
      setCoverUploadMessage(
        "Cover image uploaded successfully. Save the homepage content to publish this change.",
      );
    } catch (error: any) {
      setCoverUploadMessage(
        error?.response?.data?.message || "Failed to upload cover image.",
      );
    } finally {
      setCoverUploading(false);
    }
  };

  const updateMetric = (
    index: number,
    field: keyof HomepageMetric,
    value: any,
  ) => {
    const updated = [...form.metrics];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("metrics", updated);
  };

  const addMetric = () => {
    updateField("metrics", [
      ...form.metrics,
      createMetric(form.metrics.length + 1),
    ]);
  };

  const removeMetric = (index: number) => {
    updateField(
      "metrics",
      form.metrics
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        })),
    );
  };

  const updateInfoItem = (
    index: number,
    field: keyof HomepageInfoItem,
    value: any,
  ) => {
    const updated = [...form.journalInfoItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("journalInfoItems", updated);
  };

  const addInfoItem = () => {
    updateField("journalInfoItems", [
      ...form.journalInfoItems,
      createInfoItem(form.journalInfoItems.length + 1),
    ]);
  };

  const removeInfoItem = (index: number) => {
    updateField(
      "journalInfoItems",
      form.journalInfoItems
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        })),
    );
  };

  const updateButton = (
    index: number,
    field: keyof HomepageButton,
    value: any,
  ) => {
    const updated = [...form.buttons];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("buttons", updated);
  };

  const addButton = () => {
    updateField("buttons", [
      ...form.buttons,
      createButton(form.buttons.length + 1),
    ]);
  };

  const removeButton = (index: number) => {
    updateField(
      "buttons",
      form.buttons
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        })),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.heroTitle.trim()) {
      setMessage("Hero title is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload: HomepageContent = {
        ...form,
        metrics: form.metrics.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
        journalInfoItems: form.journalInfoItems.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
        buttons: form.buttons.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
      };

      const updated = await updateAdminHomepage(payload);
      setForm({
        ...emptyHomepage,
        ...updated,
      });

      setMessage("Homepage content updated successfully.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to update homepage content.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005A78]">
                Homepage CMS
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Homepage Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Manage homepage hero, journal cover, ISSN values, metrics,
                overview, journal information, section headings, and homepage
                buttons.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Public homepage updates from this content.
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#005A78]" />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Loading homepage content...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Hero / Header Section
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Hero Title
                  </label>
                  <input
                    value={form.heroTitle}
                    onChange={(event) =>
                      updateField("heroTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Journal Cover Image
                  </label>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <input
                      value={form.journalCoverImage}
                      onChange={(event) =>
                        updateField("journalCoverImage", event.target.value)
                      }
                      placeholder="Paste image URL or upload an image below"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#005A78]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#005A78] transition hover:bg-[#005A78]/5">
                        {coverUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                        {coverUploading ? "Uploading..." : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={coverUploading}
                          onChange={(event) => {
                            handleCoverImageUpload(event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                      </label>

                      {form.journalCoverImage ? (
                        <button
                          type="button"
                          onClick={() => updateField("journalCoverImage", "")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                        >
                          <X className="h-4 w-4" />
                          Clear Image
                        </button>
                      ) : null}
                    </div>

                    {coverUploadMessage ? (
                      <p className="text-xs font-semibold text-slate-600">
                        {coverUploadMessage}
                      </p>
                    ) : null}

                    {form.journalCoverImage ? (
                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <img
                            src={form.journalCoverImage}
                            alt="Journal cover preview"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                          <ImageIcon className="hidden h-5 w-5 text-slate-400" />
                        </div>

                        <div className="min-w-0 text-xs text-slate-500">
                          <p className="font-semibold text-slate-700">
                            Current cover URL
                          </p>
                          <p className="mt-1 break-all leading-5">
                            {form.journalCoverImage}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Hero Subtitle
                  </label>
                  <textarea
                    value={form.heroSubtitle}
                    onChange={(event) =>
                      updateField("heroSubtitle", event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Publishing Model
                  </label>
                  <input
                    value={form.publishingModel}
                    onChange={(event) =>
                      updateField("publishingModel", event.target.value)
                    }
                    placeholder="Open Access"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Published Status
                  </label>
                  <label className="flex min-h-[46px] items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(event) =>
                        updateField("isPublished", event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    Show homepage content through public API
                  </label>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Print ISSN
                  </label>
                  <input
                    value={form.issnPrint}
                    onChange={(event) =>
                      updateField("issnPrint", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Online ISSN
                  </label>
                  <input
                    value={form.issnOnline}
                    onChange={(event) =>
                      updateField("issnOnline", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Metric / Stat Cards
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    These values control the homepage score/stat boxes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addMetric}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Metric
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {form.metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr_auto]">
                      <input
                        value={metric.label}
                        onChange={(event) =>
                          updateMetric(index, "label", event.target.value)
                        }
                        placeholder="Label"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={metric.value}
                        onChange={(event) =>
                          updateMetric(index, "value", event.target.value)
                        }
                        placeholder="Value"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={metric.description || ""}
                        onChange={(event) =>
                          updateMetric(index, "description", event.target.value)
                        }
                        placeholder="Description"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeMetric(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={metric.isActive}
                        onChange={(event) =>
                          updateMetric(index, "isActive", event.target.checked)
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Overview Section
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Overview Title
                  </label>
                  <input
                    value={form.overviewTitle}
                    onChange={(event) =>
                      updateField("overviewTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Overview Content
                  </label>
                  <textarea
                    value={form.overviewContent}
                    onChange={(event) =>
                      updateField("overviewContent", event.target.value)
                    }
                    rows={6}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Journal Information Sidebar
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    These values control the journal information box on the
                    public homepage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addInfoItem}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Info
                </button>
              </div>

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Sidebar Title
                </label>
                <input
                  value={form.journalInfoTitle}
                  onChange={(event) =>
                    updateField("journalInfoTitle", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                />
              </div>

              <div className="mt-5 space-y-4">
                {form.journalInfoItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr_auto]">
                      <input
                        value={item.label}
                        onChange={(event) =>
                          updateInfoItem(index, "label", event.target.value)
                        }
                        placeholder="Label"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={item.value}
                        onChange={(event) =>
                          updateInfoItem(index, "value", event.target.value)
                        }
                        placeholder="Value"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeInfoItem(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(event) =>
                          updateInfoItem(
                            index,
                            "isActive",
                            event.target.checked,
                          )
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Homepage Section Headings
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Executive Editors Title
                  </label>
                  <input
                    value={form.executiveEditorsTitle}
                    onChange={(event) =>
                      updateField("executiveEditorsTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Executive Editors Subtitle
                  </label>
                  <input
                    value={form.executiveEditorsSubtitle}
                    onChange={(event) =>
                      updateField(
                        "executiveEditorsSubtitle",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Articles Section Title
                  </label>
                  <input
                    value={form.articlesSectionTitle}
                    onChange={(event) =>
                      updateField("articlesSectionTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Articles Section Subtitle
                  </label>
                  <input
                    value={form.articlesSectionSubtitle}
                    onChange={(event) =>
                      updateField("articlesSectionSubtitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Recent Issues Title
                  </label>
                  <input
                    value={form.recentIssuesTitle}
                    onChange={(event) =>
                      updateField("recentIssuesTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Recent Issues Subtitle
                  </label>
                  <input
                    value={form.recentIssuesSubtitle}
                    onChange={(event) =>
                      updateField("recentIssuesSubtitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Homepage Buttons
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    These buttons control homepage action links.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addButton}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Button
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {form.buttons.map((button, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr_180px_auto]">
                      <input
                        value={button.label}
                        onChange={(event) =>
                          updateButton(index, "label", event.target.value)
                        }
                        placeholder="Button Label"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={button.url}
                        onChange={(event) =>
                          updateButton(index, "url", event.target.value)
                        }
                        placeholder="/issues/current"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <select
                        value={button.variant}
                        onChange={(event) =>
                          updateButton(
                            index,
                            "variant",
                            event.target.value as "primary" | "secondary",
                          )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => removeButton(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={button.isActive}
                        onChange={(event) =>
                          updateButton(index, "isActive", event.target.checked)
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <div className="sticky bottom-4 z-10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#005A78] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-[#004765] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Homepage Content"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
