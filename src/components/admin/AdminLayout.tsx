"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import api from "@/lib/api";
import {
  AdminUser,
  clearAdminUser,
  clearLegacyAdminStorage,
  setAdminUser,
  startAdminInactivityWatcher,
  subscribeToAdminUser,
} from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type AdminLayoutProps = {
  children: ReactNode;
};

const SIDEBAR_COLLAPSED_KEY =
  "jfst_admin_sidebar_collapsed";

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [checking, setChecking] =
    useState(true);

  const [admin, setAdmin] =
    useState<AdminUser | null>(null);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.localStorage.getItem(
        SIDEBAR_COLLAPSED_KEY
      ) === "true"
    );
  });

  useEffect(() => {
    let mounted = true;

    clearLegacyAdminStorage();

    const unsubscribeFromAdmin = subscribeToAdminUser((nextAdmin) => {
      if (mounted) {
        setAdmin(nextAdmin);
      }
    });

    const redirectToLogin = (): void => {
      clearAdminUser();
      clearLegacyAdminStorage();

      window.location.replace(
        "/admin/login"
      );
    };

    const expireSession = async (): Promise<void> => {
      try {
        await api.post("/auth/logout");
      } catch {
        // The server session may already be expired.
      } finally {
        redirectToLogin();
      }
    };

    const verifyAdmin = async (): Promise<void> => {
      try {
        const { data } =
          await api.get("/auth/me");

        if (!data?.admin) {
          throw new Error(
            "Admin session was not returned."
          );
        }

        if (!mounted) {
          return;
        }

        setAdminUser(data.admin);
        setAdmin(data.admin);
        setChecking(false);

        if (
          data.admin.mustChangePassword &&
          window.location.pathname !== "/admin/account"
        ) {
          window.location.replace("/admin/account");
        }
      } catch {
        if (mounted) {
          redirectToLogin();
        }
      }
    };

    const stopInactivityWatcher =
      startAdminInactivityWatcher(() => {
        void expireSession();
      });

    void verifyAdmin();

    return () => {
      mounted = false;
      unsubscribeFromAdmin();
      stopInactivityWatcher();
    };
  }, []);

  const handleSidebarToggle = (): void => {
    setSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;

      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        String(nextValue)
      );

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
        admin={admin}
        collapsed={sidebarCollapsed}
        onToggleCollapse={
          handleSidebarToggle
        }
      />

      <section
        className={[
          "min-h-screen transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed
            ? "lg:pl-[92px]"
            : "lg:pl-[270px]",
        ].join(" ")}
      >
        <AdminTopbar admin={admin} />

        <div className="p-5 lg:p-8">
          {children}
        </div>
      </section>
    </main>
  );
}