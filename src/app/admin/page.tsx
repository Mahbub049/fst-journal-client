"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  clearAdminUser,
  clearLegacyAdminStorage,
  setAdminUser,
} from "@/lib/auth";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const openAdmin = async (): Promise<void> => {
      clearLegacyAdminStorage();

      try {
        const { data } = await api.get("/auth/me");

        if (!mounted) return;

        if (!data?.admin) {
          throw new Error("Admin session was not returned.");
        }

        setAdminUser(data.admin);

        router.replace(
          data.admin.mustChangePassword
            ? "/admin/account"
            : "/admin/dashboard"
        );
      } catch {
        if (!mounted) return;

        clearAdminUser();
        clearLegacyAdminStorage();
        router.replace("/admin/login");
      }
    };

    void openAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#005A78]" />
        <p className="font-semibold text-slate-700">Opening admin panel...</p>
      </div>
    </main>
  );
}
