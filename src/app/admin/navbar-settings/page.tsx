"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ExternalLink, Globe2, Loader2, Save } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAdminNavbarLegacyLinkSettings,
  NavbarLegacyLinkPosition,
  NavbarLegacyLinkSettings,
  updateAdminNavbarLegacyLinkSettings,
} from "@/services/navbarLegacyLinkService";

const defaultSettings: NavbarLegacyLinkSettings = {
  enabled: true,
  label: "Old JFST Website",
  url: "https://jfst.bup.edu.bd/index.php/jfst",
  position: "between-search-submit",
  openInNewTab: true,
};

const positionOptions: {
  value: NavbarLegacyLinkPosition;
  label: string;
  description: string;
}[] = [
  {
    value: "before-search",
    label: "Left of Search",
    description: "Old website button → Search → Submit Manuscript",
  },
  {
    value: "between-search-submit",
    label: "Between Search and Submit Manuscript",
    description: "Search → Old website button → Submit Manuscript",
  },
  {
    value: "after-submit",
    label: "Right of Submit Manuscript",
    description: "Search → Submit Manuscript → Old website button",
  },
];

export default function AdminNavbarSettingsPage() {
  const [form, setForm] = useState<NavbarLegacyLinkSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getAdminNavbarLegacyLinkSettings();

        if (mounted) {
          setForm({ ...defaultSettings, ...data });
        }
      } catch (error: any) {
        if (mounted) {
          setMessage(
            error?.response?.data?.message ||
              "Failed to load old website button settings."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = <K extends keyof NavbarLegacyLinkSettings>(
    field: K,
    value: NavbarLegacyLinkSettings[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const previewItems = useMemo(() => {
    const legacyItem = form.label.trim() || "Old JFST Website";

    if (form.position === "before-search") {
      return [legacyItem, "Search", "Submit Manuscript"];
    }

    if (form.position === "after-submit") {
      return ["Search", "Submit Manuscript", legacyItem];
    }

    return ["Search", legacyItem, "Submit Manuscript"];
  }, [form.label, form.position]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.label.trim()) {
      setMessage("Button text is required.");
      return;
    }

    if (!form.url.trim()) {
      setMessage("Old website link is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const updated = await updateAdminNavbarLegacyLinkSettings({
        ...form,
        label: form.label.trim(),
        url: form.url.trim(),
      });

      setForm({ ...defaultSettings, ...updated });
      setMessage("Old website navbar button updated successfully.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Failed to update old website button settings."
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
                Navbar Settings
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Old JFST Website Button
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Show or hide the old-site button, edit its text and link, and
                choose where it appears beside Search and Submit Manuscript.
              </p>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#005A78] hover:text-[#005A78]"
            >
              <ExternalLink className="h-4 w-4" />
              View Public Site
            </a>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#005A78]" />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Loading navbar button settings...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Button Visibility
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Turn the old website shortcut on or off without deleting its
                    saved configuration.
                  </p>
                </div>

                <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(event) =>
                      updateField("enabled", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#005A78]"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    {form.enabled ? "Button Enabled" : "Button Disabled"}
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#005A78]">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Button Content
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    This text and destination are shown on the public navbar.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Button Text
                  </label>
                  <input
                    value={form.label}
                    onChange={(event) => updateField("label", event.target.value)}
                    placeholder="Old JFST Website"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Website Link
                  </label>
                  <input
                    value={form.url}
                    onChange={(event) => updateField("url", event.target.value)}
                    placeholder="https://jfst.bup.edu.bd/index.php/jfst"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#005A78]"
                  />
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    You may use a complete external URL or an internal path
                    beginning with /.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.openInNewTab}
                  onChange={(event) =>
                    updateField("openInNewTab", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#005A78]"
                />
                Open the old website in a new tab
              </label>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Navbar Placement
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Choose the desktop position relative to Search and Submit
                Manuscript. On mobile, the button remains near Submit Manuscript
                inside the opened menu.
              </p>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {positionOptions.map((option) => {
                  const selected = form.position === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        selected
                          ? "border-[#005A78] bg-cyan-50 shadow-sm"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="position"
                          value={option.value}
                          checked={selected}
                          onChange={() => updateField("position", option.value)}
                          className="mt-1 h-4 w-4 accent-[#005A78]"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {option.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-[#071a33] p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                  Preview Order
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {previewItems.map((item) => {
                    const isLegacy = item === (form.label.trim() || "Old JFST Website");
                    const isSubmit = item === "Submit Manuscript";

                    return (
                      <span
                        key={`${item}-${isLegacy ? "legacy" : "fixed"}`}
                        className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-xs font-bold ${
                          isLegacy
                            ? form.enabled
                              ? "border border-white bg-white text-[#111433]"
                              : "border border-dashed border-white/30 bg-transparent text-white/40 line-through"
                            : isSubmit
                              ? "bg-[#f5c84b] text-[#071a33]"
                              : "border border-white/20 bg-white text-[#111433]"
                        }`}
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#005A78] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#004968] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Navbar Button"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
