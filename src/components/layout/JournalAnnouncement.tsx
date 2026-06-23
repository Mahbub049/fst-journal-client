"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnnouncementItem,
  getPublicSiteSettings,
} from "@/services/siteSettingsService";

const fallbackAnnouncements: AnnouncementItem[] = [
  {
    text: "Welcome to the official website of Journal of FST",
    order: 1,
    isActive: true,
  },
  {
    text: "Call for Papers is now open",
    order: 2,
    isActive: true,
  },
  {
    text: "Submit your research manuscript through the online submission system",
    order: 3,
    isActive: true,
  },
  {
    text: "Explore current and archived issues of the journal",
    order: 4,
    isActive: true,
  },
];

export default function JournalAnnouncement() {
  const [announcements, setAnnouncements] =
    useState<AnnouncementItem[]>(fallbackAnnouncements);

  useEffect(() => {
    const loadAnnouncementItems = async () => {
      try {
        const settings = await getPublicSiteSettings();

        if (Array.isArray(settings.announcementItems)) {
          setAnnouncements(settings.announcementItems);
        }
      } catch {
        setAnnouncements(fallbackAnnouncements);
      }
    };

    loadAnnouncementItems();
  }, []);

  const activeAnnouncements = useMemo(() => {
    return announcements
      .filter((item) => item.isActive && item.text?.trim())
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }, [announcements]);

  if (!activeAnnouncements.length) {
    return null;
  }

  const scrollingItems = [...activeAnnouncements, ...activeAnnouncements];

  return (
    <section className="relative overflow-hidden border-y border-[#1f4566]/60 bg-[#071a33] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,184,232,0.22),rgba(17,20,51,0.95),rgba(245,200,75,0.12))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[#7de4ee]/45" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#7de4ee]/25" />

      <div className="relative flex min-h-[46px] items-center overflow-hidden">
        <div className="journal-announcement-track flex w-max items-center gap-10 whitespace-nowrap px-6">
          {scrollingItems.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/92"
            >
              <span className="h-2 w-2 rounded-full bg-[#7de4ee] shadow-[0_0_14px_rgba(125,228,238,0.8)]" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
