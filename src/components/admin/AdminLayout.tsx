"use client";

import { ReactNode, useEffect, useState } from "react";
import api from "@/lib/api";
import { removeAdminToken, setAdminUser } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data } = await api.get("/auth/me");

        if (data?.admin) {
          setAdminUser(data.admin);
        }

        setChecking(false);
      } catch {
        removeAdminToken();
        window.location.href = "/admin/login";
      }
    };

    verifyAdmin();
  }, []);

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
      <AdminSidebar />

      <section className="lg:pl-[270px]">
        <AdminTopbar />

        <div className="p-5 lg:p-8">{children}</div>
      </section>
    </main>
  );
}