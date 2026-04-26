"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/common/Container";
import JournalDropdownMenu from "@/components/common/JournalDropdownMenu";

const aboutItems = [
  { label: "About the Journal", href: "/about/about-the-journal" },
  { label: "Aims & Scope", href: "/about/aims-scope" },
  { label: "Policies & Ethics", href: "/about/policies-ethics" },
  { label: "Open Access Statement", href: "/about/open-access-statement" },
  { label: "Abstracting & Indexing", href: "/about/abstracting-indexing" },
  { label: "Contact Us", href: "/contact" },
];

const issueItems = [
  { label: "Current Issue", href: "/issues/current" },
  { label: "All Issues / Archive", href: "/issues/archive" },
  { label: "Special Issues", href: "/issues/special" },
  { label: "Most Cited", href: "/issues/most-cited" },
  { label: "Most Read", href: "/issues/most-read" },
];

const authorItems = [
  { label: "Author Guidelines", href: "/for-authors/author-guidelines" },
  { label: "Submission Guidelines", href: "/for-authors/submission-guidelines" },
  { label: "Peer Review Process", href: "/for-authors/peer-review-process" },
  { label: "Article Processing Charge", href: "/for-authors/article-processing-charge" },
  { label: "Copyright & Licensing", href: "/for-authors/copyright-licensing" },
  { label: "Templates", href: "/for-authors/templates" },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* Desktop Menu */}
          <div className="hidden items-center gap-1 xl:flex">
            <Link href="/" className="nav-link">
              Home
            </Link>

            <JournalDropdownMenu label="About" items={aboutItems} />
            <JournalDropdownMenu label="Issues" items={issueItems} />
            <JournalDropdownMenu label="For Authors" items={authorItems} />

            <Link href="/editorial-board" className="nav-link">
              Editorial Board
            </Link>

            <Link
              href="/call-for-papers"
              className="inline-flex items-center rounded-full border border-[#111433] bg-[#111433] px-4 py-2 text-[14px] font-semibold text-white hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433]"
            >
              Call for Papers
            </Link>
          </div>

          {/* Desktop Search + Submit */}
          <div className="hidden items-center gap-3 lg:flex">
            <form className="flex h-11 w-[250px] overflow-hidden rounded-full border border-slate-200 bg-slate-50 focus-within:border-[#22b8e8]">
              <input
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

            <Link
              href="/for-authors/submission-guidelines"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#111433] px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1e2557]"
            >
              Submit Manuscript
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[22px] font-semibold text-[#111433] shadow-sm xl:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-slate-200 py-4 xl:hidden">
            <div className="grid gap-2">
              <MobileLink href="/" label="Home" onClick={() => setMenuOpen(false)} />

              <MobileGroup
                title="About"
                items={aboutItems}
                onClick={() => setMenuOpen(false)}
              />

              <MobileGroup
                title="Issues"
                items={issueItems}
                onClick={() => setMenuOpen(false)}
              />

              <MobileGroup
                title="For Authors"
                items={authorItems}
                onClick={() => setMenuOpen(false)}
              />

              <MobileLink
                href="/editorial-board"
                label="Editorial Board"
                onClick={() => setMenuOpen(false)}
              />

              <Link
                href="/call-for-papers"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-[#111433] bg-[#111433] px-4 text-[14px] font-semibold text-white hover:border-[#f5c84b] hover:bg-[#f5c84b] hover:text-[#111433]"
              >
                Call for Papers
              </Link>

              <Link
                href="/for-authors/submission-guidelines"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#111433] px-4 text-[14px] font-semibold text-white hover:bg-[#1e2557]"
              >
                Submit Manuscript
              </Link>

              <form className="mt-3 flex h-11 overflow-hidden rounded-full border border-slate-200 bg-slate-50 focus-within:border-[#22b8e8]">
                <input
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
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-2xl px-4 py-3 text-[14px] font-medium text-[#111433] hover:bg-[#eef8fc] hover:text-[#22b8e8]"
    >
      {label}
    </Link>
  );
}

function MobileGroup({
  title,
  items,
  onClick,
}: {
  title: string;
  items: { label: string; href: string }[];
  onClick: () => void;
}) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-[14px] font-semibold text-[#111433]">
        {title}
      </summary>

      <div className="grid gap-1 border-t border-slate-200 bg-slate-50 p-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className="rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-600 hover:bg-white hover:text-[#22b8e8]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}