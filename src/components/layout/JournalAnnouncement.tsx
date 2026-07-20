"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AnnouncementItem } from "@/services/siteSettingsService";
import { getPublicSiteSettings } from "@/services/siteSettingsService";

type AnnouncementMessage = {
  text: string;
  url?: string;
};

type JournalAnnouncementProps = {
  homepage?: unknown;
  items?: string[];
  announcements?: string[];
  className?: string;
};

const fallbackAnnouncements: AnnouncementMessage[] = [
  { text: "SUBMIT YOUR MANUSCRIPT TODAY" },
  { text: "WELCOME TO THE JOURNAL OF FST" },
  { text: "CALL FOR PAPERS" },
  { text: "EXPLORE CURRENT AND ARCHIVED ISSUES OF THE JOURNAL" },
  {
    text: "SUBMIT YOUR RESEARCH MANUSCRIPT THROUGH THE ONLINE SUBMISSION SYSTEM",
  },
];

const DEFAULT_SPEED_SECONDS = 100;
const MIN_SPEED_SECONDS = 10;
const MAX_SPEED_SECONDS = 300;
const DEFAULT_GAP_PIXELS = 120;
const MIN_GAP_PIXELS = 24;
const MAX_GAP_PIXELS = 480;

function clampSpeed(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return DEFAULT_SPEED_SECONDS;

  return Math.min(
    Math.max(Math.round(numericValue), MIN_SPEED_SECONDS),
    MAX_SPEED_SECONDS,
  );
}

function clampGap(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return DEFAULT_GAP_PIXELS;

  return Math.min(
    Math.max(Math.round(numericValue), MIN_GAP_PIXELS),
    MAX_GAP_PIXELS,
  );
}

function asAnnouncementMessages(value: unknown): AnnouncementMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { text: item.trim() };
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const possibleText =
          record.text ?? record.title ?? record.label ?? record.message ?? record.name;
        const possibleUrl = record.url ?? record.link ?? record.href ?? record.linkUrl;

        return {
          text: typeof possibleText === "string" ? possibleText.trim() : "",
          url: typeof possibleUrl === "string" ? possibleUrl.trim() : undefined,
        };
      }

      return { text: "" };
    })
    .filter((item) => item.text);
}

function getHomepageAnnouncements(homepage: unknown): AnnouncementMessage[] {
  if (!homepage || typeof homepage !== "object") return [];

  const record = homepage as Record<string, unknown>;

  const candidates = [
    record.announcements,
    record.announcementItems,
    record.marqueeItems,
    record.marqueeTexts,
    record.tickerItems,
    record.tickerTexts,
    record.newsTicker,
  ];

  for (const candidate of candidates) {
    const values = asAnnouncementMessages(candidate);
    if (values.length > 0) return values;
  }

  const announcementBar = record.announcementBar;
  if (announcementBar && typeof announcementBar === "object") {
    const bar = announcementBar as Record<string, unknown>;
    const values = asAnnouncementMessages(bar.items ?? bar.messages ?? bar.texts);
    if (values.length > 0) return values;
  }

  return [];
}

