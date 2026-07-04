"use client";

import { useEffect, useMemo, useState } from "react";
import { getPublicSiteSettings } from "@/services/siteSettingsService";
import type { AnnouncementItem } from "@/services/siteSettingsService";

type JournalAnnouncementProps = {
  homepage?: unknown;
  items?: string[];
  announcements?: string[];
  className?: string;
};

const fallbackAnnouncements = [
  "SUBMIT YOUR MANUSCRIPT TODAY",
  "WELCOME TO THE JOURNAL OF FST",
  "CALL FOR PAPERS",
  "EXPLORE CURRENT AND ARCHIVED ISSUES OF THE JOURNAL",
  "SUBMIT YOUR RESEARCH MANUSCRIPT THROUGH THE ONLINE SUBMISSION SYSTEM",
];

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const possibleText =
          record.text ?? record.title ?? record.label ?? record.message ?? record.name;
        return typeof possibleText === "string" ? possibleText : "";
      }
      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
}

function getHomepageAnnouncements(homepage: unknown): string[] {
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
    const values = asStringArray(candidate);
    if (values.length > 0) return values;
  }

  const announcementBar = record.announcementBar;
  if (announcementBar && typeof announcementBar === "object") {
    const bar = announcementBar as Record<string, unknown>;
    const values = asStringArray(bar.items ?? bar.messages ?? bar.texts);
    if (values.length > 0) return values;
  }

  return [];
}

function getActiveAnnouncementTexts(items: AnnouncementItem[] = []) {
  return items
    .filter((item) => item.isActive !== false && item.text?.trim())
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((item) => item.text.trim());
}

export default function JournalAnnouncement({
  homepage,
  items,
  announcements,
  className = "",
}: JournalAnnouncementProps) {
  const [settingsAnnouncements, setSettingsAnnouncements] = useState<string[]>([]);
  const [loadedSettings, setLoadedSettings] = useState(false);
  const [failedToLoadSettings, setFailedToLoadSettings] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSiteSettings = async () => {
      try {
        const settings = await getPublicSiteSettings();

        if (!isMounted) return;

        setSettingsAnnouncements(
          getActiveAnnouncementTexts(settings.announcementItems)
        );
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
      ...asStringArray(items),
      ...asStringArray(announcements),
      ...getHomepageAnnouncements(homepage),
    ];

    if (settingsAnnouncements.length > 0) return settingsAnnouncements;
    if (propItems.length > 0) return propItems;
    if (failedToLoadSettings) return fallbackAnnouncements;

    return [];
  }, [announcements, failedToLoadSettings, homepage, items, settingsAnnouncements]);

  if (!loadedSettings && messages.length === 0) return null;
  if (messages.length === 0) return null;

  // Repeat inside each group so one group is always wider than the screen.
  // Then render two identical groups; the CSS moves exactly one group width.
  const loopItems = [...messages, ...messages, ...messages];

  const renderGroup = (hidden = false) => (
    <div className="journal-announcement-group" aria-hidden={hidden || undefined}>
      {loopItems.map((message, index) => (
        <span className="journal-announcement-item" key={`${message}-${index}`}>
          <span className="journal-announcement-dot" />
          <span>{message}</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className={`journal-announcement-shell ${className}`} aria-label="Journal announcements">
      <div className="journal-announcement-fade journal-announcement-fade-left" />
      <div className="journal-announcement-fade journal-announcement-fade-right" />

      <div className="journal-announcement-track">
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </section>
  );
}
