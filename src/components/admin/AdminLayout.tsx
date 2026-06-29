"use client";

import { ReactNode, useEffect, useState } from "react";
import api from "@/lib/api";
import {
  getAdminToken,
  removeAdminToken,
  setAdminUser,
  startAdminInactivityWatcher,
} from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type AdminLayoutProps = {
  children: ReactNode;
};

const SIDEBAR_COLLAPSED_KEY = "jfst_admin_sidebar_collapsed";

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [checking, setChecking] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedSidebarState = window.localStorage.getItem(
      SIDEBAR_COLLAPSED_KEY
    );

    if (savedSidebarState === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const redirectToLogin = () => {
      removeAdminToken();
      window.location.replace("/admin/login");
    };

    const verifyAdmin = async () => {
      const token = getAdminToken();

      if (!token) {
        redirectToLogin();
        return;
      }

      try {
        const { data } = await api.get("/auth/me");

        if (data?.admin) {
          setAdminUser(data.admin);
        }

        setChecking(false);
      } catch {
        redirectToLogin();
      }
    };

    const stopInactivityWatcher = startAdminInactivityWatcher(redirectToLogin);

    verifyAdmin();

    return stopInactivityWatcher;
  }, []);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextValue));
      return nextValue;
    });
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#005A78]" />
          <p className="font-semibold text-slate-700">
            Checking admin access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA]">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
      />

      <section
        className={[
          "min-h-screen transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-[92px]" : "lg:pl-[270px]",
        ].join(" ")}
      >
        <AdminTopbar />

        <div className="p-5 lg:p-8">{children}</div>
      </section>
    </main>
  );
}
