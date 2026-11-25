"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getBrowserApiBaseUrl } from "@/lib/apiBase";
import {
  articleTabs, archiveApiPath, archiveHref, archiveParams, defaultArchiveQuery,
  paginationItems, parseArchiveQuery, type ArchiveArticle, type ArchiveQuery,
  type ArchiveResult, type ArchiveTab,
} from "@/lib/articleArchive";

const CACHE_TTL = 30_000;
const MAX_CACHE = 24;
const control = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#0b1f3a] outline-none focus:border-[#0a7180] focus:ring-2 focus:ring-[#0ea5b7]/20";
const primary = "inline-flex min-h-10 items-center justify-center rounded-full bg-[#0b1f3a] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#0a7180] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a7180] disabled:cursor-not-allowed disabled:opacity-40";
const pageButton = "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-[#0a7180] hover:text-[#0a7180] focus-visible:outline-2 focus-visible:outline-[#0a7180] disabled:cursor-not-allowed disabled:opacity-40";

function ArticleRow({ article, number }: { article: ArchiveArticle; number: number }) {
  const issue = article.issueId;
  const href = `/issues/${issue.slug}/articles/${article.slug}`;
  return (
    <article className="group rounded-2xl border border-[#dce6ec] bg-white p-5 transition hover:border-[#0ea5b7]/45 hover:shadow-md md:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
        <span className="text-slate-400">{String(number).padStart(2, "0")}</span>
        <span className="uppercase tracking-[0.12em] text-[#0a7180]">{article.articleType || "Research Article"}</span>
        {article.status === "inPress" && <span className="rounded-full bg-[#f8f0dd] px-3 py-1 text-[#8a6b28]">In press</span>}
        {article.accessType && <span className="rounded-full bg-[#e6f7f9] px-3 py-1 text-[#0a7180]">{article.accessType}</span>}
      </div>
      <h3 className="mt-3 text-lg font-bold leading-7 text-[#0b1f3a] md:text-[22px] md:leading-8">
        <Link href={href} prefetch={false} className="break-words transition hover:text-[#0a7180] hover:underline">{article.title}</Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{article.authors?.join(", ") || "Author information unavailable"}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6 text-slate-500">
        <Link href={`/issues/${issue.slug}`} prefetch={false} className="font-semibold text-[#0a7180] hover:underline">Vol. {issue.volume}, Issue {issue.issueNumber}</Link>
        {(article.publishDate || issue.publishDateLabel) && <span>{article.publishDate || issue.publishDateLabel}</span>}
        {article.pages && <span>Pages: {article.pages}</span>}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-[#e6f7f9] px-3 py-1.5 text-[#0a7180]">Views: {article.views ?? 0}</span>
          <span className="rounded-full bg-[#f8f0dd] px-3 py-1.5 text-[#8a6b28]">Downloads: {article.downloads ?? 0}</span>
          <span className="rounded-full bg-[#eef3f6] px-3 py-1.5 text-slate-600">Citations: {article.citations ?? 0}</span>
        </div>
        <Link href={href} prefetch={false} className={primary}>View article <span aria-hidden="true" className="ml-2">→</span></Link>
      </div>
    </article>
  );
}

export default function ArticleArchive({ initialQuery, initialData }: { initialQuery: ArchiveQuery; initialData: ArchiveResult | null }) {
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery.q);
  const [sizeInput, setSizeInput] = useState(String(initialQuery.pageSize));
  const [data, setData] = useState<ArchiveResult | null>(initialData);
  const [shownKey, setShownKey] = useState(initialData ? archiveParams(initialQuery) : null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const cache = useRef(new Map<string, { data: ArchiveResult; time: number }>(initialData ? [[archiveParams(initialQuery), { data: initialData, time: Date.now() }]] : []));
  const resultsTop = useRef<HTMLDivElement>(null);
  const queryKey = archiveParams(query);

  function commit(next: ArchiveQuery, replace = false) {
    if (archiveParams(next) === queryKey) return;
    // Next.js supports native history updates without a Server Component navigation.
    if (replace) window.history.replaceState(null, "", archiveHref(next));
    else window.history.pushState(null, "", archiveHref(next));
    setQuery(next);
    setError("");
  }

  useEffect(() => {
    const sync = () => {
      const next = parseArchiveQuery(new URLSearchParams(window.location.search));
      setQuery(next);
      setSearch(next.q);
      setSizeInput(String(next.pageSize));
      setError("");
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    const text = search.trim().slice(0, 120);
    if (text === query.q) return;
    const timer = window.setTimeout(() => {
      const next = { ...query, q: text, page: 1 };
      window.history.replaceState(null, "", archiveHref(next));
      setQuery(next);
      setError("");
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, query]);

  useEffect(() => {
    const cached = cache.current.get(queryKey);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      setData(cached.data);
      setShownKey(queryKey);
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    async function load() {
      try {
        const response = await fetch(`${getBrowserApiBaseUrl()}${archiveApiPath(query)}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (!json.success || !Array.isArray(json.data?.articles)) throw new Error("Invalid response");
        if (controller.signal.aborted) return;
        const result: ArchiveResult = json.data;
        cache.current.delete(queryKey);
        cache.current.set(queryKey, { data: result, time: Date.now() });
        while (cache.current.size > MAX_CACHE) {
          const oldest = cache.current.keys().next().value;
          if (oldest === undefined) break;
          cache.current.delete(oldest);
        }
        setData(result);
        setShownKey(queryKey);
      } catch {
        if (!controller.signal.aborted) setError("The articles could not be loaded. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [query, queryKey, retry]);

  const pending = loading || shownKey !== queryKey || search.trim() !== query.q;
  function changeFilter(patch: Partial<ArchiveQuery>) {
    commit({ ...query, ...patch, q: search.trim(), page: 1 });
  }
  function applySize() {
    const parsed = /^\d+$/.test(sizeInput.trim()) ? Number(sizeInput) : NaN;
    const n = Number.isSafeInteger(parsed) ? Math.min(100, Math.max(1, parsed)) : query.pageSize;
    setSizeInput(String(n));
    if (n !== query.pageSize) changeFilter({ pageSize: n });
  }
  function clear() {
    setSearch("");
    setSizeInput("10");
    commit({ ...defaultArchiveQuery });
  }
  function goToPage(page: number) {
    if (!data || pending || page < 1 || page > data.totalPages || page === data.page) return;
    commit({ ...query, page });
    resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const start = data?.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const end = data?.total ? start + data.articles.length - 1 : 0;
  const grouped = data && (query.tab === "all" || query.tab === "latest");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#dce6ec] bg-white p-5 shadow-sm md:p-7" aria-label="Article filters">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0b1f3a]">Browse articles</h2>
          <button type="button" onClick={clear} className="text-sm font-semibold text-[#0a7180] hover:underline">Reset filters</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Article category">
          {articleTabs.map(tab => <button key={tab.value} type="button" aria-pressed={query.tab === tab.value} onClick={() => changeFilter({ tab: tab.value as ArchiveTab })} className={`min-h-10 rounded-full border px-4 py-2 text-xs font-bold transition md:text-sm ${query.tab === tab.value ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-[#d9e4ea] bg-white text-slate-600 hover:border-[#0a7180] hover:text-[#0a7180]"}`}>{tab.label}</button>)}
        </div>
        <div className="mt-6 grid items-end gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_180px]">
          <div>
            <label htmlFor="article-search" className="mb-2 block text-sm font-semibold text-slate-700">Search by title or author</label>
            <div className="relative">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
              <input id="article-search" type="search" maxLength={120} value={search} onChange={event => setSearch(event.target.value)} placeholder="Start typing a paper or author name…" className={`${control} pl-9`} autoComplete="off" />
            </div>
          </div>
          <div>
            <label htmlFor="archive-issue" className="mb-2 block text-sm font-semibold text-slate-700">Issue</label>
            <select id="archive-issue" value={query.issue} onChange={event => changeFilter({ issue: event.target.value })} className={control}>
              <option value="">All issues</option>
              {query.issue && !data?.issues.some(issue => issue.slug === query.issue) && <option value={query.issue}>Selected issue</option>}
              {data?.issues.map(issue => <option key={issue._id} value={issue.slug}>Vol. {issue.volume}, Issue {issue.issueNumber} — {issue.publishDateLabel}</option>)}
            </select>
          </div>
          <form onSubmit={event => { event.preventDefault(); applySize(); }}>
            <label htmlFor="archive-size" className="mb-2 block text-sm font-semibold text-slate-700">Articles per page</label>
            <div className="flex gap-2">
              <input id="archive-size" type="number" min={1} max={100} step={1} value={sizeInput} onChange={event => setSizeInput(event.target.value)} className={`${control} min-w-0`} />
              <button type="submit" className="rounded-xl border border-[#d9e4ea] bg-[#f4f9fa] px-3 text-xs font-bold text-[#0a7180] hover:bg-[#e6f7f9]">Apply</button>
            </div>
          </form>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">Search updates automatically as you type. Choose any page size from 1 to 100.</p>
      </section>

      <div ref={resultsTop} className="scroll-mt-28 rounded-3xl border border-[#dce6ec] bg-[#fbfcfd] p-4 shadow-sm md:p-7" aria-busy={pending && !error}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="journal-subheading">Article directory</p>
            <h2 className="mt-2 text-xl font-bold text-[#0b1f3a] md:text-2xl">{articleTabs.find(tab => tab.value === query.tab)?.label}</h2>
            <p className="mt-1 text-sm text-slate-500" role="status" aria-live="polite">{error ? "Unable to refresh results" : pending ? "Updating results…" : data?.total ? `Showing ${start}–${end} of ${data.total} articles` : "0 articles found"}</p>
          </div>
          {(query.tab === "all" || query.tab === "latest") && <span className="rounded-full bg-[#e6f7f9] px-3 py-1.5 text-xs font-semibold text-[#0a7180]">Newest issue first</span>}
        </div>
        {error ? <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center" role="alert"><p className="text-sm text-slate-600">{error}</p><button type="button" className={`${primary} mt-4`} onClick={() => { cache.current.delete(queryKey); setRetry(n => n + 1); }}>Try again</button></div>
        : !data ? <div className="space-y-4" aria-label="Loading articles">{Array.from({ length: 3 }, (_, i) => <div key={i} className="animate-pulse space-y-4 rounded-2xl border border-slate-200 bg-white p-6"><div className="h-3 w-28 rounded bg-slate-200"/><div className="h-5 w-4/5 rounded bg-slate-200"/><div className="h-4 w-1/2 rounded bg-slate-100"/></div>)}</div>
        : data.articles.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-bold text-[#0b1f3a]">{pending ? "Searching articles…" : "No articles found"}</h3>{!pending && <p className="mt-2 text-sm text-slate-500">Try another title, author, issue or category.</p>}</div>
        : <div className={`space-y-4 transition-opacity ${pending ? "opacity-55" : "opacity-100"}`}>
          {data.articles.map((article, index) => {
            const issue = article.issueId;
            const heading = grouped && (index === 0 || data.articles[index - 1].issueId._id !== issue._id);
            return <div key={article._id}>
              {heading && <div className="mb-3 mt-2 flex flex-wrap items-center justify-between gap-2 border-l-[3px] border-[#0a7180] bg-[#edf5f7] px-4 py-3"><Link href={`/issues/${issue.slug}`} prefetch={false} className="text-sm font-bold text-[#0b1f3a] hover:underline">{issue.title} · Vol. {issue.volume}, Issue {issue.issueNumber}</Link><span className="text-xs text-slate-600">{issue.publishDateLabel}</span></div>}
              <ArticleRow article={article} number={start + index} />
            </div>;
          })}
        </div>}
        {data && data.totalPages > 1 && !error && <nav className="mt-7 flex flex-col items-center gap-3 border-t border-slate-200 pt-6" aria-label="Article pagination">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button type="button" className={pageButton} disabled={pending || data.page === 1} onClick={() => goToPage(data.page - 1)} aria-label="Previous page">‹ <span className="ml-1 hidden sm:inline">Previous</span></button>
            {paginationItems(data.page, data.totalPages).map(item => typeof item === "number" ? <button key={item} type="button" disabled={pending} aria-current={item === data.page ? "page" : undefined} onClick={() => goToPage(item)} className={item === data.page ? `${pageButton} !border-[#0b1f3a] !bg-[#0b1f3a] !text-white` : pageButton}>{item}</button> : <span key={item} className="px-1 text-slate-400" aria-hidden="true">…</span>)}
            <button type="button" className={pageButton} disabled={pending || data.page === data.totalPages} onClick={() => goToPage(data.page + 1)} aria-label="Next page"><span className="mr-1 hidden sm:inline">Next</span> ›</button>
          </div>
          <p className="text-xs text-slate-500">Page {data.page} of {data.totalPages}</p>
        </nav>}
      </div>
    </div>
  );
}