function getActiveAnnouncementMessages(items: AnnouncementItem[] = []) {
  return items
    .filter((item) => item.isActive !== false && item.text?.trim())
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((item) => ({
      text: item.text.trim(),
      url: item.url?.trim() || undefined,
    }));
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function fillVisibleSlots(messages: AnnouncementMessage[]) {
  if (messages.length >= 3) return messages;

  const minimumSlots = messages.length === 2 ? 4 : 3;

  return Array.from(
    { length: minimumSlots },
    (_, index) => messages[index % messages.length],
  );
}

export default function JournalAnnouncement({
  homepage,
  items,
  announcements,
  className = "",
}: JournalAnnouncementProps) {
  const [settingsAnnouncements, setSettingsAnnouncements] = useState<
    AnnouncementMessage[]
  >([]);
  const [speedSeconds, setSpeedSeconds] = useState(DEFAULT_SPEED_SECONDS);
  const [gapPixels, setGapPixels] = useState(DEFAULT_GAP_PIXELS);
  const [loadedSettings, setLoadedSettings] = useState(false);
  const [failedToLoadSettings, setFailedToLoadSettings] = useState(false);
  const shellRef = useRef<HTMLElement | null>(null);
  const itemMeasureRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [marqueeGeometry, setMarqueeGeometry] = useState({
    gap: DEFAULT_GAP_PIXELS,
    cycleWidth: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const loadSiteSettings = async () => {
      try {
        const settings = await getPublicSiteSettings();

        if (!isMounted) return;

        setSettingsAnnouncements(
          getActiveAnnouncementMessages(settings.announcementItems),
        );
        setSpeedSeconds(clampSpeed(settings.announcementSpeedSeconds));
        setGapPixels(clampGap(settings.announcementGapPixels));
        setFailedToLoadSettings(false);
      } catch (error) {
        console.error("Failed to load journal announcements:", error);

        if (!isMounted) return;

        setFailedToLoadSettings(true);
      } finally {
        if (isMounted) {
          setLoadedSettings(true);
        }
      }
    };

    loadSiteSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const messages = useMemo(() => {
    const propItems = [
      ...asAnnouncementMessages(items),
      ...asAnnouncementMessages(announcements),
      ...getHomepageAnnouncements(homepage),
    ];

    if (settingsAnnouncements.length > 0) return settingsAnnouncements;
    if (propItems.length > 0) return propItems;
    if (failedToLoadSettings) return fallbackAnnouncements;

    return [];
  }, [announcements, failedToLoadSettings, homepage, items, settingsAnnouncements]);

  const displayedMessages = useMemo(
    () => (messages.length > 0 ? fillVisibleSlots(messages) : []),
    [messages],
  );

  useEffect(() => {
    if (displayedMessages.length === 0) return;

    const updateMarqueeGeometry = () => {
      const shellWidth = shellRef.current?.getBoundingClientRect().width ?? 0;
      const itemWidths = itemMeasureRefs.current
        .slice(0, displayedMessages.length)
        .map((item) => item?.getBoundingClientRect().width ?? 0);

      if (shellWidth <= 0 || itemWidths.some((width) => width <= 0)) return;

      const totalItemWidth = itemWidths.reduce((total, width) => total + width, 0);

      // There are as many equal gaps as there are items: the normal gaps
      // inside the sequence plus one split equally across its two edges.
      // That split edge gap joins with the next identical sequence, keeping
      // R1---R2---R3---R1 spacing exactly the same at every loop boundary.
      const gapNeededToFillViewport = Math.max(
        0,
        (shellWidth - totalItemWidth) / displayedMessages.length,
      );
      const equalGap = Math.max(gapPixels, gapNeededToFillViewport);
      const cycleWidth = totalItemWidth + equalGap * displayedMessages.length;

      setMarqueeGeometry((current) => {
        const nextGap = Math.round(equalGap * 100) / 100;
        const nextCycleWidth = Math.ceil(cycleWidth);

        if (
          Math.abs(current.gap - nextGap) < 0.5 &&
          Math.abs(current.cycleWidth - nextCycleWidth) < 1
        ) {
          return current;
        }

        return { gap: nextGap, cycleWidth: nextCycleWidth };
      });
    };

    updateMarqueeGeometry();

    const resizeObserver = new ResizeObserver(updateMarqueeGeometry);
    if (shellRef.current) resizeObserver.observe(shellRef.current);

    document.fonts?.ready.then(updateMarqueeGeometry).catch(() => undefined);

    return () => resizeObserver.disconnect();
  }, [displayedMessages, gapPixels]);

  if (!loadedSettings && displayedMessages.length === 0) return null;
  if (displayedMessages.length === 0) return null;

  const equalGap = marqueeGeometry.gap || gapPixels;
  const cycleWidth = marqueeGeometry.cycleWidth;

  const trackStyle = {
    "--announcement-duration": `${speedSeconds}s`,
    "--announcement-gap": `${equalGap}px`,
    "--announcement-translate": cycleWidth ? `-${cycleWidth}px` : "-100vw",
    animationPlayState: cycleWidth ? undefined : "paused",
  } as CSSProperties;

  const groupStyle = {
    display: "flex",
    boxSizing: "border-box",
    flex: cycleWidth ? `0 0 ${cycleWidth}px` : "0 0 auto",
    width: cycleWidth ? `${cycleWidth}px` : "max-content",
    minWidth: cycleWidth ? `${cycleWidth}px` : "max-content",
    columnGap: `${equalGap}px`,
    paddingInline: `${equalGap / 2}px`,
  } as CSSProperties;

  const renderMessageText = (message: AnnouncementMessage) => {
    if (!message.url) return <span>{message.text}</span>;

    return (
      <a
        href={message.url}
        target={isExternalUrl(message.url) ? "_blank" : undefined}
        rel={isExternalUrl(message.url) ? "noreferrer" : undefined}
        className="journal-announcement-link"
      >
        {message.text}
      </a>
    );
  };

  const renderSequence = (hidden = false, collectMeasurements = false) => (
    <div
      className="journal-announcement-group"
      aria-hidden={hidden || undefined}
      style={groupStyle}
    >
      {displayedMessages.map((message, index) => (
        <span
          className="journal-announcement-item"
          key={`${message.text}-${message.url || "text"}-${index}`}
          ref={
            collectMeasurements
              ? (element) => {
                  itemMeasureRefs.current[index] = element;
                }
              : undefined
          }
          style={{ flex: "0 0 auto" }}
        >
          <span className="journal-announcement-dot" />
          {renderMessageText(message)}
        </span>
      ))}
    </div>
  );

  return (
    <section
      ref={shellRef}
      className={`journal-announcement-shell ${className}`}
      aria-label="Journal announcements"
    >
      <div className="journal-announcement-fade journal-announcement-fade-left" />
      <div className="journal-announcement-fade journal-announcement-fade-right" />

      <div className="journal-announcement-track" style={trackStyle}>
        {renderSequence(false, true)}
        {renderSequence(true)}
      </div>
    </section>
  );
}
