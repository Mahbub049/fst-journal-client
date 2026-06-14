"use client";

import {
  FormEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const submitManuscriptUrl = "https://jfst.bup.edu.bd/index.php/jfst/login";

const fallbackAboutItems: DropdownMenuItem[] = [
  { label: "About the Journal", href: "/about/about-the-journal" },
  { label: "Aims & Scope", href: "/about/aims-scope" },
  { label: "Policies & Ethics", href: "/about/policies-ethics" },
  { label: "Open Access Statement", href: "/about/open-access-statement" },
  { label: "Abstracting & Indexing", href: "/about/abstracting-indexing" },
  { label: "Contact Us", href: "/contact" },
];

const fallbackIssueItems: DropdownMenuItem[] = [
  {
    label: "Volume 03, Issue 01, July 2025",
    href: "/issues/volume-03-issue-01-july-2025",
  },
  {
    label: "Volume 02, Issue 01, July 2023",
    href: "/issues/volume-02-issue-01-july-2023",
  },
  {
    label: "Volume 01, Issue 01, July 2022",
    href: "/issues/volume-01-issue-01-july-2022",
  },
  { label: "All Issues / Archive", href: "/issues/archive" },
];

const fallbackAuthorItems: DropdownMenuItem[] = [
  { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
  {
    label: "Submission Guidelines",
    href: "/for-authors/submission-guidelines",
  },
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

const isAbsoluteUrl = (href: string) => {
  return /^(https?:\/\/|mailto:|tel:)/i.test(href);
};

const isInternalUrl = (url: string) => url.startsWith("/");

const getParentId = (item: PublicMenuItem) => {
  if (!item.parentId) return "";
  return String(item.parentId);
};

const getItemsByLocation = (
  menus: PublicMenuItem[],
  location: PublicMenuLocation,
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
  isAllowedUrl: (href: string) => boolean,
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
  fallbackItems: DropdownMenuItem[],
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
  isAllowedUrl: (href: string) => boolean,
) => {
  const apiItems = toDropdownItems(
    getItemsByLocation(menus, location),
    isAllowedUrl,
  );

  return mergeWithFallback(apiItems, fallbackItems);
};

const getIssueDateValue = (issue: Issue) => {
  const dateText =
    issue.publishDateLabel || issue.createdAt || issue.updatedAt || "";
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

const scrollToHashTarget = (
  hash: string,
  behavior: ScrollBehavior = "smooth",
) => {
  if (!hash || typeof window === "undefined") return;

  const targetId = decodeURIComponent(hash.replace("#", ""));
  const targetElement = document.getElementById(targetId);

  if (!targetElement) return;

  const navbarHeight =
    document.querySelector<HTMLElement>(".journal-navbar")?.offsetHeight || 0;
  const extraGap = window.innerWidth < 768 ? 18 : 24;
  const targetTop =
    targetElement.getBoundingClientRect().top +
    window.scrollY -
    navbarHeight -
    extraGap;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior,
  });
};

const requestHashScroll = (
  hash: string,
  behavior: ScrollBehavior = "smooth",
) => {
  if (!hash || typeof window === "undefined") return;

  const delays = [80, 220, 420];

  delays.forEach((delay) => {
    window.setTimeout(() => scrollToHashTarget(hash, behavior), delay);
  });
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
  const cleanHref = normalizeUrl(href);
  const target = openInNewTab ? "_blank" : undefined;
  const rel = openInNewTab ? "noopener noreferrer" : undefined;
  const shouldUseAnchor = isExternal || isAbsoluteUrl(cleanHref);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      const targetUrl = new URL(cleanHref, window.location.origin);
      const currentUrl = new URL(window.location.href);
      const isSamePage =
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search;

      if (isSamePage && targetUrl.hash) {
        event.preventDefault();

        onClick?.();
        window.history.pushState(
          null,
          "",
          `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
        );
        requestHashScroll(targetUrl.hash);

        return;
      }

      if (isSamePage && !targetUrl.hash) {
        event.preventDefault();

        onClick?.();
        window.history.pushState(
          null,
          "",
          `${targetUrl.pathname}${targetUrl.search}`,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });

        return;
      }
    }

    onClick?.();
  };

  if (shouldUseAnchor) {
    return (
      <a
        href={cleanHref}
        target={target}
        rel={rel}
        onClick={handleClick}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={cleanHref}
      scroll={!cleanHref.includes("#")}
      onClick={handleClick}
      className={className}
    >
      {label}
    </Link>
  );
}

export default function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const navbarRef = useRef<HTMLElement | null>(null);
  const mobileMenuTimerRef = useRef<ReturnType<
    typeof window.setTimeout
  > | null>(null);

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
        issuesResult.status === "fulfilled" ? issuesResult.value : [],
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

  useEffect(() => {
    return () => {
      if (mobileMenuTimerRef.current) {
        window.clearTimeout(mobileMenuTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const closeOnOutsideClick = (event: PointerEvent) => {
      const navbar = navbarRef.current;
      const target = event.target as Node | null;

      if (!navbar || !target || navbar.contains(target)) return;

      setMenuOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeMobileMenuOnDesktop = () => {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeMobileMenuOnDesktop);

    return () => {
      window.removeEventListener("resize", closeMobileMenuOnDesktop);
    };
  }, []);

  useEffect(() => {
    const scrollToCurrentHash = () => {
      requestHashScroll(window.location.hash);
    };

    scrollToCurrentHash();

    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHash);
    };
  }, [pathname]);

  const handleMobileMenuToggle = () => {
    if (mobileMenuTimerRef.current) {
      window.clearTimeout(mobileMenuTimerRef.current);
      mobileMenuTimerRef.current = null;
    }

    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const navbar = navbarRef.current;

    if (navbar && window.innerWidth < 1280) {
      const navbarTop = navbar.getBoundingClientRect().top;
      const targetScrollTop = Math.max(0, window.scrollY + navbarTop);

      if (Math.abs(navbarTop) > 4) {
        window.scrollTo({ top: targetScrollTop, behavior: "smooth" });

        const openingDelay = Math.min(
          420,
          Math.max(260, Math.abs(navbarTop) * 0.75),
        );

        mobileMenuTimerRef.current = window.setTimeout(() => {
          setMenuOpen(true);
          mobileMenuTimerRef.current = null;
        }, openingDelay);

        return;
      }
    }

    setMenuOpen(true);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanSearch = searchText.trim();

    if (!cleanSearch) return;

    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(cleanSearch)}`);
  };

  const activeMenus = useMemo(
    () => menus.filter((menu) => menu.isActive),
    [menus],
  );

  const aboutItems = useMemo(() => {
    return getSafeDropdownItems(
      activeMenus,
      "about",
      fallbackAboutItems,
      (href) => href.startsWith("/about/") || href === "/contact",
    );
  }, [activeMenus]);

  const issueItems = useMemo(() => {
    const dynamicIssueItems = sortIssuesLatestToOld(publicIssues).map(
      (issue) => ({
        label: getIssueDropdownLabel(issue),
        href: `/issues/${issue.slug}`,
      }),
    );

    if (dynamicIssueItems.length > 0) {
      return mergeWithFallback(dynamicIssueItems, [
        { label: "All Issues / Archive", href: "/issues/archive" },
      ]);
    }

    return fallbackIssueItems;
  }, [publicIssues]);

  const authorItems = useMemo(() => {
    return getSafeDropdownItems(
      activeMenus,
      "for-authors",
      fallbackAuthorItems,
      (href) => href.startsWith("/for-authors/"),
    );
  }, [activeMenus]);

  const homeMenu = findMainMenu(activeMenus, ["home"]);
  const aboutMenu = findMainMenu(activeMenus, ["about"]);
  const issuesMenu = findMainMenu(activeMenus, ["issues"]);
  const authorsMenu = findMainMenu(activeMenus, ["for authors", "authors"]);
  const editorialMenu = findMainMenu(activeMenus, [
    "editorial board",
    "editorial",
  ]);
  const cfpMenu = findMainMenu(activeMenus, [
    "call for papers",
    "call for paper",
  ]);
  const submitMenu = findMainMenu(activeMenus, [
    "submit manuscript",
    "submission",
  ]);

  const homeHref = normalizeUrl(homeMenu?.url || "/");
  const aboutHref = "/about/about-the-journal";
  const issuesHref = "/issues/archive";
  const editorialHref = "/editorial-board";
  const authorsHref = "/for-authors/author-guidelines";

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
              href={homeHref}
              label={homeMenu?.label || "Home"}
              isExternal={homeMenu?.isExternal}
              openInNewTab={homeMenu?.openInNewTab}
              className="nav-link whitespace-nowrap"
            />

            <JournalDropdownMenu
              label={aboutMenu?.label || "About"}
              href={aboutHref}
              isExternal={aboutMenu?.isExternal}
              openInNewTab={aboutMenu?.openInNewTab}
              items={aboutItems}
            />

            <JournalDropdownMenu
              label={issuesMenu?.label || "Issues"}
              href={issuesHref}
              isExternal={issuesMenu?.isExternal}
              openInNewTab={issuesMenu?.openInNewTab}
              items={issueItems}
            />

            <JournalDropdownMenu
              label={editorialMenu?.label || "Editorial Board"}
              href={editorialHref}
              isExternal={editorialMenu?.isExternal}
              openInNewTab={editorialMenu?.openInNewTab}
              items={editorialItems}
            />

            <JournalDropdownMenu
              label={authorsMenu?.label || "For Authors"}
              href={authorsHref}
              isExternal={authorsMenu?.isExternal}
              openInNewTab={authorsMenu?.openInNewTab}
              items={authorItems}
            />

            <SmartLink
              href={normalizeUrl(cfpMenu?.url || "/call-for-papers")}
              label={cfpMenu?.label || "Call for Papers"}
              isExternal={cfpMenu?.isExternal}
              openInNewTab={cfpMenu?.openInNewTab}
              className="journal-cfp-button inline-flex items-center whitespace-nowrap rounded-full border border-[#111433] bg-[#111433] px-4 py-2 text-[14px] font-semibold text-white transition-all duration-300 hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433]"
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
              href={normalizeUrl(submitMenu?.url || submitManuscriptUrl)}
              label={submitMenu?.label || "Submit Manuscript"}
              isExternal={submitMenu?.isExternal ?? true}
              openInNewTab={submitMenu?.openInNewTab ?? true}
              className="journal-submit-button inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#111433] bg-[#111433] px-5 text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#1e2557]"
            />
          </div>

          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[22px] font-semibold text-[#111433] shadow-sm transition-all duration-300 hover:scale-105 hover:border-[#22b8e8] hover:bg-[#eef8fc] active:scale-95 xl:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`inline-block transition-transform duration-300 ease-out ${
                menuOpen ? "rotate-90 scale-110" : "rotate-0 scale-100"
              }`}
            >
              {menuOpen ? "×" : "☰"}
            </span>
          </button>
        </nav>

        <div
          className={`border-t border-slate-200 transition-all duration-500 ease-in-out xl:hidden ${
            menuOpen
              ? "max-h-[calc(100dvh-78px)] translate-y-0 overflow-y-auto overscroll-contain touch-pan-y py-4 opacity-100"
              : "max-h-0 -translate-y-2 overflow-hidden border-transparent py-0 opacity-0"
          }`}
        >
          <div
            className={`grid gap-2 pr-1 transition-all duration-500 ease-in-out ${
              menuOpen ? "scale-100" : "scale-[0.98]"
            }`}
          >
            <MobileLink
              href={homeHref}
              label={homeMenu?.label || "Home"}
              isExternal={homeMenu?.isExternal}
              openInNewTab={homeMenu?.openInNewTab}
              onClick={() => setMenuOpen(false)}
            />

            <MobileGroup
              title={aboutMenu?.label || "About"}
              href={aboutHref}
              isExternal={aboutMenu?.isExternal}
              openInNewTab={aboutMenu?.openInNewTab}
              items={aboutItems}
              onClick={() => setMenuOpen(false)}
            />

            <MobileGroup
              title={issuesMenu?.label || "Issues"}
              href={issuesHref}
              isExternal={issuesMenu?.isExternal}
              openInNewTab={issuesMenu?.openInNewTab}
              items={issueItems}
              onClick={() => setMenuOpen(false)}
            />

            <MobileGroup
              title={editorialMenu?.label || "Editorial Board"}
              href={editorialHref}
              isExternal={editorialMenu?.isExternal}
              openInNewTab={editorialMenu?.openInNewTab}
              items={editorialItems}
              onClick={() => setMenuOpen(false)}
            />

            <MobileGroup
              title={authorsMenu?.label || "For Authors"}
              href={authorsHref}
              isExternal={authorsMenu?.isExternal}
              openInNewTab={authorsMenu?.openInNewTab}
              items={authorItems}
              onClick={() => setMenuOpen(false)}
            />

            <SmartLink
              href={normalizeUrl(cfpMenu?.url || "/call-for-papers")}
              label={cfpMenu?.label || "Call for Papers"}
              isExternal={cfpMenu?.isExternal}
              openInNewTab={cfpMenu?.openInNewTab}
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-[#111433] bg-[#111433] px-4 text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433] hover:shadow-md active:scale-[0.99]"
            />

            <SmartLink
              href={normalizeUrl(submitMenu?.url || submitManuscriptUrl)}
              label={submitMenu?.label || "Submit Manuscript"}
              isExternal={submitMenu?.isExternal ?? true}
              openInNewTab={submitMenu?.openInNewTab ?? true}
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#111433] px-4 text-[14px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1e2557] hover:shadow-md active:scale-[0.99]"
            />

            <form
              onSubmit={handleSearch}
              className="mt-3 flex h-11 overflow-hidden rounded-full border border-slate-200 bg-slate-50 transition-all duration-300 focus-within:border-[#22b8e8]"
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
      className="rounded-full border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-[#111433] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#22b8e8] hover:bg-[#eef8fc] hover:text-[#087895] hover:shadow-md active:scale-[0.99]"
    />
  );
}

function MobileGroup({
  title,
  href,
  isExternal,
  openInNewTab,
  items,
  onClick,
}: {
  title: string;
  href: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
  items: DropdownMenuItem[];
  onClick: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const showParentLink = href && href !== "#";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#22b8e8] hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[14px] font-semibold text-[#111433] transition-all duration-300 hover:bg-[#eef8fc] hover:text-[#087895] active:bg-[#e3f5fb]"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span
          aria-hidden="true"
          className={`text-[12px] leading-none transition-transform duration-300 ease-out ${
            isOpen ? "rotate-180 text-[#087895]" : "rotate-0 text-slate-500"
          }`}
        >
          ▼
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-1 border-t border-slate-200 bg-slate-50 p-2">
            {showParentLink ? (
              <SmartLink
                href={href}
                label={`Open ${title}`}
                isExternal={isExternal}
                openInNewTab={openInNewTab}
                onClick={onClick}
                className="rounded-xl bg-white px-4 py-2.5 text-[14px] font-semibold text-[#111433] transition-all duration-300 hover:bg-[#eef8fc] hover:text-[#087895] active:scale-[0.99]"
              />
            ) : null}

            {items.map((item) => (
              <SmartLink
                key={`${item.label}-${item.href}`}
                href={item.href}
                label={item.label}
                isExternal={item.isExternal}
                openInNewTab={item.openInNewTab}
                onClick={onClick}
                className="rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-600 transition-all duration-300 hover:bg-white hover:text-[#087895] hover:shadow-sm active:scale-[0.99]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
