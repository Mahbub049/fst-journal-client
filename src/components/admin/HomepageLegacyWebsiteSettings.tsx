"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Globe2, Loader2, Save } from "lucide-react";
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
    description: "Old website → Search → Submit Manuscript",
  },
  {
    value: "between-search-submit",
    label: "Between Search and Submit",
    description: "Search → Old website → Submit Manuscript",
  },
  {
    value: "after-submit",
    label: "Right of Submit",
    description: "Search → Submit Manuscript → Old website",
  },
];

export default function HomepageLegacyWebsiteSettings() {
  const [form, setForm] = useState<NavbarLegacyLinkSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    void getAdminNavbarLegacyLinkSettings()
      .then((data) => {
        if (mounted) setForm({ ...defaultSettings, ...data });
      })
      .catch((error: any) => {
        if (mounted) {
          setMessage(
            error?.response?.data?.message ||
              "Failed to load old website button settings.",
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const previewItems = useMemo(() => {
    const legacy = form.label.trim() || "Old JFST Website";
    if (form.position === "before-search") {
      return [legacy, "Search", "Submit Manuscript"];
    }
    if (form.position === "after-submit") {
      return ["Search", "Submit Manuscript", legacy];
    }
    return ["Search", legacy, "Submit Manuscript"];
  }, [form.label, form.position]);

  const updateField = <K extends keyof NavbarLegacyLinkSettings>(
    field: K,
    value: NavbarLegacyLinkSettings[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.label.trim() || !form.url.trim()) {
      setMessage("Button text and website link are required.");
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
      setMessage("Old website button updated successfully.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to update old website button.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#005A78]">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Old JFST Website Button
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Keep this transition link with Homepage controls instead of adding
              another permanent item to the admin sidebar.
            </p>
          </div>
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading settings...
        </div>
      ) : (
        <form onSubmit={save} className="mt-5 space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Visibility</p>
              <p className="mt-1 text-xs text-slate-500">
                Disable it any time after the transition period.
              </p>
            </div>
            <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => updateField("enabled", event.target.checked)}
                className="h-4 w-4 accent-[#005A78]"
              />
              <span className="text-sm font-bold text-slate-700">
                {form.enabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Button Text
              </label>
              <input
                value={form.label}
                onChange={(event) => updateField("label", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Website Link
              </label>
              <input
                value={form.url}
                onChange={(event) => updateField("url", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005A78]"
              />
            </div>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.openInNewTab}
              onChange={(event) =>
                updateField("openInNewTab", event.target.checked)
              }
              className="h-4 w-4 accent-[#005A78]"
            />
            Open in a new tab
          </label>

          <div>
            <p className="text-sm font-bold text-slate-800">Navbar Position</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {positionOptions.map((option) => {
                const selected = form.position === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selected
                        ? "border-[#005A78] bg-cyan-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="legacy-position"
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
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-[#071a33] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {previewItems.map((item) => {
                const legacy = item === (form.label.trim() || "Old JFST Website");
                return (
                  <span
                    key={`${item}-${legacy}`}
                    className={`rounded-full px-3 py-2 text-xs font-bold ${
                      legacy
                        ? "border border-[#7de4ee]/50 bg-[#0c2b47] text-[#e6fbff]"
                        : item === "Submit Manuscript"
                          ? "bg-[#f5c84b] text-[#071a33]"
                          : "bg-white text-[#111433]"
                    }`}
                  >
                    {item}
                  </span>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#005A78] px-5 text-sm font-bold text-white transition hover:bg-[#004968] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Button"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
