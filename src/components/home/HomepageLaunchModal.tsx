"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PublicHomepageContent } from "@/services/publicHomepageService";

const SESSION_KEY = "jfst_launch_modal_seen_session";
const DAY_KEY = "jfst_launch_modal_seen_day";
const EXIT_DURATION_MS = 360;

const isWithinSchedule = (startAt?: string | null, endAt?: string | null) => {
  const now = Date.now();
  const start = startAt ? new Date(startAt).getTime() : null;
  const end = endAt ? new Date(endAt).getTime() : null;

  if (start && Number.isFinite(start) && now < start) return false;
  if (end && Number.isFinite(end) && now > end) return false;
  return true;
};

const isAbsoluteUrl = (url: string) => /^(https?:\/\/|mailto:|tel:)/i.test(url);

export default function HomepageLaunchModal({
  homepage,
}: {
  homepage: PublicHomepageContent | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

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
      autoCloseSeconds: Math.min(
        Math.max(Number(homepage?.launchModalAutoCloseSeconds) || 0, 0),
        120,
      ),
    }),
    [homepage],
  );

  const markSeen = useCallback(() => {
    try {
      if (config.frequency === "once-per-session") {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      if (config.frequency === "once-per-day") {
        localStorage.setItem(DAY_KEY, new Date().toISOString().slice(0, 10));
      }
    } catch {
      // Storage can be blocked. The welcome experience should still remain usable.
    }
  }, [config.frequency]);

  const closeModal = useCallback(() => {
    markSeen();
    setVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      closeTimerRef.current = null;
    }, EXIT_DURATION_MS);
  }, [markSeen]);

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
      // Storage may be unavailable in strict privacy modes.
    }

    const openTimer = window.setTimeout(() => {
      setMounted(true);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true));
      });
    }, 380);

    return () => window.clearTimeout(openTimer);
  }, [config.enabled, config.endAt, config.frequency, config.startAt]);

  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted, config.dismissible, closeModal]);

  useEffect(() => {
    if (!visible || config.autoCloseSeconds <= 0) return;

    const timer = window.setTimeout(
      closeModal,
      config.autoCloseSeconds * 1000,
    );

    return () => window.clearTimeout(timer);
  }, [visible, config.autoCloseSeconds, closeModal]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!mounted) return null;

  const hasImage = Boolean(config.imageUrl);
  const imageOnly = config.layout === "image" && hasImage;
  const imageText = config.layout === "image-text" && hasImage;

  const actionClass =
    "transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]";

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6 transition-[background-color,backdrop-filter,opacity] duration-[360ms] ease-out ${
        visible
          ? "bg-[#041225]/78 opacity-100 backdrop-blur-[6px]"
          : "bg-[#041225]/0 opacity-0 backdrop-blur-none"
      }`}
      onMouseDown={(event) => {
        if (config.dismissible && event.target === event.currentTarget) {
          closeModal();
        }
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="jfst-launch-modal-title"
        className={`relative max-h-[92vh] w-full overflow-hidden rounded-[30px] border border-white/15 bg-white shadow-[0_30px_100px_rgba(2,8,23,0.42)] transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          imageOnly ? "max-w-4xl" : imageText ? "max-w-5xl" : "max-w-2xl"
        } ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-[0.965] opacity-0"
        }`}
      >
        {config.autoCloseSeconds > 0 ? (
          <div className="absolute left-0 top-0 z-30 h-1 w-full overflow-hidden bg-slate-200/70">
            <div
              key={`${config.autoCloseSeconds}-${visible}`}
              className="h-full origin-left bg-gradient-to-r from-[#22b8e8] via-[#f5c84b] to-[#22b8e8]"
              style={{
                animation: visible
                  ? `jfstModalCountdown ${config.autoCloseSeconds}s linear forwards`
                  : "none",
              }}
            />
          </div>
        ) : null}

        {config.dismissible ? (
          <button
            type="button"
            onClick={closeModal}
            className={`absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#071a33]/82 text-xl font-medium text-white shadow-lg backdrop-blur ${actionClass} hover:rotate-90 hover:bg-[#071a33]`}
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
                className={`max-h-[78vh] w-full object-contain transition-[opacity,transform] delay-100 duration-500 ease-out ${
                  visible ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"
                }`}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 bg-[#071a33] p-4">
              {config.primaryLabel && config.primaryUrl ? (
                <ActionLink
                  href={config.primaryUrl}
                  onClick={markSeen}
                  className={`inline-flex h-11 items-center justify-center rounded-full bg-[#f5c84b] px-6 text-sm font-extrabold text-[#071a33] shadow-sm hover:bg-[#ffd86b] hover:shadow-md ${actionClass}`}
                >
                  {config.primaryLabel}
                </ActionLink>
              ) : null}
              {config.dismissible ? (
                <button
                  type="button"
                  onClick={closeModal}
                  className={`inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-bold text-white hover:bg-white/10 ${actionClass}`}
                >
                  {config.secondaryLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={imageText ? "grid md:grid-cols-[0.92fr_1.08fr]" : ""}>
            {imageText ? (
              <div className="relative min-h-[250px] overflow-hidden bg-[#071a33] md:min-h-[570px]">
                <img
                  src={config.imageUrl}
                  alt={config.imageAlt}
                  className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out ${
                    visible ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a33]/60 via-transparent to-transparent" />
              </div>
            ) : null}

            <div className="relative overflow-hidden bg-white p-7 sm:p-9 md:p-11">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-[#22b8e8]/15" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#f5c84b]/25" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#22b8e8] via-[#111433] to-[#f5c84b]" />

              <div
                className={`transition-[opacity,transform] delay-75 duration-500 ease-out ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
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
                    <ActionLink
                      href={config.primaryUrl}
                      onClick={markSeen}
                      className={`inline-flex h-12 items-center justify-center rounded-full bg-[#071a33] px-6 text-sm font-extrabold text-white shadow-sm hover:bg-[#123a59] hover:shadow-lg ${actionClass}`}
                    >
                      {config.primaryLabel}
                      <span className="ml-2 text-lg transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </ActionLink>
                  ) : null}

                  {config.dismissible ? (
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 hover:border-[#22b8e8] hover:bg-[#eef8fc] hover:text-[#087895] hover:shadow-sm ${actionClass}`}
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
          </div>
        )}
      </section>

      <style>{`
        @keyframes jfstModalCountdown {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"], [role="presentation"] {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function ActionLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  if (isAbsoluteUrl(href)) {
    return (
      <a href={href} className={`group ${className}`} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`group ${className}`} onClick={onClick}>
      {children}
    </Link>
  );
}
