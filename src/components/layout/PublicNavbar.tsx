"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import JournalDropdownMenu, {
  DropdownMenuItem,
} from "@/components/common/JournalDropdownMenu";
import { getPublicIssues } from "@/services/issues.service";
import {
  getPublicMenus,
  PublicMenuItem,
  PublicMenuLocation,
} from "@/services/publicMenuService";
import type { Issue } from "@/types/issue";

const fallbackAboutItems: DropdownMenuItem[] = [
  { label: "About the Journal", href: "/about/about-the-journal" },
  { label: "Aims & Scope", href: "/about/aims-scope" },
  { label: "Policies & Ethics", href: "/about/policies-ethics" },
  { label: "Open Access Statement", href: "/about/open-access-statement" },
  { label: "Abstracting & Indexing", href: "/about/abstracting-indexing" },
  { label: "Contact Us", href: "/contact" },
];

const fallbackIssueItems: DropdownMenuItem[] = [
  { label: "Current Issue", href: "/issues/current" },
  { label: "All Issues / Archive", href: "/issues/archive" },
  { label: "Special Issues", href: "/issues/special" },
  { label: "Most Cited", href: "/issues/most-cited" },
  { label: "Most Read", href: "/issues/most-read" },
];

const fallbackAuthorItems: DropdownMenuItem[] = [
  { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
  { label: "Submission Guidelines", href: "/for-authors/submission-guidelines" },
  { label: "Peer Review Process", href: "/for-authors/peer-review-process" },
  {
    label: "Article Processing Charge",
    href: "/for-authors/article-processing-charge",
  },
  { label: "Copyright & Licensing", href: "/for-authors/copyright-licensing" },
  { label: "Templates", href: "/for-authors/templates" },
];

const editorialItems: DropdownMenuItem[] = [
  { label: "Chief Patron", href: "/editorial-board#chief-patron" },
  { label: "Chief Editor", href: "/editorial-board#chief-editor" },
  { label: "Editor", href: "/editorial-board#editor" },
  { label: "Assistant Editors", href: "/editorial-board#assistant-editors" },
  {
    label: "Editorial Advisory Board",
    href: "/editorial-board#editorial-advisory-board",
  },
];

const submitManuscriptUrl = "https://jfst.bup.edu.bd/index.php/jfst/login";

const sortMenus = <T extends { order?: number; label: string }>(items: T[]) => {
  return [...items].sort((a, b) => {
    const orderA = Number(a.order || 0);
    const orderB = Number(b.order || 0);

    if (orderA !== orderB) return orderA - orderB;

    return a.label.localeCompare(b.label);
  });
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const normalizeUrl = (url?: string) => {
  const cleanUrl = (url || "").trim();
  return cleanUrl || "#";
};

const isInternalUrl = (url: string) => url.startsWith("/");

const getParentId = (item: PublicMenuItem) => {
  if (!item.parentId) return "";
  return String(item.parentId);
};

const getItemsByLocation = (
  menus: PublicMenuItem[],
  location: PublicMenuLocation
) => {
  return menus.filter((item) => item.location === location && item.isActive);
};

const findMainMenu = (menus: PublicMenuItem[], checks: string[]) => {
  const normalizedChecks = checks.map(normalizeText);

  return sortMenus(menus).find((item) => {
    const label = normalizeText(item.label);

    return (
      item.location === "main" &&
      item.isActive &&
      !getParentId(item) &&
      normalizedChecks.some((check) => label === check || label.includes(check))
    );
  });
};

const toDropdownItems = (
  items: PublicMenuItem[],
  isAllowedUrl: (href: string) => boolean
): DropdownMenuItem[] => {
  const seen = new Set<string>();

  return sortMenus(items)
    .filter((item) => item.isActive && item.type !== "dropdown")
    .map((item) => ({
      label: item.label.trim(),
      href: normalizeUrl(item.url),
      isExternal: item.isExternal,
      openInNewTab: item.openInNewTab,
    }))
    .filter((item) => {
      if (!item.label || item.href === "#") return false;

      const allowedExternal = item.isExternal && !isInternalUrl(item.href);
      const allowedInternal = isAllowedUrl(item.href);

      if (!allowedExternal && !allowedInternal) return false;

      const key = `${normalizeText(item.label)}::${item.href}`;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
};

const mergeWithFallback = (
  apiItems: DropdownMenuItem[],
  fallbackItems: DropdownMenuItem[]
) => {
  const result: DropdownMenuItem[] = [];
  const hrefs = new Set<string>();
  const labels = new Set<string>();

  [...apiItems, ...fallbackItems].forEach((item) => {
    const cleanLabel = item.label.trim();
    const cleanHref = normalizeUrl(item.href);
    const labelKey = normalizeText(cleanLabel);

    if (!cleanLabel || cleanHref === "#") return;
    if (hrefs.has(cleanHref) || labels.has(labelKey)) return;

    result.push({ ...item, label: cleanLabel, href: cleanHref });
    hrefs.add(cleanHref);
    labels.add(labelKey);
  });

  return result;
};

const getSafeDropdownItems = (
  menus: PublicMenuItem[],
  location: PublicMenuLocation,
  fallbackItems: DropdownMenuItem[],
  isAllowedUrl: (href: string) => boolean
) => {
  const apiItems = toDropdownItems(
    getItemsByLocation(menus, location),
    isAllowedUrl
  );

  return mergeWithFallback(apiItems, fallbackItems);
};

const getIssueDateValue = (issue: Issue) => {
  const dateText = issue.publishDateLabel || issue.createdAt || issue.updatedAt || "";
  const parsedDate = Date.parse(dateText);

  return Number.isNaN(parsedDate) ? 0 : parsedDate;
};

const sortIssuesLatestToOld = (issues: Issue[]) => {
  return [...issues].sort((a, b) => {
    const orderA = Number(a.order ?? 9999);
    const orderB = Number(b.order ?? 9999);

    if (orderA !== orderB) return orderA - orderB;

    const dateDifference = getIssueDateValue(b) - getIssueDateValue(a);
    if (dateDifference !== 0) return dateDifference;

    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
};

const getIssueDropdownLabel = (issue: Issue) => {
  const volumeText = issue.volume ? `Volume ${issue.volume}` : "";
  const issueText = issue.issueNumber ? `Issue ${issue.issueNumber}` : "";
  const dateText = issue.publishDateLabel || "";

  const label = [volumeText, issueText, dateText].filter(Boolean).join(", ");

  return label || issue.title || "View Issue";
};

function SmartLink({
  href,
  label,
  className,
  isExternal,
  openInNewTab,
  onClick,
}: {
  href: string;
  label: string;
  className: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
  onClick?: () => void;
}) {
  const target = openInNewTab ? "_blank" : undefined;
  const rel = openInNewTab ? "noopener noreferrer" : undefined;

  if (isExternal) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {label}
    </Link>
  );
}

export default function PublicNavbar() {
  const router = useRouter();
  const navbarRef = useRef<HTMLElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menus, setMenus] = useState<PublicMenuItem[]>([]);
  const [publicIssues, setPublicIssues] = useState<Issue[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isNavbarStuck, setIsNavbarStuck] = useState(false);

  useEffect(() => {
    const fetchNavbarData = async () => {
      const [menusResult, issuesResult] = await Promise.allSettled([
        getPublicMenus(),
        getPublicIssues(),
      ]);

      setMenus(menusResult.status === "fulfilled" ? menusResult.value : []);
      setPublicIssues(
        issuesResult.status === "fulfilled" ? issuesResult.value : []
      );
    };

    fetchNavbarData();
  }, []);

  useEffect(() => {
    const checkNavbarPosition = () => {
      const navbar = navbarRef.current;
      if (!navbar) return;

      const navbarTop = navbar.getBoundingClientRect().top;

      setIsNavbarStuck(navbarTop <= 0 && window.scrollY > 40);
    };

    checkNavbarPosition();

    window.addEventListener("scroll", checkNavbarPosition, { passive: true });
    window.addEventListener("resize", checkNavbarPosition);

    return () => {
      window.removeEventListener("scroll", checkNavbarPosition);
      window.removeEventListener("resize", checkNavbarPosition);
    };
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanSearch = searchText.trim();

    if (!cleanSearch) return;

    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(cleanSearch)}`);
  };

  const activeMenus = useMemo(() => menus.filter((menu) => menu.isActive), [menus]);

  const aboutItems = useMemo(() => {
    return getSafeDropdownItems(
      activeMenus,
      "about",
      fallbackAboutItems,
      (href) => href.startsWith("/about/") || href === "/contact"
    );
  }, [activeMenus]);

  const issueItems = useMemo(() => {
    const dynamicIssueItems = sortIssuesLatestToOld(publicIssues).map(
      (issue) => ({
        label: getIssueDropdownLabel(issue),
        href: `/issues/${issue.slug}`,
      })
    );

    if (dynamicIssueItems.length > 0) {
      return mergeWithFallback(dynamicIssueItems, [
        { label: "All Issues / Archive", href: "/issues/archive" },
      ]);
    }

    return getSafeDropdownItems(
      activeMenus,
      "issues",
      fallbackIssueItems,
      (href) => href.startsWith("/issues/")
    );
  }, [activeMenus, publicIssues]);

  const authorItems = useMemo(() => {
    return getSafeDropdownItems(
      activeMenus,
      "for-authors",
      fallbackAuthorItems,
      (href) => href.startsWith("/for-authors/")
    );
  }, [activeMenus]);

  const homeMenu = findMainMenu(activeMenus, ["home"]);
  const aboutMenu = findMainMenu(activeMenus, ["about"]);
  const issuesMenu = findMainMenu(activeMenus, ["issues"]);
  const authorsMenu = findMainMenu(activeMenus, ["for authors", "authors"]);
  const editorialMenu = findMainMenu(activeMenus, ["editorial board", "editorial"]);
  const cfpMenu = findMainMenu(activeMenus, ["call for papers", "call for paper"]);
  const submitMenu = findMainMenu(activeMenus, ["submit manuscript", "submission"]);

  return (
    <header
      ref={navbarRef}
      className={`journal-navbar sticky top-0 z-[100] border-b backdrop-blur-xl transition-all duration-300 ${
        isNavbarStuck
          ? "journal-navbar-stuck border-[#15395e]/70 bg-[#071a33]/95 shadow-[0_16px_40px_rgba(2,8,23,0.22)]"
          : "border-slate-200 bg-white/95 shadow-sm"
      }`}
    >
      <Container>
        <nav className="flex min-h-[78px] items-center justify-between gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <div className="journal-logo-wrap relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm transition-all duration-300">
              <Image
                src="/images/bup.png"
                alt="Bangladesh University of Professionals"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            <SmartLink
              href={normalizeUrl(homeMenu?.url || "/")}
              label={homeMenu?.label || "Home"}
              isExternal={homeMenu?.isExternal}
              openInNewTab={homeMenu?.openInNewTab}
              className="nav-link"
            />

            <JournalDropdownMenu
              label={aboutMenu?.label || "About"}
              items={aboutItems}
            />

            <JournalDropdownMenu
              label={issuesMenu?.label || "Issues"}
              items={issueItems}
            />

            <JournalDropdownMenu
              label={editorialMenu?.label || "Editorial Board"}
              items={editorialItems}
            />

            <JournalDropdownMenu
              label={authorsMenu?.label || "For Authors"}
              items={authorItems}
            />

            <SmartLink
              href={normalizeUrl(cfpMenu?.url || "/call-for-papers")}
              label={cfpMenu?.label || "Call for Papers"}
              isExternal={cfpMenu?.isExternal}
              openInNewTab={cfpMenu?.openInNewTab}
              className="journal-cfp-button inline-flex items-center rounded-full border border-[#111433] bg-[#111433] px-4 py-2 text-[14px] font-semibold text-white transition-all duration-300 hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433]"
            />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <form
              onSubmit={handleSearch}
              className="journal-search-form flex h-11 w-[250px] overflow-hidden rounded-full border border-slate-200 bg-slate-50 transition-all duration-300 focus-within:border-[#22b8e8]"
            >
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search journal"
                className="journal-search-input min-w-0 flex-1 bg-transparent px-4 text-[14px] text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="journal-search-button cursor-pointer px-4 text-[13px] font-medium text-[#111433] transition-all duration-300 hover:text-[#22b8e8]"
              >
                Search
              </button>
            </form>

            <SmartLink
              href={submitManuscriptUrl}
              label={submitMenu?.label || "Submit Manuscript"}
              isExternal
              openInNewTab={false}
              className="journal-submit-button inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[#111433] bg-[#111433] px-5 text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#1e2557]"
            />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[22px] font-semibold text-[#111433] shadow-sm xl:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200 py-4 xl:hidden">
            <div className="grid gap-2">
              <MobileLink
                href={normalizeUrl(homeMenu?.url || "/")}
                label={homeMenu?.label || "Home"}
                isExternal={homeMenu?.isExternal}
                openInNewTab={homeMenu?.openInNewTab}
                onClick={() => setMenuOpen(false)}
              />

              <MobileGroup
                title={aboutMenu?.label || "About"}
                items={aboutItems}
                onClick={() => setMenuOpen(false)}
              />

              <MobileGroup
                title={issuesMenu?.label || "Issues"}
                items={issueItems}
                onClick={() => setMenuOpen(false)}
              />

              <MobileGroup
                title={editorialMenu?.label || "Editorial Board"}
                items={editorialItems}
                onClick={() => setMenuOpen(false)}
              />

              <MobileGroup
                title={authorsMenu?.label || "For Authors"}
                items={authorItems}
                onClick={() => setMenuOpen(false)}
              />

              <SmartLink
                href={normalizeUrl(cfpMenu?.url || "/call-for-papers")}
                label={cfpMenu?.label || "Call for Papers"}
                isExternal={cfpMenu?.isExternal}
                openInNewTab={cfpMenu?.openInNewTab}
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-[#111433] bg-[#111433] px-4 text-[14px] font-semibold text-white hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433]"
              />

              <SmartLink
                href={submitManuscriptUrl}
                label={submitMenu?.label || "Submit Manuscript"}
                isExternal
                openInNewTab={false}
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#111433] px-4 text-[14px] font-semibold text-white hover:bg-[#1e2557]"
              />

              <form
                onSubmit={handleSearch}
                className="mt-3 flex h-11 overflow-hidden rounded-full border border-slate-200 bg-slate-50 focus-within:border-[#22b8e8]"
              >
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search journal"
                  className="journal-search-input min-w-0 flex-1 bg-transparent px-4 text-[14px] text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="journal-search-button cursor-pointer px-4 text-[13px] font-medium text-[#111433] transition-all duration-300 hover:text-[#22b8e8]"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

function MobileLink({
  href,
  label,
  onClick,
  isExternal,
  openInNewTab,
}: {
  href: string;
  label: string;
  onClick: () => void;
  isExternal?: boolean;
  openInNewTab?: boolean;
}) {
  return (
    <SmartLink
      href={href}
      label={label}
      onClick={onClick}
      isExternal={isExternal}
      openInNewTab={openInNewTab}
      className="rounded-2xl px-4 py-3 text-[14px] font-medium text-[#111433] hover:bg-[#eef8fc] hover:text-[#22b8e8]"
    />
  );
}

function MobileGroup({
  title,
  items,
  onClick,
}: {
  title: string;
  items: DropdownMenuItem[];
  onClick: () => void;
}) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-[14px] font-semibold text-[#111433]">
        {title}
      </summary>

      <div className="grid gap-1 border-t border-slate-200 bg-slate-50 p-2">
        {items.map((item) => (
          <SmartLink
            key={`${item.label}-${item.href}`}
            href={item.href}
            label={item.label}
            isExternal={item.isExternal}
            openInNewTab={item.openInNewTab}
            onClick={onClick}
            className="rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-white hover:text-[#22b8e8]"
          />
        ))}
      </div>
    </details>
  );
}
