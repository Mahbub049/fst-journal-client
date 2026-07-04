"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
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
  { text: "SUBMIT YOUR RESEARCH MANUSCRIPT THROUGH THE ONLINE SUBMISSION SYSTEM" },
];

const DEFAULT_SPEED_SECONDS = 100;
const MIN_SPEED_SECONDS = 10;
const MAX_SPEED_SECONDS = 300;

function clampSpeed(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return DEFAULT_SPEED_SECONDS;

  return Math.min(
    Math.max(Math.round(numericValue), MIN_SPEED_SECONDS),
    MAX_SPEED_SECONDS
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
  const [loadedSettings, setLoadedSettings] = useState(false);
  const [failedToLoadSettings, setFailedToLoadSettings] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSiteSettings = async () => {
      try {
        const settings = await getPublicSiteSettings();

        if (!isMounted) return;

        setSettingsAnnouncements(
          getActiveAnnouncementMessages(settings.announcementItems)
        );
        setSpeedSeconds(clampSpeed(settings.announcementSpeedSeconds));
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

  if (!loadedSettings && messages.length === 0) return null;
  if (messages.length === 0) return null;

  const loopItems = [...messages, ...messages, ...messages];
  const trackStyle = {
    "--announcement-duration": `${speedSeconds}s`,
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

  const renderGroup = (hidden = false) => (
    <div className="journal-announcement-group" aria-hidden={hidden || undefined}>
      {loopItems.map((message, index) => (
        <span
          className="journal-announcement-item"
          key={`${message.text}-${message.url || "text"}-${index}`}
        >
          <span className="journal-announcement-dot" />
          {renderMessageText(message)}
        </span>
      ))}
    </div>
  );

  return (
    <section
      className={`journal-announcement-shell ${className}`}
      aria-label="Journal announcements"
    >
      <div className="journal-announcement-fade journal-announcement-fade-left" />
      <div className="journal-announcement-fade journal-announcement-fade-right" />

      <div className="journal-announcement-track" style={trackStyle}>
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </section>
  );
}
