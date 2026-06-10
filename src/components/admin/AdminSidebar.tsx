"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PenTool,
  Settings,
  UserRoundCog,
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/lib/auth";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Homepage",
    href: "/admin/homepage",
    icon: Home,
  },
  {
    label: "Pages",
    href: "/admin/pages",
    icon: FileText,
  },
  {
    label: "Navbar Builder",
    href: "/admin/menus",
    icon: Menu,
  },
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
    label: "Media Library",
    href: "/admin/media",
    icon: Image,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = "/admin/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[270px] border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Journal of FST
          </p>
          <h1 className="mt-1 text-xl font-bold text-[#003B5C]">
            Admin Panel
          </h1>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#005A78] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#003B5C]",
                ].join(" ")}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}