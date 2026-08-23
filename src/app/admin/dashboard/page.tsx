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
  CheckCircle2,
  CircleGauge,
  ExternalLink,
  FileText,
  Globe2,
  Home,
  Image,
  LayoutGrid,
  Mail,
  Menu,
  Newspaper,
  PenTool,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

type DashboardModule = {
  title: string;
  href: string;
  publicHref?: string;
  icon: LucideIcon;
  description: string;
  meta?: string;
};

type DashboardGroup = {
  title: string;
  subtitle: string;
  eyebrow: string;
  icon: LucideIcon;
  modules: DashboardModule[];
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

const dashboardGroups: DashboardGroup[] = [
  {
    title: "Publication Content",
    subtitle:
      "Manage the journal material visitors read most often — issues, papers, editorial information, calls, and contact details.",
    eyebrow: "Publishing",
    icon: Newspaper,
    modules: [
      {
        title: "Issues",
        href: "/admin/issues",
        publicHref: "/issues/archive",
        icon: Newspaper,
        description:
          "Create and publish volumes and issues, manage covers, dates, visibility, and issue files.",
        meta: "Volumes & issues",
      },
      {
        title: "Articles",
        href: "/admin/articles",
        publicHref: "/issues/archive",
        icon: PenTool,
        description:
          "Add papers, authors, abstracts, DOI, PDF files, page ranges, metrics, and issue mapping.",
        meta: "Research papers",
      },
      {
        title: "Editorial Board",
        href: "/admin/editorial-board",
        publicHref: "/editorial-board",
        icon: Users,
        description:
          "Maintain editorial groups, member profiles, biographies, roles, affiliations, and display order.",
        meta: "Board profiles",
      },
      {
        title: "Call for Papers",
        href: "/admin/call-for-papers",
        publicHref: "/call-for-papers",
        icon: UserRoundCog,
        description:
          "Control the active call, important dates, submission information, downloadable files, and links.",
        meta: "Announcements",
      },
      {
        title: "Contact Page",
        href: "/admin/contact",
        publicHref: "/contact",
        icon: Mail,
        description:
          "Update editorial office and author-support contact details shown on the public website.",
        meta: "Contact details",
      },
    ],
  },
  {
    title: "Website Setup",
    subtitle:
      "Control the public presentation and structure of the journal without touching the application code.",
    eyebrow: "Website",
    icon: LayoutGrid,
    modules: [
      {
        title: "Homepage",
        href: "/admin/homepage",
        publicHref: "/",
        icon: Home,
        description:
          "Manage hero content, journal information, launch modal, celebration effects, carousel, metrics, and homepage sections.",
        meta: "Homepage CMS",
      },
      {
        title: "Navbar Builder",
        href: "/admin/menus",
        publicHref: "/",
        icon: Menu,
        description:
          "Edit navbar labels, dropdown items, links, order, visibility, and the public navigation structure.",
        meta: "Navigation",
      },
      {
        title: "Pages",
        href: "/admin/pages",
        publicHref: "/about/about-the-journal",
        icon: FileText,
        description:
          "Manage About, Authors, Reviewers, policies, guidelines, and other reusable public content pages.",
        meta: "Content pages",
      },
      {
        title: "Media Library",
        href: "/admin/media",
        icon: Image,
        description:
          "Review uploaded images, PDFs, covers, posters, and reusable document assets stored by the journal.",
        meta: "Media storage",
      },
      {
        title: "Settings / Footer",
        href: "/admin/settings",
        publicHref: "/",
        icon: Settings,
        description:
          "Manage footer text, useful links, copyright, contact information, and other site-wide details.",
        meta: "Site settings",
      },
    ],
  },
  {
    title: "Administration",
    subtitle:
      "Administrative controls that affect access to the CMS rather than public journal content.",
    eyebrow: "Security & Access",
    icon: ShieldCheck,
    modules: [
      {
        title: "Admin Access",
        href: "/admin/admin-access",
        icon: ShieldCheck,
        description:
          "Approve administrator accounts, create temporary credentials, and control CMS access status.",
        meta: "Restricted access",
      },
    ],
  },
];

const publishingSteps = [
  {
    title: "Prepare the issue",
    description: "Create the volume/issue and verify publication information.",
    href: "/admin/issues",
  },
  {
    title: "Add the papers",
    description: "Create each article under the correct issue and verify its PDF/DOI.",
    href: "/admin/articles",
  },
  {
    title: "Review the public site",
    description: "Check issue, article, homepage, call-for-papers, and navigation output.",
    href: "/",
    external: true,
  },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>(initialCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const [
      pagesResult,
      menusResult,
      issuesResult,
      articlesResult,
      editorsResult,
      mediaResult,
    ] = await Promise.allSettled([
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
    const articles =
      articlesResult.status === "fulfilled" ? articlesResult.value : [];
    const editors =
      editorsResult.status === "fulfilled" ? editorsResult.value : [];
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
      setError(
        "Some dashboard values could not be loaded. Management links are still available.",
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const topStats = useMemo(
    () => [
      {
        label: "Pages",
        value: counts.publishedPages,
        total: counts.pages,
        icon: FileText,
        note: "published",
      },
      {
        label: "Issues",
        value: counts.publishedIssues,
        total: counts.issues,
        icon: Newspaper,
        note: `${counts.recentIssues} marked recent`,
      },
      {
        label: "Articles",
        value: counts.publishedArticles,
        total: counts.articles,
        icon: PenTool,
        note: "published papers",
      },
      {
        label: "Editorial Board",
        value: counts.activeEditors,
        total: counts.editors,
        icon: Users,
        note: "active members",
      },
      {
        label: "Navbar",
        value: counts.activeMenus,
        total: counts.menus,
        icon: Menu,
        note: "active menu items",
      },
      {
        label: "Media",
        value: counts.media,
        total: null,
        icon: Image,
        note: "stored files",
      },
    ],
    [counts],
  );

  const readinessItems = useMemo(
    () => [
      {
        label: "Public pages",
        value: counts.pages
          ? Math.round((counts.publishedPages / counts.pages) * 100)
          : 0,
      },
      {
        label: "Issues",
        value: counts.issues
          ? Math.round((counts.publishedIssues / counts.issues) * 100)
          : 0,
      },
      {
        label: "Articles",
        value: counts.articles
          ? Math.round((counts.publishedArticles / counts.articles) * 100)
          : 0,
      },
      {
        label: "Editorial board",
        value: counts.editors
          ? Math.round((counts.activeEditors / counts.editors) * 100)
          : 0,
      },
    ],
    [counts],
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[#071a33] text-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#f5c84b]/10 blur-3xl" />

          <div className="relative grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  <CircleGauge size={14} />
                  Journal CMS
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-bold text-emerald-100">
                  <CheckCircle2 size={14} />
                  Management ready
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight md:text-[38px]">
                Journal Admin Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                A structured control centre for publishing journal content,
                configuring the public website, and maintaining administrative
                access.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              <Link
                href="/"
                target="_blank"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#071a33] shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                <Globe2 size={17} />
                View Public Site
              </Link>
              <button
                type="button"
                onClick={() => void loadDashboard()}
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-wait disabled:opacity-70"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 shadow-sm">
            {error}
          </div>
        ) : null}

        <section>
          <div className="mb-3 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#005A78]">
                At a glance
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                Current journal status
              </h2>
            </div>
            <p className="hidden text-xs font-medium text-slate-400 sm:block">
              Published / total values update from the CMS
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {topStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#005A78]/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005A78]/8 text-[#005A78]">
                      <Icon size={19} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      {stat.note}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-600">
                    {stat.label}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-950">
                      {loading ? "—" : stat.value}
                    </span>
                    {stat.total !== null ? (
                      <span className="text-xs font-bold text-slate-400">
                        / {loading ? "—" : stat.total}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {dashboardGroups.map((group) => {
              const GroupIcon = group.icon;

              return (
                <section
                  key={group.title}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#005A78] text-white shadow-sm">
                        <GroupIcon size={21} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#007B9A]">
                          {group.eyebrow}
                        </p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">
                          {group.title}
                        </h2>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                          {group.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-px bg-slate-200 md:grid-cols-2">
                    {group.modules.map((module) => {
                      const Icon = module.icon;

                      return (
                        <div
                          key={module.title}
                          className="group bg-white p-5 transition hover:bg-[#f8fbfc] md:p-6"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#005A78] shadow-sm transition group-hover:border-[#005A78]/25 group-hover:bg-cyan-50">
                              <Icon size={21} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-base font-black text-slate-950">
                                    {module.title}
                                  </h3>
                                  {module.meta ? (
                                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                      {module.meta}
                                    </p>
                                  ) : null}
                                </div>

                                {module.publicHref ? (
                                  <Link
                                    href={module.publicHref}
                                    target="_blank"
                                    onClick={(event) => event.stopPropagation()}
                                    className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-500 transition hover:border-[#005A78]/30 hover:text-[#005A78]"
                                  >
                                    Public
                                    <ExternalLink size={12} />
                                  </Link>
                                ) : null}
                              </div>

                              <p className="mt-3 text-sm leading-6 text-slate-600">
                                {module.description}
                              </p>

                              <Link
                                href={module.href}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#005A78] transition group-hover:gap-3"
                              >
                                Manage
                                <ArrowRight size={16} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={21} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                    CMS health
                  </p>
                  <h3 className="mt-0.5 text-lg font-black text-slate-950">
                    Publishing readiness
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {readinessItems.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-slate-950">
                        {loading ? "—" : `${item.value}%`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#0E7490] transition-[width] duration-500"
                        style={{ width: loading ? "0%" : `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Sparkles size={21} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
                    Recommended flow
                  </p>
                  <h3 className="mt-0.5 text-lg font-black text-slate-950">
                    Publish with confidence
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                {publishingSteps.map((step, index) => (
                  <Link
                    key={step.title}
                    href={step.href}
                    target={step.external ? "_blank" : undefined}
                    className="group flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#071a33] text-xs font-black text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-slate-800">
                          {step.title}
                        </p>
                        <ArrowRight
                          size={14}
                          className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#005A78]"
                        />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-[26px] border border-[#0E7490]/25 bg-gradient-to-br from-[#071a33] to-[#0b3551] p-5 text-white shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
                Quick actions
              </p>
              <h3 className="mt-1 text-lg font-black">Common management tasks</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">
                Jump directly to the areas you are most likely to update during a publication cycle.
              </p>

              <div className="mt-5 grid gap-2">
                {[
                  ["Manage Issues", "/admin/issues", Newspaper],
                  ["Manage Articles", "/admin/articles", PenTool],
                  ["Homepage", "/admin/homepage", Home],
                ].map(([label, href, Icon]) => {
                  const ActionIcon = Icon as LucideIcon;
                  return (
                    <Link
                      key={label as string}
                      href={href as string}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/14"
                    >
                      <span className="flex items-center gap-2.5">
                        <ActionIcon size={17} className="text-cyan-200" />
                        {label as string}
                      </span>
                      <ArrowRight size={15} />
                    </Link>
                  );
                })}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </AdminLayout>
  );
}
