"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminArticles } from "@/services/articleAdminService";
import { getAdminEditorialBoard } from "@/services/editorialBoardService";
import { getAdminIssues } from "@/services/issues.service";
import { getMedia } from "@/services/mediaService";
import { getAdminMenus } from "@/services/menuService";
import { getAdminPages } from "@/services/pageService";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  Home,
  Image,
  Layers3,
  Menu,
  Newspaper,
  PenTool,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";

type DashboardCounts = {
  pages: number;
  publishedPages: number;
  menus: number;
  activeMenus: number;
  issues: number;
  publishedIssues: number;
  recentIssues: number;
  articles: number;
  publishedArticles: number;
  editors: number;
  activeEditors: number;
  media: number;
};

const initialCounts: DashboardCounts = {
  pages: 0,
  publishedPages: 0,
  menus: 0,
  activeMenus: 0,
  issues: 0,
  publishedIssues: 0,
  recentIssues: 0,
  articles: 0,
  publishedArticles: 0,
  editors: 0,
  activeEditors: 0,
  media: 0,
};

const moduleCards = [
  {
    title: "Homepage",
    href: "/admin/homepage",
    publicHref: "/",
    icon: Home,
    description: "Control hero content, ISSN values, metrics, overview, journal information, and homepage buttons.",
    accent: "from-cyan-500 to-sky-600",
  },
  {
    title: "Pages",
    href: "/admin/pages",
    publicHref: "/about/about-the-journal",
    icon: FileText,
    description: "Manage About, For Authors, and other public content pages with reusable content blocks.",
    accent: "from-indigo-500 to-blue-600",
  },
  {
    title: "Menus",
    href: "/admin/menus",
    publicHref: "/",
    icon: Menu,
    description: "Update navbar labels, dropdown links, button links, order, and visibility status.",
    accent: "from-teal-500 to-emerald-600",
  },
  {
    title: "Issues",
    href: "/admin/issues",
    publicHref: "/issues/current",
    icon: Newspaper,
    description: "Create journal issues, upload cover/PDF files, and manage current or archive visibility.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    title: "Articles",
    href: "/admin/articles",
    publicHref: "/issues/current",
    icon: PenTool,
    description: "Add papers, authors, abstracts, PDF links, DOI, article metrics, and issue mapping.",
    accent: "from-rose-500 to-pink-600",
  },
  {
    title: "Editorial Board",
    href: "/admin/editorial-board",
    publicHref: "/editorial-board",
    icon: Users,
    description: "Maintain editorial categories, members, profile images, designations, and display order.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    title: "Call for Papers",
    href: "/admin/call-for-papers",
    publicHref: "/call-for-papers",
    icon: UserRoundCog,
    description: "Edit call-for-papers content, timeline, PDF, contact block, and submission links.",
    accent: "from-yellow-500 to-amber-600",
  },
  {
    title: "Media Library",
    href: "/admin/media",
    publicHref: "/",
    icon: Image,
    description: "Upload and reuse images, PDF files, cover images, posters, and document assets.",
    accent: "from-slate-500 to-slate-700",
  },

  {
    title: "Admin Access",
    href: "/admin/admin-access",
    publicHref: "",
    icon: ShieldCheck,
    description: "Create approved admin emails, set temporary passwords, and control admin account status.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    title: "Settings / Footer",
    href: "/admin/settings",
    publicHref: "/",
    icon: Settings,
    description: "Manage footer description, useful links, contact information, copyright, and credit text.",
    accent: "from-[#005A78] to-[#003B5C]",
  },
];

