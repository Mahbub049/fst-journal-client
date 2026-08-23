"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Globe2,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Settings,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";
import api from "@/lib/api";
import {
  type AdminUser,
  clearAdminUser,
  clearLegacyAdminStorage,
} from "@/lib/auth";

type SidebarItem = {
  label: string;
  href: string;
  icon: ElementType;
  superOnly?: boolean;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

type AdminSidebarProps = {
  admin: AdminUser | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const sidebarSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Publication Content",
    items: [
      {
        label: "Issues",
        href: "/admin/issues",
        icon: Newspaper,
      },
      {
        label: "Articles",
        href: "/admin/articles",
        icon: PenTool,
      },
      {
        label: "Editorial Board",
        href: "/admin/editorial-board",
        icon: Users,
      },
      {
        label: "Call for Papers",
        href: "/admin/call-for-papers",
        icon: UserRoundCog,
      },
      {
        label: "Contact Page",
        href: "/admin/contact",
        icon: Mail,
      },
    ],
  },
  {
    title: "Website Setup",
    items: [
      {
        label: "Homepage",
        href: "/admin/homepage",
        icon: Home,
      },
      {
        label: "Navbar Builder",
        href: "/admin/menus",
        icon: Menu,
      },
      {
        label: "Old Website Button",
        href: "/admin/navbar-settings",
        icon: Globe2,
      },
      {
        label: "Pages",
        href: "/admin/pages",
        icon: FileText,
      },
      {
        label: "Media Library",
        href: "/admin/media",
        icon: Image,
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        label: "Admin Access",
        href: "/admin/admin-access",
        icon: ShieldCheck,
        superOnly: true,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminSidebar({
  admin,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Session may already be expired. Clear local admin data either way.
    } finally {
      clearAdminUser();
      clearLegacyAdminStorage();
      window.location.replace("/admin/login");
    }
  };

  const visibleSections = sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.superOnly || admin?.role === "super_admin"
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-200 bg-white shadow-sm transition-[width] duration-300 ease-in-out lg:block",
        collapsed ? "w-[92px]" : "w-[270px]",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <div
          className={[
            "border-b border-slate-200 px-4 py-5",
            collapsed ? "text-center" : "",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-start gap-3",
              collapsed ? "justify-center" : "justify-between",
            ].join(" ")}
          >
            <Link
              href="/admin/dashboard"
              className={[
                "min-w-0",
                collapsed ? "flex justify-center" : "block",
              ].join(" ")}
              title="Journal of FST Admin Panel"
            >
              {collapsed ? (
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#005A78] text-sm font-black text-white shadow-sm">
                  JF
                </span>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Journal of FST
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-[#003B5C]">
                    Admin Panel
                  </h1>
                </>
              )}
            </Link>

            {!collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:border-[#005A78]/30 hover:bg-cyan-50 hover:text-[#005A78]"
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mx-auto mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:border-[#005A78]/30 hover:bg-cyan-50 hover:text-[#005A78]"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        <nav
          className={[
            "flex-1 overflow-y-auto py-4",
            collapsed ? "px-3" : "px-3",
          ].join(" ")}
        >
          {visibleSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex === 0 ? "" : "mt-5"}>
              {collapsed ? (
                <div className="mx-auto mb-2 h-px w-10 bg-slate-200" />
              ) : (
                <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={[
                        "group flex items-center rounded-xl text-sm font-semibold transition",
                        collapsed
                          ? "justify-center px-3 py-3"
                          : "gap-3 px-4 py-3",
                        isActive
                          ? "bg-[#005A78] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-[#003B5C]",
                      ].join(" ")}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div
          className={[
            "border-t border-slate-200 p-4",
            collapsed ? "px-3" : "",
          ].join(" ")}
        >
          {!collapsed && (
            <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#005A78] text-xs font-black text-white">
                  {(admin?.name || "A").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={[
              "flex w-full items-center rounded-xl text-sm font-semibold text-rose-600 transition hover:bg-rose-50",
              collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
            ].join(" ")}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
