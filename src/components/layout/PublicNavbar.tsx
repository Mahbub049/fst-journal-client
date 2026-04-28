"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import JournalDropdownMenu, {
  DropdownMenuItem,
} from "@/components/common/JournalDropdownMenu";
import {
  getPublicMenus,
  PublicMenuItem,
  PublicMenuLocation,
} from "@/services/publicMenuService";

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

const sortMenus = (items: PublicMenuItem[]) => {
  return [...items].sort((a, b) => {
    const orderA = Number(a.order || 0);
    const orderB = Number(b.order || 0);

    if (orderA !== orderB) return orderA - orderB;

    return a.label.localeCompare(b.label);
  });
};

const normalizeUrl = (url: string) => {
  if (!url) return "#";
  return url;
};

const toDropdownItems = (items: PublicMenuItem[]): DropdownMenuItem[] => {
  return sortMenus(items)
    .filter((item) => item.isActive)
    .map((item) => ({
      label: item.label,
      href: normalizeUrl(item.url),
      isExternal: item.isExternal,
      openInNewTab: item.openInNewTab,
    }));
};

const mergeDropdownItems = (
  apiItems: DropdownMenuItem[],
  fallbackItems: DropdownMenuItem[]
) => {
  const merged = [...apiItems];

  fallbackItems.forEach((fallbackItem) => {
    const alreadyExists = merged.some(
      (item) =>
        item.label.toLowerCase() === fallbackItem.label.toLowerCase() ||
        item.href === fallbackItem.href
    );

    if (!alreadyExists) {
      merged.push(fallbackItem);
    }
  });

  return merged;
};

const getItemsByLocation = (
  menus: PublicMenuItem[],
  location: PublicMenuLocation
) => {
  return menus.filter((item) => item.location === location && item.isActive);
};

const findMainMenu = (menus: PublicMenuItem[], label: string) => {
  return menus.find(
    (item) =>
      item.location === "main" &&
      item.isActive &&
      item.label.toLowerCase() === label.toLowerCase()
  );
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [menus, setMenus] = useState<PublicMenuItem[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const data = await getPublicMenus();
        setMenus(data);
      } catch {
        setMenus([]);
      }
    };

    fetchMenus();
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanSearch = searchText.trim();

    if (!cleanSearch) return;

    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(cleanSearch)}`);
  };

const aboutItems = useMemo(() => {
  const apiItems = toDropdownItems(getItemsByLocation(menus, "about"));
  return mergeDropdownItems(apiItems, fallbackAboutItems);
}, [menus]);

const issueItems = useMemo(() => {
  const apiItems = toDropdownItems(getItemsByLocation(menus, "issues"));
  return mergeDropdownItems(apiItems, fallbackIssueItems);
}, [menus]);

const authorItems = useMemo(() => {
  const apiItems = toDropdownItems(getItemsByLocation(menus, "for-authors"));
  return mergeDropdownItems(apiItems, fallbackAuthorItems);
}, [menus]);

  const homeMenu = findMainMenu(menus, "Home");
  const aboutMenu = findMainMenu(menus, "About");
  const issuesMenu = findMainMenu(menus, "Issues");
  const authorsMenu =
    findMainMenu(menus, "For Authors") || findMainMenu(menus, "Authors");
  const editorialMenu =
    findMainMenu(menus, "Editorial Board") ||
    findMainMenu(menus, "Editorial");
  const cfpMenu =
    findMainMenu(menus, "Call for Papers") ||
    findMainMenu(menus, "Call For Papers");
  const submitMenu =
    findMainMenu(menus, "Submit Manuscript") ||
    findMainMenu(menus, "Submission Guidelines");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Container>
        <nav className="flex min-h-[78px] items-center justify-between gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
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

            <SmartLink
              href={normalizeUrl(issuesMenu?.url || "/issues/current")}
              label={issuesMenu?.label || "Issues"}
              isExternal={issuesMenu?.isExternal}
              openInNewTab={issuesMenu?.openInNewTab}
              className="nav-link"
            />

            <JournalDropdownMenu
              label={authorsMenu?.label || "For Authors"}
              items={authorItems}
            />

            <SmartLink
              href={normalizeUrl(editorialMenu?.url || "/editorial-board")}
              label={editorialMenu?.label || "Editorial Board"}
              isExternal={editorialMenu?.isExternal}
              openInNewTab={editorialMenu?.openInNewTab}
              className="nav-link"
            />

            <SmartLink
              href={normalizeUrl(cfpMenu?.url || "/call-for-papers")}
              label={cfpMenu?.label || "Call for Papers"}
              isExternal={cfpMenu?.isExternal}
              openInNewTab={cfpMenu?.openInNewTab}
              className="inline-flex items-center rounded-full border border-[#111433] bg-[#111433] px-4 py-2 text-[14px] font-semibold text-white hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433]"
            />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <form
              onSubmit={handleSearch}
              className="flex h-11 w-[250px] overflow-hidden rounded-full border border-slate-200 bg-slate-50 focus-within:border-[#22b8e8]"
            >
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search journal"
                className="min-w-0 flex-1 bg-transparent px-4 text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="px-4 text-[13px] font-medium text-[#111433] hover:text-[#22b8e8]"
              >
                Search
              </button>
            </form>

            <SmartLink
              href={normalizeUrl(
                submitMenu?.url || "/for-authors/submission-guidelines"
              )}
              label={submitMenu?.label || "Submit Manuscript"}
              isExternal={submitMenu?.isExternal}
              openInNewTab={submitMenu?.openInNewTab}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1e2557]"
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
                title={authorsMenu?.label || "For Authors"}
                items={authorItems}
                onClick={() => setMenuOpen(false)}
              />

              <MobileLink
                href={normalizeUrl(editorialMenu?.url || "/editorial-board")}
                label={editorialMenu?.label || "Editorial Board"}
                isExternal={editorialMenu?.isExternal}
                openInNewTab={editorialMenu?.openInNewTab}
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
                href={normalizeUrl(
                  submitMenu?.url || "/for-authors/submission-guidelines"
                )}
                label={submitMenu?.label || "Submit Manuscript"}
                isExternal={submitMenu?.isExternal}
                openInNewTab={submitMenu?.openInNewTab}
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
                  className="min-w-0 flex-1 bg-transparent px-4 text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="px-4 text-[13px] font-medium text-[#111433] hover:text-[#22b8e8]"
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