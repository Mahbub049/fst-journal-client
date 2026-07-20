"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Eye,
  Link2,
  Loader2,
  Save,
  Share2,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAdminSiteSettings,
  AnnouncementItem,
  SiteSettingsContent,
  SocialLink,
  updateAdminSiteSettings,
  UsefulLink,
} from "@/services/siteSettingsService";

const emptySettings: SiteSettingsContent = {
  footerJournalTitle: "Journal of FST",
  footerJournalSubtitle: "Bangladesh University of Professionals",
  footerDescription:
    "A scholarly journal platform dedicated to publishing quality research in science, technology, engineering, and related interdisciplinary fields.",
  publisherLabel: "Publisher",
  publisherName: "Faculty of Science & Technology, BUP",
  contactEmail: "journal.fst@bup.edu.bd",
  contactPhone: "",
  address:
    "Bangladesh University of Professionals, Mirpur Cantonment, Dhaka - 1216",
  copyrightText: "Copyright © 2026 Journal of FST. All rights reserved.",
  footerCreditText: "Designed for academic publishing and research visibility.",
  footerCreditUrl: "",

  journalInfoTitle: "Journal Information",
  publishingModel: "Hybrid",
  language: "English",
  publicationFrequency: "Annual",

  announcementItems: [
    {
      text: "Welcome to the official website of Journal of FST",
      url: "",
      order: 1,
      isActive: true,
    },
    {
      text: "Call for Papers is now open",
      url: "/call-for-papers",
      order: 2,
      isActive: true,
    },
    {
      text: "Submit your research manuscript through the online submission system",
      url: "/submit-manuscript-portal",
      order: 3,
      isActive: true,
    },
    {
      text: "Explore current and archived issues of the journal",
      url: "/issues/archive",
      order: 4,
      isActive: true,
    },
  ],
  announcementSpeedSeconds: 100,
  announcementGapPixels: 120,

  usefulLinks: [],
  socialLinks: [],

  isPublished: true,
};

const createAnnouncementItem = (order: number): AnnouncementItem => ({
  text: "",
  url: "",
  order,
  isActive: true,
});

const createUsefulLink = (order: number): UsefulLink => ({
  label: "",
  url: "",
  group: "Journal",
  order,
  isActive: true,
});

