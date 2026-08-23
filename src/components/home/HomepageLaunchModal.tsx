"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicHomepageContent } from "@/services/publicHomepageService";

const SESSION_KEY = "jfst_launch_modal_seen_session";
const DAY_KEY = "jfst_launch_modal_seen_day";

const isWithinSchedule = (startAt?: string | null, endAt?: string | null) => {
  const now = Date.now();
  const start = startAt ? new Date(startAt).getTime() : null;
  const end = endAt ? new Date(endAt).getTime() : null;

  if (start && Number.isFinite(start) && now < start) return false;
  if (end && Number.isFinite(end) && now > end) return false;
  return true;
};

export default function HomepageLaunchModal({
  homepage,
}: {
  homepage: PublicHomepageContent | null;
}) {
  const [open, setOpen] = useState(false);

  const config = useMemo(
    () => ({
      enabled: homepage?.launchModalEnabled ?? false,
      layout: homepage?.launchModalLayout || "text",
      eyebrow: homepage?.launchModalEyebrow || "A NEW CHAPTER BEGINS",
      title:
        homepage?.launchModalTitle ||
        "Welcome to the New Journal of FST Website",
      message:
        homepage?.launchModalMessage ||
        "We are delighted to welcome you to the newly launched digital home of the Journal of FST, Bangladesh University of Professionals.",
      imageUrl: homepage?.launchModalImageUrl || "",
      imageAlt: homepage?.launchModalImageAlt || "Journal of FST inauguration",
      primaryLabel: homepage?.launchModalPrimaryLabel || "Explore the Journal",
      primaryUrl: homepage?.launchModalPrimaryUrl || "/issues/archive",
      secondaryLabel:
        homepage?.launchModalSecondaryLabel || "Continue to Website",
      startAt: homepage?.launchModalStartAt || null,
      endAt: homepage?.launchModalEndAt || null,
      frequency: homepage?.launchModalFrequency || "once-per-session",
      dismissible: homepage?.launchModalDismissible ?? true,
    }),
    [homepage],
  );

  useEffect(() => {
    if (!config.enabled || !isWithinSchedule(config.startAt, config.endAt)) {
      return;
    }

    try {
      if (
        config.frequency === "once-per-session" &&
        sessionStorage.getItem(SESSION_KEY) === "1"
      ) {
        return;
      }

      if (config.frequency === "once-per-day") {
        const today = new Date().toISOString().slice(0, 10);
        if (localStorage.getItem(DAY_KEY) === today) return;
      }
    } catch {
      // Storage can be blocked in private/privacy modes. The modal should still work.
    }

    const timer = window.setTimeout(() => setOpen(true), 420);
    return () => window.clearTimeout(timer);
  }, [config]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && config.dismissible) {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, config.dismissible]);

  const markSeen = () => {
    try {
      if (config.frequency === "once-per-session") {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      if (config.frequency === "once-per-day") {
        localStorage.setItem(DAY_KEY, new Date().toISOString().slice(0, 10));
      }
    } catch {
      // Ignore storage failures.
    }
  };

  const closeModal = () => {
    markSeen();
    setOpen(false);
  };

  if (!open) return null;

  const hasImage = Boolean(config.imageUrl);
  const imageOnly = config.layout === "image" && hasImage;
  const imageText = config.layout === "image-text" && hasImage;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#041225]/78 px-4 py-6 backdrop-blur-[5px]"
      onMouseDown={(event) => {
        if (
          config.dismissible &&
          event.target === event.currentTarget
        ) {
          closeModal();
        }
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="jfst-launch-modal-title"
        className={`relative max-h-[92vh] w-full overflow-hidden rounded-[30px] border border-white/15 bg-white shadow-[0_30px_100px_rgba(2,8,23,0.42)] ${
          imageOnly ? "max-w-4xl" : imageText ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        {config.dismissible ? (
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#071a33]/80 text-xl font-medium text-white shadow-lg backdrop-blur transition hover:bg-[#071a33]"
            aria-label="Close welcome message"
          >
            ×
          </button>
        ) : null}

        {imageOnly ? (
          <div className="relative bg-[#071a33]">
            <div className="relative flex min-h-[320px] w-full items-center justify-center md:min-h-[540px]">
              <img
                src={config.imageUrl}
                alt={config.imageAlt}
                className="max-h-[78vh] w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 bg-[#071a33] p-4">
              {config.primaryLabel && config.primaryUrl ? (
                <Link
                  href={config.primaryUrl}
                  onClick={markSeen}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#f5c84b] px-6 text-sm font-extrabold text-[#071a33] transition hover:bg-[#ffd86b]"
                >
                  {config.primaryLabel}
                </Link>
              ) : null}
              {config.dismissible ? (
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  {config.secondaryLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={imageText ? "grid md:grid-cols-[0.92fr_1.08fr]" : ""}>
            {imageText ? (
              <div className="relative min-h-[250px] bg-[#071a33] md:min-h-[570px]">
                <img
                  src={config.imageUrl}
                  alt={config.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a33]/55 via-transparent to-transparent" />
              </div>
            ) : null}

            <div className="relative overflow-hidden bg-white p-7 sm:p-9 md:p-11">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-[#22b8e8]/15" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#f5c84b]/25" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#22b8e8] via-[#111433] to-[#f5c84b]" />

              {!imageText ? (
                <div className="mb-7 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Image
                      src="/images/bup.png"
                      alt="Bangladesh University of Professionals"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#087895]">
                      Official Journal Website
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Faculty of Science & Technology, BUP
                    </p>
                  </div>
                </div>
              ) : null}

              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#b78912]">
                {config.eyebrow}
              </p>
              <h2
                id="jfst-launch-modal-title"
                className="mt-3 text-[30px] font-semibold leading-[1.08] text-[#071a33] sm:text-[38px]"
                style={{ fontFamily: "var(--font-source-serif)" }}
              >
                {config.title}
              </h2>
              <div className="mt-5 h-[3px] w-20 rounded-full bg-[#f5c84b]" />

              <p className="mt-6 whitespace-pre-line text-[14px] leading-7 text-slate-600 sm:text-[15px]">
                {config.message}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {config.primaryLabel && config.primaryUrl ? (
                  <Link
                    href={config.primaryUrl}
                    onClick={markSeen}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#071a33] px-6 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#123a59]"
                  >
                    {config.primaryLabel}
                    <span className="ml-2 text-lg">→</span>
                  </Link>
                ) : null}

                {config.dismissible ? (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-[#22b8e8] hover:bg-[#eef8fc] hover:text-[#087895]"
                  >
                    {config.secondaryLabel}
                  </button>
                ) : null}
              </div>

              <p className="mt-7 text-xs leading-5 text-slate-400">
                Journal of FST · Bangladesh University of Professionals
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
