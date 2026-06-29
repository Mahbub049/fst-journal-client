"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken, removeAdminToken } from "@/lib/auth";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();

    if (token) {
      router.replace("/admin/dashboard");
      return;
    }

    removeAdminToken();
    router.replace("/admin/login");
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
