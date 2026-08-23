"use client";

import { Clock3, MapPin, Sparkles } from "lucide-react";
import type { HomepageContent } from "@/services/homepageService";
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
    description: "Celebrate only when visitors arrive on the homepage.",
  },
  {
    value: "all",
    title: "Every Public Page",
    description: "Allow the effect anywhere on the public journal website.",
  },
  {
    value: "custom",
    title: "Custom Pages",
    description: "Restrict the effect to selected pages or public sections.",
  },
];

export default function HomepageCelebrationSettings({ form, updateField }: Props) {
  const scope = form.celebrationScope || "all";
  const customPaths = form.celebrationCustomPaths || [];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-[#071a33] via-[#123a59] to-[#111433] p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7de4ee] text-[#071a33] shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f5c84b]">
                Launch Celebration
              </p>
              <h2 className="mt-1 text-xl font-bold">Website Celebration Effect</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-white/70">
                Add a lightweight inauguration celebration. The animation never blocks clicks,
                can be limited to selected pages, and stops automatically.
              </p>
            </div>
          </div>

          <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <input
              type="checkbox"
              checked={form.celebrationEnabled}
              onChange={(event) =>
                updateField("celebrationEnabled", event.target.checked)
              }
              className="h-4 w-4 accent-[#f5c84b]"
            />
            <span className="text-sm font-bold">
              {form.celebrationEnabled ? "Celebration Enabled" : "Celebration Disabled"}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
          <div className="flex items-center gap-2 text-slate-800">
            <MapPin className="h-4 w-4 text-[#005A78]" />
            <p className="text-sm font-bold">Where should the celebration appear?</p>
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
                      name="celebration-scope"
                      checked={selected}
                      onChange={() => updateField("celebrationScope", option.value)}
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
                    "celebrationCustomPaths",
                    parseCustomDisplayPaths(event.target.value),
                  )
                }
                placeholder={'One per line, for example:\n/\n/issues/archive\n/issues/*'}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Use exact paths or <strong>*</strong> for a section, e.g. <strong>/issues/*</strong>.
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">Celebration Style</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            These remain elegant rather than loud so the academic website still feels professional.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[
              ["confetti", "Elegant Confetti", "Gold, cyan and light celebratory pieces"],
              ["fireworks", "Festival Sparkles", "Firework-style spark bursts around the screen edges"],
              ["both", "Launch Celebration", "A balanced combination of both effects"],
            ].map(([value, title, description]) => {
              const selected = form.celebrationStyle === value;
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
                      name="celebration-style"
                      checked={selected}
                      onChange={() =>
                        updateField(
                          "celebrationStyle",
                          value as HomepageContent["celebrationStyle"],
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

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Effect Duration (seconds)
            </label>
            <input
              type="number"
              min={2}
              max={30}
              step={1}
              value={form.celebrationDurationSeconds}
              onChange={(event) =>
                updateField(
                  "celebrationDurationSeconds",
                  Math.min(Math.max(Number(event.target.value) || 8, 2), 30),
                )
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Recommended: 6–10 seconds. The animation fades out automatically.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Show Frequency
            </label>
            <select
              value={form.celebrationFrequency}
              onChange={(event) =>
                updateField(
                  "celebrationFrequency",
                  event.target.value as HomepageContent["celebrationFrequency"],
                )
              }
              className={inputClass}
            >
              <option value="once-per-session">Once per browser session</option>
              <option value="every-page">On every matching public page opened</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Once per session is recommended so repeat visitors are not distracted.
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Clock3 className="h-4 w-4 text-[#005A78]" />
              <label className="text-sm font-semibold">Start Celebration</label>
            </div>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.celebrationStartAt)}
              onChange={(event) =>
                updateField("celebrationStartAt", toIsoDateValue(event.target.value))
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">Leave blank to allow it immediately.</p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Clock3 className="h-4 w-4 text-[#005A78]" />
              <label className="text-sm font-semibold">Stop Celebration</label>
            </div>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.celebrationEndAt)}
              onChange={(event) =>
                updateField("celebrationEndAt", toIsoDateValue(event.target.value))
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Set the end of the inauguration period so it turns off automatically.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Suggested inauguration setup: <strong>Every Public Page</strong>, <strong>Launch Celebration</strong>,
          8 seconds, once per browser session, using the same date range as the welcome modal.
          Visitors who prefer reduced motion will not receive the animation.
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