const workflowItems = [
  "Update homepage identity and navbar links first.",
  "Create or publish the current issue.",
  "Add articles under the correct issue.",
  "Review public pages, footer, and call-for-papers page.",
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>(initialCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const [pagesResult, menusResult, issuesResult, articlesResult, editorsResult, mediaResult] =
      await Promise.allSettled([
        getAdminPages(),
        getAdminMenus({ location: "all" }),
        getAdminIssues({ status: "all" }),
        getAdminArticles(),
        getAdminEditorialBoard({ status: "all" }),
        getMedia(),
      ]);

    const pages = pagesResult.status === "fulfilled" ? pagesResult.value : [];
    const menus = menusResult.status === "fulfilled" ? menusResult.value : [];
    const issues = issuesResult.status === "fulfilled" ? issuesResult.value : [];
    const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
    const editors = editorsResult.status === "fulfilled" ? editorsResult.value : [];
    const media = mediaResult.status === "fulfilled" ? mediaResult.value : [];

    setCounts({
      pages: pages.length,
      publishedPages: pages.filter((page) => page.isPublished).length,
      menus: menus.length,
      activeMenus: menus.filter((menu) => menu.isActive).length,
      issues: issues.length,
      publishedIssues: issues.filter((issue) => issue.isPublished).length,
      recentIssues: issues.filter((issue) => issue.isRecent).length,
      articles: articles.length,
      publishedArticles: articles.filter((article) => article.isPublished).length,
      editors: editors.length,
      activeEditors: editors.filter((editor) => editor.isActive).length,
      media: media.length,
    });

    const hasFailedRequest = [
      pagesResult,
      menusResult,
      issuesResult,
      articlesResult,
      editorsResult,
      mediaResult,
    ].some((result) => result.status === "rejected");

    if (hasFailedRequest) {
      setError("Some dashboard values could not be loaded. The management links will still work.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const topStats = useMemo(
    () => [
      {
        label: "Published Pages",
        value: counts.publishedPages,
        total: counts.pages,
        icon: FileText,
        note: "content pages",
      },
      {
        label: "Published Issues",
        value: counts.publishedIssues,
        total: counts.issues,
        icon: Newspaper,
        note: `${counts.recentIssues} recent`,
      },
      {
        label: "Published Articles",
        value: counts.publishedArticles,
        total: counts.articles,
        icon: PenTool,
        note: "papers",
      },
      {
        label: "Active Editors",
        value: counts.activeEditors,
        total: counts.editors,
        icon: Users,
        note: "board members",
      },
    ],
    [counts]
  );

  return (
    <AdminLayout>
      <div className="space-y-7">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-[#003B5C] via-[#005A78] to-[#0E7490] p-7 text-white md:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-cyan-300/20 blur-xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">
                  Admin CMS
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                  Journal Admin Dashboard
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-50/90">
                  Manage the public journal website from one clean place. Use the shortcut cards below to update homepage content, menus, pages, issues, articles, editorial board, call for papers, media, and footer settings.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#003B5C] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Globe2 size={17} />
                  View Public Site
                </Link>
                <button
                  type="button"
                  onClick={loadDashboard}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
                  Refresh Stats
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            {topStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {stat.label}
                      </p>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-950">
                          {loading ? "..." : stat.value}
                        </span>
                        <span className="pb-1 text-sm font-semibold text-slate-500">
                          / {loading ? "..." : stat.total}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{stat.note}</p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#005A78]/10 text-[#005A78]">
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {moduleCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="group rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-sm`}
                    >
                      <Icon size={23} />
                    </div>

                    {card.publicHref ? (
                      <Link
                        href={card.publicHref}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-[#005A78] hover:text-[#005A78]"
                      >
                        Public
                        <ExternalLink size={13} />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                        Private
                      </span>
                    )}
                  </div>

                  <h2 className="mt-5 text-xl font-black text-slate-950">
                    {card.title}
                  </h2>
                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>

                  <Link
                    href={card.href}
                    className="mt-5 inline-flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition group-hover:bg-[#005A78] group-hover:text-white"
                  >
                    Manage Section
                    <ArrowRight size={17} />
                  </Link>
                </div>
              );
            })}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    CMS Health
                  </p>
                  <h3 className="text-lg font-black text-slate-950">
                    Website Management Ready
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Homepage content management",
                  "Menu and dropdown management",
                  "Issues and article publishing",
                  "Editorial board profiles",
                  "Call for papers and footer settings",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <CheckCircle2 size={17} className="text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#005A78]/10 text-[#005A78]">
                  <Layers3 size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Suggested Flow
                  </p>
                  <h3 className="text-lg font-black text-slate-950">
                    Publishing Checklist
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {workflowItems.map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-[#005A78]">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-[#081225] p-5 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">
                    Quick Summary
                  </p>
                  <h3 className="text-lg font-black">Current Data</h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">{loading ? "..." : counts.activeMenus}</p>
                  <p className="mt-1 text-xs font-semibold text-cyan-100/80">Active Menus</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-black">{loading ? "..." : counts.media}</p>
                  <p className="mt-1 text-xs font-semibold text-cyan-100/80">Media Files</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-50/90">
                <Clock3 size={17} />
                Refresh after major CRUD operations to update dashboard counts.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </AdminLayout>
  );
}
