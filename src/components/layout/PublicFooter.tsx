"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/common/Container";
import {
  getPublicSiteSettings,
  SiteSettingsContent,
  UsefulLink,
} from "@/services/siteSettingsService";

const fallbackSettings: SiteSettingsContent = {
  footerJournalTitle: "Journal of FST",
  footerJournalSubtitle: "Bangladesh University of Professionals",
  footerDescription:
    "A scholarly journal platform dedicated to publishing quality research in science, technology, engineering, and related interdisciplinary fields.",
  publisherLabel: "Publisher",
  publisherName: "Faculty of Science & Technology, BUP",
  contactEmail: "journal.fst@bup.edu.bd",
  contactPhone: "",
  address:
    "Bangladesh University of Professionals, Mirpur Cantonment, Dhaka - 1216",
  copyrightText: "Copyright © 2026 Journal of FST. All rights reserved.",
  footerCreditText: "Designed for academic publishing and research visibility.",
  footerCreditUrl: "",
  journalInfoTitle: "Journal Information",
  publishingModel: "Hybrid",
  language: "English",
  publicationFrequency: "Annual",
  usefulLinks: [
    {
      label: "About the Journal",
      url: "/about/about-the-journal",
      group: "Journal",
      order: 1,
      isActive: true,
    },
    {
      label: "Aims & Scope",
      url: "/about/aims-scope",
      group: "Journal",
      order: 2,
      isActive: true,
    },
    {
      label: "Editorial Board",
      url: "/editorial-board",
      group: "Journal",
      order: 3,
      isActive: true,
    },
    {
      label: "Contact",
      url: "/contact",
      group: "Journal",
      order: 4,
      isActive: true,
    },
    {
      label: "Author Guidelines",
      url: "/for-authors/author-guidelines",
      group: "For Authors",
      order: 1,
      isActive: true,
    },
    {
      label: "Submission Guidelines",
      url: "/for-authors/submission-guidelines",
      group: "For Authors",
      order: 2,
      isActive: true,
    },
    {
      label: "Peer Review Process",
      url: "/for-authors/peer-review-process",
      group: "For Authors",
      order: 3,
      isActive: true,
    },
    {
      label: "Templates",
      url: "/for-authors/templates",
      group: "For Authors",
      order: 4,
      isActive: true,
    },
    {
      label: "Current Issue",
      url: "/issues/current",
      group: "Browse",
      order: 1,
      isActive: true,
    },
    {
      label: "Archive",
      url: "/issues/archive",
      group: "Browse",
      order: 2,
      isActive: true,
    },
    {
      label: "Most Cited",
      url: "/issues/most-cited",
      group: "Browse",
      order: 3,
      isActive: true,
    },
    {
      label: "Most Read",
      url: "/issues/most-read",
      group: "Browse",
      order: 4,
      isActive: true,
    },
  ],
  socialLinks: [],
  isPublished: true,
};

const groupOrder = ["Journal", "For Authors", "Browse"];

export default function PublicFooter() {
  const [settings, setSettings] = useState<SiteSettingsContent>(fallbackSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getPublicSiteSettings();
        setSettings({
          ...fallbackSettings,
          ...data,
          usefulLinks: data.usefulLinks?.length
            ? data.usefulLinks
            : fallbackSettings.usefulLinks,
          socialLinks: data.socialLinks || [],
        });
      } catch {
        setSettings(fallbackSettings);
      }
    };

    loadSettings();
  }, []);

  const groupedLinks = useMemo(() => {
    const activeLinks = (settings.usefulLinks || [])
      .filter((item) => item.isActive && item.label && item.url)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    const groups = activeLinks.reduce<Record<string, UsefulLink[]>>(
      (result, item) => {
        const group = item.group || "General";
        result[group] = result[group] || [];
        result[group].push(item);
        return result;
      },
      {}
    );

    return Object.entries(groups).sort(([groupA], [groupB]) => {
      const indexA = groupOrder.indexOf(groupA);
      const indexB = groupOrder.indexOf(groupB);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return groupA.localeCompare(groupB);
    });
  }, [settings.usefulLinks]);

  const activeSocialLinks = (settings.socialLinks || []).filter(
    (item) => item.isActive && item.platform && item.url
  );

  const creditText = settings.footerCreditText || fallbackSettings.footerCreditText;
  const creditUrl = (settings.footerCreditUrl || "").trim();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#07162b] text-white">
      <div className="absolute inset-0 journal-dark-panel" />
      <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#0ea5b7]/10 blur-3xl" />
      <div className="absolute right-[-90px] bottom-[-120px] h-80 w-80 rounded-full bg-[#c7a159]/10 blur-3xl" />

      <Container className="relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
                  <Image
                    src="/images/bup.png"
                    alt="Bangladesh University of Professionals"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>
              </Link>

              <div>
                <h3
                  className="text-[26px] font-semibold leading-none text-white"
                  style={{ fontFamily: "var(--font-source-serif)" }}
                >
                  {settings.footerJournalTitle || fallbackSettings.footerJournalTitle}
                </h3>
                <p className="pt-1 text-[13px] font-medium text-white/60">
                  {settings.footerJournalSubtitle ||
                    fallbackSettings.footerJournalSubtitle}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/66">
              {settings.footerDescription || fallbackSettings.footerDescription}
            </p>

            <div className="mt-6 rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-md">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#7de4ee]">
                {settings.publisherLabel || fallbackSettings.publisherLabel}
              </p>
              <p className="mt-2 text-[15px] font-bold text-white">
                {settings.publisherName || fallbackSettings.publisherName}
              </p>
            </div>

            {activeSocialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {activeSocialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[13px] font-semibold text-white/75 transition hover:bg-white/14 hover:text-white"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {groupedLinks.map(([title, links]) => (
            <FooterColumn
              key={title}
              title={title}
              links={links.map((item) => [item.label, item.url] as [string, string])}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/52 md:flex-row md:items-center md:justify-between">
          <p>{settings.copyrightText || fallbackSettings.copyrightText}</p>

          {creditUrl ? (
            creditUrl.startsWith("/") ? (
              <Link
                href={creditUrl}
                className="transition hover:text-white"
              >
                {creditText}
              </Link>
            ) : (
              <a
                href={creditUrl}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                {creditText}
              </a>
            )
          ) : (
            <p>{creditText}</p>
          )}
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4
        className="text-[21px] font-semibold text-white"
        style={{ fontFamily: "var(--font-source-serif)" }}
      >
        {title}
      </h4>
      <div className="mt-3 h-[3px] w-12 rounded-full bg-[#0ea5b7]" />
      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <li key={`${label}-${href}`}>
            <Link href={href} className="footer-link">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
