"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type ArchiveIssue = {
  _id: string;
  title: string;
  slug: string;
  issn?: string;
  volume?: string;
  issueNumber?: string;
  publishDateLabel?: string;
  coverImage?: string;
};

const PAGE_SIZE = 6;
const getYear = (issue: ArchiveIssue) => issue.publishDateLabel?.match(/\b(?:19|20)\d{2}\b/)?.[0] || "";

function IssueCard({ issue }: { issue: ArchiveIssue }) {
  return (
    <Link href={`/issues/${issue.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#fbfcfd] transition hover:-translate-y-1 hover:border-[#0ea5b7]/45 hover:bg-white hover:shadow-md">
      <div className="relative aspect-[0.72] w-full overflow-hidden bg-[#111433]">
        <Image src={issue.coverImage || "/images/journal-cover.jpg"} alt={`${issue.title} cover`} fill sizes="(max-width: 639px) 280px, (max-width: 1023px) 300px, 310px" className="object-contain" />
      </div>
      <div className="flex flex-1 flex-col items-start p-4 sm:p-5">
        {issue.issn && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111433]">ISSN {issue.issn}</p>}
        <h3 className="mt-2 text-[17px] font-semibold leading-6 text-slate-950 transition-colors group-hover:text-[#0a7180]">{issue.title}</h3>
        <p className="mb-4 mt-2 text-[14px] leading-6 text-slate-500">Volume {issue.volume || "-"}, Issue {issue.issueNumber || "-"}{issue.publishDateLabel ? `, ${issue.publishDateLabel}` : ""}</p>
        <span className="mt-auto inline-flex rounded-full bg-[#0b1f3a] px-4 py-2 text-[13px] font-extrabold text-white transition-colors group-hover:bg-[#0ea5b7]">View issue →</span>
      </div>
    </Link>
  );
}

export default function IssueArchive({ title, subtitle, issues, emptyMessage, showFilters = true }: {
  title: string; subtitle: string; issues: ArchiveIssue[]; emptyMessage: string; showFilters?: boolean;
}) {
  const [year, setYear] = useState("all");
  const [page, setPage] = useState(1);
  const headingRef = useRef<HTMLDivElement>(null);
  const years = useMemo(() => [...new Set(issues.map(getYear).filter(Boolean))].sort((a,b) => Number(b)-Number(a)), [issues]);
  const filtered = useMemo(() => issues
    .filter(issue => year === "all" || getYear(issue) === year)
    // Preserve the CMS order within a publication year; undated issues appear last.
    .sort((a,b) => Number(getYear(b) || 0)-Number(getYear(a) || 0)), [issues, year]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const pageNumbers = Array.from(new Set([1, totalPages, ...Array.from({length: 5}, (_,i) => currentPage - 2 + i).filter(n => n >= 1 && n <= totalPages)])).sort((a,b) => a-b);
  function goToPage(next: number) {
    if (next < 1 || next > totalPages || next === currentPage) return;
    setPage(next);
    headingRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }
  const pageButton = "inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-bold text-[#0b1f3a] transition hover:border-[#0a7180] hover:text-[#0a7180] disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
      <div ref={headingRef} className="mb-7 flex scroll-mt-28 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="journal-subheading">Published Issues</p>
          <h2 className="mt-3 text-[24px] font-semibold leading-tight text-slate-950 md:text-[30px]" style={{ fontFamily: "var(--font-source-serif)" }}>{title}</h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{subtitle}</p>
        </div>
        {showFilters && <label className="flex shrink-0 flex-col gap-1.5 text-sm font-semibold text-slate-700 sm:min-w-40">
          Publication year
          <select value={year} onChange={e => { setYear(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0a7180] focus:ring-2 focus:ring-[#0a7180]/15">
            <option value="all">All years</option>
            {years.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>}
      </div>
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center" role="status">
          <h3 className="text-lg font-semibold text-slate-800">No issues found</h3>
          <p className="mt-2 text-sm text-slate-500">{year === "all" ? emptyMessage : `No published issues for ${year}.`}</p>
        </div>
      ) : (
        <>
          <div className="mx-auto grid max-w-[930px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(issue => <div key={issue._id} className="mx-auto w-full max-w-[300px]"><IssueCard issue={issue} /></div>)}
          </div>
          {showFilters && <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <nav aria-label="Issue pagination" className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" className={pageButton} disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>‹ Previous</button>
              {pageNumbers.map((number, index) => <span key={number} className="inline-flex items-center gap-2">
                {index > 0 && number - pageNumbers[index - 1] > 1 && <span className="text-slate-400" aria-hidden="true">…</span>}
                <button type="button" aria-label={`Page ${number}`} aria-current={currentPage === number ? "page" : undefined} className={currentPage === number ? "inline-flex min-h-9 min-w-9 items-center justify-center rounded-full bg-[#0b1f3a] px-3 text-xs font-bold text-white" : pageButton} onClick={() => goToPage(number)}>{number}</button>
              </span>)}
              <button type="button" className={pageButton} disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next ›</button>
            </nav>
            <p className="mt-3 text-xs text-slate-500" role="status">Showing {start + 1}–{start + visible.length} of {filtered.length} issues · Page {currentPage} of {totalPages}</p>
          </div>}
        </>
      )}
    </section>
  );
}