const createSocialLink = (order: number): SocialLink => ({
  platform: "",
  url: "",
  order,
  isActive: true,
});

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteSettingsContent>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const data = await getAdminSiteSettings();

      setForm({
        ...emptySettings,
        ...data,
        announcementItems: data.announcementItems || emptySettings.announcementItems,
        announcementSpeedSeconds:
          data.announcementSpeedSeconds ?? emptySettings.announcementSpeedSeconds,
        announcementGapPixels:
          data.announcementGapPixels ?? emptySettings.announcementGapPixels,
        usefulLinks: data.usefulLinks || [],
        socialLinks: data.socialLinks || [],
      });
    } catch {
      setMessage("Failed to load site settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateField = <K extends keyof SiteSettingsContent>(
    field: K,
    value: SiteSettingsContent[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAnnouncementItem = (
    index: number,
    field: keyof AnnouncementItem,
    value: any
  ) => {
    const updated = [...form.announcementItems];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("announcementItems", updated);
  };

  const addAnnouncementItem = () => {
    updateField("announcementItems", [
      ...form.announcementItems,
      createAnnouncementItem(form.announcementItems.length + 1),
    ]);
  };

  const removeAnnouncementItem = (index: number) => {
    updateField(
      "announcementItems",
      form.announcementItems
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        }))
    );
  };

  const updateUsefulLink = (
    index: number,
    field: keyof UsefulLink,
    value: any
  ) => {
    const updated = [...form.usefulLinks];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("usefulLinks", updated);
  };

  const addUsefulLink = () => {
    updateField("usefulLinks", [
      ...form.usefulLinks,
      createUsefulLink(form.usefulLinks.length + 1),
    ]);
  };

  const removeUsefulLink = (index: number) => {
    updateField(
      "usefulLinks",
      form.usefulLinks
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        }))
    );
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: any
  ) => {
    const updated = [...form.socialLinks];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField("socialLinks", updated);
  };

  const addSocialLink = () => {
    updateField("socialLinks", [
      ...form.socialLinks,
      createSocialLink(form.socialLinks.length + 1),
    ]);
  };

  const removeSocialLink = (index: number) => {
    updateField(
      "socialLinks",
      form.socialLinks
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        }))
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload: SiteSettingsContent = {
        ...form,
        announcementItems: form.announcementItems.map((item, index) => ({
          ...item,
          text: item.text.trim(),
          url: item.url?.trim() || "",
          order: index + 1,
        })),
        announcementSpeedSeconds: Math.min(
          Math.max(Number(form.announcementSpeedSeconds) || 100, 10),
          300
        ),
        announcementGapPixels: Math.min(
          Math.max(Number(form.announcementGapPixels) || 120, 24),
          480
        ),
        usefulLinks: form.usefulLinks.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
        socialLinks: form.socialLinks.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
      };

      const updated = await updateAdminSiteSettings(payload);

      setForm({
        ...emptySettings,
        ...updated,
        announcementItems: updated.announcementItems || emptySettings.announcementItems,
        announcementSpeedSeconds:
          updated.announcementSpeedSeconds ?? emptySettings.announcementSpeedSeconds,
        announcementGapPixels:
          updated.announcementGapPixels ?? emptySettings.announcementGapPixels,
        usefulLinks: updated.usefulLinks || [],
        socialLinks: updated.socialLinks || [],
      });

      setMessage("Site settings updated successfully.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to update site settings."
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
                Site Settings
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Website Settings CMS
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Manage the announcement ticker, public footer identity, publisher block, grouped links, contact details, and copyright text.
              </p>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#005A78] hover:text-[#005A78]"
            >
              <Eye className="h-4 w-4" />
              View Public Site
            </a>
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
              Loading site settings...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Journal Announcement
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Control the scrolling announcement text, speed, and optional links shown between the journal hero and the navbar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addAnnouncementItem}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Link2 className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Marquee Speed <span className="font-normal text-slate-400">(seconds)</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={form.announcementSpeedSeconds}
                    onChange={(event) =>
                      updateField(
                        "announcementSpeedSeconds",
                        Number(event.target.value) as SiteSettingsContent["announcementSpeedSeconds"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Lower value moves faster. Higher value moves slower. Recommended range: 60–140 seconds.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Minimum Gap Between Texts <span className="font-normal text-slate-400">(pixels)</span>
                  </label>
                  <input
                    type="number"
                    min={24}
                    max={480}
                    value={form.announcementGapPixels}
                    onChange={(event) =>
                      updateField(
                        "announcementGapPixels",
                        Number(event.target.value) as SiteSettingsContent["announcementGapPixels"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Controls the spacing between announcements. Short lists are also distributed across the full screen, such as left, center, and right.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {form.announcementItems.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr_auto]">
                      <input
                        value={item.text}
                        onChange={(event) =>
                          updateAnnouncementItem(index, "text", event.target.value)
                        }
                        placeholder="Example: Call for Papers is now open"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={item.url || ""}
                        onChange={(event) =>
                          updateAnnouncementItem(index, "url", event.target.value)
                        }
                        placeholder="Optional link: /call-for-papers"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeAnnouncementItem(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                        aria-label="Remove announcement text"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(event) =>
                          updateAnnouncementItem(
                            index,
                            "isActive",
                            event.target.checked
                          )
                        }
                      />
                      Active
                    </label>
                  </div>
                ))}

                {!form.announcementItems.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                    No announcement text added. Add at least one active text to show the scrolling announcement bar.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Footer Identity
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Footer Journal Title
                  </label>
                  <input
                    value={form.footerJournalTitle}
                    onChange={(event) =>
                      updateField("footerJournalTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Footer Subtitle
                  </label>
                  <input
                    value={form.footerJournalSubtitle}
                    onChange={(event) =>
                      updateField("footerJournalSubtitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Footer Description
                  </label>
                  <textarea
                    value={form.footerDescription}
                    onChange={(event) =>
                      updateField("footerDescription", event.target.value)
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Publisher Label
                  </label>
                  <input
                    value={form.publisherLabel}
                    onChange={(event) =>
                      updateField("publisherLabel", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Publisher Name
                  </label>
                  <input
                    value={form.publisherName}
                    onChange={(event) =>
                      updateField("publisherName", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Contact & Copyright Information
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      updateField("contactEmail", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Contact Phone
                  </label>
                  <input
                    value={form.contactPhone}
                    onChange={(event) =>
                      updateField("contactPhone", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Copyright Text
                  </label>
                  <input
                    value={form.copyrightText}
                    onChange={(event) =>
                      updateField("copyrightText", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Footer Credit Text
                  </label>
                  <input
                    value={form.footerCreditText}
                    onChange={(event) =>
                      updateField("footerCreditText", event.target.value)
                    }
                    placeholder="Example: Developed By: Mahbub Sarwar"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Footer Credit Link <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    value={form.footerCreditUrl || ""}
                    onChange={(event) =>
                      updateField("footerCreditUrl", event.target.value)
                    }
                    placeholder="Example: https://developer-portfolio.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    If this field is filled, the footer credit text will become clickable on the public footer.
                  </p>
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
                    Visible through public API
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Journal Information
              </h2>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Journal Info Title
                  </label>
                  <input
                    value={form.journalInfoTitle}
                    onChange={(event) =>
                      updateField("journalInfoTitle", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Language
                  </label>
                  <input
                    value={form.language}
                    onChange={(event) =>
                      updateField("language", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Publication Frequency
                  </label>
                  <input
                    value={form.publicationFrequency}
                    onChange={(event) =>
                      updateField("publicationFrequency", event.target.value)
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
                    Footer Links
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Group links by Journal, For Authors, Browse, or any custom
                    footer column name.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addUsefulLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Link2 className="h-4 w-4" />
                  Add Link
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {form.usefulLinks.map((link, index) => (
                  <div
                    key={link._id || index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr_180px_auto]">
                      <input
                        value={link.label}
                        onChange={(event) =>
                          updateUsefulLink(index, "label", event.target.value)
                        }
                        placeholder="Label"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={link.url}
                        onChange={(event) =>
                          updateUsefulLink(index, "url", event.target.value)
                        }
                        placeholder="/about/about-the-journal"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={link.group}
                        onChange={(event) =>
                          updateUsefulLink(index, "group", event.target.value)
                        }
                        placeholder="Journal"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeUsefulLink(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                        aria-label="Remove link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={link.isActive}
                        onChange={(event) =>
                          updateUsefulLink(
                            index,
                            "isActive",
                            event.target.checked
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Social Links
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Optional social media or external links. These appear only if
                    active links are added.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A78] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Share2 className="h-4 w-4" />
                  Add Social
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {form.socialLinks.map((link, index) => (
                  <div
                    key={link._id || index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr_auto]">
                      <input
                        value={link.platform}
                        onChange={(event) =>
                          updateSocialLink(
                            index,
                            "platform",
                            event.target.value
                          )
                        }
                        placeholder="Facebook, LinkedIn, Website"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <input
                        value={link.url}
                        onChange={(event) =>
                          updateSocialLink(index, "url", event.target.value)
                        }
                        placeholder="https://..."
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
                      />

                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                        aria-label="Remove social link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={link.isActive}
                        onChange={(event) =>
                          updateSocialLink(
                            index,
                            "isActive",
                            event.target.checked
                          )
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
                {saving ? "Saving..." : "Save Site Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
