"use client";

import { ImageIcon, Loader2, MapPin, Sparkles, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import type { HomepageContent } from "@/services/homepageService";
import { uploadMedia } from "@/services/mediaService";
import {
  parseCustomDisplayPaths,
  type PublicDisplayScope,
} from "@/lib/publicDisplayScope";

type Props = {
  form: HomepageContent;
  updateField: <K extends keyof HomepageContent>(
    field: K,
    value: HomepageContent[K],
  ) => void;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#005A78] focus:ring-2 focus:ring-[#005A78]/10";

const scopeOptions: Array<{
  value: PublicDisplayScope;
  title: string;
  description: string;
}> = [
  {
    value: "homepage",
    title: "Homepage Only",
    description: "Show the modal only when a visitor opens the homepage.",
  },
  {
    value: "all",
    title: "Every Public Page",
    description: "Allow the modal on homepage, issues, articles and other public pages.",
  },
  {
    value: "custom",
    title: "Custom Pages",
    description: "Choose exact public paths or sections where the modal may appear.",
  },
];

export default function HomepageLaunchModalSettings({ form, updateField }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const scope = form.launchModalScope || "homepage";
  const customPaths = form.launchModalCustomPaths || [];

  const uploadImage = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadMessage("Please select an image file.");
      return;
    }

    try {
      setUploading(true);
      setUploadMessage("");
      const uploaded = await uploadMedia({
        file,
        title: file.name,
        folder: "homepage-launch-modal",
      });
      updateField("launchModalImageUrl", uploaded.fileUrl);
      setUploadMessage("Modal image uploaded. Save Homepage Management to publish it.");
    } catch (error: any) {
      setUploadMessage(
        error?.response?.data?.message || "Failed to upload modal image.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-[#071a33] via-[#0c2b47] to-[#111433] p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f5c84b] text-[#071a33] shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7de4ee]">
                Visitor Welcome Experience
              </p>
              <h2 className="mt-1 text-xl font-bold">Launch / Announcement Modal</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-white/70">
                Use this for inauguration and later announcements. Control its design,
                schedule, display duration and exactly where it can appear.
              </p>
            </div>
          </div>

          <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <input
              type="checkbox"
              checked={form.launchModalEnabled}
              onChange={(event) =>
                updateField("launchModalEnabled", event.target.checked)
              }
              className="h-4 w-4 accent-[#f5c84b]"
            />
            <span className="text-sm font-bold">
              {form.launchModalEnabled ? "Modal Enabled" : "Modal Disabled"}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
          <div className="flex items-center gap-2 text-slate-800">
            <MapPin className="h-4 w-4 text-[#005A78]" />
            <p className="text-sm font-bold">Where should the modal appear?</p>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {scopeOptions.map((option) => {
              const selected = scope === option.value;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selected
                      ? "border-[#005A78] bg-white shadow-sm"
                      : "border-slate-200 bg-white/60 hover:border-slate-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="launch-modal-scope"
                      checked={selected}
                      onChange={() => updateField("launchModalScope", option.value)}
                      className="mt-1 h-4 w-4 accent-[#005A78]"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{option.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {scope === "custom" ? (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Custom Public Paths
              </label>
              <textarea
                rows={4}
                value={customPaths.join("\n")}
                onChange={(event) =>
                  updateField(
                    "launchModalCustomPaths",
                    parseCustomDisplayPaths(event.target.value),
                  )
                }
                placeholder={'One per line, for example:\n/issues/archive\n/editorial-board\n/issues/*'}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Use exact paths or <strong>*</strong> for a section, e.g. <strong>/issues/*</strong>.
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">Modal Layout</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[
              ["text", "Designed Welcome", "BUP logo + journal-styled text"],
              ["image-text", "Photo + Text", "Image area with editable message"],
              ["image", "Full Image", "Use a complete launch poster/photo"],
            ].map(([value, title, description]) => {
              const selected = form.launchModalLayout === value;
              return (
                <label
                  key={value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selected
                      ? "border-[#005A78] bg-cyan-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="launch-modal-layout"
                      checked={selected}
                      onChange={() =>
                        updateField(
                          "launchModalLayout",
                          value as HomepageContent["launchModalLayout"],
                        )
                      }
                      className="mt-1 h-4 w-4 accent-[#005A78]"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Small Heading / Eyebrow
            </label>
            <input
              value={form.launchModalEyebrow}
              onChange={(event) => updateField("launchModalEyebrow", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Main Title
            </label>
            <input
              value={form.launchModalTitle}
              onChange={(event) => updateField("launchModalTitle", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Welcome / Announcement Text
          </label>
          <textarea
            rows={5}
            value={form.launchModalMessage}
            onChange={(event) => updateField("launchModalMessage", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#005A78] shadow-sm">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Modal Image</p>
              <p className="text-xs text-slate-500">
                Required for Photo + Text and Full Image layouts. Optional for Designed Welcome.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              value={form.launchModalImageUrl}
              onChange={(event) => updateField("launchModalImageUrl", event.target.value)}
              placeholder="Image URL or upload below"
              className={inputClass}
            />
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#005A78]/20 bg-white px-4 py-3 text-sm font-bold text-[#005A78] transition hover:bg-cyan-50">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    void uploadImage(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              {form.launchModalImageUrl ? (
                <button
                  type="button"
                  onClick={() => updateField("launchModalImageUrl", "")}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
                >
                  <X className="h-4 w-4" /> Clear
                </button>
              ) : null}
            </div>
          </div>

          <input
            value={form.launchModalImageAlt}
            onChange={(event) => updateField("launchModalImageAlt", event.target.value)}
            placeholder="Image alternative text"
            className={`${inputClass} mt-3`}
          />
          {uploadMessage ? (
            <p className="mt-2 text-xs font-semibold text-slate-600">{uploadMessage}</p>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Primary Button Text</label>
            <input
              value={form.launchModalPrimaryLabel}
              onChange={(event) => updateField("launchModalPrimaryLabel", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Primary Button Link</label>
            <input
              value={form.launchModalPrimaryUrl}
              onChange={(event) => updateField("launchModalPrimaryUrl", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Close Button Text</label>
            <input
              value={form.launchModalSecondaryLabel}
              onChange={(event) => updateField("launchModalSecondaryLabel", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Showing</label>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.launchModalStartAt)}
              onChange={(event) =>
                updateField("launchModalStartAt", toIsoDateValue(event.target.value))
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">Leave blank to start now.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Stop Showing</label>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.launchModalEndAt)}
              onChange={(event) =>
                updateField("launchModalEndAt", toIsoDateValue(event.target.value))
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">Useful for a temporary launch period.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Show Frequency</label>
            <select
              value={form.launchModalFrequency}
              onChange={(event) =>
                updateField(
                  "launchModalFrequency",
                  event.target.value as HomepageContent["launchModalFrequency"],
                )
              }
              className={inputClass}
            >
              <option value="once-per-session">Once per browser session</option>
              <option value="once-per-day">Once per day</option>
              <option value="every-visit">Every matching page visit</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <div>
              <p className="text-sm font-bold text-slate-800">Automatic Display Time</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Set how many seconds the modal stays visible before it closes smoothly.
                Use 0 to keep it open until the visitor closes it or follows a button.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Auto-close after (seconds)</label>
              <input
                type="number"
                min={0}
                max={120}
                step={1}
                value={form.launchModalAutoCloseSeconds}
                onChange={(event) =>
                  updateField(
                    "launchModalAutoCloseSeconds",
                    Math.min(Math.max(Number(event.target.value) || 0, 0), 120),
                  )
                }
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">0 = no automatic close</p>
            </div>
          </div>
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.launchModalDismissible}
            onChange={(event) => updateField("launchModalDismissible", event.target.checked)}
            className="h-4 w-4 accent-[#005A78]"
          />
          Allow visitors to close the modal with ×, outside click, or Escape
        </label>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Suggested launch setup: <strong>Homepage Only</strong>, <strong>Designed Welcome</strong>,
          once per session, with an automatic stop date after 3–7 days.
        </div>
      </div>
    </section>
  );
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoDateValue(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
