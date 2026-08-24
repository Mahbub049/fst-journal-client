"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getPublicHomepage,
  type PublicHomepageContent,
} from "@/services/publicHomepageService";
import { matchesPublicDisplayScope } from "@/lib/publicDisplayScope";

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
  homepage?: PublicHomepageContent | null;
}) {
  const pathname = usePathname();
  const [resolvedHomepage, setResolvedHomepage] =
    useState<PublicHomepageContent | null>(homepage || null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (homepage) {
      setResolvedHomepage(homepage);
      return;
    }

    let active = true;
    void getPublicHomepage()
      .then((data) => {
        if (active) setResolvedHomepage(data);
      })
      .catch(() => {
        // A modal settings fetch failure must never break the public website.
      });

    return () => {
      active = false;
    };
  }, [homepage]);

  const config = useMemo(
    () => ({
      enabled: resolvedHomepage?.launchModalEnabled ?? false,
      layout: resolvedHomepage?.launchModalLayout || "text",
      eyebrow: resolvedHomepage?.launchModalEyebrow || "A NEW CHAPTER BEGINS",
      title:
        resolvedHomepage?.launchModalTitle ||
        "Welcome to the New Journal of FST Website",
      message:
        resolvedHomepage?.launchModalMessage ||
        "We are delighted to welcome you to the newly launched digital home of the Journal of FST, Bangladesh University of Professionals.",
      imageUrl: resolvedHomepage?.launchModalImageUrl || "",
      imageAlt:
        resolvedHomepage?.launchModalImageAlt || "Journal of FST inauguration",
      primaryLabel:
        resolvedHomepage?.launchModalPrimaryLabel || "Explore the Journal",
      primaryUrl:
        resolvedHomepage?.launchModalPrimaryUrl || "/issues/archive",
      secondaryLabel:
        resolvedHomepage?.launchModalSecondaryLabel || "Continue to Website",
      startAt: resolvedHomepage?.launchModalStartAt || null,
      endAt: resolvedHomepage?.launchModalEndAt || null,
      frequency:
        resolvedHomepage?.launchModalFrequency || "once-per-session",
      dismissible: resolvedHomepage?.launchModalDismissible ?? true,
      autoCloseSeconds: Math.min(
        Math.max(Number(resolvedHomepage?.launchModalAutoCloseSeconds) || 0, 0),
        120,
      ),
      scope: resolvedHomepage?.launchModalScope || "homepage",
      customPaths: resolvedHomepage?.launchModalCustomPaths || [],
      publishingModel: resolvedHomepage?.publishingModel || "Hybrid",
      issnOnline: resolvedHomepage?.issnOnline || "3134-7339",
      issnPrint: resolvedHomepage?.issnPrint || "2959-4812",
    }),
    [resolvedHomepage],
  );

  const allowedOnCurrentPage = matchesPublicDisplayScope({
    pathname: pathname || "/",
    scope: config.scope,
    customPaths: config.customPaths,
  });

  const markSeen = useCallback(() => {
    try {
      if (config.frequency === "once-per-session") {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      if (config.frequency === "once-per-day") {
        localStorage.setItem(DAY_KEY, new Date().toISOString().slice(0, 10));
      }
    } catch {
      // Storage can be blocked. The welcome experience should remain usable.
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
    if (
      !resolvedHomepage ||
      !config.enabled ||
      !allowedOnCurrentPage ||
      !isWithinSchedule(config.startAt, config.endAt)
    ) {
      setVisible(false);
      setMounted(false);
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
  }, [
    allowedOnCurrentPage,
    config.enabled,
    config.endAt,
    config.frequency,
    config.startAt,
    pathname,
    resolvedHomepage,
  ]);

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
    <>
      <div
        className={`fixed inset-0 z-[1000] transition-[background-color,backdrop-filter,opacity] duration-[360ms] ease-out ${
          visible
            ? "bg-[#041225]/78 opacity-100 backdrop-blur-[6px]"
            : "bg-[#041225]/0 opacity-0 backdrop-blur-none"
        }`}
        onMouseDown={() => {
          if (config.dismissible) closeModal();
        }}
        role="presentation"
      />

      <div className="pointer-events-none fixed inset-0 z-[1020] flex items-center justify-center px-4 py-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="jfst-launch-modal-title"
          className={`pointer-events-auto relative max-h-[92vh] w-full overflow-hidden rounded-[30px] border border-white/15 bg-white shadow-[0_30px_100px_rgba(2,8,23,0.42)] transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
                          Online Journal Website
                        </p>
                        <p className="mt-1.5 text-[15px] font-extrabold leading-5 text-slate-950 sm:text-base">
                          Faculty of Science &amp; Technology, BUP
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <h2
                    id="jfst-launch-modal-title"
                    className="text-[30px] font-semibold leading-[1.08] text-[#071a33] sm:text-[38px]"
                    style={{ fontFamily: "var(--font-source-serif)" }}
                  >
                    {config.title}
                  </h2>

                  <div className="mt-5 flex items-center gap-2">
                    <span className="h-[3px] w-12 rounded-full bg-[#f5c84b]" />
                    <span className="h-[3px] w-5 rounded-full bg-[#22b8e8]" />
                  </div>

                  <JournalProfile
                    publishingModel={config.publishingModel}
                    issnOnline={config.issnOnline}
                    issnPrint={config.issnPrint}
                    compact={imageText}
                  />

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
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
      </div>

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
    </>
  );
}

function JournalProfile({
  publishingModel,
  issnOnline,
  issnPrint,
  compact = false,
}: {
  publishingModel: string;
  issnOnline: string;
  issnPrint: string;
  compact?: boolean;
}) {
  const items = [
    {
      label: "Publishing Model",
      value: publishingModel,
      accent: "bg-[#f5c84b]",
    },
    {
      label: "Electronic ISSN",
      value: issnOnline,
      accent: "bg-[#22b8e8]",
    },
    {
      label: "Print ISSN",
      value: issnPrint,
      accent: "bg-white/70",
    },
  ];

  return (
    <div className="relative mt-7 overflow-hidden rounded-[22px] border border-[#102c4c] bg-[#071a33] shadow-[0_18px_45px_rgba(7,26,51,0.16)]">
      <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full border border-[#22b8e8]/15" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full border border-[#f5c84b]/10" />
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#22b8e8] via-[#f5c84b] to-[#22b8e8]" />

      <div className="relative flex items-center justify-between gap-4 px-5 pb-3 pt-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7cdcf0]">
            Journal Profile
          </p>
          {!compact ? (
            <p className="mt-1 text-xs font-medium text-white/45">
              Core publication information at a glance
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22b8e8]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5c84b]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      <div
        className={`relative grid border-t border-white/10 ${
          compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"
        }`}
      >
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`relative px-5 py-4 ${
              index > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""
            }`}
          >
            <span
              className={`absolute left-5 top-0 h-[2px] w-8 rounded-full ${item.accent}`}
            />
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">
              {item.label}
            </p>
            <p className="mt-1.5 text-lg font-extrabold tracking-[-0.02em] text-white sm:text-xl">
              {item.value}
            </p>
          </div>
        ))}
      </div>
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
